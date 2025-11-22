import db from "../config/database.js";

// ============================================================================
// CREATE ADJUSTMENT
// ============================================================================
const createAdjustment = async (req, res) => {
  const { reference, product_id, warehouse_id, new_qty, reason, notes } = req.body;
  const user_id = req.user?.id;

  try {
    if (!reference || !product_id || !warehouse_id || new_qty === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: "reference, product_id, warehouse_id, new_qty, and reason are required"
      });
    }

    // Check if reference already exists
    const existingAdjustment = await db.query(
      "SELECT id FROM adjustments WHERE reference = $1",
      [reference]
    );

    if (existingAdjustment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Adjustment reference already exists"
      });
    }

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Get current inventory
      const inventoryQuery = await client.query(
        `SELECT quantity FROM inventory WHERE product_id = $1 AND warehouse_id = $2`,
        [product_id, warehouse_id]
      );

      const old_qty = inventoryQuery.rows.length > 0 ? inventoryQuery.rows[0].quantity : 0;

      // Create adjustment record
      const adjustmentQuery = `
        INSERT INTO adjustments(reference, product_id, warehouse_id, old_qty, new_qty, reason, notes, created_by)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;

      const adjustmentValues = [reference, product_id, warehouse_id, old_qty, new_qty, reason, notes || null, user_id];
      const { rows: adjustmentRows } = await client.query(adjustmentQuery, adjustmentValues);

      // Update inventory
      await client.query(
        `INSERT INTO inventory(product_id, warehouse_id, quantity, reserved)
         VALUES($1, $2, $3, 0)
         ON CONFLICT(product_id, warehouse_id)
         DO UPDATE SET quantity = $3;`,
        [product_id, warehouse_id, new_qty]
      );

      // Create stock ledger entry
      const change = new_qty - old_qty;
      await client.query(
        `INSERT INTO stock_ledger(product_id, warehouse_id, change, type, reference_type, reference_id, reference_number, notes, created_by)
         VALUES($1, $2, $3, 'adjustment', 'adjustment', $4, $5, $6, $7);`,
        [product_id, warehouse_id, change, adjustmentRows[0].id, `ADJ-${adjustmentRows[0].id}`, reason, user_id]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message: "Adjustment created successfully",
        data: {
          ...adjustmentRows[0],
          diff: new_qty - old_qty
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating adjustment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating adjustment"
    });
  }
};

// ============================================================================
// GET ALL ADJUSTMENTS
// ============================================================================
const getAllAdjustments = async (req, res) => {
  try {
    const { reason, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.id,
        a.reference,
        p.name as product_name,
        p.sku,
        w.name as warehouse_name,
        a.old_qty,
        a.new_qty,
        a.diff,
        a.reason,
        a.notes,
        u.name as created_by_name,
        a.created_at
      FROM adjustments a
      LEFT JOIN products p ON a.product_id = p.id
      LEFT JOIN warehouses w ON a.warehouse_id = w.id
      LEFT JOIN users u ON a.created_by = u.id
    `;

    const params = [];

    if (reason) {
      query += ` WHERE a.reason = $${params.length + 1}`;
      params.push(reason);
    }

    query += `
      ORDER BY a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM adjustments";
    const countParams = [];

    if (reason) {
      countQuery += ` WHERE reason = $1`;
      countParams.push(reason);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalAdjustments = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: totalAdjustments,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalAdjustments / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching adjustments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching adjustments"
    });
  }
};

// ============================================================================
// GET ADJUSTMENT BY ID
// ============================================================================
const getAdjustmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        a.id,
        a.reference,
        a.product_id,
        p.name as product_name,
        p.sku,
        a.warehouse_id,
        w.name as warehouse_name,
        a.old_qty,
        a.new_qty,
        a.diff,
        a.reason,
        a.notes,
        u.name as created_by_name,
        a.created_at
      FROM adjustments a
      LEFT JOIN products p ON a.product_id = p.id
      LEFT JOIN warehouses w ON a.warehouse_id = w.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Adjustment not found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Error fetching adjustment:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching adjustment"
    });
  }
};

// ============================================================================
// GET ADJUSTMENTS BY REASON
// ============================================================================
const getAdjustmentsByReason = async (req, res) => {
  try {
    const reasons = ["Damage", "Loss", "Surplus", "Discrepancy", "Recount", "Correction", "Other"];

    const reasonStats = [];

    for (const reason of reasons) {
      const query = `
        SELECT 
          COUNT(*) as count,
          SUM(ABS(diff)) as total_change
        FROM adjustments
        WHERE reason = $1;
      `;

      const { rows } = await db.query(query, [reason]);

      reasonStats.push({
        reason,
        count: parseInt(rows[0].count),
        total_change: rows[0].total_change ? parseFloat(rows[0].total_change) : 0
      });
    }

    res.json({
      success: true,
      data: reasonStats
    });
  } catch (error) {
    console.error("Error fetching adjustment reasons:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching adjustment reasons"
    });
  }
};

// ============================================================================
// GET ADJUSTMENT HISTORY FOR PRODUCT
// ============================================================================
const getProductAdjustmentHistory = async (req, res) => {
  const { product_id } = req.params;

  try {
    const query = `
      SELECT 
        a.id,
        a.reference,
        w.name as warehouse_name,
        a.old_qty,
        a.new_qty,
        a.diff,
        a.reason,
        a.notes,
        u.name as created_by_name,
        a.created_at
      FROM adjustments a
      LEFT JOIN warehouses w ON a.warehouse_id = w.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.product_id = $1
      ORDER BY a.created_at DESC;
    `;

    const { rows } = await db.query(query, [product_id]);

    // Get product info
    const productQuery = await db.query(
      "SELECT id, name, sku FROM products WHERE id = $1",
      [product_id]
    );

    if (productQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: {
        product: productQuery.rows[0],
        adjustments: rows
      }
    });
  } catch (error) {
    console.error("Error fetching product adjustment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product adjustment history"
    });
  }
};

// ============================================================================
// GET ADJUSTMENT HISTORY FOR WAREHOUSE
// ============================================================================
const getWarehouseAdjustmentHistory = async (req, res) => {
  const { warehouse_id } = req.params;

  try {
    const query = `
      SELECT 
        a.id,
        a.reference,
        p.name as product_name,
        p.sku,
        a.old_qty,
        a.new_qty,
        a.diff,
        a.reason,
        a.notes,
        u.name as created_by_name,
        a.created_at
      FROM adjustments a
      LEFT JOIN products p ON a.product_id = p.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.warehouse_id = $1
      ORDER BY a.created_at DESC;
    `;

    const { rows } = await db.query(query, [warehouse_id]);

    // Get warehouse info
    const warehouseQuery = await db.query(
      "SELECT id, name, code FROM warehouses WHERE id = $1",
      [warehouse_id]
    );

    if (warehouseQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    res.json({
      success: true,
      data: {
        warehouse: warehouseQuery.rows[0],
        adjustments: rows
      }
    });
  } catch (error) {
    console.error("Error fetching warehouse adjustment history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching warehouse adjustment history"
    });
  }
};

export {
  createAdjustment,
  getAllAdjustments,
  getAdjustmentById,
  getAdjustmentsByReason,
  getProductAdjustmentHistory,
  getWarehouseAdjustmentHistory
};

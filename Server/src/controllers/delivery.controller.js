import db from "../config/database.js";

// ============================================================================
// CREATE DELIVERY
// ============================================================================
const createDelivery = async (req, res) => {
  const { reference, customer_id, warehouse_id, scheduled_date, delivery_address, notes } = req.body;
  const user_id = req.user?.id;

  try {
    if (!reference || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "Reference and warehouse_id are required"
      });
    }

    // Check if reference already exists
    const existingDelivery = await db.query(
      "SELECT id FROM deliveries WHERE reference = $1",
      [reference]
    );

    if (existingDelivery.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Delivery reference already exists"
      });
    }

    const query = `
      INSERT INTO deliveries(reference, customer_id, warehouse_id, scheduled_date, delivery_address, notes, created_by, status)
      VALUES($1, $2, $3, $4, $5, $6, $7, 'Draft')
      RETURNING *;
    `;

    const values = [reference, customer_id || null, warehouse_id, scheduled_date || null, delivery_address || null, notes || null, user_id];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: "Delivery created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error creating delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error creating delivery"
    });
  }
};

// ============================================================================
// GET ALL DELIVERIES
// ============================================================================
const getAllDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        d.id,
        d.reference,
        c.name as customer_name,
        w.name as warehouse_name,
        d.status,
        d.scheduled_date,
        d.shipped_date,
        d.delivery_address,
        d.notes,
        u.name as created_by_name,
        d.created_at,
        COUNT(DISTINCT dl.id) as total_lines,
        COALESCE(SUM(dl.qty_ordered), 0) as total_qty_ordered,
        COALESCE(SUM(dl.qty_picked), 0) as total_qty_picked
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN warehouses w ON d.warehouse_id = w.id
      LEFT JOIN users u ON d.created_by = u.id
      LEFT JOIN delivery_lines dl ON d.id = dl.delivery_id
    `;

    const params = [];

    if (status) {
      query += ` WHERE d.status = $${params.length + 1}`;
      params.push(status);
    }

    query += `
      GROUP BY d.id, c.name, w.name, u.name
      ORDER BY d.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    let countQuery = "SELECT COUNT(*) as total FROM deliveries";
    const countParams = [];

    if (status) {
      countQuery += ` WHERE status = $1`;
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalDeliveries = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: totalDeliveries,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalDeliveries / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching deliveries"
    });
  }
};

// ============================================================================
// GET DELIVERY BY ID
// ============================================================================
const getDeliveryById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        d.id,
        d.reference,
        d.customer_id,
        c.name as customer_name,
        d.warehouse_id,
        w.name as warehouse_name,
        d.status,
        d.scheduled_date,
        d.shipped_date,
        d.delivery_address,
        d.notes,
        u.name as created_by_name,
        d.created_at
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN warehouses w ON d.warehouse_id = w.id
      LEFT JOIN users u ON d.created_by = u.id
      WHERE d.id = $1;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    // Get delivery lines
    const linesQuery = `
      SELECT 
        dl.id,
        dl.product_id,
        p.name as product_name,
        p.sku,
        dl.qty_ordered,
        dl.qty_picked,
        dl.uom,
        dl.notes
      FROM delivery_lines dl
      LEFT JOIN products p ON dl.product_id = p.id
      WHERE dl.delivery_id = $1;
    `;

    const { rows: lines } = await db.query(linesQuery, [id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        lines
      }
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery"
    });
  }
};

// ============================================================================
// UPDATE DELIVERY
// ============================================================================
const updateDelivery = async (req, res) => {
  const { id } = req.params;
  const { reference, customer_id, scheduled_date, delivery_address, notes, status } = req.body;

  try {
    const existingDelivery = await db.query(
      "SELECT status FROM deliveries WHERE id = $1",
      [id]
    );

    if (existingDelivery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery not found"
      });
    }

    if (["Done", "Canceled"].includes(existingDelivery.rows[0].status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update delivery with status: " + existingDelivery.rows[0].status
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (reference !== undefined) {
      updates.push(`reference = $${paramCount++}`);
      values.push(reference);
    }
    if (customer_id !== undefined) {
      updates.push(`customer_id = $${paramCount++}`);
      values.push(customer_id);
    }
    if (scheduled_date !== undefined) {
      updates.push(`scheduled_date = $${paramCount++}`);
      values.push(scheduled_date);
    }
    if (delivery_address !== undefined) {
      updates.push(`delivery_address = $${paramCount++}`);
      values.push(delivery_address);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(id);
    const query = `
      UPDATE deliveries
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    res.json({
      success: true,
      message: "Delivery updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery"
    });
  }
};

// ============================================================================
// ADD DELIVERY LINE
// ============================================================================
const addDeliveryLine = async (req, res) => {
  const { delivery_id } = req.params;
  const { product_id, qty_ordered, uom, notes } = req.body;

  try {
    if (!product_id || !qty_ordered || !uom) {
      return res.status(400).json({
        success: false,
        message: "product_id, qty_ordered, and uom are required"
      });
    }

    const query = `
      INSERT INTO delivery_lines(delivery_id, product_id, qty_ordered, uom, notes)
      VALUES($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [delivery_id, product_id, qty_ordered, uom, notes || null];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: "Delivery line added successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error adding delivery line:", error);
    res.status(500).json({
      success: false,
      message: "Error adding delivery line"
    });
  }
};

// ============================================================================
// UPDATE DELIVERY LINE
// ============================================================================
const updateDeliveryLine = async (req, res) => {
  const { line_id } = req.params;
  const { qty_picked, notes } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (qty_picked !== undefined) {
      updates.push(`qty_picked = $${paramCount++}`);
      values.push(qty_picked);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(line_id);
    const query = `
      UPDATE delivery_lines
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery line not found"
      });
    }

    res.json({
      success: true,
      message: "Delivery line updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating delivery line:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery line"
    });
  }
};

// ============================================================================
// SHIP DELIVERY (Mark as Done and Update Inventory)
// ============================================================================
const shipDelivery = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  try {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const deliveryQuery = await client.query(
        `SELECT warehouse_id, status FROM deliveries WHERE id = $1`,
        [id]
      );

      if (deliveryQuery.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: "Delivery not found"
        });
      }

      const delivery = deliveryQuery.rows[0];

      if (delivery.status === "Done") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Delivery already shipped"
        });
      }

      // Update delivery status
      await client.query(
        `UPDATE deliveries SET status = 'Done', shipped_date = NOW() WHERE id = $1`,
        [id]
      );

      // Get delivery lines
      const linesQuery = await client.query(
        `SELECT product_id, qty_picked FROM delivery_lines WHERE delivery_id = $1`,
        [id]
      );

      // Update inventory for each line
      for (const line of linesQuery.rows) {
        const { product_id, qty_picked } = line;

        // Reduce inventory
        await client.query(
          `UPDATE inventory 
           SET quantity = quantity - $1
           WHERE product_id = $2 AND warehouse_id = $3
           AND quantity >= $1;`,
          [qty_picked, product_id, delivery.warehouse_id]
        );

        // Create stock ledger entry
        await client.query(
          `INSERT INTO stock_ledger(product_id, warehouse_id, change, type, reference_type, reference_id, reference_number, created_by)
           VALUES($1, $2, $3, 'delivery', 'delivery', $4, $5, $6);`,
          [product_id, delivery.warehouse_id, -qty_picked, id, `DEL-${id}`, user_id]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Delivery shipped successfully",
        data: {
          id,
          status: "Done",
          shipped_date: new Date()
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error shipping delivery:", error);
    res.status(500).json({
      success: false,
      message: "Error shipping delivery"
    });
  }
};

// ============================================================================
// DELETE DELIVERY LINE
// ============================================================================
const deleteDeliveryLine = async (req, res) => {
  const { line_id } = req.params;

  try {
    const { rows } = await db.query(
      "DELETE FROM delivery_lines WHERE id = $1 RETURNING *;",
      [line_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Delivery line not found"
      });
    }

    res.json({
      success: true,
      message: "Delivery line deleted successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error deleting delivery line:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting delivery line"
    });
  }
};

export {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  updateDelivery,
  addDeliveryLine,
  updateDeliveryLine,
  deleteDeliveryLine,
  shipDelivery
};

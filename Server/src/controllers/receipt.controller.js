import db from "../config/database.js";

// ============================================================================
// CREATE RECEIPT
// ============================================================================
const createReceipt = async (req, res) => {
  const { reference, supplier_id, warehouse_id, expected_date, notes } = req.body;
  const user_id = req.user?.id;

  try {
    // Validate required fields
    if (!reference || !warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "Reference and warehouse_id are required"
      });
    }

    // Check if reference already exists
    const existingReceipt = await db.query(
      "SELECT id FROM receipts WHERE reference = $1",
      [reference]
    );

    if (existingReceipt.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Receipt reference already exists"
      });
    }

    const query = `
      INSERT INTO receipts(reference, supplier_id, warehouse_id, expected_date, notes, created_by, status)
      VALUES($1, $2, $3, $4, $5, $6, 'Draft')
      RETURNING *;
    `;

    const values = [reference, supplier_id || null, warehouse_id, expected_date || null, notes || null, user_id];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: "Receipt created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error creating receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error creating receipt"
    });
  }
};

// ============================================================================
// GET ALL RECEIPTS
// ============================================================================
const getAllReceipts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        r.id,
        r.reference,
        s.name as supplier_name,
        w.name as warehouse_name,
        r.status,
        r.expected_date,
        r.received_date,
        r.notes,
        u.name as created_by_name,
        r.created_at,
        COUNT(DISTINCT rl.id) as total_lines,
        COALESCE(SUM(rl.qty_ordered), 0) as total_qty_ordered,
        COALESCE(SUM(rl.qty_received), 0) as total_qty_received
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN receipt_lines rl ON r.id = rl.receipt_id
    `;

    const params = [];

    if (status) {
      query += ` WHERE r.status = $${params.length + 1}`;
      params.push(status);
    }

    query += `
      GROUP BY r.id, s.name, w.name, u.name
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM receipts";
    const countParams = [];

    if (status) {
      countQuery += ` WHERE status = $1`;
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalReceipts = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: totalReceipts,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalReceipts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching receipts"
    });
  }
};

// ============================================================================
// GET RECEIPT BY ID
// ============================================================================
const getReceiptById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        r.id,
        r.reference,
        r.supplier_id,
        s.name as supplier_name,
        r.warehouse_id,
        w.name as warehouse_name,
        r.status,
        r.expected_date,
        r.received_date,
        r.notes,
        u.name as created_by_name,
        r.created_at
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      LEFT JOIN users u ON r.created_by = u.id
      WHERE r.id = $1;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }

    // Get receipt lines
    const linesQuery = `
      SELECT 
        rl.id,
        rl.product_id,
        p.name as product_name,
        p.sku,
        rl.qty_ordered,
        rl.qty_received,
        rl.uom,
        rl.unit_cost,
        (rl.qty_ordered * rl.unit_cost) as total_cost,
        rl.notes
      FROM receipt_lines rl
      LEFT JOIN products p ON rl.product_id = p.id
      WHERE rl.receipt_id = $1;
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
    console.error("Error fetching receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching receipt"
    });
  }
};

// ============================================================================
// UPDATE RECEIPT
// ============================================================================
const updateReceipt = async (req, res) => {
  const { id } = req.params;
  const { reference, supplier_id, expected_date, notes, status } = req.body;

  try {
    const existingReceipt = await db.query(
      "SELECT status FROM receipts WHERE id = $1",
      [id]
    );

    if (existingReceipt.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }

    // Cannot update Done or Canceled receipts
    if (["Done", "Canceled"].includes(existingReceipt.rows[0].status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update receipt with status: " + existingReceipt.rows[0].status
      });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (reference !== undefined) {
      updates.push(`reference = $${paramCount++}`);
      values.push(reference);
    }
    if (supplier_id !== undefined) {
      updates.push(`supplier_id = $${paramCount++}`);
      values.push(supplier_id);
    }
    if (expected_date !== undefined) {
      updates.push(`expected_date = $${paramCount++}`);
      values.push(expected_date);
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
      UPDATE receipts
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    res.json({
      success: true,
      message: "Receipt updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error updating receipt"
    });
  }
};

// ============================================================================
// ADD RECEIPT LINE
// ============================================================================
const addReceiptLine = async (req, res) => {
  const { receipt_id } = req.params;
  const { product_id, qty_ordered, uom, unit_cost, notes } = req.body;

  try {
    if (!product_id || !qty_ordered || !uom) {
      return res.status(400).json({
        success: false,
        message: "product_id, qty_ordered, and uom are required"
      });
    }

    const query = `
      INSERT INTO receipt_lines(receipt_id, product_id, qty_ordered, uom, unit_cost, notes)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [receipt_id, product_id, qty_ordered, uom, unit_cost || 0, notes || null];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: "Receipt line added successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error adding receipt line:", error);
    res.status(500).json({
      success: false,
      message: "Error adding receipt line"
    });
  }
};

// ============================================================================
// UPDATE RECEIPT LINE
// ============================================================================
const updateReceiptLine = async (req, res) => {
  const { line_id } = req.params;
  const { qty_received, notes } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (qty_received !== undefined) {
      updates.push(`qty_received = $${paramCount++}`);
      values.push(qty_received);
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
      UPDATE receipt_lines
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receipt line not found"
      });
    }

    res.json({
      success: true,
      message: "Receipt line updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating receipt line:", error);
    res.status(500).json({
      success: false,
      message: "Error updating receipt line"
    });
  }
};

// ============================================================================
// RECEIVE RECEIPT (Mark as Done and Update Inventory)
// ============================================================================
const receiveReceipt = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user?.id;

  try {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // Get receipt details
      const receiptQuery = await client.query(
        `SELECT warehouse_id, status FROM receipts WHERE id = $1`,
        [id]
      );

      if (receiptQuery.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          success: false,
          message: "Receipt not found"
        });
      }

      const receipt = receiptQuery.rows[0];

      if (receipt.status === "Done") {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Receipt already received"
        });
      }

      // Update receipt status
      await client.query(
        `UPDATE receipts SET status = 'Done', received_date = NOW() WHERE id = $1`,
        [id]
      );

      // Get receipt lines
      const linesQuery = await client.query(
        `SELECT product_id, qty_received FROM receipt_lines WHERE receipt_id = $1`,
        [id]
      );

      // Update inventory for each line
      for (const line of linesQuery.rows) {
        const { product_id, qty_received } = line;

        // Insert or update inventory
        await client.query(
          `INSERT INTO inventory(product_id, warehouse_id, quantity, reserved)
           VALUES($1, $2, $3, 0)
           ON CONFLICT(product_id, warehouse_id) 
           DO UPDATE SET quantity = inventory.quantity + $3;`,
          [product_id, receipt.warehouse_id, qty_received]
        );

        // Create stock ledger entry
        await client.query(
          `INSERT INTO stock_ledger(product_id, warehouse_id, change, type, reference_type, reference_id, reference_number, created_by)
           VALUES($1, $2, $3, 'receipt', 'receipt', $4, $5, $6);`,
          [product_id, receipt.warehouse_id, qty_received, id, `RCP-${id}`, user_id]
        );
      }

      await client.query("COMMIT");

      res.json({
        success: true,
        message: "Receipt received successfully",
        data: {
          id,
          status: "Done",
          received_date: new Date()
        }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error receiving receipt:", error);
    res.status(500).json({
      success: false,
      message: "Error receiving receipt"
    });
  }
};

// ============================================================================
// DELETE RECEIPT LINE
// ============================================================================
const deleteReceiptLine = async (req, res) => {
  const { line_id } = req.params;

  try {
    const { rows } = await db.query(
      "DELETE FROM receipt_lines WHERE id = $1 RETURNING *;",
      [line_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receipt line not found"
      });
    }

    res.json({
      success: true,
      message: "Receipt line deleted successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error deleting receipt line:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting receipt line"
    });
  }
};

export {
  createReceipt,
  getAllReceipts,
  getReceiptById,
  updateReceipt,
  addReceiptLine,
  updateReceiptLine,
  deleteReceiptLine,
  receiveReceipt
};

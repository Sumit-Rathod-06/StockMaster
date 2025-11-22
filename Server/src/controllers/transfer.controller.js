import db from "../config/database.js";

const createTransfer = async (req, res) => {
  const { reference, from_warehouse_id, to_warehouse_id, transfer_date, notes } = req.body;
  const user_id = req.user?.id;

  try {
    if (!reference || !from_warehouse_id || !to_warehouse_id) {
      return res.status(400).json({
        success: false,
        message: "Reference, from_warehouse_id, and to_warehouse_id are required"
      });
    }

    const query = `
      INSERT INTO transfers(reference, from_warehouse_id, to_warehouse_id, transfer_date, notes, created_by, status)
      VALUES($1, $2, $3, $4, $5, $6, 'Draft')
      RETURNING *;
    `;

    const values = [reference, from_warehouse_id, to_warehouse_id, transfer_date || null, notes || null, user_id];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: "Transfer created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error creating transfer:", error);
    res.status(500).json({
      success: false,
      message: "Error creating transfer"
    });
  }
};

const getAllTransfers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        t.id,
        t.reference,
        fw.name as from_warehouse_name,
        tw.name as to_warehouse_name,
        t.status,
        t.transfer_date,
        t.notes,
        u.name as created_by_name,
        t.created_at,
        COUNT(DISTINCT tl.id) as total_lines
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN transfer_lines tl ON t.id = tl.transfer_id
    `;

    const params = [];

    if (status) {
      query += ` WHERE t.status = $${params.length + 1}`;
      params.push(status);
    }

    query += `
      GROUP BY t.id, fw.name, tw.name, u.name
      ORDER BY t.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;

    params.push(limit, offset);
    const { rows } = await db.query(query, params);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transfers"
    });
  }
};

const getTransferById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        t.*,
        fw.name as from_warehouse_name,
        tw.name as to_warehouse_name,
        u.name as created_by_name
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Error fetching transfer:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transfer"
    });
  }
};

const updateTransfer = async (req, res) => {
  const { id } = req.params;
  const { reference, from_warehouse_id, to_warehouse_id, transfer_date, notes } = req.body;

  try {
    const query = `
      UPDATE transfers
      SET reference = $1, from_warehouse_id = $2, to_warehouse_id = $3, transfer_date = $4, notes = $5
      WHERE id = $6
      RETURNING *;
    `;

    const { rows } = await db.query(query, [reference, from_warehouse_id, to_warehouse_id, transfer_date, notes, id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found"
      });
    }

    res.json({
      success: true,
      message: "Transfer updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating transfer:", error);
    res.status(500).json({
      success: false,
      message: "Error updating transfer"
    });
  }
};

const completeTransfer = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE transfers
      SET status = 'Completed'
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found"
      });
    }

    res.json({
      success: true,
      message: "Transfer completed successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error completing transfer:", error);
    res.status(500).json({
      success: false,
      message: "Error completing transfer"
    });
  }
};

export {
  createTransfer,
  getAllTransfers,
  getTransferById,
  updateTransfer,
  completeTransfer
};

import db from "../config/database.js";

const createWarehouse = async (req, res) => {
  const { name, code, address, city, state, postal_code, country, contact_person, contact_phone } = req.body;

  try {
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code are required"
      });
    }

    const query = `
      INSERT INTO warehouses(name, code, address, city, state, postal_code, country, contact_person, contact_phone, is_active)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
      RETURNING *;
    `;

    const values = [name, code, address || null, city || null, state || null, postal_code || null, country || null, contact_person || null, contact_phone || null];
    const { rows } = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: "Warehouse created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error creating warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Error creating warehouse"
    });
  }
};

const getAllWarehouses = async (req, res) => {
  try {
    const query = `
      SELECT * FROM warehouses
      WHERE is_active = true
      ORDER BY created_at DESC;
    `;

    const { rows } = await db.query(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching warehouses"
    });
  }
};

const getWarehouseById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `SELECT * FROM warehouses WHERE id = $1;`;
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching warehouse"
    });
  }
};

const updateWarehouse = async (req, res) => {
  const { id } = req.params;
  const { name, code, address, city, state, postal_code, country, contact_person, contact_phone } = req.body;

  try {
    const query = `
      UPDATE warehouses
      SET name = $1, code = $2, address = $3, city = $4, state = $5, postal_code = $6, country = $7, contact_person = $8, contact_phone = $9
      WHERE id = $10
      RETURNING *;
    `;

    const values = [name, code, address || null, city || null, state || null, postal_code || null, country || null, contact_person || null, contact_phone || null, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    res.json({
      success: true,
      message: "Warehouse updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Error updating warehouse"
    });
  }
};

const deleteWarehouse = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      UPDATE warehouses
      SET is_active = false
      WHERE id = $1
      RETURNING *;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found"
      });
    }

    res.json({
      success: true,
      message: "Warehouse deleted successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting warehouse"
    });
  }
};

export {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse
};

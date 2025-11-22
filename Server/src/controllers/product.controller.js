import db from "../config/database.js";

// ============================================================================
// CREATE PRODUCT
// ============================================================================
const createProduct = async (req, res) => {
  const { name, sku, barcode, category_id, uom, reorder_level, unit_cost } = req.body;
  
  try {
    // Validate required fields
    if (!name || !sku || !uom) {
      return res.status(400).json({
        success: false,
        message: "Name, SKU, and UOM are required"
      });
    }

    // Check if SKU already exists
    const existingSku = await db.query(
      "SELECT id FROM products WHERE sku = $1",
      [sku]
    );
    
    if (existingSku.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists"
      });
    }

    // Create product
    const query = `
      INSERT INTO products(name, sku, barcode, category_id, uom, reorder_level, unit_cost, is_active)
      VALUES($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *;
    `;
    
    const values = [
      name,
      sku,
      barcode || null,
      category_id || null,
      uom,
      reorder_level || 0,
      unit_cost || 0
    ];

    const { rows } = await db.query(query, values);
    const product = rows[0];

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product"
    });
  }
};

// ============================================================================
// GET ALL PRODUCTS
// ============================================================================
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category_id, is_active = true } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.category_id,
        c.name as category_name,
        p.uom,
        p.reorder_level,
        p.unit_cost,
        p.is_active,
        p.created_at,
        COUNT(DISTINCT i.warehouse_id) as warehouses_with_stock,
        COALESCE(SUM(i.quantity), 0) as total_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = $1
    `;
    
    const params = [is_active === 'true' || is_active === true];

    if (category_id) {
      query += ` AND p.category_id = $${params.length + 1}`;
      params.push(category_id);
    }

    query += `
      GROUP BY p.id, p.name, p.sku, p.barcode, p.category_id, c.name, p.uom, p.reorder_level, p.unit_cost, p.is_active, p.created_at
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2};
    `;
    
    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM products WHERE is_active = $1";
    const countParams = [is_active === 'true' || is_active === true];
    
    if (category_id) {
      countQuery += ` AND category_id = $2`;
      countParams.push(category_id);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalProducts = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: totalProducts,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalProducts / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products"
    });
  }
};

// ============================================================================
// GET PRODUCT BY ID
// ============================================================================
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.category_id,
        c.name as category_name,
        p.uom,
        p.reorder_level,
        p.unit_cost,
        p.is_active,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const product = rows[0];

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product"
    });
  }
};

// ============================================================================
// UPDATE PRODUCT
// ============================================================================
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, sku, barcode, category_id, uom, reorder_level, unit_cost, is_active } = req.body;

  try {
    // Check if product exists
    const existingProduct = await db.query(
      "SELECT id FROM products WHERE id = $1",
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check if new SKU already exists (if SKU is being changed)
    if (sku) {
      const existingSku = await db.query(
        "SELECT id FROM products WHERE sku = $1 AND id != $2",
        [sku, id]
      );
      
      if (existingSku.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "SKU already exists"
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (sku !== undefined) {
      updates.push(`sku = $${paramCount++}`);
      values.push(sku);
    }
    if (barcode !== undefined) {
      updates.push(`barcode = $${paramCount++}`);
      values.push(barcode);
    }
    if (category_id !== undefined) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(category_id);
    }
    if (uom !== undefined) {
      updates.push(`uom = $${paramCount++}`);
      values.push(uom);
    }
    if (reorder_level !== undefined) {
      updates.push(`reorder_level = $${paramCount++}`);
      values.push(reorder_level);
    }
    if (unit_cost !== undefined) {
      updates.push(`unit_cost = $${paramCount++}`);
      values.push(unit_cost);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(id);
    const query = `
      UPDATE products
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    res.json({
      success: true,
      message: "Product updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product"
    });
  }
};

// ============================================================================
// DELETE PRODUCT (Soft Delete)
// ============================================================================
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if product exists
    const existingProduct = await db.query(
      "SELECT id FROM products WHERE id = $1",
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Soft delete
    const { rows } = await db.query(
      "UPDATE products SET is_active = false WHERE id = $1 RETURNING *;",
      [id]
    );

    res.json({
      success: true,
      message: "Product deleted successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product"
    });
  }
};

// ============================================================================
// STOCK AVAILABILITY PER LOCATION
// ============================================================================
const getStockByLocation = async (req, res) => {
  const { product_id } = req.params;

  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        w.id as warehouse_id,
        w.name as warehouse_name,
        w.code as warehouse_code,
        i.quantity,
        i.reserved,
        i.available,
        p.reorder_level,
        CASE 
          WHEN i.available <= 0 THEN 'out_of_stock'
          WHEN i.available <= p.reorder_level THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      WHERE p.id = $1 AND p.is_active = true
      ORDER BY w.name;
    `;

    const { rows } = await db.query(query, [product_id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: {
        product_id: rows[0].id,
        product_name: rows[0].name,
        product_sku: rows[0].sku,
        reorder_level: rows[0].reorder_level,
        locations: rows.filter(r => r.warehouse_id !== null)
      }
    });
  } catch (error) {
    console.error("Error fetching stock by location:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stock by location"
    });
  }
};

// ============================================================================
// GET REORDERING RULES
// ============================================================================
const getReorderingRules = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.reorder_level,
        p.unit_cost,
        c.name as category_name,
        COUNT(DISTINCT i.warehouse_id) as warehouses_tracked,
        COALESCE(SUM(i.available), 0) as total_available,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        CASE 
          WHEN COALESCE(SUM(i.available), 0) <= p.reorder_level THEN true
          ELSE false
        END as needs_reorder
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      GROUP BY p.id, p.name, p.sku, p.reorder_level, p.unit_cost, c.name
      ORDER BY needs_reorder DESC, p.name ASC;
    `;

    const { rows } = await db.query(query);

    const needsReorder = rows.filter(r => r.needs_reorder);
    const normalStock = rows.filter(r => !r.needs_reorder);

    res.json({
      success: true,
      data: {
        summary: {
          total_products: rows.length,
          products_needing_reorder: needsReorder.length,
          products_in_stock: normalStock.length
        },
        products_needing_reorder: needsReorder,
        products_in_stock: normalStock
      }
    });
  } catch (error) {
    console.error("Error fetching reordering rules:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reordering rules"
    });
  }
};

// ============================================================================
// UPDATE REORDER LEVEL
// ============================================================================
const updateReorderLevel = async (req, res) => {
  const { id } = req.params;
  const { reorder_level } = req.body;

  try {
    if (reorder_level === undefined || reorder_level < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid reorder level is required"
      });
    }

    const { rows } = await db.query(
      "UPDATE products SET reorder_level = $1 WHERE id = $2 RETURNING *;",
      [reorder_level, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Reorder level updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating reorder level:", error);
    res.status(500).json({
      success: false,
      message: "Error updating reorder level"
    });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getStockByLocation,
  getReorderingRules,
  updateReorderLevel
};

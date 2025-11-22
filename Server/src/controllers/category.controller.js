import db from "../config/database.js";

// ============================================================================
// CREATE CATEGORY
// ============================================================================
const createCategory = async (req, res) => {
  const { name, parent_id } = req.body;

  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    // Check if category already exists
    const existingCategory = await db.query(
      "SELECT id FROM categories WHERE name = $1",
      [name]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists"
      });
    }

    // Validate parent_id if provided
    if (parent_id) {
      const parentCategory = await db.query(
        "SELECT id FROM categories WHERE id = $1",
        [parent_id]
      );

      if (parentCategory.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found"
        });
      }
    }

    // Create category
    const query = `
      INSERT INTO categories(name, parent_id)
      VALUES($1, $2)
      RETURNING *;
    `;

    const { rows } = await db.query(query, [name, parent_id || null]);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Error creating category"
    });
  }
};

// ============================================================================
// GET ALL CATEGORIES
// ============================================================================
const getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.parent_id,
        p.name as parent_name,
        COUNT(DISTINCT pr.id) as product_count,
        c.created_at
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON c.id = pr.category_id
      GROUP BY c.id, c.name, c.parent_id, p.name, c.created_at
      ORDER BY c.parent_id, c.name;
    `;

    const { rows } = await db.query(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories"
    });
  }
};

// ============================================================================
// GET CATEGORY BY ID
// ============================================================================
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.parent_id,
        p.name as parent_name,
        COUNT(DISTINCT pr.id) as product_count,
        c.created_at
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products pr ON c.id = pr.category_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.parent_id, p.name, c.created_at;
    `;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category"
    });
  }
};

// ============================================================================
// UPDATE CATEGORY
// ============================================================================
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, parent_id } = req.body;

  try {
    // Check if category exists
    const existingCategory = await db.query(
      "SELECT id FROM categories WHERE id = $1",
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if name is being changed and if it already exists
    if (name) {
      const existingName = await db.query(
        "SELECT id FROM categories WHERE name = $1 AND id != $2",
        [name, id]
      );

      if (existingName.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists"
        });
      }
    }

    // Validate parent_id if provided
    if (parent_id && parent_id !== null) {
      // Prevent self-referencing
      if (parent_id === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: "Cannot set category as its own parent"
        });
      }

      const parentCategory = await db.query(
        "SELECT id FROM categories WHERE id = $1",
        [parent_id]
      );

      if (parentCategory.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found"
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (parent_id !== undefined) {
      updates.push(`parent_id = $${paramCount++}`);
      values.push(parent_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    values.push(id);

    const query = `
      UPDATE categories
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const { rows } = await db.query(query, values);

    res.json({
      success: true,
      message: "Category updated successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category"
    });
  }
};

// ============================================================================
// DELETE CATEGORY
// ============================================================================
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if category exists
    const existingCategory = await db.query(
      "SELECT id FROM categories WHERE id = $1",
      [id]
    );

    if (existingCategory.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category has products
    const productsInCategory = await db.query(
      "SELECT id FROM products WHERE category_id = $1",
      [id]
    );

    if (productsInCategory.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with products. Delete or reassign products first."
      });
    }

    // Check if category has subcategories
    const subcategories = await db.query(
      "SELECT id FROM categories WHERE parent_id = $1",
      [id]
    );

    if (subcategories.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with subcategories. Delete subcategories first."
      });
    }

    // Delete category
    const { rows } = await db.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *;",
      [id]
    );

    res.json({
      success: true,
      message: "Category deleted successfully",
      data: rows[0]
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category"
    });
  }
};

// ============================================================================
// GET CATEGORY HIERARCHY
// ============================================================================
const getCategoryHierarchy = async (req, res) => {
  try {
    const query = `
      WITH RECURSIVE category_tree AS (
        SELECT 
          id,
          name,
          parent_id,
          0 as level
        FROM categories
        WHERE parent_id IS NULL
        
        UNION ALL
        
        SELECT 
          c.id,
          c.name,
          c.parent_id,
          ct.level + 1
        FROM categories c
        INNER JOIN category_tree ct ON c.parent_id = ct.id
      )
      SELECT * FROM category_tree
      ORDER BY level, name;
    `;

    const { rows } = await db.query(query);

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error("Error fetching category hierarchy:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching category hierarchy"
    });
  }
};

// ============================================================================
// GET PRODUCTS BY CATEGORY
// ============================================================================
const getProductsByCategory = async (req, res) => {
  const { category_id } = req.params;

  try {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.uom,
        p.reorder_level,
        p.unit_cost,
        COUNT(DISTINCT i.warehouse_id) as warehouses_with_stock,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        p.created_at
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.category_id = $1 AND p.is_active = true
      GROUP BY p.id, p.name, p.sku, p.barcode, p.uom, p.reorder_level, p.unit_cost, p.created_at
      ORDER BY p.name;
    `;

    const { rows } = await db.query(query, [category_id]);

    if (rows.length === 0) {
      // Check if category exists
      const categoryExists = await db.query(
        "SELECT id FROM categories WHERE id = $1",
        [category_id]
      );

      if (categoryExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
    }

    res.json({
      success: true,
      data: {
        category_id,
        product_count: rows.length,
        products: rows
      }
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products by category"
    });
  }
};

export {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryHierarchy,
  getProductsByCategory
};

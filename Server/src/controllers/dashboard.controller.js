import db from "../config/database.js";

// Get Total Products in Stock
const getTotalProductsInStock = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        COALESCE(SUM(i.quantity * p.unit_cost), 0) as total_value
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = true
    `);
    
    res.json({
      success: true,
      data: {
        total_products: parseInt(rows[0].total_products),
        total_quantity: parseFloat(rows[0].total_quantity),
        total_value: parseFloat(rows[0].total_value)
      }
    });
  } catch (error) {
    console.error("Error fetching total products in stock:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching total products in stock" 
    });
  }
};

// Get Low Stock / Out of Stock Items
const getLowStockItems = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        w.name as warehouse_name,
        i.quantity,
        i.available,
        p.reorder_level,
        CASE 
          WHEN i.available <= 0 THEN 'out_of_stock'
          WHEN i.available <= p.reorder_level THEN 'low_stock'
          ELSE 'normal'
        END as stock_status
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
      WHERE p.is_active = true 
        AND (i.available <= p.reorder_level OR i.available IS NULL)
      ORDER BY i.available ASC
    `);
    
    const outOfStock = rows.filter(r => r.stock_status === 'out_of_stock').length;
    const lowStock = rows.filter(r => r.stock_status === 'low_stock').length;
    
    res.json({
      success: true,
      data: {
        total_critical_items: rows.length,
        out_of_stock_count: outOfStock,
        low_stock_count: lowStock,
        items: rows
      }
    });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching low stock items" 
    });
  }
};

// Get Pending Receipts
const getPendingReceipts = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        r.id,
        r.reference,
        s.name as supplier_name,
        w.name as warehouse_name,
        r.status,
        r.expected_date,
        COUNT(DISTINCT rl.id) as total_lines,
        COALESCE(SUM(rl.qty_ordered), 0) as total_qty_ordered,
        COALESCE(SUM(rl.qty_received), 0) as total_qty_received
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      LEFT JOIN receipt_lines rl ON r.id = rl.receipt_id
      WHERE r.status IN ('Waiting', 'Ready')
      GROUP BY r.id, r.reference, s.name, w.name, r.status, r.expected_date
      ORDER BY r.expected_date ASC
    `);
    
    res.json({
      success: true,
      data: {
        pending_count: rows.length,
        receipts: rows
      }
    });
  } catch (error) {
    console.error("Error fetching pending receipts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching pending receipts" 
    });
  }
};

// Get Pending Deliveries
const getPendingDeliveries = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        d.id,
        d.reference,
        c.name as customer_name,
        w.name as warehouse_name,
        d.status,
        d.scheduled_date,
        COUNT(DISTINCT dl.id) as total_lines,
        COALESCE(SUM(dl.qty_ordered), 0) as total_qty_ordered,
        COALESCE(SUM(dl.qty_picked), 0) as total_qty_picked
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN warehouses w ON d.warehouse_id = w.id
      LEFT JOIN delivery_lines dl ON d.id = dl.delivery_id
      WHERE d.status IN ('Waiting', 'Ready')
      GROUP BY d.id, d.reference, c.name, w.name, d.status, d.scheduled_date
      ORDER BY d.scheduled_date ASC
    `);
    
    res.json({
      success: true,
      data: {
        pending_count: rows.length,
        deliveries: rows
      }
    });
  } catch (error) {
    console.error("Error fetching pending deliveries:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching pending deliveries" 
    });
  }
};

// Get Internal Transfers Scheduled
const getScheduledTransfers = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        t.id,
        t.reference,
        fw.name as from_warehouse,
        tw.name as to_warehouse,
        t.status,
        t.transfer_date,
        COUNT(DISTINCT tl.id) as total_lines,
        COALESCE(SUM(tl.qty), 0) as total_qty
      FROM transfers t
      LEFT JOIN warehouses fw ON t.from_warehouse_id = fw.id
      LEFT JOIN warehouses tw ON t.to_warehouse_id = tw.id
      LEFT JOIN transfer_lines tl ON t.id = tl.transfer_id
      WHERE t.status IN ('Waiting', 'Ready')
      GROUP BY t.id, t.reference, fw.name, tw.name, t.status, t.transfer_date
      ORDER BY t.transfer_date ASC
    `);
    
    res.json({
      success: true,
      data: {
        scheduled_count: rows.length,
        transfers: rows
      }
    });
  } catch (error) {
    console.error("Error fetching scheduled transfers:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching scheduled transfers" 
    });
  }
};

// Get All KPIs in one call
const getAllKPIs = async (req, res) => {
  try {
    // Total Products in Stock
    const productsQuery = await db.query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COALESCE(SUM(i.quantity), 0) as total_quantity,
        COALESCE(SUM(i.quantity * p.unit_cost), 0) as total_value
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = true
    `);
    
    // Low Stock Items
    const lowStockQuery = await db.query(`
      SELECT 
        COUNT(*) as count,
        COUNT(CASE WHEN i.available <= 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN i.available > 0 AND i.available <= p.reorder_level THEN 1 END) as low_stock
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.is_active = true 
        AND (i.available <= p.reorder_level OR i.available IS NULL)
    `);
    
    // Pending Receipts
    const receiptsQuery = await db.query(`
      SELECT COUNT(*) as count FROM receipts
      WHERE status IN ('Waiting', 'Ready')
    `);
    
    // Pending Deliveries
    const deliveriesQuery = await db.query(`
      SELECT COUNT(*) as count FROM deliveries
      WHERE status IN ('Waiting', 'Ready')
    `);
    
    // Scheduled Transfers
    const transfersQuery = await db.query(`
      SELECT COUNT(*) as count FROM transfers
      WHERE status IN ('Waiting', 'Ready')
    `);
    
    res.json({
      success: true,
      data: {
        total_products_in_stock: {
          total_products: parseInt(productsQuery.rows[0].total_products),
          total_quantity: parseFloat(productsQuery.rows[0].total_quantity),
          total_value: parseFloat(productsQuery.rows[0].total_value)
        },
        low_stock_items: {
          total_critical: parseInt(lowStockQuery.rows[0].count),
          out_of_stock: parseInt(lowStockQuery.rows[0].out_of_stock),
          low_stock: parseInt(lowStockQuery.rows[0].low_stock)
        },
        pending_receipts: {
          count: parseInt(receiptsQuery.rows[0].count)
        },
        pending_deliveries: {
          count: parseInt(deliveriesQuery.rows[0].count)
        },
        scheduled_transfers: {
          count: parseInt(transfersQuery.rows[0].count)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching dashboard KPIs" 
    });
  }
};

export {
  getTotalProductsInStock,
  getLowStockItems,
  getPendingReceipts,
  getPendingDeliveries,
  getScheduledTransfers,
  getAllKPIs
};

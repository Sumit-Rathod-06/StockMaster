-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('InventoryManager','WarehouseStaff','Admin')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('reset', 'verification')),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- MASTER DATA
-- ============================================================================

CREATE TABLE warehouses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  parent_id INT REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  category_id INT REFERENCES categories(id),
  uom TEXT NOT NULL,
  reorder_level INT DEFAULT 0,
  unit_cost NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- INVENTORY
-- ============================================================================

CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity NUMERIC DEFAULT 0 CHECK (quantity >= 0),
  reserved NUMERIC DEFAULT 0 CHECK (reserved >= 0),
  available NUMERIC GENERATED ALWAYS AS (quantity - reserved) STORED,
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

-- ============================================================================
-- RECEIPTS (INCOMING)
-- ============================================================================

CREATE TABLE receipts (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  supplier_id INT REFERENCES suppliers(id),
  warehouse_id INT REFERENCES warehouses(id) NOT NULL,
  status TEXT CHECK (status IN ('Draft','Waiting','Ready','Done','Canceled')) DEFAULT 'Draft',
  expected_date DATE,
  received_date TIMESTAMP,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE receipt_lines (
  id SERIAL PRIMARY KEY,
  receipt_id INT REFERENCES receipts(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) NOT NULL,
  qty_ordered NUMERIC NOT NULL CHECK (qty_ordered > 0),
  qty_received NUMERIC DEFAULT 0 CHECK (qty_received >= 0),
  uom TEXT NOT NULL,
  unit_cost NUMERIC DEFAULT 0,
  notes TEXT
);

-- ============================================================================
-- DELIVERIES (OUTGOING)
-- ============================================================================

CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  customer_id INT REFERENCES customers(id),
  warehouse_id INT REFERENCES warehouses(id) NOT NULL,
  status TEXT CHECK (status IN ('Draft','Waiting','Ready','Done','Canceled')) DEFAULT 'Draft',
  scheduled_date DATE,
  shipped_date TIMESTAMP,
  delivery_address TEXT,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE delivery_lines (
  id SERIAL PRIMARY KEY,
  delivery_id INT REFERENCES deliveries(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) NOT NULL,
  qty_ordered NUMERIC NOT NULL CHECK (qty_ordered > 0),
  qty_picked NUMERIC DEFAULT 0 CHECK (qty_picked >= 0),
  uom TEXT NOT NULL,
  notes TEXT
);

-- ============================================================================
-- TRANSFERS
-- ============================================================================

CREATE TABLE transfers (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  from_warehouse_id INT REFERENCES warehouses(id) NOT NULL,
  to_warehouse_id INT REFERENCES warehouses(id) NOT NULL,
  status TEXT CHECK (status IN ('Draft','Waiting','Ready','Done','Canceled')) DEFAULT 'Draft',
  transfer_date DATE,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  CHECK (from_warehouse_id != to_warehouse_id)
);

CREATE TABLE transfer_lines (
  id SERIAL PRIMARY KEY,
  transfer_id INT REFERENCES transfers(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) NOT NULL,
  qty NUMERIC NOT NULL CHECK (qty > 0),
  uom TEXT NOT NULL
);

-- ============================================================================
-- ADJUSTMENTS
-- ============================================================================

CREATE TABLE adjustments (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  product_id INT REFERENCES products(id) NOT NULL,
  warehouse_id INT REFERENCES warehouses(id) NOT NULL,
  old_qty NUMERIC NOT NULL,
  new_qty NUMERIC NOT NULL,
  diff NUMERIC GENERATED ALWAYS AS (new_qty - old_qty) STORED,
  reason TEXT NOT NULL,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- STOCK LEDGER (AUDIT)
-- ============================================================================

CREATE TABLE stock_ledger (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) NOT NULL,
  warehouse_id INT REFERENCES warehouses(id) NOT NULL,
  change NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receipt','delivery','transfer_in','transfer_out','adjustment')),
  reference_type TEXT, -- 'receipt', 'delivery', 'transfer', 'adjustment'
  reference_id INT,
  reference_number TEXT,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- ALERTS
-- ============================================================================

CREATE TABLE stock_alerts (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  warehouse_id INT REFERENCES warehouses(id),
  alert_type TEXT CHECK (alert_type IN ('low_stock','overstock','negative_stock')),
  message TEXT,
  status TEXT CHECK (status IN ('active','resolved')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX idx_stock_ledger_created ON stock_ledger(created_at);

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

CREATE VIEW v_current_stock AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.sku,
  w.id as warehouse_id,
  w.name as warehouse_name,
  i.quantity,
  i.reserved,
  i.available,
  p.reorder_level,
  CASE 
    WHEN i.available <= p.reorder_level THEN 'low'
    ELSE 'normal'
  END as stock_status
FROM products p
LEFT JOIN inventory i ON p.id = i.product_id
LEFT JOIN warehouses w ON i.warehouse_id = w.id
WHERE p.is_active = true;

-- {
--   "loginId": "101",
--   "emailId": "mayurraonang@gmail.com",
--   "password": "Mayur@2005",
--   "role": "InventoryManager"
-- }

-- {
--   "loginId": "101",
--   "password": "Mayur@2005"
-- }
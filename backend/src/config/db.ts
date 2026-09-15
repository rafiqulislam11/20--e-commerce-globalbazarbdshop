import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'globalbazarbd.db');
export const db = new Database(dbPath);

// Enable WAL mode & foreign keys for performance and data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  const schema = `
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CUSTOMER', -- 'ADMIN', 'STAFF', 'CUSTOMER'
      avatar TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'BLOCKED'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Addresses Table
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Home', -- 'Home', 'Office'
      division TEXT NOT NULL,
      district TEXT NOT NULL,
      upazila TEXT NOT NULL,
      full_address TEXT NOT NULL,
      phone TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image TEXT,
      icon TEXT,
      parent_id TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    -- Brands Table
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category_id TEXT NOT NULL,
      brand_id TEXT,
      description_en TEXT,
      description_bn TEXT,
      short_desc_en TEXT,
      short_desc_bn TEXT,
      price REAL NOT NULL,
      sale_price REAL,
      cost_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      stock_status TEXT NOT NULL DEFAULT 'IN_STOCK', -- 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'
      weight TEXT,
      dimensions TEXT,
      warranty TEXT,
      return_policy TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_flash_sale INTEGER NOT NULL DEFAULT 0,
      flash_sale_price REAL,
      status TEXT NOT NULL DEFAULT 'PUBLISHED', -- 'DRAFT', 'PUBLISHED', 'ARCHIVED'
      rating REAL NOT NULL DEFAULT 5.0,
      review_count INTEGER NOT NULL DEFAULT 0,
      tags TEXT, -- JSON array string
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
    );

    -- Product Images
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0,
      display_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Product Variants
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      price REAL,
      stock INTEGER NOT NULL DEFAULT 0,
      attributes_json TEXT NOT NULL, -- e.g. {"Color":"Midnight Blue","Size":"XL"}
      image_url TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      division TEXT NOT NULL,
      district TEXT NOT NULL,
      upazila TEXT NOT NULL,
      shipping_method TEXT NOT NULL, -- 'INSIDE_DHAKA', 'OUTSIDE_DHAKA', 'EXPRESS'
      shipping_charge REAL NOT NULL DEFAULT 0,
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      grand_total REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'COD', 'BKASH', 'NAGAD', 'CARD', 'BANK'
      payment_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAYMENT_VERIFICATION_PENDING', 'PAID', 'FAILED', 'CANCELLED', 'CORRECTION_REQUESTED'
      order_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'PAYMENT_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
      transaction_id TEXT,
      payment_phone TEXT,
      payment_proof TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      product_name TEXT NOT NULL,
      product_image TEXT,
      variant_name TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Order Status Timeline
    CREATE TABLE IF NOT EXISTS order_timeline (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Coupons Table
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL, -- 'PERCENTAGE', 'FIXED'
      discount_val REAL NOT NULL,
      min_order_val REAL NOT NULL DEFAULT 0,
      max_discount REAL,
      usage_limit INTEGER,
      used_count INTEGER NOT NULL DEFAULT 0,
      start_date DATETIME,
      end_date DATETIME,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Reviews Table
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      comment TEXT NOT NULL,
      is_verified_purchase INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING', 'HIDDEN'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Flash Sales
    CREATE TABLE IF NOT EXISTS flash_sales (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_bn TEXT NOT NULL,
      banner TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      discount_text TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Hero Banners
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_bn TEXT NOT NULL,
      subtitle_en TEXT,
      subtitle_bn TEXT,
      image_desktop TEXT NOT NULL,
      image_mobile TEXT,
      link_url TEXT NOT NULL DEFAULT '/shop',
      cta_text_en TEXT NOT NULL DEFAULT 'Shop Now',
      cta_text_bn TEXT NOT NULL DEFAULT 'এখনই কিনুন',
      display_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Blog Posts
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_bn TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      summary_en TEXT,
      summary_bn TEXT,
      content_en TEXT NOT NULL,
      content_bn TEXT NOT NULL,
      cover_image TEXT,
      category TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'Global Bazar BD Team',
      read_time TEXT NOT NULL DEFAULT '4 min',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Contact Messages
    CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Settings Key-Value Store
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Wishlists Table
    CREATE TABLE IF NOT EXISTS wishlists (
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Indexes for fast queries
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
    CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
    CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
  `;

  db.exec(schema);
  console.log('✅ SQLite Database schema initialized successfully.');
}

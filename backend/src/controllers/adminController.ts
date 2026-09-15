import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export function getDashboardStats(_req: AuthRequest, res: Response): void {
  try {
    const totalSalesRow = db.prepare(`
      SELECT SUM(grand_total) as total
      FROM orders
      WHERE order_status NOT IN ('CANCELLED', 'REFUNDED')
    `).get() as any;
    const totalSales = totalSalesRow?.total || 0;

    const todaySalesRow = db.prepare(`
      SELECT SUM(grand_total) as total
      FROM orders
      WHERE DATE(created_at) = DATE('now') AND order_status NOT IN ('CANCELLED', 'REFUNDED')
    `).get() as any;
    const todaySales = todaySalesRow?.total || 0;

    const totalOrdersRow = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const totalOrders = totalOrdersRow?.count || 0;

    const pendingOrdersRow = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'PENDING'").get() as any;
    const pendingOrders = pendingOrdersRow?.count || 0;

    const totalCustomersRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'CUSTOMER'").get() as any;
    const totalCustomers = totalCustomersRow?.count || 0;

    const totalProductsRow = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'PUBLISHED'").get() as any;
    const totalProducts = totalProductsRow?.count || 0;

    const lowStockProductsRow = db.prepare("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 10 AND status = 'PUBLISHED'").get() as any;
    const lowStockProducts = lowStockProductsRow?.count || 0;

    // Recent 7 days sales
    const salesChart = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(id) as order_count,
        SUM(grand_total) as revenue
      FROM orders
      WHERE created_at >= DATE('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `).all();

    // Category distribution
    const categoryDistribution = db.prepare(`
      SELECT c.name_en as name, COUNT(p.id) as count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY count DESC
      LIMIT 6
    `).all();

    // Recent 5 Orders
    const recentOrders = db.prepare(`
      SELECT id, order_number, customer_name, customer_phone, grand_total, order_status, payment_method, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    // Low stock product list
    const lowStockItems = db.prepare(`
      SELECT id, name_en, name_bn, sku, stock_quantity, price, sale_price
      FROM products
      WHERE stock_quantity <= 10 AND status = 'PUBLISHED'
      ORDER BY stock_quantity ASC
      LIMIT 6
    `).all();

    res.json({
      success: true,
      stats: {
        totalSales,
        todaySales,
        totalOrders,
        pendingOrders,
        totalCustomers,
        totalProducts,
        lowStockProducts,
        salesChart,
        categoryDistribution,
        recentOrders,
        lowStockItems
      }
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Product Management ----------------
export function adminGetProducts(req: AuthRequest, res: Response): void {
  try {
    const products = db.prepare(`
      SELECT 
        p.*,
        c.name_en as category_name,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `).all();

    res.json({ success: true, products });
  } catch (err: any) {
    console.error('Admin get products error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminCreateProduct(req: AuthRequest, res: Response): void {
  try {
    const {
      name_en,
      name_bn,
      category_id,
      brand_id,
      price,
      sale_price,
      cost_price,
      stock_quantity,
      warranty,
      description_en,
      description_bn,
      image_url,
      sku,
      is_featured,
      is_flash_sale,
      flash_sale_price
    } = req.body;

    if (!name_en || !category_id || !price) {
      res.status(400).json({ success: false, message: 'Name, Category, and Price are required' });
      return;
    }

    const id = `prod-${Date.now()}`;
    const slug = name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Math.random().toString(36).substr(2, 4)}`;
    const productSku = sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

    db.prepare(`
      INSERT INTO products (
        id, name_en, name_bn, slug, sku, category_id, brand_id, price, sale_price, cost_price,
        stock_quantity, stock_status, warranty, description_en, description_bn, is_featured,
        is_flash_sale, flash_sale_price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')
    `).run(
      id,
      name_en,
      name_bn || name_en,
      slug,
      productSku,
      category_id,
      brand_id || null,
      price,
      sale_price || null,
      cost_price || null,
      stock_quantity || 0,
      (stock_quantity || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
      warranty || null,
      description_en || '',
      description_bn || '',
      is_featured ? 1 : 0,
      is_flash_sale ? 1 : 0,
      flash_sale_price || null
    );

    if (image_url) {
      db.prepare(`
        INSERT INTO product_images (id, product_id, image_url, is_primary, display_order)
        VALUES (?, ?, ?, 1, 1)
      `).run(`img-${Date.now()}`, id, image_url);
    }

    res.status(201).json({ success: true, message: 'Product created successfully', id });
  } catch (err: any) {
    console.error('Admin create product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error: ' + err.message });
  }
}

export function adminUpdateProduct(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const {
      name_en,
      name_bn,
      category_id,
      brand_id,
      price,
      sale_price,
      cost_price,
      stock_quantity,
      warranty,
      description_en,
      description_bn,
      is_featured,
      is_flash_sale,
      flash_sale_price,
      status,
      image_url
    } = req.body;

    const stock = parseInt(stock_quantity) || 0;
    const stockStatus = stock <= 0 ? 'OUT_OF_STOCK' : (stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK');

    db.prepare(`
      UPDATE products
      SET name_en = ?, name_bn = ?, category_id = ?, brand_id = ?, price = ?, sale_price = ?,
          cost_price = ?, stock_quantity = ?, stock_status = ?, warranty = ?, description_en = ?,
          description_bn = ?, is_featured = ?, is_flash_sale = ?, flash_sale_price = ?, status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      name_en,
      name_bn,
      category_id,
      brand_id || null,
      price,
      sale_price || null,
      cost_price || null,
      stock,
      stockStatus,
      warranty || null,
      description_en || '',
      description_bn || '',
      is_featured ? 1 : 0,
      is_flash_sale ? 1 : 0,
      flash_sale_price || null,
      status || 'PUBLISHED',
      id
    );

    if (image_url) {
      // Check if image already exists
      const existingImg = db.prepare('SELECT id FROM product_images WHERE product_id = ? AND is_primary = 1').get(id);
      if (existingImg) {
        db.prepare('UPDATE product_images SET image_url = ? WHERE product_id = ? AND is_primary = 1').run(image_url, id);
      } else {
        db.prepare('INSERT INTO product_images (id, product_id, image_url, is_primary, display_order) VALUES (?, ?, ?, 1, 1)')
          .run(`img-${Date.now()}`, id, image_url);
      }
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err: any) {
    console.error('Admin update product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminDeleteProduct(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Admin delete product error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Order Management ----------------
export function adminGetOrders(req: AuthRequest, res: Response): void {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM orders';
    const conditions: string[] = [];
    const params: any[] = [];

    if (status && status !== 'ALL') {
      conditions.push('order_status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(order_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);
    res.json({ success: true, orders });
  } catch (err: any) {
    console.error('Admin get orders error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminUpdateOrderStatus(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { order_status, payment_status, notes } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];
    if (!validStatuses.includes(order_status)) {
      res.status(400).json({ success: false, message: 'Invalid order status' });
      return;
    }

    db.prepare(`
      UPDATE orders
      SET order_status = ?,
          payment_status = COALESCE(?, payment_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(order_status, payment_status || null, id);

    // Append to timeline
    db.prepare(`
      INSERT INTO order_timeline (id, order_id, status, notes)
      VALUES (?, ?, ?, ?)
    `).run(`tl-${Date.now()}`, id, order_status, notes || `Status updated to ${order_status}`);

    res.json({ success: true, message: `Order status updated to ${order_status}` });
  } catch (err: any) {
    console.error('Admin update order status error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Category Management ----------------
export function adminCreateCategory(req: AuthRequest, res: Response): void {
  try {
    const { name_en, name_bn, slug, description, icon } = req.body;
    const id = `cat-${Date.now()}`;
    const finalSlug = slug || name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    db.prepare(`
      INSERT INTO categories (id, name_en, name_bn, slug, description, icon, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(id, name_en, name_bn || name_en, finalSlug, description || null, icon || 'Folder');

    res.status(201).json({ success: true, message: 'Category created successfully' });
  } catch (err: any) {
    console.error('Admin create category error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminDeleteCategory(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    console.error('Admin delete category error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Customer Management ----------------
export function adminGetCustomers(_req: AuthRequest, res: Response): void {
  try {
    const customers = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.status, u.created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
        (SELECT COALESCE(SUM(grand_total), 0) FROM orders WHERE user_id = u.id AND order_status != 'CANCELLED') as total_spent
      FROM users u
      WHERE u.role = 'CUSTOMER'
      ORDER BY u.created_at DESC
    `).all();

    res.json({ success: true, customers });
  } catch (err: any) {
    console.error('Admin get customers error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminToggleCustomerStatus(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const user = db.prepare('SELECT status FROM users WHERE id = ?').get(id) as any;
    if (!user) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const nextStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(nextStatus, id);

    res.json({ success: true, message: `Customer status changed to ${nextStatus}`, status: nextStatus });
  } catch (err: any) {
    console.error('Admin toggle customer status error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Coupon Management ----------------
export function adminGetCoupons(_req: AuthRequest, res: Response): void {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    res.json({ success: true, coupons });
  } catch (err: any) {
    console.error('Admin get coupons error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminCreateCoupon(req: AuthRequest, res: Response): void {
  try {
    const { code, discount_type, discount_val, min_order_val, max_discount, usage_limit } = req.body;
    const id = `cp-${Date.now()}`;

    db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_val, min_order_val, max_discount, usage_limit, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, code.toUpperCase(), discount_type, discount_val, min_order_val || 0, max_discount || null, usage_limit || null);

    res.status(201).json({ success: true, message: 'Coupon created successfully' });
  } catch (err: any) {
    console.error('Admin create coupon error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminDeleteCoupon(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    console.error('Admin delete coupon error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Reviews Moderation ----------------
export function adminGetReviews(_req: AuthRequest, res: Response): void {
  try {
    const reviews = db.prepare(`
      SELECT r.*, p.name_en as product_name
      FROM reviews r
      LEFT JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `).all();

    res.json({ success: true, reviews });
  } catch (err: any) {
    console.error('Admin get reviews error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminUpdateReviewStatus(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED', 'PENDING', 'HIDDEN'

    db.prepare('UPDATE reviews SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: `Review status changed to ${status}` });
  } catch (err: any) {
    console.error('Admin update review status error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Settings Management ----------------
export function adminUpdateSettings(req: AuthRequest, res: Response): void {
  try {
    const settings = req.body; // Key-value object
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO settings (key, value_json, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    for (const [key, val] of Object.entries(settings)) {
      stmt.run(key, JSON.stringify(val));
    }

    res.json({ success: true, message: 'Store settings updated successfully' });
  } catch (err: any) {
    console.error('Admin update settings error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

// ---------------- Payment Verification Dashboard ----------------
export function adminGetPaymentVerifications(req: AuthRequest, res: Response): void {
  try {
    const { status } = req.query;
    let query = `
      SELECT id, order_number, customer_name, customer_phone, grand_total, 
             payment_method, payment_status, order_status, transaction_id, 
             payment_phone, payment_proof, notes, created_at, updated_at
      FROM orders
      WHERE payment_method IN ('BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'BANK')
    `;
    const params: any[] = [];
    if (status && status !== 'ALL') {
      query += ' AND payment_status = ?';
      params.push(status);
    }
    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);
    res.json({ success: true, orders });
  } catch (err: any) {
    console.error('Admin get payment verifications error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminVerifyPayment(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const order = db.prepare('SELECT id, order_number, payment_status FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    db.prepare(`
      UPDATE orders
      SET payment_status = 'PAID',
          order_status = 'CONFIRMED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    db.prepare(`
      INSERT INTO order_timeline (id, order_id, status, notes)
      VALUES (?, ?, ?, ?)
    `).run(`tl-${Date.now()}`, id, 'CONFIRMED', notes || 'পেমেন্ট সফলভাবে ভেরিফাই ও কনফার্ম করা হয়েছে (Payment verified by Admin)');

    res.json({ success: true, message: 'Payment verified and order confirmed successfully' });
  } catch (err: any) {
    console.error('Admin verify payment error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminRejectPayment(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = db.prepare('SELECT id, order_number FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    db.prepare(`
      UPDATE orders
      SET payment_status = 'FAILED',
          order_status = 'CANCELLED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    db.prepare(`
      INSERT INTO order_timeline (id, order_id, status, notes)
      VALUES (?, ?, ?, ?)
    `).run(`tl-${Date.now()}`, id, 'CANCELLED', `পেমেন্ট বাতিল করা হয়েছে: ${reason || 'ভুল TrxID বা অপ্রাপ্ত পেমেন্ট'} (Payment rejected by Admin)`);

    res.json({ success: true, message: 'Payment rejected and order cancelled' });
  } catch (err: any) {
    console.error('Admin reject payment error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function adminRequestPaymentCorrection(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { instructions } = req.body;

    const order = db.prepare('SELECT id, order_number FROM orders WHERE id = ?').get(id) as any;
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    db.prepare(`
      UPDATE orders
      SET payment_status = 'CORRECTION_REQUESTED',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(id);

    db.prepare(`
      INSERT INTO order_timeline (id, order_id, status, notes)
      VALUES (?, ?, ?, ?)
    `).run(`tl-${Date.now()}`, id, 'PAYMENT_VERIFICATION', `সংশোধন চাওয়া হয়েছে: ${instructions || 'সঠিক TrxID বা পেমেন্ট নাম্বার প্রদান করুন'} (Payment correction requested by Admin)`);

    res.json({ success: true, message: 'Payment correction requested successfully' });
  } catch (err: any) {
    console.error('Admin request correction error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}


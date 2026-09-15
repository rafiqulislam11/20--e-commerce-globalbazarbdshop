import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export function createOrder(req: AuthRequest, res: Response): void {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      division,
      district,
      upazila,
      shipping_method,
      payment_method,
      items,
      coupon_code,
      notes
    } = req.body;

    if (!customer_name || !customer_phone || !delivery_address || !items || !items.length) {
      res.status(400).json({ success: false, message: 'Missing required customer or item information' });
      return;
    }

    // 1. Calculate subtotal & verify stock
    let subtotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = db.prepare('SELECT id, name_en, name_bn, price, sale_price, stock_quantity, stock_status FROM products WHERE id = ?').get(item.product_id) as any;
      if (!product) {
        res.status(400).json({ success: false, message: `Product not found: ${item.product_id}` });
        return;
      }

      if (product.stock_quantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name_en}". Only ${product.stock_quantity} available.`
        });
        return;
      }

      let unitPrice = product.sale_price !== null ? product.sale_price : product.price;

      if (item.variant_id) {
        const variant = db.prepare('SELECT id, name, price, stock FROM product_variants WHERE id = ?').get(item.variant_id) as any;
        if (variant && variant.price) {
          unitPrice = variant.price;
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product_id: product.id,
        variant_id: item.variant_id || null,
        product_name: product.name_en,
        product_image: item.product_image || null,
        variant_name: item.variant_name || null,
        price: unitPrice,
        quantity: item.quantity,
        subtotal: itemTotal,
        currentStock: product.stock_quantity
      });
    }

    // 2. Validate coupon if provided
    let discount = 0;
    if (coupon_code) {
      const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code.toUpperCase()) as any;
      if (coupon) {
        const now = new Date();
        const startValid = !coupon.start_date || new Date(coupon.start_date) <= now;
        const endValid = !coupon.end_date || new Date(coupon.end_date) >= now;
        const minSpendValid = subtotal >= coupon.min_order_val;
        const usageLimitValid = !coupon.usage_limit || coupon.used_count < coupon.usage_limit;

        if (startValid && endValid && minSpendValid && usageLimitValid) {
          if (coupon.discount_type === 'PERCENTAGE') {
            discount = (subtotal * coupon.discount_val) / 100;
            if (coupon.max_discount && discount > coupon.max_discount) {
              discount = coupon.max_discount;
            }
          } else {
            discount = coupon.discount_val;
          }
          // Increment coupon used count
          db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
        }
      }
    }

    // 3. Calculate shipping fee
    let shippingCharge = 70; // Inside Dhaka default
    if (shipping_method === 'OUTSIDE_DHAKA') {
      shippingCharge = 130;
    } else if (shipping_method === 'EXPRESS') {
      shippingCharge = 160;
    }

    // Free delivery check (e.g. over 2000 BDT)
    if (subtotal >= 2000) {
      shippingCharge = 0;
    }

    const grandTotal = Math.max(0, subtotal - discount + shippingCharge);

    // 4. Generate Order ID
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GBBD-${todayStr}-${randNum}`;
    const orderId = `ord-${Date.now()}`;
    const userId = req.user ? req.user.id : null;

    const {
      transaction_id,
      payment_phone,
      payment_proof
    } = req.body;

    const isManualPayment = ['BKASH', 'NAGAD', 'ROCKET', 'UPAY', 'BANK'].includes(payment_method);
    const initialPaymentStatus = isManualPayment ? 'PAYMENT_VERIFICATION_PENDING' : 'PENDING';
    const initialOrderStatus = isManualPayment ? 'PAYMENT_VERIFICATION' : 'PENDING';

    // 5. Database transaction for Order Creation & Inventory Decrement
    const runTransaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO orders (
          id, order_number, user_id, customer_name, customer_email, customer_phone, delivery_address,
          division, district, upazila, shipping_method, shipping_charge, subtotal, discount, grand_total,
          payment_method, payment_status, order_status, notes, transaction_id, payment_phone, payment_proof
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        orderId,
        orderNumber,
        userId,
        customer_name,
        customer_email || null,
        customer_phone,
        delivery_address,
        division || 'Dhaka',
        district || 'Dhaka',
        upazila || '',
        shipping_method || 'INSIDE_DHAKA',
        shippingCharge,
        subtotal,
        discount,
        grandTotal,
        payment_method || 'COD',
        initialPaymentStatus,
        initialOrderStatus,
        notes || null,
        transaction_id || null,
        payment_phone || null,
        payment_proof || null
      );

      // Insert items & decrement stock
      const insertItem = db.prepare(`
        INSERT INTO order_items (id, order_id, product_id, variant_id, product_name, product_image, variant_name, price, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products
        SET stock_quantity = stock_quantity - ?,
            stock_status = CASE WHEN stock_quantity - ? <= 0 THEN 'OUT_OF_STOCK' WHEN stock_quantity - ? <= 5 THEN 'LOW_STOCK' ELSE 'IN_STOCK' END
        WHERE id = ?
      `);

      for (const item of validatedItems) {
        insertItem.run(
          `oi-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          orderId,
          item.product_id,
          item.variant_id,
          item.product_name,
          item.product_image,
          item.variant_name,
          item.price,
          item.quantity,
          item.subtotal
        );

        updateStock.run(item.quantity, item.quantity, item.quantity, item.product_id);
      }

      // Initial timeline entry
      const timelineNote = isManualPayment
        ? `অর্ডার গ্রহণ করা হয়েছে - ${payment_method} পেমেন্ট ভেরিফিকেশন অপেক্ষমান (TrxID: ${transaction_id || 'N/A'}, Phone: ${payment_phone || 'N/A'})`
        : 'অর্ডার সফলভাবে গ্রহণ করা হয়েছে (Order placed successfully - COD)';

      db.prepare(`
        INSERT INTO order_timeline (id, order_id, status, notes)
        VALUES (?, ?, ?, ?)
      `).run(
        `tl-${Date.now()}`,
        orderId,
        initialOrderStatus,
        timelineNote
      );
    });

    runTransaction();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: orderId,
        order_number: orderNumber,
        customer_name,
        customer_phone,
        grand_total: grandTotal,
        subtotal,
        shipping_charge: shippingCharge,
        discount,
        payment_method,
        order_status: 'PENDING'
      }
    });
  } catch (err: any) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Internal server error: ' + err.message });
  }
}

export function trackOrder(req: Request, res: Response): void {
  try {
    const order_number = (req.query.order_number || req.query.order_id || req.query.orderId) as string;
    const phone = req.query.phone as string;

    if (!order_number || !phone) {
      res.status(400).json({ success: false, message: 'Both Order ID and Phone Number are required' });
      return;
    }

    const cleanOrderNo = (order_number as string).trim();
    const cleanPhone = (phone as string).trim();

    const order = db.prepare(`
      SELECT * FROM orders
      WHERE (order_number = ? OR id = ?) AND customer_phone LIKE ?
    `).get(cleanOrderNo, cleanOrderNo, `%${cleanPhone}%`) as any;

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'No order found matching the provided Order ID and Phone number. Please check and try again.'
      });
      return;
    }

    const items = db.prepare(`
      SELECT * FROM order_items WHERE order_id = ?
    `).all(order.id);

    const timeline = db.prepare(`
      SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC
    `).all(order.id);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        timeline
      }
    });
  } catch (err: any) {
    console.error('Track order error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getMyOrders(req: AuthRequest, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const orders = db.prepare(`
      SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ success: true, orders });
  } catch (err: any) {
    console.error('Get my orders error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getOrderById(req: Request, res: Response): void {
  try {
    const { id } = req.params;

    const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(id, id) as any;
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const timeline = db.prepare('SELECT * FROM order_timeline WHERE order_id = ? ORDER BY created_at ASC').all(order.id);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        timeline
      }
    });
  } catch (err: any) {
    console.error('Get order by id error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

import { Request, Response } from 'express';
import { db } from '../config/db.js';

export function validateCoupon(req: Request, res: Response): void {
  try {
    const { code, subtotal } = req.body;

    if (!code || typeof subtotal !== 'number') {
      res.status(400).json({ success: false, message: 'Coupon code and subtotal are required' });
      return;
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(code.toUpperCase()) as any;
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
      return;
    }

    const now = new Date();
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      res.status(400).json({ success: false, message: 'This coupon is not active yet' });
      return;
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      res.status(400).json({ success: false, message: 'This coupon has expired' });
      return;
    }

    if (subtotal < coupon.min_order_val) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ৳${coupon.min_order_val}`
      });
      return;
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
      return;
    }

    let discount = 0;
    if (coupon.discount_type === 'PERCENTAGE') {
      discount = (subtotal * coupon.discount_val) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_val;
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_val: coupon.discount_val,
        calculated_discount: discount
      }
    });
  } catch (err: any) {
    console.error('Validate coupon error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

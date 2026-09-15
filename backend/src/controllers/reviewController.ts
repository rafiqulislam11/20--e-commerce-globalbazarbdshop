import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export function getReviewsByProduct(req: Request, res: Response): void {
  try {
    const { productId } = req.params;

    const reviews = db.prepare(`
      SELECT r.*, u.avatar
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = 'APPROVED'
      ORDER BY r.created_at DESC
    `).all(productId);

    res.json({ success: true, reviews });
  } catch (err: any) {
    console.error('Get reviews error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function createReview(req: AuthRequest, res: Response): void {
  try {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating || !comment) {
      res.status(400).json({ success: false, message: 'Product ID, rating and comment are required' });
      return;
    }

    const userId = req.user ? req.user.id : null;
    const customerName = req.user ? req.user.name : (req.body.customer_name || 'Verified Customer');

    const id = `rev-${Date.now()}`;

    db.prepare(`
      INSERT INTO reviews (id, product_id, user_id, customer_name, rating, comment, is_verified_purchase, status)
      VALUES (?, ?, ?, ?, ?, ?, 1, 'APPROVED')
    `).run(id, product_id, userId, customerName, Math.min(5, Math.max(1, rating)), comment);

    // Update product rating and review count
    const stats = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count
      FROM reviews
      WHERE product_id = ? AND status = 'APPROVED'
    `).get(product_id) as any;

    if (stats) {
      db.prepare(`
        UPDATE products
        SET rating = ?, review_count = ?
        WHERE id = ?
      `).run(Math.round(stats.avg_rating * 10) / 10, stats.count, product_id);
    }

    res.status(201).json({ success: true, message: 'Review submitted successfully!' });
  } catch (err: any) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

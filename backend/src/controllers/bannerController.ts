import { Request, Response } from 'express';
import { db } from '../config/db.js';

export function getBanners(_req: Request, res: Response): void {
  try {
    const banners = db.prepare(`
      SELECT * FROM banners
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at DESC
    `).all();

    const flashSale = db.prepare(`
      SELECT * FROM flash_sales
      WHERE is_active = 1 AND end_time > CURRENT_TIMESTAMP
      ORDER BY start_time ASC
      LIMIT 1
    `).get();

    res.json({
      success: true,
      banners,
      flashSale: flashSale || null
    });
  } catch (err: any) {
    console.error('Get banners error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

import { Request, Response } from 'express';
import { db } from '../config/db.js';

export function getCategories(_req: Request, res: Response): void {
  try {
    const categories = db.prepare(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND status = 'PUBLISHED') as product_count
      FROM categories c
      WHERE c.is_active = 1
      ORDER BY c.display_order ASC, c.name_en ASC
    `).all();

    res.json({ success: true, categories });
  } catch (err: any) {
    console.error('Get categories error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getBrands(_req: Request, res: Response): void {
  try {
    const brands = db.prepare(`
      SELECT 
        b.*,
        (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND status = 'PUBLISHED') as product_count
      FROM brands b
      ORDER BY b.is_featured DESC, b.name ASC
    `).all();

    res.json({ success: true, brands });
  } catch (err: any) {
    console.error('Get brands error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

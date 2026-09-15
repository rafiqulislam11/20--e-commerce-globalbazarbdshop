import { Request, Response } from 'express';
import { db } from '../config/db.js';

export function getProducts(req: Request, res: Response): void {
  try {
    const {
      search,
      category,
      brand,
      min_price,
      max_price,
      rating,
      on_sale,
      in_stock,
      featured,
      flash_sale,
      sort = 'newest',
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string) || 12));
    const offset = (pageNum - 1) * limitNum;

    let whereConditions: string[] = ["p.status = 'PUBLISHED'"];
    let params: any[] = [];

    if (search) {
      whereConditions.push("(p.name_en LIKE ? OR p.name_bn LIKE ? OR p.sku LIKE ? OR p.tags LIKE ?)");
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (category) {
      whereConditions.push("(c.slug = ? OR p.category_id = ?)");
      params.push(category, category);
    }

    if (brand) {
      whereConditions.push("(b.slug = ? OR p.brand_id = ?)");
      params.push(brand, brand);
    }

    if (min_price) {
      whereConditions.push("COALESCE(p.sale_price, p.price) >= ?");
      params.push(parseFloat(min_price as string));
    }

    if (max_price) {
      whereConditions.push("COALESCE(p.sale_price, p.price) <= ?");
      params.push(parseFloat(max_price as string));
    }

    if (rating) {
      whereConditions.push("p.rating >= ?");
      params.push(parseFloat(rating as string));
    }

    if (on_sale === 'true' || on_sale === '1') {
      whereConditions.push("p.sale_price IS NOT NULL AND p.sale_price < p.price");
    }

    if (in_stock === 'true' || in_stock === '1') {
      whereConditions.push("p.stock_quantity > 0");
    }

    if (featured === 'true' || featured === '1') {
      whereConditions.push("p.is_featured = 1");
    }

    if (flash_sale === 'true' || flash_sale === '1') {
      whereConditions.push("p.is_flash_sale = 1");
    }

    const whereClause = whereConditions.join(' AND ');

    // Sorting
    let orderBy = "p.created_at DESC";
    if (sort === 'price-asc') orderBy = "COALESCE(p.sale_price, p.price) ASC";
    else if (sort === 'price-desc') orderBy = "COALESCE(p.sale_price, p.price) DESC";
    else if (sort === 'rating') orderBy = "p.rating DESC";
    else if (sort === 'popular') orderBy = "p.review_count DESC";

    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${whereClause}
    `;

    const countResult = db.prepare(countQuery).get(...params) as any;
    const total = countResult ? countResult.total : 0;

    const dataQuery = `
      SELECT 
        p.*,
        c.name_en as category_name_en, c.name_bn as category_name_bn, c.slug as category_slug,
        b.name as brand_name, b.slug as brand_slug,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = db.prepare(dataQuery).all(...params, limitNum, offset);

    res.json({
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: any) {
    console.error('Get products error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getProductBySlug(req: Request, res: Response): void {
  try {
    const { slug } = req.params;

    const product = db.prepare(`
      SELECT 
        p.*,
        c.name_en as category_name_en, c.name_bn as category_name_bn, c.slug as category_slug,
        b.name as brand_name, b.slug as brand_slug, b.logo as brand_logo
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.slug = ? OR p.id = ?
    `).get(slug, slug) as any;

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const images = db.prepare(`
      SELECT id, image_url, is_primary, display_order
      FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, display_order ASC
    `).all(product.id);

    const variants = db.prepare(`
      SELECT id, name, sku, price, stock, attributes_json, image_url
      FROM product_variants
      WHERE product_id = ?
    `).all(product.id);

    const reviews = db.prepare(`
      SELECT id, customer_name, rating, comment, is_verified_purchase, created_at
      FROM reviews
      WHERE product_id = ? AND status = 'APPROVED'
      ORDER BY created_at DESC
      LIMIT 10
    `).all(product.id);

    const relatedProducts = db.prepare(`
      SELECT 
        p.id, p.name_en, p.name_bn, p.slug, p.price, p.sale_price, p.rating, p.review_count, p.stock_status,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'PUBLISHED'
      LIMIT 6
    `).all(product.category_id, product.id);

    res.json({
      success: true,
      product: {
        ...product,
        images,
        variants: variants.map((v: any) => ({
          ...v,
          attributes: JSON.parse(v.attributes_json || '{}')
        })),
        reviews,
        relatedProducts
      }
    });
  } catch (err: any) {
    console.error('Get product by slug error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getFeaturedSections(_req: Request, res: Response): void {
  try {
    const flashSale = db.prepare(`
      SELECT 
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      WHERE p.is_flash_sale = 1 AND p.status = 'PUBLISHED'
      LIMIT 8
    `).all();

    const bestSellers = db.prepare(`
      SELECT 
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.review_count DESC
      LIMIT 8
    `).all();

    const newArrivals = db.prepare(`
      SELECT 
        p.*,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.created_at DESC
      LIMIT 8
    `).all();

    res.json({
      success: true,
      flashSale,
      bestSellers,
      newArrivals
    });
  } catch (err: any) {
    console.error('Get featured sections error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getSearchSuggestions(req: Request, res: Response): void {
  try {
    const query = ((req.query.q as string) || '').trim();
    if (!query || query.length < 2) {
      res.json({ success: true, suggestions: [], categories: [], brands: [] });
      return;
    }

    const term = `%${query}%`;

    const products = db.prepare(`
      SELECT id, name_en, name_bn, slug, price, sale_price,
        (SELECT image_url FROM product_images WHERE product_id = products.id ORDER BY is_primary DESC LIMIT 1) as image
      FROM products
      WHERE (name_en LIKE ? OR name_bn LIKE ? OR sku LIKE ?) AND status = 'PUBLISHED'
      LIMIT 6
    `).all(term, term, term);

    const categories = db.prepare(`
      SELECT id, name_en, name_bn, slug FROM categories
      WHERE (name_en LIKE ? OR name_bn LIKE ?) AND is_active = 1
      LIMIT 4
    `).all(term, term);

    const brands = db.prepare(`
      SELECT id, name, slug FROM brands
      WHERE name LIKE ?
      LIMIT 4
    `).all(term);

    res.json({
      success: true,
      products,
      categories,
      brands
    });
  } catch (err: any) {
    console.error('Search suggestions error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

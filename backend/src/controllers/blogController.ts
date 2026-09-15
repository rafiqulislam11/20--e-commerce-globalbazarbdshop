import { Request, Response } from 'express';
import { db } from '../config/db.js';

export function getBlogPosts(_req: Request, res: Response): void {
  try {
    const posts = db.prepare('SELECT id, title_en, title_bn, slug, summary_en, summary_bn, cover_image, category, author, read_time, created_at FROM blog_posts ORDER BY created_at DESC').all();
    res.json({ success: true, posts });
  } catch (err: any) {
    console.error('Get blog posts error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export function getBlogPostBySlug(req: Request, res: Response): void {
  try {
    const { slug } = req.params;
    const post = db.prepare('SELECT * FROM blog_posts WHERE slug = ? OR id = ?').get(slug, slug);

    if (!post) {
      res.status(404).json({ success: false, message: 'Blog post not found' });
      return;
    }

    res.json({ success: true, post });
  } catch (err: any) {
    console.error('Get blog post by slug error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

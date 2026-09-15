import { Request, Response } from 'express';
import { db } from '../config/db.js';

export function submitContactMessage(req: Request, res: Response): void {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, message: 'All required fields must be filled' });
      return;
    }

    const id = `msg-${Date.now()}`;
    db.prepare(`
      INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, name, email, phone || null, subject, message);

    res.status(201).json({
      success: true,
      message: 'ধন্যবাদ! আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে। আমাদের টিম দ্রুত যোগাযোগ করবে।'
    });
  } catch (err: any) {
    console.error('Contact message error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

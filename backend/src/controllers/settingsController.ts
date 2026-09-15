import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { DEFAULT_SETTINGS } from '../config/constants.js';

export function getPublicSettings(_req: Request, res: Response): void {
  try {
    const rows = db.prepare('SELECT key, value_json FROM settings').all() as any[];
    const settings: Record<string, any> = { ...DEFAULT_SETTINGS };

    rows.forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value_json);
      } catch {
        settings[r.key] = r.value_json;
      }
    });

    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Get settings error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

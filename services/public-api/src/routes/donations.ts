import { Router } from 'express';
import { requireScope } from '../middleware/apiKey';
import { query } from '../lib/db';

export const donationsRouter = Router();

const SANDBOX_DONATION = {
  id: 'don_sandbox_001',
  campaign_id: 'cmp_sandbox_001',
  amount: 100,
  currency: 'USD',
  status: 'succeeded',
  created_at: '2026-04-15T12:00:00Z',
};

donationsRouter.get('/', requireScope('donations:read'), async (req, res) => {
  if (req.apiKey!.environment === 'sandbox') {
    return res.json({ data: [SANDBOX_DONATION], next_cursor: null });
  }
  const rows = await query(
    `SELECT d.id, d.campaign_id, d.amount, d.currency, d.status, d.created_at
       FROM donations d
       JOIN campaigns c ON c.id = d.campaign_id
      WHERE c.school_id = $1
        AND ($2::text IS NULL OR d.campaign_id = $2)
        AND ($3::text IS NULL OR d.status = $3)
      ORDER BY d.created_at DESC
      LIMIT $4`,
    [
      req.apiKey!.school_id,
      (req.query.campaign_id as string) ?? null,
      (req.query.status as string) ?? null,
      Math.min(Number(req.query.limit ?? 20), 100),
    ],
  );
  res.json({ data: rows, next_cursor: null });
});

donationsRouter.get('/:id', requireScope('donations:read'), async (req, res) => {
  if (req.apiKey!.environment === 'sandbox') {
    return res.json({ ...SANDBOX_DONATION, id: req.params.id });
  }
  const [row] = await query(
    `SELECT d.id, d.campaign_id, d.amount, d.currency, d.status, d.created_at
       FROM donations d
       JOIN campaigns c ON c.id = d.campaign_id
      WHERE d.id = $1 AND c.school_id = $2`,
    [req.params.id, req.apiKey!.school_id],
  );
  if (!row) return res.status(404).json({ error: { code: 'not_found', message: 'Bağış yok' } });
  res.json(row);
});

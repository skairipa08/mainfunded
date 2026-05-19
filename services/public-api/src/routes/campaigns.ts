import { Router } from 'express';
import { requireScope } from '../middleware/apiKey';
import { query } from '../lib/db';

export const campaignsRouter = Router();

/**
 * Sandbox modu: `req.apiKey.environment === 'sandbox'` ise gerçek datayı sızdırmamak için
 * sabit/seed örnekler döner.
 */
const SANDBOX_CAMPAIGN = {
  id: 'cmp_sandbox_001',
  title: 'Sandbox Demo Campaign',
  student_id: 'std_sandbox_001',
  goal_amount: 10_000,
  raised: 4_250,
  currency: 'USD',
  status: 'active',
  created_at: '2026-01-01T00:00:00Z',
  completed_at: null,
};

campaignsRouter.get('/', requireScope('campaigns:read'), async (req, res) => {
  if (req.apiKey!.environment === 'sandbox') {
    return res.json({ data: [SANDBOX_CAMPAIGN], next_cursor: null });
  }

  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const status = req.query.status as string | undefined;
  const rows = await query(
    `SELECT id, title, student_id, goal_amount, raised, currency, status, created_at, completed_at
       FROM campaigns
      WHERE school_id = $1
        AND ($2::text IS NULL OR status = $2)
      ORDER BY created_at DESC
      LIMIT $3`,
    [req.apiKey!.school_id, status ?? null, limit],
  );
  res.json({ data: rows, next_cursor: null });
});

campaignsRouter.get('/:id', requireScope('campaigns:read'), async (req, res) => {
  if (req.apiKey!.environment === 'sandbox') {
    return res.json({ ...SANDBOX_CAMPAIGN, id: req.params.id });
  }
  const [row] = await query(
    `SELECT id, title, student_id, goal_amount, raised, currency, status, created_at, completed_at
       FROM campaigns WHERE id=$1 AND school_id=$2`,
    [req.params.id, req.apiKey!.school_id],
  );
  if (!row) return res.status(404).json({ error: { code: 'not_found', message: 'Kampanya yok' } });
  res.json(row);
});

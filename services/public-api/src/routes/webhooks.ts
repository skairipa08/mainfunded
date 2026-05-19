import { Router } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { requireScope } from '../middleware/apiKey';
import { query } from '../lib/db';

export const webhooksRouter = Router();

const upsertSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(['donation.created', 'campaign.completed', 'monthly_report.ready'])).min(1),
});

webhooksRouter.get('/endpoints', requireScope('webhooks:write'), async (req, res) => {
  const rows = await query(
    `SELECT id, url, events, environment, status, created_at
       FROM webhook_endpoints WHERE school_id=$1 AND environment=$2`,
    [req.apiKey!.school_id, req.apiKey!.environment],
  );
  res.json(rows);
});

webhooksRouter.post('/endpoints', requireScope('webhooks:write'), async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: 'invalid_body', message: parsed.error.message } });
  }
  const secret = `whsec_${crypto.randomBytes(24).toString('base64url')}`;
  const [row] = await query<any>(
    `INSERT INTO webhook_endpoints (school_id, url, secret, events, environment)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id, url, events, environment, status, created_at`,
    [req.apiKey!.school_id, parsed.data.url, secret, parsed.data.events, req.apiKey!.environment],
  );
  res.status(201).json({ ...row, secret });
});

webhooksRouter.delete('/endpoints/:id', requireScope('webhooks:write'), async (req, res) => {
  await query(`DELETE FROM webhook_endpoints WHERE id=$1 AND school_id=$2`, [
    req.params.id,
    req.apiKey!.school_id,
  ]);
  res.status(204).end();
});

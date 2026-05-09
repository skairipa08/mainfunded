import { Router } from 'express';
import { z } from 'zod';
import { createApiKey, revokeApiKey } from '../services/apiKeys';

export const adminRouter = Router();

/**
 * NOT: Admin endpoint'leri public API key auth değil, internal admin oturumu/JWT ile
 * korunmalı. Bu router'ı sadece internal subnet veya admin auth middleware'i ardına mount edin.
 */

const createSchema = z.object({
  school_id: z.string().min(1),
  name: z.string().min(1),
  environment: z.enum(['live', 'sandbox']),
  scopes: z.array(z.string()).optional(),
});

adminRouter.post('/api-keys', async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: 'invalid_body', message: parsed.error.message } });
  }
  const { record, plaintext } = await createApiKey(parsed.data);
  res.status(201).json({
    id: record.id,
    api_key: plaintext, // tek seferlik
    environment: record.environment,
    scopes: record.scopes,
  });
});

adminRouter.delete('/api-keys/:id', async (req, res) => {
  await revokeApiKey(req.params.id);
  res.status(204).end();
});

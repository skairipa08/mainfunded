import { z } from 'zod';

export const studentVerifySchema = z.object({
  body: z.object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const studentIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

export const campaignStatusSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'published', 'paused', 'completed', 'cancelled']),
    reason: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

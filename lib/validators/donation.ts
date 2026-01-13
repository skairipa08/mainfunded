import { z } from 'zod';

export const createCheckoutSchema = z.object({
  campaign_id: z.string().min(1),
  amount: z.number().min(0.01).max(100000),
  donor_name: z.string().min(1).max(200).optional(),
  donor_email: z.string().email().optional(),
  anonymous: z.boolean().optional(),
  origin_url: z.string().url(),
  idempotency_key: z.string().optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

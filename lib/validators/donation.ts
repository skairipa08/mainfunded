import { z } from 'zod';

export const createCheckoutSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign ID is required'),
  amount: z.coerce.number().min(0.01, 'Minimum donation is $0.01').max(100000, 'Maximum donation is $100,000'),
  donor_name: z.string().max(200).optional().default('Anonymous'),
  donor_email: z.string().email('Invalid email format').optional(),
  anonymous: z.boolean().optional().default(false),
  coverFees: z.boolean().optional().default(false),
  note_to_student: z.string().max(500).optional().default(''),
  platform_tip_percent: z.coerce.number().min(0).max(100).optional().default(0),
  platform_tip_amount: z.coerce.number().min(0).optional().default(0),
  origin_url: z.string().url().optional(),
  idempotency_key: z.string().optional(),
});

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

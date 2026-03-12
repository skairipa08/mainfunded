import { z } from 'zod';

const tributeOccasionSchema = z.enum([
  'birthday',
  'mothers_day',
  'graduation',
  'get_well',
  'general',
]);

export const tributeInfoSchema = z.object({
  isTribute: z.boolean().default(false),
  honoreeName: z.string().min(1, 'Honoree name is required').max(200),
  honoreeEmail: z.string().email('Invalid honoree email').optional(),
  occasion: tributeOccasionSchema.default('general'),
  message: z.string().max(1000).optional().default(''),
  donorDisplayName: z.string().max(200).optional(),
});

export type TributeInfoInput = z.infer<typeof tributeInfoSchema>;

export const createCheckoutSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign ID is required'),
  amount: z.coerce.number().min(0.01, 'Minimum donation is $0.01').max(100000, 'Maximum donation is $100,000'),
  interval: z.enum(['one-time', 'week', 'month', 'quarterly', 'yearly']).optional().default('one-time'),
  donor_name: z.string().max(200).optional().default('Anonymous'),
  donor_email: z.string().email('Invalid email format').optional(),
  anonymous: z.boolean().optional().default(false),
  coverFees: z.boolean().optional().default(false),
  note_to_student: z.string().max(500).optional().default(''),
  platform_tip_percent: z.coerce.number().min(0).max(100).optional().default(0),
  platform_tip_amount: z.coerce.number().min(0).optional().default(0),
  origin_url: z.string().url().optional(),
  idempotency_key: z.string().optional(),
  /** Tribute giving — optional */
  tribute_info: tributeInfoSchema.optional(),
});


export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

// ─── Subscription Management Schemas ─────────────────────────────────────────

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional().default(''),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

export const updateSubscriptionSchema = z.object({
  amount: z.coerce.number().min(0.01).max(100000).optional(),
  interval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
});

export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;

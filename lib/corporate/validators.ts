import { z } from 'zod';
import { ELIGIBLE_CATEGORIES } from './types';

const categoryEnum = z.enum(ELIGIBLE_CATEGORIES as unknown as [string, ...string[]]);

export const signupSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    legalName: z.string().trim().max(300).optional(),
    taxId: z.string().trim().min(1).max(50),
    contactEmail: z.string().email().toLowerCase(),
    contactPhone: z.string().trim().max(50).optional(),
    websiteUrl: z.string().url().max(500).optional(),
    logoUrl: z.string().url().max(500).optional(),
    password: z.string().min(8).max(200),
  })
  .strict();

export const matchingRuleSchema = z
  .object({
    ratio: z
      .number()
      .int()
      .refine((v) => v === 1 || v === 2 || v === 3, {
        message: 'ratio must be 1, 2, or 3',
      }),
    monthlyBudgetTRY: z.number().int().positive(),
    eligibleCategories: z.array(categoryEnum).min(1),
    active: z.boolean(),
  })
  .strict();

export const simulateSchema = z
  .object({
    donationAmountTRY: z.number().int().positive(),
    category: categoryEnum,
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    legalName: z.string().trim().max(300).nullable().optional(),
    logoUrl: z.string().url().max(500).nullable().optional(),
    contactEmail: z.string().email().toLowerCase().optional(),
    contactPhone: z.string().trim().max(50).nullable().optional(),
    websiteUrl: z.string().url().max(500).nullable().optional(),
  })
  .strict();

export const approveDecisionSchema = z
  .object({
    decision: z.enum(['APPROVE', 'REJECT']),
    reason: z.string().trim().min(1).max(1000).optional(),
  })
  .strict()
  .refine(
    (v) => v.decision === 'APPROVE' || (v.decision === 'REJECT' && !!v.reason),
    { message: 'reason is required when decision is REJECT', path: ['reason'] }
  );

export type SignupInput = z.infer<typeof signupSchema>;
export type MatchingRuleInput = z.infer<typeof matchingRuleSchema>;
export type SimulateInputBody = z.infer<typeof simulateSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ApproveDecisionInput = z.infer<typeof approveDecisionSchema>;

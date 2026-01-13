import { z } from 'zod';

export const campaignCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    story: z.string().min(1).max(10000),
    category: z.enum(['tuition', 'books', 'laptop', 'housing', 'travel', 'emergency']),
    goal_amount: z.number().positive().max(1000000),
    timeline: z.string().optional(),
    impact_log: z.string().optional(),
    cover_image: z.string().url().optional(),
    country: z.string().optional(),
    field_of_study: z.string().optional(),
  }),
});

export const campaignUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    story: z.string().min(1).max(10000).optional(),
    category: z.enum(['tuition', 'books', 'laptop', 'housing', 'travel', 'emergency']).optional(),
    goal_amount: z.number().positive().max(1000000).optional(),
    timeline: z.string().optional(),
    impact_log: z.string().optional(),
    cover_image: z.string().url().optional(),
    status: z.enum(['draft', 'published', 'paused', 'completed', 'cancelled']).optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const campaignIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

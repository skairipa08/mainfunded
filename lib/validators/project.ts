import { z } from 'zod'

const budgetItemSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  category: z.string().min(1),
})

const timelineItemSchema = z.object({
  week: z.number().int().positive(),
  task: z.string().min(1),
})

export const projectCreateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(2000),
  type: z.enum(['club', 'team', 'research', 'competition', 'social', 'event', 'conference']),
  school_name: z.string().min(2),
  school_email: z.string().email(),
  school_level: z.enum(['high_school', 'university']),
  club_name: z.string().optional(),
  domain: z.array(z.string()).min(1).max(5),
  city: z.string().optional(),
  advisor_name: z.string().optional(),
  advisor_email: z.string().email().optional().or(z.literal('')),
  target_budget: z.number().positive().max(10_000_000),
  budget_items: z.array(budgetItemSchema).min(1).max(20),
  expected_outputs: z.array(z.string().min(1)).min(1).max(10),
  timeline: z.array(timelineItemSchema).min(1).max(52),
  files: z.array(z.string().url()).max(10),
  video_url: z.string().url().optional().or(z.literal('')),
})

export const projectUpdateSchema = projectCreateSchema.partial()

export const milestoneEvidenceSchema = z.object({
  evidence_files: z.array(z.string().url()).min(1).max(5),
  evidence_note: z.string().min(10).max(1000),
})

export const adminVerifySchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejection_reason: z.string().optional(),
})

export const adminMilestoneSchema = z.object({
  milestone_id: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  admin_note: z.string().optional(),
})

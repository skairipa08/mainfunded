/**
 * Consolidated Input Validation Module
 *
 * Single import for all Zod schemas + a `validateBody` helper that
 * returns a typed result or a 400 NextResponse.
 *
 * Usage:
 *   import { validateBody, campaignCreateSchema } from '@/lib/validators';
 *   const data = validateBody(body, campaignCreateSchema.shape.body);
 *   if (data instanceof NextResponse) return data; // validation failed
 */

import { z, ZodSchema, ZodError } from 'zod';
import { NextResponse } from 'next/server';

// ── Re-export all domain schemas ──────────────────────────────
export * from './campaign';
export * from './donation';
export * from './admin';

// ── Common Schemas ────────────────────────────────────────────

/** MongoDB ObjectId string (24 hex chars) */
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID format');

/** Safe string — no HTML tags or null bytes */
export const safeString = (min = 1, max = 500) =>
  z
    .string()
    .min(min)
    .max(max)
    .refine((s) => !s.includes('\0'), 'Null bytes not allowed')
    .refine((s) => !/<script/i.test(s), 'HTML script tags not allowed');

/** Pagination query params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/** Sort direction */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

// ── validateBody helper ───────────────────────────────────────

/**
 * Parse `data` against a Zod schema.
 * Returns the typed parsed value on success,
 * or a 400 NextResponse with structured error details on failure.
 */
export function validateBody<T>(
  data: unknown,
  schema: ZodSchema<T>,
): T | NextResponse {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formatZodErrors(result.error),
      },
    },
    { status: 400 },
  );
}

/**
 * Same as validateBody but for URL query / search params.
 */
export function validateQuery<T>(
  params: Record<string, string | string[] | undefined>,
  schema: ZodSchema<T>,
): T | NextResponse {
  return validateBody(params, schema);
}

// ── Error formatting ──────────────────────────────────────────

function formatZodErrors(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

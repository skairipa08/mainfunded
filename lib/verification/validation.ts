/**
 * Zod Validation Schemas for Verification System
 * 
 * Provides input validation for all verification-related DTOs.
 * Applied at API route level to ensure data integrity.
 */

import { z } from 'zod';
import {
    INSTITUTION_TYPES,
    DEGREE_LEVELS,
    DOCUMENT_TYPES,
    REJECT_REASONS
} from '@/types/verification';

// =======================================
// Base Validators
// =======================================

const nameSchema = z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-ZÀ-ÿ\u0100-\u017F\s'-]+$/, 'Name contains invalid characters');

const phoneSchema = z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number format (use E.164 format)');

const studentIdSchema = z.string()
    .min(5, 'Student ID must be at least 5 characters')
    .max(30, 'Student ID must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9-]+$/, 'Student ID must be alphanumeric');

const countrySchema = z.string()
    .length(2, 'Country must be a 2-letter ISO 3166-1 code')
    .regex(/^[A-Z]{2}$/, 'Country must be uppercase ISO code');

const yearSchema = z.number()
    .int('Year must be an integer')
    .min(2000, 'Year must be 2000 or later')
    .max(2040, 'Year must be 2040 or earlier');

const dateOfBirthSchema = z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
        const dob = new Date(date);
        const now = new Date();
        const age = Math.floor((now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 16;
    }, 'Must be at least 16 years old')
    .refine((date) => {
        const dob = new Date(date);
        const now = new Date();
        const age = Math.floor((now.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age <= 35;
    }, 'Must be 35 years or younger');

// =======================================
// CreateVerificationDTO Schema
// =======================================

export const createVerificationSchema = z.object({
    // Profile fields
    first_name: nameSchema,
    last_name: nameSchema,
    date_of_birth: dateOfBirthSchema,
    phone: phoneSchema,
    country: countrySchema,
    city: z.string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must not exceed 100 characters')
        .optional(),

    // Education fields
    institution_name: z.string()
        .min(3, 'Institution name must be at least 3 characters')
        .max(200, 'Institution name must not exceed 200 characters'),
    institution_country: countrySchema,
    institution_type: z.enum(INSTITUTION_TYPES, {
        errorMap: () => ({ message: `Institution type must be one of: ${INSTITUTION_TYPES.join(', ')}` })
    }),
    student_id: studentIdSchema,
    enrollment_year: yearSchema.refine((year) => {
        const currentYear = new Date().getFullYear();
        return year >= currentYear - 10 && year <= currentYear + 1;
    }, 'Enrollment year must be within last 10 years or next year'),
    expected_graduation: yearSchema.refine((year) => {
        const currentYear = new Date().getFullYear();
        return year >= currentYear && year <= currentYear + 8;
    }, 'Expected graduation must be within next 8 years'),
    degree_program: z.string()
        .min(2, 'Degree program must be at least 2 characters')
        .max(150, 'Degree program must not exceed 150 characters'),
    degree_level: z.enum(DEGREE_LEVELS, {
        errorMap: () => ({ message: `Degree level must be one of: ${DEGREE_LEVELS.join(', ')}` })
    }),
    is_full_time: z.boolean(),

    // Financial context (optional)
    monthly_income: z.number()
        .min(0, 'Monthly income cannot be negative')
        .max(100000, 'Monthly income exceeds maximum')
        .optional(),
    has_scholarship: z.boolean().optional(),
    scholarship_amount: z.number()
        .min(0, 'Scholarship amount cannot be negative')
        .max(100000, 'Scholarship amount exceeds maximum')
        .optional(),
    financial_need_statement: z.string()
        .max(1000, 'Financial need statement must not exceed 1000 characters')
        .optional(),
}).refine((data) => {
    // Cross-field validation: graduation must be after enrollment
    return data.expected_graduation >= data.enrollment_year;
}, {
    message: 'Expected graduation must be after or equal to enrollment year',
    path: ['expected_graduation']
});

// =======================================
// UpdateVerificationDTO Schema
// =======================================

export const updateVerificationSchema = z.object({
    // All fields optional for partial updates
    first_name: nameSchema.optional(),
    last_name: nameSchema.optional(),
    date_of_birth: dateOfBirthSchema.optional(),
    phone: phoneSchema.optional(),
    country: countrySchema.optional(),
    city: z.string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City must not exceed 100 characters')
        .optional(),

    institution_name: z.string()
        .min(3, 'Institution name must be at least 3 characters')
        .max(200, 'Institution name must not exceed 200 characters')
        .optional(),
    institution_country: countrySchema.optional(),
    institution_type: z.enum(INSTITUTION_TYPES).optional(),
    student_id: studentIdSchema.optional(),
    enrollment_year: yearSchema.optional(),
    expected_graduation: yearSchema.optional(),
    degree_program: z.string()
        .min(2, 'Degree program must be at least 2 characters')
        .max(150, 'Degree program must not exceed 150 characters')
        .optional(),
    degree_level: z.enum(DEGREE_LEVELS).optional(),
    is_full_time: z.boolean().optional(),

    monthly_income: z.number()
        .min(0, 'Monthly income cannot be negative')
        .max(100000, 'Monthly income exceeds maximum')
        .optional(),
    has_scholarship: z.boolean().optional(),
    scholarship_amount: z.number()
        .min(0, 'Scholarship amount cannot be negative')
        .max(100000, 'Scholarship amount exceeds maximum')
        .optional(),
    financial_need_statement: z.string()
        .max(1000, 'Financial need statement must not exceed 1000 characters')
        .optional(),
}).refine((data) => {
    // At least one field must be provided
    return Object.keys(data).length > 0;
}, {
    message: 'At least one field must be provided for update'
});

// =======================================
// SubmitVerificationDTO Schema
// =======================================

export const submitVerificationSchema = z.object({
    verification_id: z.string()
        .min(1, 'Verification ID is required'),
    version: z.number()
        .int('Version must be an integer')
        .min(0, 'Version must be non-negative'),
    declaration_accepted: z.boolean()
        .refine((val) => val === true, 'You must accept the declaration to submit'),
});

// =======================================
// AdminActionDTO Schema
// =======================================

const adminActions = [
    'APPROVE', 'REJECT', 'NEEDS_MORE_INFO', 'SUSPEND',
    'INVESTIGATE', 'REVOKE', 'BAN', 'LIFT_SUSPENSION',
    'REASSIGN', 'ESCALATE'
] as const;

export const adminActionSchema = z.object({
    action: z.enum(adminActions, {
        errorMap: () => ({ message: `Action must be one of: ${adminActions.join(', ')}` })
    }),
    reason: z.string()
        .min(1, 'Reason is required for this action')
        .max(1000, 'Reason must not exceed 1000 characters')
        .optional(),
    reason_code: z.enum(REJECT_REASONS).optional(),
    requested_documents: z.array(z.enum(DOCUMENT_TYPES))
        .max(7, 'Cannot request more than 7 document types')
        .optional(),
    message: z.string()
        .max(2000, 'Message must not exceed 2000 characters')
        .optional(),
    suspend_until: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/, 'Invalid date format')
        .optional(),
    new_assignee: z.string().optional(),
    escalate_to: z.string().optional(),
    internal_notes: z.string()
        .max(2000, 'Internal notes must not exceed 2000 characters')
        .optional(),
}).refine((data) => {
    // REJECT requires reason
    if (data.action === 'REJECT' && !data.reason) {
        return false;
    }
    return true;
}, {
    message: 'Reason is required for REJECT action',
    path: ['reason']
}).refine((data) => {
    // NEEDS_MORE_INFO requires requested_documents
    if (data.action === 'NEEDS_MORE_INFO' && (!data.requested_documents || data.requested_documents.length === 0)) {
        return false;
    }
    return true;
}, {
    message: 'Requested documents are required for NEEDS_MORE_INFO action',
    path: ['requested_documents']
}).refine((data) => {
    // SUSPEND requires reason
    if (data.action === 'SUSPEND' && !data.reason) {
        return false;
    }
    return true;
}, {
    message: 'Reason is required for SUSPEND action',
    path: ['reason']
}).refine((data) => {
    // REVOKE and BAN require reason
    if (['REVOKE', 'BAN'].includes(data.action) && !data.reason) {
        return false;
    }
    return true;
}, {
    message: 'Reason is required for REVOKE/BAN action',
    path: ['reason']
}).refine((data) => {
    // REASSIGN requires new_assignee
    if (data.action === 'REASSIGN' && !data.new_assignee) {
        return false;
    }
    return true;
}, {
    message: 'New assignee is required for REASSIGN action',
    path: ['new_assignee']
}).refine((data) => {
    // ESCALATE requires escalate_to
    if (data.action === 'ESCALATE' && !data.escalate_to) {
        return false;
    }
    return true;
}, {
    message: 'Escalate to is required for ESCALATE action',
    path: ['escalate_to']
});

// =======================================
// Document Upload Schema
// =======================================

export const documentUploadSchema = z.object({
    verification_id: z.string().min(1, 'Verification ID is required'),
    document_type: z.enum(DOCUMENT_TYPES, {
        errorMap: () => ({ message: `Document type must be one of: ${DOCUMENT_TYPES.join(', ')}` })
    }),
    file_name: z.string()
        .min(1, 'File name is required')
        .max(255, 'File name must not exceed 255 characters')
        .refine((name) => !name.includes('..'), 'Invalid file name')
        .refine((name) => !name.includes('\0'), 'Invalid file name'),
    mime_type: z.string()
        .refine((type) => [
            'image/jpeg', 'image/png', 'application/pdf', 'image/heic', 'image/webp'
        ].includes(type), 'Invalid file type'),
});

// =======================================
// Internal Note Schema
// =======================================

export const internalNoteSchema = z.object({
    content: z.string()
        .min(1, 'Note content is required')
        .max(5000, 'Note content must not exceed 5000 characters'),
    note_type: z.enum(['OBSERVATION', 'CONCERN', 'INVESTIGATION', 'RESOLUTION', 'HANDOFF']),
    visibility: z.enum(['ALL_ADMINS', 'SENIOR_ONLY', 'AUTHOR_ONLY']),
    tags: z.array(z.string().max(50)).max(10).optional(),
});

// =======================================
// Query Parameter Schemas
// =======================================

export const verificationQueueQuerySchema = z.object({
    status: z.string()
        .transform((val) => val.split(','))
        .pipe(z.array(z.string()))
        .optional(),
    assigned_to: z.string().optional(),
    min_risk_score: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(0).max(100))
        .optional(),
    search: z.string().max(100).optional(),
    page: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1))
        .default('1'),
    limit: z.string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100))
        .default('20'),
    sort_field: z.enum(['submitted_at', 'risk_score', 'created_at', 'status']).default('submitted_at'),
    sort_order: z.enum(['asc', 'desc']).default('asc'),
});

// =======================================
// Helper Functions
// =======================================

/**
 * Validate request body against schema
 * Returns parsed data or throws validation error
 */
export async function validateBody<T>(
    request: Request,
    schema: z.ZodSchema<T>
): Promise<T> {
    const body = await request.json();
    return schema.parse(body);
}

/**
 * Validate query parameters against schema
 * Returns parsed data or throws validation error
 */
export function validateQuery<T>(
    searchParams: URLSearchParams,
    schema: z.ZodSchema<T>
): T {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return schema.parse(params);
}

/**
 * Format Zod errors for API response
 */
export function formatZodError(error: z.ZodError): {
    message: string;
    errors: Array<{ field: string; message: string }>;
} {
    return {
        message: 'Validation failed',
        errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
        })),
    };
}

// Type exports for use in API routes
export type CreateVerificationInput = z.infer<typeof createVerificationSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type AdminActionInput = z.infer<typeof adminActionSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type InternalNoteInput = z.infer<typeof internalNoteSchema>;
export type VerificationQueueQuery = z.infer<typeof verificationQueueQuerySchema>;

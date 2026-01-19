/**
 * Verification Module Barrel Export
 */

// Types
export * from '@/types/verification';

// State Machine
export * from './transitions';

// Database Operations
export * from './db';

// Auth Guards
export * from './guards';

// Upload Validation
export * from './upload';

// Input Validation (Zod Schemas)
export * from './validation';

// Email Notifications
export * from './email';

// Campaign Fate Handler
export * from './campaign-fate';

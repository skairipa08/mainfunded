/**
 * Centralized logger — suppresses debug/info logs in production.
 * console.error and console.warn are always emitted.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('[Webhook]', 'Event processed', eventId);
 *   logger.debug('[DB]', 'Connection details', host);
 *   logger.error('[Email]', 'Send failed', error);
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
    /** Debug-level: only in development */
    debug: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },

    /** Info-level: only in development */
    info: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },

    /** Warn-level: always emitted */
    warn: (...args: unknown[]) => {
        console.warn(...args);
    },

    /** Error-level: always emitted */
    error: (...args: unknown[]) => {
        console.error(...args);
    },
};

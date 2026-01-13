/**
 * Error monitoring with Sentry
 * Gracefully handles missing configuration
 * All functions are safe to call even if Sentry is not installed
 */

let sentryInitialized = false;

export function initMonitoring() {
  // Only initialize in production or if SENTRY_DSN is set
  if (process.env.NODE_ENV !== 'production' && !process.env.SENTRY_DSN) {
    return;
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    return;
  }

  // Use dynamic import to avoid build errors if @sentry/nextjs is not installed
  // This is evaluated at runtime, not build time
  if (typeof window === 'undefined') {
    // Server-side: use require with try-catch
    try {
      // @ts-ignore - Optional dependency, may not be installed
      const Sentry = require('@sentry/nextjs');
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV || 'production',
        tracesSampleRate: 0.1, // 10% of transactions
        beforeSend(event: any) {
          // Remove sensitive data
          if (event.request) {
            // Remove auth headers
            if (event.request.headers) {
              delete event.request.headers.authorization;
              delete event.request.headers.cookie;
            }
            // Remove query params that might contain sensitive data
            if (event.request.query_string) {
              const params = new URLSearchParams(event.request.query_string);
              params.delete('token');
              params.delete('key');
              event.request.query_string = params.toString();
            }
          }
          return event;
        },
      });
      sentryInitialized = true;
    } catch {
      // Sentry not installed, silently fail
    }
  } else {
    // Client-side: use dynamic import with eval to avoid build-time resolution
    try {
      // eslint-disable-next-line no-eval
      const dynamicImport = eval('(module) => import(module)');
      dynamicImport('@sentry/nextjs').then((Sentry: any) => {
        Sentry.init({
          dsn,
          environment: process.env.NODE_ENV || 'production',
          tracesSampleRate: 0.1,
        });
        sentryInitialized = true;
      }).catch(() => {
        // Sentry not installed, silently fail
      });
    } catch {
      // Ignore if dynamic import fails
    }
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    // Fallback to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error]', error, context);
    }
    return;
  }

  try {
    if (typeof window === 'undefined') {
      // Server-side
      // @ts-ignore - Optional dependency, may not be installed
      const Sentry = require('@sentry/nextjs');
      Sentry.captureException(error, { extra: context });
    } else {
      // Client-side: use eval to avoid build-time resolution
      try {
        // eslint-disable-next-line no-eval
        const dynamicImport = eval('(module) => import(module)');
        dynamicImport('@sentry/nextjs').then((Sentry: any) => {
          Sentry.captureException(error, { extra: context });
        }).catch(() => {
          // Sentry not available
        });
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}]`, message);
    }
    return;
  }

  try {
    if (typeof window === 'undefined') {
      // Server-side
      // @ts-ignore - Optional dependency, may not be installed
      const Sentry = require('@sentry/nextjs');
      Sentry.captureMessage(message, level);
    } else {
      // Client-side: use eval to avoid build-time resolution
      try {
        // eslint-disable-next-line no-eval
        const dynamicImport = eval('(module) => import(module)');
        dynamicImport('@sentry/nextjs').then((Sentry: any) => {
          Sentry.captureMessage(message, level);
        }).catch(() => {
          // Sentry not available
        });
      } catch {
        // Ignore
      }
    }
  } catch {
    // Ignore
  }
}

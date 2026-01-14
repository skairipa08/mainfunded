let sentryModule: any = null;
let sentryInitialized = false;

function getSentry() {
  if (sentryModule !== null) {
    return sentryModule;
  }

  if (!process.env.SENTRY_DSN) {
    sentryModule = false;
    return null;
  }

  try {
    const requireSentry = new Function('module', 'return require(module)');
    sentryModule = requireSentry('@sentry/nextjs');
    return sentryModule;
  } catch {
    sentryModule = false;
    return null;
  }
}

export function initMonitoring() {
  if (process.env.NODE_ENV !== 'production' && !process.env.SENTRY_DSN) {
    return;
  }

  const dsn = process.env.SENTRY_DSN;
  if (!dsn || typeof window !== 'undefined') {
    return;
  }

  const Sentry = getSentry();
  if (!Sentry) {
    return;
  }

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1,
      beforeSend(event: any) {
        if (event.request) {
          if (event.request.headers) {
            delete event.request.headers.authorization;
            delete event.request.headers.cookie;
          }
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
    // Ignore
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    return;
  }

  const Sentry = getSentry();
  if (!Sentry) {
    return;
  }

  try {
    Sentry.captureException(error, { extra: context });
  } catch {
    // Ignore
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized) {
    return;
  }

  const Sentry = getSentry();
  if (!Sentry) {
    return;
  }

  try {
    Sentry.captureMessage(message, level);
  } catch {
    // Ignore
  }
}

import * as Sentry from '@sentry/cloudflare';

export function initSentry(env: { SENTRY_DSN?: string }) {
  if (!env.SENTRY_DSN) {
    console.log('Sentry DSN not found, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT || 'production',
    tracesSampleRate: 1.0,
  });
}

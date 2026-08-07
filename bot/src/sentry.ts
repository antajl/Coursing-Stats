// Simplified error logging using Cloudflare Observability
// Sentry integration removed due to API compatibility issues
// Cloudflare Observability is already enabled in wrangler.toml

export function captureException(error: Error, context?: Record<string, unknown>) {
  console.error('Exception captured:', error);
  if (context) {
    console.error('Context:', context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (level === 'error') {
    console.error(message);
  } else if (level === 'warning') {
    console.warn(message);
  } else {
    console.log(message);
  }
}

export function initSentry(_dsn: string) {
  // Sentry integration disabled - using Cloudflare Observability instead
  console.log('Error monitoring: using Cloudflare Observability');
}

export interface Env {
  AI: Ai;
  CACHE: KVNamespace;
  DB: D1Database;
}

export interface PDFProcessingResult {
  success: boolean;
  text?: string;
  pages?: number;
  method?: string;
  error?: string;
  metadata?: Record<string, string>;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/health') {
      return new Response('OK', { status: 200 });
    }

    // PDF processing endpoint
    if (url.pathname === '/api/process-pdf' && request.method === 'POST') {
      try {
        const body = await request.json() as { pdfUrl: string };
        const pdfUrl = body.pdfUrl;

        if (!pdfUrl) {
          return Response.json({ success: false, error: 'PDF URL is required' }, { status: 400 });
        }

        // Check cache first
        const cacheKey = `pdf:${btoa(pdfUrl)}`;
        const cachedResult = await env.CACHE.get(cacheKey, 'json');

        if (cachedResult) {
          console.log('Cache hit for:', pdfUrl);
          return Response.json({ success: true, ...cachedResult, cached: true });
        }

        console.log('Cache miss, processing PDF:', pdfUrl);

        // For now, return a placeholder response that PDF processing is not available
        // We'll need to use a different approach (local processing or external service)
        return Response.json({
          success: false,
          error: 'PDF processing requires local Node.js environment. Please use existing backend parser.',
          method: 'placeholder',
          suggestion: 'Use backend/parsers/shows/parse-rkf-certificate-pdf.ts for PDF processing'
        }, { status: 501 });

      } catch (error) {
        console.error('PDF processing error:', error);
        return Response.json(
          { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    return new Response('Not found', { status: 404 });
  },
};

// backend/src/middleware/cors.middleware.js

function securityHeaders(req, res, next) {
  // Prevent clickjacking by restricting framing to deny
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent browsers from sniffing mime types
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information sent with requests
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Disable browser-side XSS filtering (modern standard in favor of strict CSP)
  res.setHeader('X-XSS-Protection', '0');

  // API-only Content Security Policy (blocks all resource loading since this is a JSON-only API)
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");

  // Disable DNS prefetching
  res.setHeader('X-DNS-Prefetch-Control', 'off');

  // Prevents IE from executing downloads in site context
  res.setHeader('X-Download-Options', 'noopen');

  // Restricts cross-domain policies for Flash/PDFs
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Force HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

module.exports = securityHeaders;

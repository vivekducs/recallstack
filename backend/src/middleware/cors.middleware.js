// backend/src/middleware/cors.middleware.js

function securityHeaders(req, res, next) {
  // Prevent clickjacking by restricting framing to deny
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent browsers from sniffing mime types
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Control referrer information sent with requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent XSS injection attacks in older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Force HSTS in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

module.exports = securityHeaders;

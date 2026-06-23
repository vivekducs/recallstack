// backend/src/middleware/auth.middleware.js

const { verifyToken } = require('../utils/jwt');

// ========== MIDDLEWARE: VERIFY TOKEN ==========
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, role }
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ========== MIDDLEWARE: OPTIONAL AUTH ==========
// Attaches user if token present, but doesn't require it
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth
};

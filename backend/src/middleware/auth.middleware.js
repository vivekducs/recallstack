// backend/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
const JWT_EXPIRY = '7d';

// ========== PASSWORD HASHING ==========
async function hashPassword(plaintext) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plaintext, salt);
}

async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

// ========== TOKEN GENERATION ==========
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// ========== MIDDLEWARE: VERIFY TOKEN ==========
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded; // { userId, role }
    next();
  });
}

// ========== MIDDLEWARE: OPTIONAL AUTH ==========
// Attaches user if token present, but doesn't require it
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
}

// ========== MIDDLEWARE: ADMIN ONLY ==========
function adminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken,
  optionalAuth,
  adminOnly
};

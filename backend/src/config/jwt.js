// backend/src/config/jwt.js

const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

const DEFAULT_SECRET = 'your-secret-key-change-in-production';
const ALT_DEFAULT_SECRET = 'dev-secret-key-change-in-prod';

if (NODE_ENV === 'production') {
  if (!JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is not defined!');
  }
  if (JWT_SECRET === DEFAULT_SECRET || JWT_SECRET === ALT_DEFAULT_SECRET) {
    throw new Error('FATAL: Insecure JWT_SECRET developer fallback key detected in production!');
  }
}

module.exports = {
  secret: JWT_SECRET || ALT_DEFAULT_SECRET,
  expiry: JWT_EXPIRY
};

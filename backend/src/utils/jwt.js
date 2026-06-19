// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { secret, expiry } = require('../config/jwt');

function generateToken(userId, role) {
  if (!userId || !role) {
    throw new Error('userId and role are required to generate a token');
  }
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: expiry }
  );
}

function verifyToken(token) {
  if (!token) {
    throw new Error('Token is required for verification');
  }
  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken
};

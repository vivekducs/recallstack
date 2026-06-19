// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { secret, expiry } = require('../config/jwt');

function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: expiry }
  );
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = {
  generateToken,
  verifyToken
};

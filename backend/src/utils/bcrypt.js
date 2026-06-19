// backend/src/utils/bcrypt.js
const bcrypt = require('bcryptjs');

async function hashPassword(plaintext) {
  if (!plaintext) {
    throw new Error('Plaintext password is required for hashing');
  }
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plaintext, salt);
}

async function comparePassword(plaintext, hash) {
  if (!plaintext || !hash) {
    return false;
  }
  return bcrypt.compare(plaintext, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};

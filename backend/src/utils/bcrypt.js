// backend/src/utils/bcrypt.js
const bcrypt = require('bcryptjs');

async function hashPassword(plaintext) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plaintext, salt);
}

async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = {
  hashPassword,
  comparePassword
};

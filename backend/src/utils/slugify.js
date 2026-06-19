// backend/src/utils/slugify.js

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')     // Remove non-alphanumeric chars
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/-+/g, '-')             // Remove multiple -
    .substring(0, 80);               // Truncate to maximum 80 chars
}

module.exports = slugify;

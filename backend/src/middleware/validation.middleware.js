// backend/src/middleware/validation.middleware.js

function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    
    for (const key of Object.keys(schema)) {
      const rules = schema[key];
      const value = req.body[key];

      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }

      // Check type if value is present
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${key} must be of type ${rules.type}`);
        } else if (rules.type === 'array' && !Array.isArray(value)) {
          errors.push(`${key} must be an array`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    next();
  };
}

module.exports = validate;

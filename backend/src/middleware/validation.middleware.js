// backend/src/middleware/validation.middleware.js

function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    
    for (const key of Object.keys(schema)) {
      const rules = schema[key];
      const value = req.body[key];

      // 1. Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }

      // If value is not provided and not required, skip further checks
      if (value === undefined || value === null) {
        continue;
      }

      // 2. Type checks
      if (rules.type) {
        if (rules.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`${key} must be an array`);
            continue;
          }
        } else if (rules.type === 'integer') {
          if (!Number.isInteger(value)) {
            errors.push(`${key} must be an integer`);
            continue;
          }
        } else if (typeof value !== rules.type) {
          errors.push(`${key} must be of type ${rules.type}`);
          continue;
        }
      }

      // 3. String minLength / maxLength checks
      if (typeof value === 'string') {
        if (rules.minLength !== undefined && value.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength !== undefined && value.length > rules.maxLength) {
          errors.push(`${key} must be at most ${rules.maxLength} characters`);
        }
        // Regex pattern checks
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${key} has an invalid format`);
        }
      }

      // 4. Numeric min / max checks
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
        }
      }

      // 5. Enum validation checks
      if (rules.enum && Array.isArray(rules.enum)) {
        if (!rules.enum.includes(value)) {
          errors.push(`${key} must be one of: ${rules.enum.join(', ')}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    next();
  };
}

module.exports = validate;

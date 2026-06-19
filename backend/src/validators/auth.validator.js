// backend/src/validators/auth.validator.js

const registerSchema = {
  name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
  username: { required: true, type: 'string', minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_-]+$/ },
  email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
  password: { required: true, type: 'string', minLength: 8 }
};

const loginSchema = {
  email: { required: true, type: 'string', pattern: /^\S+@\S+\.\S+$/ },
  password: { required: true, type: 'string' }
};

const updateProfileSchema = {
  name: { required: false, type: 'string', minLength: 1, maxLength: 50 },
  bio: { required: false, type: 'string', maxLength: 160 },
  avatar: { required: false, type: 'string' }
};

const updatePreferencesSchema = {
  newComment: { required: false, type: 'boolean' },
  newReply: { required: false, type: 'boolean' },
  helpful: { required: false, type: 'boolean' },
  newNoteInTopic: { required: false, type: 'boolean' },
  digestFrequency: { required: false, type: 'string', enum: ['none', 'daily', 'weekly'] }
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePreferencesSchema
};

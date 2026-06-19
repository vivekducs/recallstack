// backend/src/validators/section.validator.js

const createSectionSchema = {
  title: { required: true, type: 'string', minLength: 1, maxLength: 100 },
  content: { required: true, type: 'string' },
  contentType: { required: true, type: 'string', enum: ['TEXT', 'CODE', 'EXAMPLE', 'IMAGE', 'DIAGRAM'] },
  language: { required: false, type: 'string' }
};

const updateSectionSchema = {
  title: { required: false, type: 'string', minLength: 1, maxLength: 100 },
  content: { required: false, type: 'string' },
  contentType: { required: false, type: 'string', enum: ['TEXT', 'CODE', 'EXAMPLE', 'IMAGE', 'DIAGRAM'] },
  language: { required: false, type: 'string' }
};

const reorderSectionSchema = {
  newOrder: { required: true, type: 'integer', min: 0 }
};

module.exports = {
  createSectionSchema,
  updateSectionSchema,
  reorderSectionSchema
};

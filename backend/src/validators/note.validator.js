// backend/src/validators/note.validator.js

const createNoteSchema = {
  title: { required: true, type: 'string', minLength: 3, maxLength: 100 },
  topicId: { required: true, type: 'string', minLength: 5 },
  excerpt: { required: false, type: 'string', maxLength: 250 },
  difficulty: { required: false, type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
  tags: { required: false, type: 'array' }
};

const updateNoteSchema = {
  title: { required: false, type: 'string', minLength: 3, maxLength: 100 },
  excerpt: { required: false, type: 'string', maxLength: 250 },
  difficulty: { required: false, type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
  tags: { required: false, type: 'array' }
};

const rateNoteSchema = {
  rating: { required: true, type: 'integer', min: 1, max: 5 }
};

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  rateNoteSchema
};

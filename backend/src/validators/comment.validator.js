// backend/src/validators/comment.validator.js

const createCommentSchema = {
  content: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
  parentId: { required: false, type: 'string' }
};

const updateCommentSchema = {
  content: { required: true, type: 'string', minLength: 1, maxLength: 1000 }
};

module.exports = {
  createCommentSchema,
  updateCommentSchema
};

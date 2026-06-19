// backend/src/repositories/note.repository.js
const prisma = require('../config/database');

class NoteRepository {
  findById(id, include = {}) {
    return prisma.note.findUnique({
      where: { id },
      include
    });
  }

  findMany(options = {}) {
    return prisma.note.findMany(options);
  }

  count(options = {}) {
    return prisma.note.count(options);
  }

  create(data) {
    return prisma.note.create({
      data
    });
  }

  update(id, data, select = undefined) {
    return prisma.note.update({
      where: { id },
      data,
      select
    });
  }

  delete(id) {
    return prisma.note.delete({
      where: { id }
    });
  }
}

module.exports = new NoteRepository();


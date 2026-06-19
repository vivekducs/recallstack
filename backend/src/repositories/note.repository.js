// backend/src/repositories/note.repository.js
const prisma = require('../config/database');

class NoteRepository {
  async findById(id, include = {}) {
    return prisma.note.findUnique({
      where: { id },
      include
    });
  }

  async findMany(options = {}) {
    return prisma.note.findMany(options);
  }

  async count(options = {}) {
    return prisma.note.count(options);
  }

  async create(data) {
    return prisma.note.create({
      data
    });
  }

  async update(id, data, select = undefined) {
    return prisma.note.update({
      where: { id },
      data,
      select
    });
  }

  async delete(id) {
    return prisma.note.delete({
      where: { id }
    });
  }
}

module.exports = new NoteRepository();

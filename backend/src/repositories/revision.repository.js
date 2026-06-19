// backend/src/repositories/revision.repository.js
const prisma = require('../config/database');

class RevisionRepository {
  async findById(id) {
    return prisma.revisionHistory.findUnique({
      where: { id }
    });
  }

  async findMany(options = {}) {
    return prisma.revisionHistory.findMany(options);
  }

  async create(data) {
    return prisma.revisionHistory.create({
      data
    });
  }
}

module.exports = new RevisionRepository();

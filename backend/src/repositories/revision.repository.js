// backend/src/repositories/revision.repository.js
const prisma = require('../config/database');

class RevisionRepository {
  findById(id) {
    return prisma.revisionHistory.findUnique({
      where: { id }
    });
  }

  findMany(options = {}) {
    return prisma.revisionHistory.findMany(options);
  }

  create(data) {
    return prisma.revisionHistory.create({
      data
    });
  }
}

module.exports = new RevisionRepository();


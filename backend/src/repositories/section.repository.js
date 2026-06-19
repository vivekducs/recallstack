// backend/src/repositories/section.repository.js
const prisma = require('../config/database');

class SectionRepository {
  findById(id, include = {}) {
    return prisma.section.findUnique({
      where: { id },
      include
    });
  }

  findMany(options = {}) {
    return prisma.section.findMany(options);
  }

  findFirst(options = {}) {
    return prisma.section.findFirst(options);
  }

  create(data) {
    return prisma.section.create({
      data
    });
  }

  update(id, data) {
    return prisma.section.update({
      where: { id },
      data
    });
  }

  delete(id) {
    return prisma.section.delete({
      where: { id }
    });
  }

  deleteMany(options = {}) {
    return prisma.section.deleteMany(options);
  }

  createMany(newSections) {
    return prisma.section.createMany({
      data: newSections
    });
  }
}

module.exports = new SectionRepository();


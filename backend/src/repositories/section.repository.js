// backend/src/repositories/section.repository.js
const prisma = require('../config/database');

class SectionRepository {
  async findById(id, include = {}) {
    return prisma.section.findUnique({
      where: { id },
      include
    });
  }

  async findMany(options = {}) {
    return prisma.section.findMany(options);
  }

  async findFirst(options = {}) {
    return prisma.section.findFirst(options);
  }

  async create(data) {
    return prisma.section.create({
      data
    });
  }

  async update(id, data) {
    return prisma.section.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.section.delete({
      where: { id }
    });
  }

  async deleteMany(options = {}) {
    return prisma.section.deleteMany(options);
  }

  async createMany(newSections) {
    return prisma.section.createMany({
      data: newSections
    });
  }
}

module.exports = new SectionRepository();

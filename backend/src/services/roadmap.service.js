// backend/src/services/roadmap.service.js
const prisma = require('../config/database');

class RoadmapService {
  // === Progress ===
  async getProgress(userId) {
    return await prisma.roadmapProgress.findMany({
      where: { userId }
    });
  }

  async upsertProgress(userId, itemId, completed, needsRevision) {
    if (!itemId) {
      const err = new Error('itemId required');
      err.status = 400;
      throw err;
    }

    return await prisma.roadmapProgress.upsert({
      where: {
        userId_itemId: { userId, itemId }
      },
      update: {
        completed: completed !== undefined ? completed : undefined,
        needsRevision: needsRevision !== undefined ? needsRevision : undefined
      },
      create: {
        userId,
        itemId,
        completed: completed || false,
        needsRevision: needsRevision || false
      }
    });
  }

  // === Private Notes ===
  async getNotes(userId) {
    return await prisma.roadmapNote.findMany({
      where: { userId }
    });
  }

  async upsertNote(userId, itemId, content) {
    if (!itemId) {
      const err = new Error('itemId required');
      err.status = 400;
      throw err;
    }

    return await prisma.roadmapNote.upsert({
      where: {
        userId_itemId: { userId, itemId }
      },
      update: {
        content
      },
      create: {
        userId,
        itemId,
        content
      }
    });
  }

  async deleteNote(userId, itemId) {
    if (!itemId) {
      const err = new Error('itemId required');
      err.status = 400;
      throw err;
    }

    const existing = await prisma.roadmapNote.findUnique({
      where: { userId_itemId: { userId, itemId } }
    });

    if (!existing) {
      const err = new Error('Note not found');
      err.status = 404;
      throw err;
    }

    return await prisma.roadmapNote.delete({
      where: { userId_itemId: { userId, itemId } }
    });
  }

  // === Resources ===
  async getResources() {
    return await prisma.roadmapResource.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  async addResource(itemId, title, url, type) {
    if (!itemId || !title || !url) {
      const err = new Error('itemId, title, and url are required');
      err.status = 400;
      throw err;
    }

    const validTypes = ['YOUTUBE', 'BLOG'];
    if (type && !validTypes.includes(type)) {
      const err = new Error('Invalid resource type');
      err.status = 400;
      throw err;
    }

    return await prisma.roadmapResource.create({
      data: {
        itemId,
        title,
        url,
        type: type || 'YOUTUBE'
      }
    });
  }

  async deleteResource(id) {
    const existing = await prisma.roadmapResource.findUnique({
      where: { id }
    });

    if (!existing) {
      const err = new Error('Resource not found');
      err.status = 404;
      throw err;
    }

    return await prisma.roadmapResource.delete({
      where: { id }
    });
  }
}

module.exports = new RoadmapService();

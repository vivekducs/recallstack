// backend/src/services/topic.service.js
const prisma = require('../config/database');

class TopicService {
  async getTopics(subjectId) {
    const subject = await prisma.subject.findFirst({
      where: { OR: [{ id: subjectId }, { slug: subjectId }] }
    });
    if (!subject) throw new Error('Subject not found');

    return await prisma.topic.findMany({
      where: { subjectId: subject.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        notesCount: true,
        lastUpdated: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async createTopic(subjectId, data) {
    const { name, slug, description } = data;
    if (!name || !slug) {
      const err = new Error('name and slug required');
      err.status = 400;
      throw err;
    }

    const subject = await prisma.subject.findFirst({
      where: { OR: [{ id: subjectId }, { slug: subjectId }] }
    });
    if (!subject) throw new Error('Subject not found');

    const existing = await prisma.topic.findFirst({
      where: { subjectId: subject.id, slug }
    });
    if (existing) {
      const err = new Error('Topic slug already exists in this subject');
      err.status = 409;
      throw err;
    }

    const result = await prisma.$transaction([
      prisma.topic.create({
        data: {
          name,
          slug,
          description,
          subjectId: subject.id,
          notesCount: 0
        }
      }),
      prisma.subject.update({
        where: { id: subject.id },
        data: { topicsCount: { increment: 1 } }
      })
    ]);

    return result[0];
  }

  async updateTopic(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.order = data.order;

    return await prisma.topic.update({
      where: { id },
      data: updateData
    });
  }

  async deleteTopic(id) {
    const topic = await prisma.topic.findUnique({ where: { id } });
    if (!topic) throw new Error('Topic not found');

    await prisma.$transaction([
      prisma.topic.delete({ where: { id } }),
      prisma.subject.update({
        where: { id: topic.subjectId },
        data: {
          topicsCount: { decrement: 1 },
          notesCount: { decrement: topic.notesCount }
        }
      })
    ]);

    return { deleted: true, id };
  }
}

module.exports = new TopicService();

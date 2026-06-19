// backend/src/services/subject.service.js
const prisma = require('../config/database');

class SubjectService {
  async getSubjects() {
    return await prisma.subject.findMany({
      where: { topicsCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        topicsCount: true,
        notesCount: true
      },
      orderBy: { order: 'asc' }
    });
  }

  async getSubjectByIdOrSlug(id) {
    const subject = await prisma.subject.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        topics: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            notesCount: true,
            lastUpdated: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!subject) throw new Error('Subject not found');
    return subject;
  }

  async createSubject(data) {
    const { name, slug, description, icon, color } = data;

    if (!name || !slug) {
      const err = new Error('name and slug required');
      err.status = 400;
      throw err;
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      const err = new Error('Invalid slug format. Use lowercase letters, numbers, and hyphens only.');
      err.status = 400;
      throw err;
    }

    const existing = await prisma.subject.findFirst({
      where: { OR: [{ name }, { slug }] }
    });
    if (existing) {
      const err = new Error('Subject name or slug already exists');
      err.status = 409;
      throw err;
    }

    return await prisma.subject.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        topicsCount: 0,
        notesCount: 0
      }
    });
  }

  async updateSubject(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.order !== undefined) updateData.order = data.order;

    return await prisma.subject.update({
      where: { id },
      data: updateData
    });
  }

  async deleteSubject(id) {
    await prisma.subject.delete({ where: { id } });
    return { deleted: true, id };
  }
}

module.exports = new SubjectService();

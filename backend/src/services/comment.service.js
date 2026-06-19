// backend/src/services/comment.service.js
const prisma = require('../config/database');
const emailService = require('./email.service');

class CommentService {
  async getCommentsByNote(noteId, user) {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new Error('Note not found');

    const where = { noteId };

    if (!user || user.role !== 'ADMIN') {
      where.OR = [
        { status: 'APPROVED' },
        ...(user ? [
          { userId: user.userId },
          { note: { authorId: user.userId } }
        ] : [])
      ];
    }

    const comments = await prisma.comment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    const commentMap = {};
    const rootComments = [];

    comments.forEach(c => {
      commentMap[c.id] = { ...c, replies: [] };
    });

    comments.forEach(c => {
      const mapped = commentMap[c.id];
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(mapped);
      } else {
        rootComments.push(mapped);
      }
    });

    return rootComments;
  }

  async createComment(noteId, userId, role, data) {
    const { content, parentId } = data;
    if (!content || !content.trim()) {
      const err = new Error('Comment content required');
      err.status = 400;
      throw err;
    }

    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { author: true }
    });
    if (!note) throw new Error('Note not found');

    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
      if (!parentComment) throw new Error('Parent comment not found');
    }

    let initialStatus = 'PENDING';
    if (userId === note.authorId || role === 'ADMIN' || process.env.NODE_ENV === 'development') {
      initialStatus = 'APPROVED';
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        parentId: parentId || null,
        noteId,
        userId,
        status: initialStatus
      },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } }
      }
    });

    if (userId !== note.authorId) {
      emailService.sendCommentNotification(note.author, comment.user, note.title, comment.content)
        .catch(err => console.error('Email failed:', err));
    }

    if (parentId) {
      prisma.comment.findUnique({
        where: { id: parentId },
        include: { user: true }
      }).then(parentComment => {
        if (parentComment && parentComment.userId !== userId) {
          emailService.sendReplyNotification(parentComment.user, comment.user, note.title, comment.content)
            .catch(err => console.error('Reply email failed:', err));
        }
      }).catch(err => console.error('Failed to fetch parent comment for notification:', err));
    }

    return comment;
  }

  async updateComment(id, userId, role, data) {
    const { content } = data;
    if (!content || !content.trim()) {
      const err = new Error('Comment content required');
      err.status = 400;
      throw err;
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new Error('Comment not found');

    if (comment.userId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot edit this comment');
      err.status = 403;
      throw err;
    }

    return await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } }
      }
    });
  }

  async deleteComment(id, userId, role) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!comment) throw new Error('Comment not found');

    if (comment.userId !== userId && comment.note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Cannot delete this comment');
      err.status = 403;
      throw err;
    }

    await prisma.comment.delete({ where: { id } });
    return { deleted: true, id };
  }

  async updateCommentStatus(id, userId, role, status) {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`status must be one of: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: { note: true }
    });

    if (!comment) throw new Error('Comment not found');

    if (comment.note.authorId !== userId && role !== 'ADMIN') {
      const err = new Error('Moderation requires note ownership or admin role');
      err.status = 403;
      throw err;
    }

    return await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, username: true, avatar: true } }
      }
    });
  }
}

module.exports = new CommentService();

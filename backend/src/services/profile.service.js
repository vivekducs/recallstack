// backend/src/services/profile.service.js
const prisma = require('../config/database');

class ProfileService {
  async getProfile(username, currentUserId) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
        notes: {
          where: { status: 'PUBLISHED' },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            difficulty: true,
            readingTime: true,
            views: true,
            helpfulCount: true,
            publishedAt: true,
            topic: {
              select: {
                name: true,
                slug: true,
                subject: { select: { name: true, slug: true } }
              }
            }
          },
          orderBy: { publishedAt: 'desc' }
        }
      }
    });

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    let isFollowing = false;
    if (currentUserId) {
      const followRecord = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id
          }
        }
      });
      isFollowing = !!followRecord;
    }

    return { ...user, isFollowing };
  }

  async followUser(followerId, targetUsername) {
    const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!targetUser) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    if (targetUser.id === followerId) {
      const err = new Error('You cannot follow yourself');
      err.status = 400;
      throw err;
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: { followerId, followingId: targetUser.id }
      }
    });

    if (existingFollow) return { success: true, message: 'Already following' };

    await prisma.$transaction([
      prisma.follows.create({
        data: { followerId, followingId: targetUser.id }
      }),
      prisma.user.update({
        where: { id: targetUser.id },
        data: { followersCount: { increment: 1 } }
      }),
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } }
      })
    ]);

    return { success: true, message: 'Successfully followed user' };
  }

  async unfollowUser(followerId, targetUsername) {
    const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!targetUser) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: { followerId, followingId: targetUser.id }
      }
    });

    if (!existingFollow) return { success: true, message: 'Not following' };

    await prisma.$transaction([
      prisma.follows.delete({
        where: {
          followerId_followingId: { followerId, followingId: targetUser.id }
        }
      }),
      prisma.user.update({
        where: { id: targetUser.id },
        data: { followersCount: { decrement: 1 } }
      }),
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } }
      })
    ]);

    return { success: true, message: 'Successfully unfollowed user' };
  }
}

module.exports = new ProfileService();

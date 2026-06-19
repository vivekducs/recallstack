// backend/src/repositories/user.repository.js
const prisma = require('../config/database');

class UserRepository {
  findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  findByUsername(username) {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  create(data) {
    return prisma.user.create({
      data
    });
  }

  updateProfile(id, updateData) {
    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        createdAt: true,
        emailPreferences: true
      }
    });
  }

  updatePreferences(id, emailPreferences) {
    return prisma.user.update({
      where: { id },
      data: { emailPreferences },
      select: { emailPreferences: true }
    });
  }

  incrementFollowing(id, incrementValue = 1) {
    return prisma.user.update({
      where: { id },
      data: { followingCount: { increment: incrementValue } }
    });
  }

  incrementFollowers(id, incrementValue = 1) {
    return prisma.user.update({
      where: { id },
      data: { followersCount: { increment: incrementValue } }
    });
  }

  findByResetToken(token) {
    return prisma.user.findUnique({
      where: { passwordResetToken: token }
    });
  }

  updateResetToken(id, token, expires) {
    return prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires
      }
    });
  }

  updatePassword(id, passwordHash) {
    return prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });
  }
}

module.exports = new UserRepository();


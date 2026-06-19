// backend/src/repositories/user.repository.js
const prisma = require('../config/database');

class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username }
    });
  }

  async create(data) {
    return prisma.user.create({
      data
    });
  }

  async updateProfile(id, updateData) {
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

  async updatePreferences(id, emailPreferences) {
    return prisma.user.update({
      where: { id },
      data: { emailPreferences },
      select: { emailPreferences: true }
    });
  }

  async incrementFollowing(id, incrementValue = 1) {
    return prisma.user.update({
      where: { id },
      data: { followingCount: { increment: incrementValue } }
    });
  }

  async incrementFollowers(id, incrementValue = 1) {
    return prisma.user.update({
      where: { id },
      data: { followersCount: { increment: incrementValue } }
    });
  }

  async findByResetToken(token) {
    return prisma.user.findUnique({
      where: { passwordResetToken: token }
    });
  }

  async updateResetToken(id, token, expires) {
    return prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: token,
        passwordResetExpires: expires
      }
    });
  }

  async updatePassword(id, passwordHash) {
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

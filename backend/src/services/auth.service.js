// backend/src/services/auth.service.js
const prisma = require('../config/database');
const { hashPassword, comparePassword, generateToken } = require('../middleware/auth.middleware');

class AuthService {
  async register(data) {
    const { name, username, email, password } = data;

    if (!name || !username || !email || !password) {
      const err = new Error('All fields required');
      err.status = 400;
      throw err;
    }

    if (password.length < 8) {
      const err = new Error('Password must be 8+ characters');
      err.status = 400;
      throw err;
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      const err = new Error('Username already taken');
      err.status = 409;
      throw err;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, role: 'USER' }
    });

    const token = generateToken(user.id, user.role);
    return { token, userId: user.id, role: user.role };
  }

  async login(data) {
    const { email, password } = data;

    if (!email || !password) {
      const err = new Error('Email and password required');
      err.status = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const token = generateToken(user.id, user.role);
    return {
      token,
      userId: user.id,
      role: user.role,
      name: user.name,
      username: user.username
    };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId, data) {
    const { name, bio, avatar } = data;
    const updateData = {};
    if (name !== undefined) {
      if (!name.trim()) {
        const err = new Error('Name cannot be empty');
        err.status = 400;
        throw err;
      }
      updateData.name = name;
    }
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    return await prisma.user.update({
      where: { id: userId },
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

  async updatePreferences(userId, preferences) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { emailPreferences: preferences },
      select: { emailPreferences: true }
    });
    return updated.emailPreferences;
  }
}

module.exports = new AuthService();

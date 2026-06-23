const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const emailService = require('./email.service');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

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

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      const err = new Error('Username already taken');
      err.status = 409;
      throw err;
    }

    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      name,
      username,
      email,
      passwordHash,
      role: 'USER'
    });

    // Send welcome email asynchronously
    emailService.sendWelcomeEmail(user).catch(err => {
      logger.error('[AuthService] Welcome email failed to send:', err);
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

    const user = await userRepository.findByEmail(email);
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
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      createdAt: user.createdAt,
      emailPreferences: user.emailPreferences
    };
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

    return await userRepository.updateProfile(userId, updateData);
  }

  async updatePreferences(userId, preferences) {
    const updated = await userRepository.updatePreferences(userId, preferences);
    return updated.emailPreferences;
  }

  async forgotPassword(data) {
    const { email } = data;
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // For security, don't reveal that the user does not exist
      return { success: true, message: 'If that email is registered, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await userRepository.updateResetToken(user.id, tokenHash, tokenExpires);

    // Get base URL for frontend
    const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',');
    // Choose the first one (usually development localhost, or Vercel custom domain)
    const frontendUrl = frontendUrls[0];
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email asynchronously
    emailService.sendPasswordResetEmail(user, resetUrl).catch(err => {
      logger.error('[AuthService] Reset email failed to send:', err);
    });

    return { success: true, message: 'If that email is registered, a password reset link has been sent.' };
  }

  async resetPassword(data) {
    const { token, password } = data;
    if (password.length < 8) {
      const err = new Error('Password must be 8+ characters');
      err.status = 400;
      throw err;
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findByResetToken(tokenHash);

    if (!user) {
      const err = new Error('Invalid or expired reset token');
      err.status = 400;
      throw err;
    }

    const isExpired = new Date() > new Date(user.passwordResetExpires);
    if (isExpired) {
      const err = new Error('Invalid or expired reset token');
      err.status = 400;
      throw err;
    }

    const newPasswordHash = await hashPassword(password);
    await userRepository.updatePassword(user.id, newPasswordHash);

    return { success: true, message: 'Your password has been successfully reset.' };
  }
}

module.exports = new AuthService();

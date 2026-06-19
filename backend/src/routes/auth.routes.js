// backend/src/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateToken
} = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be 8+ characters' });
    }

    // Check if user exists (email or username)
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user (default role: USER)
    const user = await prisma.user.create({
      data: { name, username, email, passwordHash, role: 'USER' }
    });

    const token = generateToken(user.id, user.role);
    return res.status(201).json({ token, userId: user.id, role: user.role });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);
    return res.json({
      token,
      userId: user.id,
      role: user.role,
      name: user.name,
      username: user.username
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/profile (Protected)
router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const updateData = {};
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updateData.name = name;
    }
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
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

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/preferences (Protected)
router.patch('/preferences', authenticateToken, async (req, res, next) => {
  try {
    const preferences = req.body;
    
    // Type validation and merging would happen here in a stricter setup
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { emailPreferences: preferences },
      select: { emailPreferences: true }
    });

    res.json(updated.emailPreferences);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


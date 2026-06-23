// backend/src/services/email.service.js
const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const path = require('path');
const prisma = require('../config/database');
const emailConfig = require('../config/email');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    if (emailConfig.useStream) {
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows'
      });
    } else {
      this.transporter = nodemailer.createTransport(emailConfig.smtp);
    }
    this.defaultFrom = emailConfig.defaults.from;
    this.templateCache = new Map();
  }

  async getTemplate(templateName, replacements = {}) {
    try {
      let content = this.templateCache.get(templateName);
      if (!content) {
        const templatePath = path.join(__dirname, '..', 'templates', templateName);
        content = await fs.readFile(templatePath, 'utf8');
        this.templateCache.set(templateName, content);
      }
      
      let replacedContent = content;
      for (const [key, value] of Object.entries(replacements)) {
        replacedContent = replacedContent.replace(new RegExp(`{{${key}}}`, 'g'), value !== undefined && value !== null ? value : '');
      }
      
      return replacedContent;
    } catch (error) {
      logger.error(`[EmailService] Error loading template ${templateName}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const html = await this.getTemplate('welcome-email.html', {
        name: user.name
      });

      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: user.email,
        subject: 'Welcome to RecallStack!',
        html
      });

      logger.info(`\n========== EMAIL MOCK SENT TO: ${user.email} ==========\nSubject: Welcome to RecallStack!\n${info.message.toString()}\n==========================================================\n`);
    } catch (err) {
      logger.error('[EmailService] Failed to send welcome email:', err);
    }
  }

  async sendCommentNotification(noteAuthor, commentAuthor, noteTitle, commentContent) {
    // Check preferences
    const prefs = noteAuthor.emailPreferences || {};
    if (prefs.newComment === false) {
      logger.info(`[EmailService] Skipped sending to ${noteAuthor.email}: user disabled newComment notifications.`);
      return;
    }

    try {
      const html = await this.getTemplate('comment-notification.html', {
        noteTitle,
        noteAuthorName: noteAuthor.name,
        commentAuthorName: commentAuthor.name,
        commentContent
      });

      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: noteAuthor.email,
        subject: `New Comment on "${noteTitle}"`,
        html
      });

      logger.info(`\n========== EMAIL MOCK SENT TO: ${noteAuthor.email} ==========\nSubject: New Comment on "${noteTitle}"\n${info.message.toString()}\n==========================================================\n`);

    } catch (err) {
      logger.error('[EmailService] Failed to send comment email:', err);
    }
  }

  async sendReplyNotification(commentAuthor, replyAuthor, noteTitle, replyContent) {
    const prefs = commentAuthor.emailPreferences || {};
    if (prefs.newReply === false) {
      logger.info(`[EmailService] Skipped sending to ${commentAuthor.email}: user disabled newReply notifications.`);
      return;
    }

    try {
      const html = await this.getTemplate('reply-notification.html', {
        noteTitle,
        commentAuthorName: commentAuthor.name,
        replyAuthorName: replyAuthor.name,
        replyContent
      });

      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: commentAuthor.email,
        subject: `New Reply on "${noteTitle}"`,
        html
      });

      logger.info(`\n========== EMAIL MOCK SENT TO: ${commentAuthor.email} ==========\nSubject: New Reply on "${noteTitle}"\n${info.message.toString()}\n==========================================================\n`);
    } catch (err) {
      logger.error('[EmailService] Failed to send reply email:', err);
    }
  }

  async sendRatingNotification(noteAuthor, rater, noteTitle, rating) {
    const prefs = noteAuthor.emailPreferences || {};
    if (prefs.helpful === false) {
      logger.info(`[EmailService] Skipped sending to ${noteAuthor.email}: user disabled helpful rating notifications.`);
      return;
    }

    try {
      const html = await this.getTemplate('rating-notification.html', {
        noteTitle,
        noteAuthorName: noteAuthor.name,
        raterName: rater.name,
        rating
      });

      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: noteAuthor.email,
        subject: `Your note "${noteTitle}" was rated`,
        html
      });

      logger.info(`\n========== EMAIL MOCK SENT TO: ${noteAuthor.email} ==========\nSubject: Your note "${noteTitle}" was rated\n${info.message.toString()}\n==========================================================\n`);
    } catch (err) {
      logger.error('[EmailService] Failed to send rating email:', err);
    }
  }

  async sendDailyDigest() {
    logger.info('[EmailService] Starting daily digest aggregation...');
    const users = await prisma.user.findMany();

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    const userIds = users.map(u => u.id);

    // Batch fetch all approved comments created in the last 24 hours
    const allComments = await prisma.comment.findMany({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        status: 'APPROVED',
        note: { authorId: { in: userIds } }
      },
      include: {
        user: { select: { name: true } },
        note: { select: { title: true, authorId: true } }
      }
    });

    // Batch fetch all ratings created in the last 24 hours
    const allRatings = await prisma.noteRating.findMany({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        note: { authorId: { in: userIds } }
      },
      include: {
        user: { select: { name: true } },
        note: { select: { title: true, authorId: true } }
      }
    });

    // Map comments and ratings to author IDs, avoiding self-activity
    const commentsByAuthor = {};
    const ratingsByAuthor = {};

    for (const comment of allComments) {
      if (comment.userId === comment.note.authorId) continue;
      const authorId = comment.note.authorId;
      if (!commentsByAuthor[authorId]) commentsByAuthor[authorId] = [];
      commentsByAuthor[authorId].push(comment);
    }

    for (const rating of allRatings) {
      if (rating.userId === rating.note.authorId) continue;
      const authorId = rating.note.authorId;
      if (!ratingsByAuthor[authorId]) ratingsByAuthor[authorId] = [];
      ratingsByAuthor[authorId].push(rating);
    }

    let sentCount = 0;

    for (const user of users) {
      const prefs = user.emailPreferences || {};
      if (prefs.digestFrequency !== 'daily') continue;

      const newComments = commentsByAuthor[user.id] || [];
      const newRatings = ratingsByAuthor[user.id] || [];

      // If no new activities, don't send anything
      if (newComments.length === 0 && newRatings.length === 0) continue;

      // 3. Construct digest content HTML block
      let digestContent = '';

      if (newComments.length > 0) {
        digestContent += `<h3>New Comments (${newComments.length})</h3><ul>`;
        for (const c of newComments) {
          digestContent += `<li><strong>${c.user.name}</strong> left a comment on "<em>${c.note.title}</em>":<br/>
          <span class="quote">"${c.content}"</span></li>`;
        }
        digestContent += '</ul>';
      }

      if (newRatings.length > 0) {
        digestContent += `<h3>New Ratings (${newRatings.length})</h3><ul>`;
        for (const r of newRatings) {
          digestContent += `<li><strong>${r.user.name}</strong> rated "<em>${r.note.title}</em>" with <strong>${r.rating} stars</strong>.</li>`;
        }
        digestContent += '</ul>';
      }

      try {
        const html = await this.getTemplate('daily-digest.html', {
          name: user.name,
          digestContent
        });

        const info = await this.transporter.sendMail({
          from: this.defaultFrom,
          to: user.email,
          subject: 'Your RecallStack Daily Digest',
          html
        });

        logger.info(`\n========== EMAIL MOCK DIGEST SENT TO: ${user.email} ==========\n${info.message.toString()}\n==============================================================\n`);
        sentCount++;
      } catch (err) {
        logger.error(`[EmailService] Failed to send digest to ${user.email}:`, err);
      }
    }

    return { success: true, count: sentCount };
  }

  async sendPasswordResetEmail(user, resetUrl) {
    try {
      const html = await this.getTemplate('password-reset.html', {
        name: user.name,
        resetUrl
      });

      const info = await this.transporter.sendMail({
        from: this.defaultFrom,
        to: user.email,
        subject: 'Reset your RecallStack Password',
        html
      });

      logger.info(`\n========== EMAIL MOCK PASSWORD RESET SENT TO: ${user.email} ==========\nSubject: Reset your RecallStack Password\nLink: ${resetUrl}\n${info.message.toString()}\n========================================================================\n`);
    } catch (err) {
      logger.error('[EmailService] Failed to send password reset email:', err);
      throw err;
    }
  }
}

module.exports = new EmailService();


// backend/src/services/email.service.js
const nodemailer = require('nodemailer');
const fs = require('fs/promises');
const path = require('path');
const prisma = require('../config/database');
const emailConfig = require('../config/email');

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
  }

  async getTemplate(templateName, replacements = {}) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', templateName);
      let content = await fs.readFile(templatePath, 'utf8');
      
      for (const [key, value] of Object.entries(replacements)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value !== undefined && value !== null ? value : '');
      }
      
      return content;
    } catch (error) {
      console.error(`[EmailService] Error loading template ${templateName}:`, error);
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

      console.log(`\n========== EMAIL MOCK SENT TO: ${user.email} ==========`);
      console.log(`Subject: Welcome to RecallStack!`);
      console.log(info.message.toString());
      console.log(`==========================================================\n`);
    } catch (err) {
      console.error('[EmailService] Failed to send welcome email:', err);
    }
  }

  async sendCommentNotification(noteAuthor, commentAuthor, noteTitle, commentContent) {
    // Check preferences
    const prefs = noteAuthor.emailPreferences || {};
    if (prefs.newComment === false) {
      console.log(`[EmailService] Skipped sending to ${noteAuthor.email}: user disabled newComment notifications.`);
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

      console.log(`\n========== EMAIL MOCK SENT TO: ${noteAuthor.email} ==========`);
      console.log(`Subject: New Comment on "${noteTitle}"`);
      console.log(info.message.toString());
      console.log(`==========================================================\n`);

    } catch (err) {
      console.error('[EmailService] Failed to send comment email:', err);
    }
  }

  async sendReplyNotification(commentAuthor, replyAuthor, noteTitle, replyContent) {
    const prefs = commentAuthor.emailPreferences || {};
    if (prefs.newReply === false) {
      console.log(`[EmailService] Skipped sending to ${commentAuthor.email}: user disabled newReply notifications.`);
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

      console.log(`\n========== EMAIL MOCK SENT TO: ${commentAuthor.email} ==========`);
      console.log(`Subject: New Reply on "${noteTitle}"`);
      console.log(info.message.toString());
      console.log(`==========================================================\n`);
    } catch (err) {
      console.error('[EmailService] Failed to send reply email:', err);
    }
  }

  async sendRatingNotification(noteAuthor, rater, noteTitle, rating) {
    const prefs = noteAuthor.emailPreferences || {};
    if (prefs.helpful === false) {
      console.log(`[EmailService] Skipped sending to ${noteAuthor.email}: user disabled helpful rating notifications.`);
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

      console.log(`\n========== EMAIL MOCK SENT TO: ${noteAuthor.email} ==========`);
      console.log(`Subject: Your note "${noteTitle}" was rated`);
      console.log(info.message.toString());
      console.log(`==========================================================\n`);
    } catch (err) {
      console.error('[EmailService] Failed to send rating email:', err);
    }
  }

  async sendDailyDigest() {
    console.log('[EmailService] Starting daily digest aggregation...');
    const users = await prisma.user.findMany();

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);

    let sentCount = 0;

    for (const user of users) {
      const prefs = user.emailPreferences || {};
      if (prefs.digestFrequency !== 'daily') continue;

      // 1. Fetch recent comments on user's notes
      const newComments = await prisma.comment.findMany({
        where: {
          note: { authorId: user.id },
          createdAt: { gte: twentyFourHoursAgo },
          userId: { not: user.id },
          status: 'APPROVED'
        },
        include: {
          user: { select: { name: true } },
          note: { select: { title: true } }
        }
      });

      // 2. Fetch recent ratings on user's notes
      const newRatings = await prisma.noteRating.findMany({
        where: {
          note: { authorId: user.id },
          createdAt: { gte: twentyFourHoursAgo },
          userId: { not: user.id }
        },
        include: {
          user: { select: { name: true } },
          note: { select: { title: true } }
        }
      });

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

        console.log(`\n========== EMAIL MOCK DIGEST SENT TO: ${user.email} ==========`);
        console.log(info.message.toString());
        console.log(`==============================================================\n`);
        sentCount++;
      } catch (err) {
        console.error(`[EmailService] Failed to send digest to ${user.email}:`, err);
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

      console.log(`\n========== EMAIL MOCK PASSWORD RESET SENT TO: ${user.email} ==========`);
      console.log(`Subject: Reset your RecallStack Password`);
      console.log(`Link: ${resetUrl}`);
      console.log(info.message.toString());
      console.log(`========================================================================\n`);
    } catch (err) {
      console.error('[EmailService] Failed to send password reset email:', err);
      throw err;
    }
  }
}

module.exports = new EmailService();


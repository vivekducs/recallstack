// backend/src/services/email.service.js
const nodemailer = require('nodemailer');
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

  async sendCommentNotification(noteAuthor, commentAuthor, noteTitle, commentContent) {
    // Check preferences
    const prefs = noteAuthor.emailPreferences || {};
    if (prefs.newComment === false) {
      console.log(`[EmailService] Skipped sending to ${noteAuthor.email}: user disabled newComment notifications.`);
      return;
    }

    const html = `
      <h2>New comment on "${noteTitle}"</h2>
      <p>Hi ${noteAuthor.name},</p>
      <p><strong>${commentAuthor.name}</strong> left a new comment on your note:</p>
      <blockquote style="border-left: 4px solid #ddd; padding-left: 10px; color: #555;">
        ${commentContent}
      </blockquote>
      <br/>
      <p><a href="http://localhost:3000/dashboard">View Comment & Manage Note</a></p>
      <hr/>
      <p style="font-size: 12px; color: #888;">Manage your notification preferences in your <a href="http://localhost:3000/dashboard/settings">Settings</a>.</p>
    `;

    try {
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
      console.error('[EmailService] Failed to send email:', err);
    }
  }

  async sendReplyNotification(commentAuthor, replyAuthor, noteTitle, replyContent) {
    const prefs = commentAuthor.emailPreferences || {};
    if (prefs.newReply === false) {
      console.log(`[EmailService] Skipped sending to ${commentAuthor.email}: user disabled newReply notifications.`);
      return;
    }

    const html = `
      <h2>New reply to your comment on "${noteTitle}"</h2>
      <p>Hi ${commentAuthor.name},</p>
      <p><strong>${replyAuthor.name}</strong> replied to your comment:</p>
      <blockquote style="border-left: 4px solid #ddd; padding-left: 10px; color: #555;">
        ${replyContent}
      </blockquote>
      <br/>
      <p><a href="http://localhost:3000/dashboard">View Comment & Manage Note</a></p>
      <hr/>
      <p style="font-size: 12px; color: #888;">Manage your notification preferences in your <a href="http://localhost:3000/dashboard/settings">Settings</a>.</p>
    `;

    try {
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

    const html = `
      <h2>Your note "${noteTitle}" received a rating!</h2>
      <p>Hi ${noteAuthor.name},</p>
      <p><strong>${rater.name}</strong> rated your note with <strong>${rating} stars</strong>.</p>
      <br/>
      <p><a href="http://localhost:3000/dashboard">Go to Dashboard</a></p>
      <hr/>
      <p style="font-size: 12px; color: #888;">Manage your notification preferences in your <a href="http://localhost:3000/dashboard/settings">Settings</a>.</p>
    `;

    try {
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

      // 3. Construct HTML
      let html = `
        <h2>Your RecallStack Daily Digest</h2>
        <p>Hi ${user.name},</p>
        <p>Here is a summary of the activity on your notes over the last 24 hours:</p>
      `;

      if (newComments.length > 0) {
        html += `<h3>New Comments (${newComments.length})</h3><ul>`;
        for (const c of newComments) {
          html += `<li><strong>${c.user.name}</strong> left a comment on "<em>${c.note.title}</em>":<br/>
          <span style="color: #555;">"${c.content}"</span></li>`;
        }
        html += '</ul>';
      }

      if (newRatings.length > 0) {
        html += `<h3>New Ratings (${newRatings.length})</h3><ul>`;
        for (const r of newRatings) {
          html += `<li><strong>${r.user.name}</strong> rated "<em>${r.note.title}</em>" with <strong>${r.rating} stars</strong>.</li>`;
        }
        html += '</ul>';
      }

      html += `
        <br/>
        <p><a href="http://localhost:3000/dashboard">Go to your Dashboard</a></p>
        <hr/>
        <p style="font-size: 12px; color: #888;">Manage your notification preferences in your <a href="http://localhost:3000/settings">Settings</a>.</p>
      `;

      try {
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
}

module.exports = new EmailService();

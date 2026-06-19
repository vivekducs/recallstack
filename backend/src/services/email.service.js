// backend/src/services/email.service.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // For local development, we'll log to console, but we can also use Ethereal Email.
    // Setting up a dummy stream transport that just logs out the email content
    this.transporter = nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows'
    });
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
        from: '"RecallStack Notifier" <notifications@recallstack.com>',
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
        from: '"RecallStack Notifier" <notifications@recallstack.com>',
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
        from: '"RecallStack Notifier" <notifications@recallstack.com>',
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
}

module.exports = new EmailService();

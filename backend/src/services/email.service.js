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

  // Add more email methods here later (e.g. daily digest, new replies, helpful ratings)
}

module.exports = new EmailService();

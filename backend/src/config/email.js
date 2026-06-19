// backend/src/config/email.js

module.exports = {
  useStream: process.env.EMAIL_USE_STREAM !== 'false',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  defaults: {
    from: process.env.EMAIL_FROM || '"RecallStack" <notifications@recallstack.com>'
  }
};

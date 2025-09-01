const nodemailer = require('nodemailer');

/**
 * Sends an email notification.
 * This is a placeholder. In a real app, you would configure a transport
 * with a service like SendGrid, Postmark, or your own SMTP server.
 *
 * @param {string} to The recipient's email address.
 * @param {string} subject The subject of the email.
 * @param {string} text The plain text body of the email.
 * @param {string} html The HTML body of the email.
 */
async function sendEmail(to, subject, text, html) {
  // Create a transporter object using a fake test account from ethereal.email
  // This is great for testing, but you'll need a real provider for production.
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.ETHEREAL_USER, // generated ethereal user
      pass: process.env.ETHEREAL_PASS, // generated ethereal password
    },
  });

  const mailOptions = {
    from: '"LinkMonitor.io" <noreply@linkmonitor.io>',
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Sends a notification for a broken link.
 * @param {object} user The user to notify.
 * @param {object} link The link that is broken.
 * @param {object} scanResult The result of the scan.
 */
async function sendBrokenLinkEmail(user, link, scanResult) {
  const subject = `Alert: Broken Link Detected for ${link.url}`;
  const text = `Hello ${user.full_name},\n\nWe detected an issue with one of your links.\n\nURL: ${link.url}\nStatus: ${scanResult.status_code} ${scanResult.status_text}\n\nPlease check it out.\n\n- The LinkMonitor.io Team`;
  const html = `<p>Hello ${user.full_name},</p><p>We detected an issue with one of your links.</p><p><b>URL:</b> ${link.url}</p><p><b>Status:</b> ${scanResult.status_code} ${scanResult.status_text}</p><p>Please check it out.</p><p>- The LinkMonitor.io Team</p>`;

  // In a real app, you'd get the user's email from the profiles table.
  // const userEmail = 'user@example.com';
  // await sendEmail(userEmail, subject, text, html);
  console.log('--- Faking email sending ---');
  console.log(`To: user@example.com`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log('--------------------------');
}


module.exports = {
  sendEmail,
  sendBrokenLinkEmail,
};

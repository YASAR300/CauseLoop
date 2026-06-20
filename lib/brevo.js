// Brevo SMTP / Transactional Email configuration.
// Run `npm install nodemailer` to enable standard SMTP sending.

export const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`[Brevo Email Placeholder] Send to: ${to}, Subject: ${subject}`);
  
  // Example implementation with nodemailer:
  //
  // const nodemailer = require("nodemailer");
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: parseInt(process.env.SMTP_PORT || "587", 10),
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASSWORD,
  //   },
  // });
  //
  // return transporter.sendMail({
  //   from: process.env.SMTP_FROM,
  //   to,
  //   subject,
  //   text,
  //   html,
  // });

  return { success: true, messageId: "placeholder-id" };
};

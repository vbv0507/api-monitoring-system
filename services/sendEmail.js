const nodemailer = require("nodemailer");

async function sendEmail(options) {

  // CREATE TRANSPORTER
  const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

  });

  // EMAIL OPTIONS
  const mailOptions = {

    from: process.env.EMAIL_USER,

    to: options.to,

    subject: options.subject,

    text: options.text,

  };

  // SEND EMAIL
  await transporter.sendMail(mailOptions);

}

module.exports = sendEmail;
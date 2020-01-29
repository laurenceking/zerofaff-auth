// const clientId = '599635178922-vugq667bgof8t21akimgcvvjs8qm0dac.apps.googleusercontent.com';
// const clientSecret = 'wbAQ7POp-qRiPGnlPbSaCVXs';
const nodemailer = require("nodemailer");
const logger = require("./logger");
const jwt = require("./jwt");
const { emailContent } = require("../../config");

const send = async ({ to, bcc, subject, content, text, attachments = [] }) => {
  // Create a SMTP transporter object
  const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: "windows",
    logger: false
  });

  // Message object
  const message = {
    from: emailContent.from,
    // Comma separated list of recipients
    to,
    bcc,
    // Subject of the message
    subject,
    // plaintext body
    text,
    // HTML body
    html: content,
    // An array of attachments
    attachments
  };
  try {
    await transporter.sendMail(message);
    return true;
  } catch (error) {
    logger.log("email-error", error);
    return false;
  }
};

const sendActivation = ({ email, id }) => {
  const token = jwt.getToken({ id, email });

  return send({
    to: email,
    subject: emailContent.activate.subject,
    text: emailContent.activate.text(token),
    content: emailContent.activate.html(token)
  });
};

const sendRecovery = ({ email, id }) => {
  const token = jwt.getToken({ id, email });

  return send({
    to: email,
    subject: emailContent.recover.subject,
    text: emailContent.recover.text(token),
    content: emailContent.recover.html(token)
  });
};

module.exports = {
  sendActivation,
  sendRecovery
};

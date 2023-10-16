import nodemailer from "nodemailer";
import { log } from "winston";

export const SendMail = (from, to, subject, html) => {
  const mailOptions = {
    from: from,
    to: to,
    // cc: process.env.SMTP_CC_MAIL,
    subject: subject,
    html: html,
  };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // upgrade later with STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        log("error", "error at send mail#################### ", error);
        reject(error);
        //   res.status(224).json({ message: "Error Occurred" });
        return;
      } else {
        resolve(info);
        console.log("Email sent: " + info.response);
        //   res.status(200).json({ message: "Email Successfully sent." });
        return;
      }
    });
  });
};

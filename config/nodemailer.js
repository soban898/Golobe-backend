import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // VERY IMPORTANT if not already in your main file

// 👉 Debug SMTP env variables
console.log("SMTP USER:", process.env.SMTP_USER);
console.log("SMTP PASS:", process.env.SMTP_PASS);

const tranporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false, // <-- this is important
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

export default tranporter;

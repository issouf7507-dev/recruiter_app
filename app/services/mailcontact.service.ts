import nodemailer from "nodemailer";

export class MailContactService {
  static async sendEmail(to: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

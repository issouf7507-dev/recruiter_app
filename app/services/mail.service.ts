import nodemailer from "nodemailer";

export class MailService {
  static async sendEmail(to: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: message,
      });

      console.log("Email envoyé avec succès");
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'email:", err);
      throw err;
    }
  }
}

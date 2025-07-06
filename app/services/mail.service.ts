import nodemailer from "nodemailer";

export class MailService {
  static async sendEmail(to: string, subject: string, message: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.NEXT_APP_EMAIL_USER,
          pass: process.env.NEXT_APP_EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.NEXT_APP_EMAIL_USER,
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

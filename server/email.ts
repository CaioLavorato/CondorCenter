
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Redefinição de Senha - Condor Center',
    html: `
      <h1>Redefinição de Senha</h1>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${process.env.APP_URL}/reset-password?token=${resetToken}">
        Redefinir Senha
      </a>
    `
  });
}

import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorHandler.middleware';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    throw new AppError(
      503,
      'Serviço de e-mail não configurado para recuperação de senha.',
      'EMAIL_PROVIDER_NOT_CONFIGURED',
    );
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendPasswordResetCodeEmail(params: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const mailer = getTransporter();
  const from = env.SMTP_FROM ?? env.SMTP_USER;

  if (!from) {
    throw new AppError(
      503,
      'Remetente de e-mail não configurado para recuperação de senha.',
      'EMAIL_SENDER_NOT_CONFIGURED',
    );
  }

  await mailer.sendMail({
    from: `"FreelasAPI" <${from}>`,
    to: params.to,
    subject: 'Código para recuperação de senha',
    text: `Olá, ${params.name}. Seu código de recuperação é ${params.code}. Ele expira em ${env.PASSWORD_RESET_CODE_TTL_MINUTES} minutos.`,
    html: `
      <p>Olá, <strong>${params.name}</strong>.</p>
      <p>Seu código de recuperação de senha é:</p>
      <h2 style="letter-spacing: 4px;">${params.code}</h2>
      <p>Esse código expira em ${env.PASSWORD_RESET_CODE_TTL_MINUTES} minutos.</p>
      <p>Se você não solicitou esta recuperação, ignore este e-mail.</p>
    `,
  });
}

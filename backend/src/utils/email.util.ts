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
    requireTLS: !env.SMTP_SECURE && env.SMTP_PORT === 587,
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

  try {
    await mailer.sendMail({
      from: `"TASKIO" <${from}>`,
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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[email] Falha ao enviar código de recuperação:', message);

    if (/535|BadCredentials|EAUTH/i.test(message)) {
      throw new AppError(
        503,
        'Falha ao autenticar no Gmail. Use uma senha de app do Google em SMTP_PASS (não a senha normal da conta).',
        'EMAIL_AUTH_FAILED',
      );
    }

    throw new AppError(
      503,
      'Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.',
      'EMAIL_SEND_FAILED',
    );
  }
}

function buildContactLines(companyEmail?: string | null, companyPhone?: string | null): string {
  const lines: string[] = [];
  if (companyEmail) lines.push(`E-mail: ${companyEmail}`);
  if (companyPhone) lines.push(`Telefone: ${companyPhone}`);
  if (lines.length === 0) {
    return 'A empresa entrará em contato usando os dados do seu perfil na TASKIO.';
  }
  return `A empresa entrará em contato por:\n${lines.join('\n')}`;
}

export async function sendApplicationAcceptedEmail(params: {
  to: string;
  userName: string;
  companyName: string;
  jobTitle: string;
  companyEmail?: string | null;
  companyPhone?: string | null;
}): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('[email] SMTP não configurado — e-mail de candidatura aceita não enviado.');
    return;
  }

  try {
    const mailer = getTransporter();
    const from = env.SMTP_FROM ?? env.SMTP_USER;
    if (!from) {
      console.warn('[email] Remetente não configurado — e-mail de candidatura aceita não enviado.');
      return;
    }

    const contactText = buildContactLines(params.companyEmail, params.companyPhone);
    const contactHtml = buildContactLines(params.companyEmail, params.companyPhone).replace(
      /\n/g,
      '<br/>',
    );

    await mailer.sendMail({
      from: `"TASKIO" <${from}>`,
      to: params.to,
      subject: `Parabéns! Sua candidatura para ${params.jobTitle} foi aceita`,
      text: [
        `Olá, ${params.userName}.`,
        '',
        `A empresa ${params.companyName} aceitou sua candidatura para a vaga "${params.jobTitle}".`,
        '',
        contactText,
        '',
        'Acesse a TASKIO para acompanhar seus trabalhos.',
      ].join('\n'),
      html: `
        <p>Olá, <strong>${params.userName}</strong>.</p>
        <p>A empresa <strong>${params.companyName}</strong> aceitou sua candidatura para a vaga <strong>${params.jobTitle}</strong>.</p>
        <p>${contactHtml}</p>
        <p>Acesse a TASKIO para acompanhar seus trabalhos.</p>
      `,
    });
  } catch (err) {
    console.error('[email] Falha ao enviar e-mail de candidatura aceita:', err);
  }
}

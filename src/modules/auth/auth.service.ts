import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { normalizeCPF } from '../../utils/cpf.util';
import { normalizeCNPJ, fetchCnpjInfo } from '../../utils/cnpj.util';
import { sanitizeString } from '../../utils/sanitize.util';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
} from '../../utils/jwt.util';
import { sendPasswordResetCodeEmail } from '../../utils/email.util';
import type {
  RegisterUserDTO,
  RegisterCompanyDTO,
  LoginDTO,
  RefreshTokenDTO,
  LogoutDTO,
  RequestPasswordResetDTO,
  VerifyPasswordResetCodeDTO,
  ResetPasswordWithCodeDTO,
} from './auth.schema';

// ─── Tipos de resposta ────────────────────────────────────────────────────────

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = AuthTokens & {
  user: {
    id: string;
    name: string;
    email: string;
    type: 'user' | 'company';
    role: 'user' | 'company' | 'admin';
  };
};

// ─── Registro de Freelancer ───────────────────────────────────────────────────

export async function registerUser(dto: RegisterUserDTO): Promise<AuthResponse> {
  const cpf = normalizeCPF(dto.cpf);
  const email = dto.email.toLowerCase().trim();
  const name = sanitizeString(dto.name);

  // Unicidade de e-mail (RN.03 / RN.04 ConfigPerfil)
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    throw new AppError(409, 'Este e-mail já está cadastrado.', 'EMAIL_CONFLICT');
  }

  // Unicidade de CPF
  const cpfExists = await prisma.user.findUnique({ where: { cpf } });
  if (cpfExists) {
    throw new AppError(409, 'Este CPF já está cadastrado.', 'CPF_CONFLICT');
  }

  const hashedPassword = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      cpf,
      phone: dto.phone ?? null,
    },
  });

  const tokens = await _generateAndStoreUserTokens(user.id);

  return {
    ...tokens,
    user: { id: user.id, name: user.name, email: user.email, type: 'user', role: 'user' },
  };
}

// ─── Registro de Empresa ──────────────────────────────────────────────────────

export async function registerCompany(dto: RegisterCompanyDTO): Promise<AuthResponse> {
  const cnpj = normalizeCNPJ(dto.cnpj);
  const email = dto.email.toLowerCase().trim();
  const name = sanitizeString(dto.name);

  // Unicidade de e-mail
  const emailExists = await prisma.company.findUnique({ where: { email } });
  if (emailExists) {
    throw new AppError(409, 'Este e-mail já está cadastrado.', 'EMAIL_CONFLICT');
  }

  // Unicidade de CNPJ
  const cnpjExists = await prisma.company.findUnique({ where: { cnpj } });
  if (cnpjExists) {
    throw new AppError(409, 'Este CNPJ já está cadastrado.', 'CNPJ_CONFLICT');
  }

  // Consulta externa: cnpj.ws — verifica se CNPJ existe e está ATIVO
  const cnpjInfo = await fetchCnpjInfo(cnpj);
  if (cnpjInfo !== null) {
    // API respondeu — verifica situação cadastral
    const situacao = cnpjInfo.situacao_cadastral?.toUpperCase();
    if (situacao && situacao !== 'ATIVA') {
      throw new AppError(
        422,
        `CNPJ com situação cadastral "${cnpjInfo.descricao_situacao_cadastral}". Apenas CNPJs ativos podem se registrar.`,
        'CNPJ_INACTIVE',
      );
    }
  }
  // Se cnpjInfo === null: API fora do ar → prossegue com revisão manual (não bloqueia)

  const hashedPassword = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

  const company = await prisma.company.create({
    data: {
      name,
      email,
      password: hashedPassword,
      cnpj,
      phone: dto.phone ?? null,
    },
  });

  const tokens = await _generateAndStoreCompanyTokens(company.id);

  return {
    ...tokens,
    user: { id: company.id, name: company.name, email: company.email, type: 'company', role: 'company' },
  };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(dto: LoginDTO): Promise<AuthResponse> {
  if (dto.type === 'user') {
    return _loginUser(dto.email, dto.password);
  }
  return _loginCompany(dto.email, dto.password);
}

async function _loginUser(email: string, password: string): Promise<AuthResponse> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mensagem genérica — não revela se o e-mail existe (RN.01 Login)
  if (!user || !user.isActive) {
    throw new AppError(401, 'Usuário ou senha inválidos.', 'INVALID_CREDENTIALS');
  }

  // Verifica bloqueio temporário (RN.02 Login)
  if (user.isBlocked && user.blockedUntil && user.blockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.blockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new AppError(
      403,
      `Usuário temporariamente bloqueado devido a múltiplas tentativas inválidas. Tente novamente em ${minutesLeft} minuto(s).`,
      'USER_BLOCKED',
    );
  }

  // Se bloqueio expirou, reseta contadores
  if (user.isBlocked && user.blockedUntil && user.blockedUntil <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isBlocked: false, loginAttempts: 0, blockedUntil: null },
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const newAttempts = user.loginAttempts + 1;

    if (newAttempts >= env.MAX_LOGIN_ATTEMPTS) {
      // Bloqueia o usuário (RN.02 Login)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          isBlocked: true,
          blockedUntil: new Date(Date.now() + env.BLOCK_DURATION_MINUTES * 60 * 1000),
        },
      });
      throw new AppError(
        403,
        `Usuário temporariamente bloqueado devido a múltiplas tentativas inválidas.`,
        'USER_BLOCKED',
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: newAttempts },
    });

    throw new AppError(401, 'Usuário ou senha inválidos.', 'INVALID_CREDENTIALS');
  }

  // Login bem-sucedido: reseta contador de tentativas
  await prisma.user.update({
    where: { id: user.id },
    data: { loginAttempts: 0, isBlocked: false, blockedUntil: null },
  });

  const tokens = await _generateAndStoreUserTokens(user.id);

  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      type: 'user',
      role: user.isAdmin ? 'admin' : 'user',
    },
  };
}

async function _loginCompany(email: string, password: string): Promise<AuthResponse> {
  const company = await prisma.company.findUnique({ where: { email } });

  if (!company || !company.isActive) {
    throw new AppError(401, 'Usuário ou senha inválidos.', 'INVALID_CREDENTIALS');
  }

  if (company.isBlocked && company.blockedUntil && company.blockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (company.blockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new AppError(
      403,
      `Usuário temporariamente bloqueado devido a múltiplas tentativas inválidas. Tente novamente em ${minutesLeft} minuto(s).`,
      'USER_BLOCKED',
    );
  }

  if (company.isBlocked && company.blockedUntil && company.blockedUntil <= new Date()) {
    await prisma.company.update({
      where: { id: company.id },
      data: { isBlocked: false, loginAttempts: 0, blockedUntil: null },
    });
  }

  const passwordMatch = await bcrypt.compare(password, company.password);

  if (!passwordMatch) {
    const newAttempts = company.loginAttempts + 1;

    if (newAttempts >= env.MAX_LOGIN_ATTEMPTS) {
      await prisma.company.update({
        where: { id: company.id },
        data: {
          loginAttempts: newAttempts,
          isBlocked: true,
          blockedUntil: new Date(Date.now() + env.BLOCK_DURATION_MINUTES * 60 * 1000),
        },
      });
      throw new AppError(
        403,
        `Usuário temporariamente bloqueado devido a múltiplas tentativas inválidas.`,
        'USER_BLOCKED',
      );
    }

    await prisma.company.update({
      where: { id: company.id },
      data: { loginAttempts: newAttempts },
    });

    throw new AppError(401, 'Usuário ou senha inválidos.', 'INVALID_CREDENTIALS');
  }

  await prisma.company.update({
    where: { id: company.id },
    data: { loginAttempts: 0, isBlocked: false, blockedUntil: null },
  });

  const tokens = await _generateAndStoreCompanyTokens(company.id);

  return {
    ...tokens,
    user: { id: company.id, name: company.name, email: company.email, type: 'company', role: 'company' },
  };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export async function refreshTokens(dto: RefreshTokenDTO): Promise<AuthTokens> {
  // Verifica assinatura JWT antes de consultar o banco
  let payload;
  try {
    payload = verifyRefreshToken(dto.refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token inválido ou expirado.', 'INVALID_TOKEN');
  }

  if (payload.type === 'user') {
    const stored = await prisma.userRefreshToken.findUnique({
      where: { token: dto.refreshToken },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, 'Refresh token inválido ou expirado.', 'INVALID_TOKEN');
    }

    // Rotate: apaga o token antigo e gera um novo par
    await prisma.userRefreshToken.delete({ where: { id: stored.id } });
    return _generateAndStoreUserTokens(payload.sub);
  }

  // type === 'company'
  const stored = await prisma.companyRefreshToken.findUnique({
    where: { token: dto.refreshToken },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'Refresh token inválido ou expirado.', 'INVALID_TOKEN');
  }

  await prisma.companyRefreshToken.delete({ where: { id: stored.id } });
  return _generateAndStoreCompanyTokens(payload.sub);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout(dto: LogoutDTO): Promise<void> {
  // Revoga em ambas as tabelas sem erro quando o token não existe
  await prisma.userRefreshToken.deleteMany({ where: { token: dto.refreshToken } });
  await prisma.companyRefreshToken.deleteMany({ where: { token: dto.refreshToken } });
}

// ─── Recuperação de senha (freelancer) ────────────────────────────────────────

export async function requestPasswordReset(dto: RequestPasswordResetDTO): Promise<void> {
  const email = dto.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, isActive: true },
  });

  // Resposta neutra para evitar enumeração de e-mails.
  if (!user || !user.isActive) {
    return;
  }

  const code = String(randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, env.BCRYPT_SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_CODE_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.userPasswordResetCode.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    await tx.userPasswordResetCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });
  });

  await sendPasswordResetCodeEmail({
    to: user.email,
    name: user.name,
    code,
  });
}

export async function verifyPasswordResetCode(dto: VerifyPasswordResetCodeDTO): Promise<void> {
  const email = dto.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  const resetCode = await prisma.userPasswordResetCode.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      codeHash: true,
      attempts: true,
    },
  });

  if (!resetCode) {
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  if (resetCode.attempts >= env.PASSWORD_RESET_MAX_ATTEMPTS) {
    await prisma.userPasswordResetCode.update({
      where: { id: resetCode.id },
      data: { usedAt: new Date() },
    });
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  const valid = await bcrypt.compare(dto.code, resetCode.codeHash);
  if (!valid) {
    const nextAttempts = resetCode.attempts + 1;
    await prisma.userPasswordResetCode.update({
      where: { id: resetCode.id },
      data: {
        attempts: nextAttempts,
        ...(nextAttempts >= env.PASSWORD_RESET_MAX_ATTEMPTS ? { usedAt: new Date() } : {}),
      },
    });
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  await prisma.userPasswordResetCode.update({
    where: { id: resetCode.id },
    data: { verifiedAt: new Date() },
  });
}

export async function resetPasswordWithCode(dto: ResetPasswordWithCodeDTO): Promise<void> {
  const email = dto.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  const resetCode = await prisma.userPasswordResetCode.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      codeHash: true,
      attempts: true,
      verifiedAt: true,
    },
  });

  if (!resetCode) {
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }
  if (resetCode.attempts >= env.PASSWORD_RESET_MAX_ATTEMPTS) {
    await prisma.userPasswordResetCode.update({
      where: { id: resetCode.id },
      data: { usedAt: new Date() },
    });
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  const valid = await bcrypt.compare(dto.code, resetCode.codeHash);
  if (!valid) {
    const nextAttempts = resetCode.attempts + 1;
    await prisma.userPasswordResetCode.update({
      where: { id: resetCode.id },
      data: {
        attempts: nextAttempts,
        ...(nextAttempts >= env.PASSWORD_RESET_MAX_ATTEMPTS ? { usedAt: new Date() } : {}),
      },
    });
    throw new AppError(400, 'Código inválido ou expirado.', 'INVALID_RESET_CODE');
  }

  if (!resetCode.verifiedAt) {
    throw new AppError(409, 'Valide o código antes de alterar a senha.', 'RESET_CODE_NOT_VERIFIED');
  }

  const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
  if (isSamePassword) {
    throw new AppError(422, 'A nova senha deve ser diferente da senha atual.', 'PASSWORD_SAME_AS_CURRENT');
  }

  const newHashedPassword = await bcrypt.hash(dto.newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        loginAttempts: 0,
        isBlocked: false,
        blockedUntil: null,
      },
    });

    await tx.userPasswordResetCode.update({
      where: { id: resetCode.id },
      data: { usedAt: new Date() },
    });
  });
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

async function _generateAndStoreUserTokens(userId: string): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  const role = user.isAdmin ? 'admin' : 'user';
  const accessToken = signAccessToken({ sub: userId, type: 'user', role });
  const newRefreshToken = signRefreshToken({ sub: userId, type: 'user', role });

  await prisma.userRefreshToken.create({
    data: {
      token: newRefreshToken,
      userId,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

async function _generateAndStoreCompanyTokens(companyId: string): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: companyId, type: 'company', role: 'company' });
  const newRefreshToken = signRefreshToken({ sub: companyId, type: 'company', role: 'company' });

  await prisma.companyRefreshToken.create({
    data: {
      token: newRefreshToken,
      companyId,
      expiresAt: refreshTokenExpiresAt(),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}
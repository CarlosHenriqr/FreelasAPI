import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export type TokenPayload = {
  sub: string;           // id do usuário ou empresa
  type: 'user' | 'company';
  iat?: number;
  exp?: number;
};

// ─── Access Token ─────────────────────────────────────────────────────────────
export function signAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export function signRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Calcula a data de expiração do refresh token para salvar no banco.
 * Usa o mesmo valor de JWT_REFRESH_EXPIRES_IN convertido para Date.
 */
export function refreshTokenExpiresAt(): Date {
  const value = env.JWT_REFRESH_EXPIRES_IN;
  const num = parseInt(value);
  const unit = value.slice(-1);

  const ms: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const multiplier = ms[unit] ?? ms['d'];
  return new Date(Date.now() + num * multiplier);
}
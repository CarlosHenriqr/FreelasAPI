import rateLimit from 'express-rate-limit';

/**
 * Rate limiter para rotas de login.
 * Protege contra ataques de força bruta em nível de IP (RNF02 – Segurança).
 * O bloqueio por usuário individual é tratado no auth.service.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,                    // 20 tentativas por IP na janela
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas tentativas de login. Aguarde 15 minutos e tente novamente.',
    code: 'TOO_MANY_REQUESTS',
  },
});

/**
 * Rate limiter para rotas de registro.
 * Evita criação em massa de contas.
 */
export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,                    // 10 registros por IP por hora
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas tentativas de cadastro. Aguarde 1 hora e tente novamente.',
    code: 'TOO_MANY_REQUESTS',
  },
});

/**
 * Rate limiter para a rota de refresh token.
 */
export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    code: 'TOO_MANY_REQUESTS',
  },
});
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.util';
import { AppError } from './errorHandler.middleware';

// Estende o tipo Request do Express para incluir o payload do JWT
declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

/**
 * Middleware de autenticação.
 * Verifica o Access Token no header Authorization: Bearer <token>.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token de autenticação não fornecido.', 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch {
    next(new AppError(401, 'Token inválido ou expirado.', 'INVALID_TOKEN'));
  }
}

/**
 * Guard: permite apenas usuários do tipo especificado.
 * Uso: router.get('/vagas', authenticate, requireType('company'), handler)
 */
export function requireType(type: TokenPayload['type']) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.auth?.type !== type) {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }
    next();
  };
}
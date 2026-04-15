import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ─── Erros de validação Zod ───────────────────────────────────────────────
  if (err instanceof ZodError) {
    res.status(422).json({
      status: 'error',
      message: 'Dados inválidos.',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // ─── Erros de negócio (AppError) ──────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  // ─── Erros inesperados ────────────────────────────────────────────────────
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    status: 'error',
    message: 'Erro interno do servidor. Tente novamente mais tarde.',
  });
}
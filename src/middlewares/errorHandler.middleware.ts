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
    res.status(400).json({
      success: false,
      message: 'Dados inválidos.',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // ─── Erros de negócio (AppError) ──────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  // ─── Erros inesperados ────────────────────────────────────────────────────
  // Em produção, evita logar objetos inteiros (podem conter payloads/PII).
  if (process.env.NODE_ENV !== 'production') {
    console.error('[UNHANDLED ERROR]', err);
  } else {
    const safe =
      err instanceof Error
        ? { name: err.name, message: err.message }
        : { message: 'Unknown error' };
    console.error('[UNHANDLED ERROR]', safe);
  }
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor. Tente novamente mais tarde.',
  });
}
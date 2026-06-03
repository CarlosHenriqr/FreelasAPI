import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AVATAR_MAX_BYTES } from '../config/supabase';

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
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Imagem muito grande. Tamanho máximo: ${Math.round(AVATAR_MAX_BYTES / 1024 / 1024)} MB.`
        : 'Falha no upload do arquivo.';
    res.status(400).json({
      success: false,
      message,
      code: err.code,
    });
    return;
  }

  // ─── Erros de validação Zod ───────────────────────────────────────────────
  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors;
    const firstFieldMessage = Object.values(fieldErrors)
      .flat()
      .find((msg): msg is string => typeof msg === 'string' && msg.length > 0);

    res.status(400).json({
      success: false,
      message: firstFieldMessage ?? 'Dados inválidos.',
      errors: fieldErrors,
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
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from './errorHandler.middleware';

export async function authorizeJobOwner(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.auth || req.auth.type !== 'company') {
    return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
  }

  const jobId = req.params.id ?? req.params.jobId;

  if (!jobId) {
    return next(new AppError(400, 'ID do projeto não fornecido.', 'MISSING_JOB_ID'));
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { companyId: true },
  });

  if (!job) {
    return next(new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND'));
  }

  if (job.companyId !== req.auth.sub) {
    return next(new AppError(403, 'Acesso negado. Você não é o proprietário deste projeto.', 'FORBIDDEN'));
  }

  next();
}

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { matchingQuerySchema } from './matching.schema';
import * as MatchingService from './matching.service';

export async function getRecommendedCandidates(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.jobId;
    if (!jobId) {
      return next(new AppError(400, 'ID da vaga não informado.', 'MISSING_JOB_ID'));
    }

    const query = matchingQuerySchema.parse(req.query);
    const data = await MatchingService.getRecommendedCandidates(req.auth.sub, jobId, query);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function expressHiringInterest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.jobId;
    const candidateUserId = req.params.userId;

    if (!jobId) {
      return next(new AppError(400, 'ID da vaga não informado.', 'MISSING_JOB_ID'));
    }
    if (!candidateUserId) {
      return next(new AppError(400, 'ID do candidato não informado.', 'MISSING_CANDIDATE_ID'));
    }

    const data = await MatchingService.expressHiringInterest(
      req.auth.sub,
      jobId,
      candidateUserId,
    );

    res.status(201).json({
      status: 'success',
      message: 'Interesse enviado ao candidato.',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendedJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const query = matchingQuerySchema.parse(req.query);
    const data = await MatchingService.getRecommendedJobs(req.auth.sub, query);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

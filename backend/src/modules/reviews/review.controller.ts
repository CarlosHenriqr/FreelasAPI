import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { createReviewSchema, listReviewsQuerySchema } from './review.schema';
import * as ReviewService from './review.service';

function getActor(req: Request): { type: 'user' | 'company'; id: string } {
  if (!req.auth) {
    throw new AppError(401, 'Não autorizado.', 'UNAUTHORIZED');
  }
  if (req.auth.type !== 'user' && req.auth.type !== 'company') {
    throw new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN');
  }
  return { type: req.auth.type, id: req.auth.sub };
}

export async function createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = getActor(req);
    const dto = createReviewSchema.parse(req.body);
    const review = await ReviewService.createReview(actor, dto);

    res.status(201).json({
      status: 'success',
      message: 'Avaliação registrada com sucesso.',
      data: review,
    });
  } catch (err) {
    next(err);
  }
}

export async function listReceivedReviews(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const actor = getActor(req);
    const query = listReviewsQuerySchema.parse(req.query);
    const data = await ReviewService.listReceivedReviews(actor, query);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function getApplicationReviewStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const actor = getActor(req);
    const applicationId = req.params.applicationId;
    if (!applicationId) {
      return next(new AppError(400, 'ID da candidatura não informado.', 'MISSING_APPLICATION_ID'));
    }

    const data = await ReviewService.getApplicationReviewStatus(actor, applicationId);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function getReviewSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = getActor(req);
    const data = await ReviewService.getReviewSummary(actor);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

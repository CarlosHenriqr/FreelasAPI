import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import * as JobService from './job.service';
import { createJobSchema, listJobsQuerySchema } from './job.schema';

export async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = createJobSchema.parse(req.body);
    const job = await JobService.createJob(req.auth.sub, dto);

    res.status(201).json({
      status: 'success',
      message: 'Vaga criada com sucesso.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listJobsQuerySchema.parse(req.query);
    const jobs = await JobService.listJobs(query);

    res.status(200).json({ status: 'success', data: jobs });
  } catch (err) {
    next(err);
  }
}


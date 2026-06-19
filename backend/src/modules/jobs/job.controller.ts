import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import * as JobService from './job.service';
import {
  applyToJobSchema,
  createJobSchema,
  listJobApplicationsQuerySchema,
  listJobsQuerySchema,
  updateJobStatusSchema,
  updateJobSchema,
} from './job.schema';

export async function createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = createJobSchema.parse(req.body);
    const job = await JobService.createJob(req.auth.sub, dto);

    res.status(201).json({
      status: 'success',
      message: 'Projeto criado com sucesso.',
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

export async function listMyJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobs = await JobService.listCompanyJobs(req.auth.sub);

    res.status(200).json({ status: 'success', data: jobs });
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const job = await JobService.getJobById(jobId);
    res.status(200).json({ status: 'success', data: job });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const dto = updateJobSchema.parse(req.body);
    const job = await JobService.updateJob(req.auth.sub, jobId, dto);

    res.status(200).json({
      status: 'success',
      message: 'Projeto atualizado com sucesso.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const job = await JobService.deleteJob(req.auth.sub, jobId);

    res.status(200).json({
      status: 'success',
      message: 'Projeto desativado com sucesso.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const dto = updateJobStatusSchema.parse(req.body);
    const job = await JobService.updateJobStatus(req.auth.sub, jobId, dto);

    res.status(200).json({
      status: 'success',
      message: 'Status do projeto atualizado com sucesso.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

export async function applyToJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const dto = applyToJobSchema.parse(req.body);
    const application = await JobService.applyToJob(req.auth.sub, jobId, dto);

    res.status(201).json({
      status: 'success',
      message: 'Candidatura enviada com sucesso.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

export async function getJobApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const query = listJobApplicationsQuerySchema.parse(req.query);
    const applications = await JobService.getJobApplications(req.auth.sub, jobId, query);

    res.status(200).json({ status: 'success', data: applications });
  } catch (err) {
    next(err);
  }
}

export async function getJobCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID do projeto não informado.', 'MISSING_JOB_ID'));
    }

    const query = listJobApplicationsQuerySchema.parse(req.query);
    const candidates = await JobService.getJobCandidates(req.auth.sub, jobId, query);

    res.status(200).json({ status: 'success', data: candidates });
  } catch (err) {
    next(err);
  }
}

export async function getJobMessages(_req: Request, _res: Response, next: NextFunction): Promise<void> {
  return next(new AppError(501, 'Listagem de mensagens do projeto ainda não implementada.', 'NOT_IMPLEMENTED'));
}


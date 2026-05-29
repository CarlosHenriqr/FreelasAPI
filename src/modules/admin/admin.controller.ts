import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import {
  adminJobsQuerySchema,
  adminTargetTypeQuerySchema,
  adminUserListQuerySchema,
} from './admin.schema';
import * as AdminService from './admin.service';

function getAdminId(req: Request): string {
  if (!req.auth || req.auth.role !== 'admin') {
    throw new AppError(403, 'Acesso não autorizado para este papel.', 'FORBIDDEN');
  }
  return req.auth.sub;
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = adminUserListQuerySchema.parse(req.query);
    const data = await AdminService.listUsers(query);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const targetId = req.params.id;
    if (!targetId) {
      return next(new AppError(400, 'ID do usuário não informado.', 'MISSING_TARGET_ID'));
    }
    const query = adminTargetTypeQuerySchema.parse(req.query);
    const data = await AdminService.blockUser(adminId, targetId, query);
    res.status(200).json({ status: 'success', message: 'Usuário bloqueado com sucesso.', data });
  } catch (err) {
    next(err);
  }
}

export async function unblockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const targetId = req.params.id;
    if (!targetId) {
      return next(new AppError(400, 'ID do usuário não informado.', 'MISSING_TARGET_ID'));
    }
    const query = adminTargetTypeQuerySchema.parse(req.query);
    const data = await AdminService.unblockUser(adminId, targetId, query);
    res.status(200).json({ status: 'success', message: 'Usuário desbloqueado com sucesso.', data });
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = adminJobsQuerySchema.parse(req.query);
    const data = await AdminService.listJobs(query);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function moderateRemoveJob(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = getAdminId(req);
    const jobId = req.params.id;
    if (!jobId) {
      return next(new AppError(400, 'ID da vaga não informado.', 'MISSING_JOB_ID'));
    }
    const data = await AdminService.moderateRemoveJob(adminId, jobId);
    res.status(200).json({ status: 'success', message: 'Vaga moderada e removida.', data });
  } catch (err) {
    next(err);
  }
}

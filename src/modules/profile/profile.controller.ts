import { Request, Response, NextFunction } from 'express';
import * as ProfileService from './profile.service';
import {
  updateUserProfileSchema,
  updateUserResumeSchema,
  updateTechStackSchema,
  updateCompanyProfileSchema,
} from './profile.schema';
import { AppError } from '../../middlewares/errorHandler.middleware';

export async function getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type === 'user') {
      const profile = await ProfileService.getUserProfile(req.auth.sub);
      res.status(200).json({ status: 'success', data: profile });
    } else if (req.auth?.type === 'company') {
      const profile = await ProfileService.getCompanyProfile(req.auth.sub);
      res.status(200).json({ status: 'success', data: profile });
    } else {
      next(new AppError(401, 'Não autorizado.', 'UNAUTHORIZED'));
    }
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = updateUserProfileSchema.parse(req.body);
    const updated = await ProfileService.updateUserProfile(req.auth.sub, dto);

    res.status(200).json({ status: 'success', message: 'Perfil atualizado com sucesso.', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateCompanyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = updateCompanyProfileSchema.parse(req.body);
    const updated = await ProfileService.updateCompanyProfile(req.auth.sub, dto);

    res.status(200).json({ status: 'success', message: 'Perfil da empresa atualizado com sucesso.', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateUserResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = updateUserResumeSchema.parse(req.body);
    const updated = await ProfileService.updateUserResume(req.auth.sub, dto);

    res.status(200).json({ status: 'success', message: 'Currículo atualizado com sucesso.', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserResume(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    await ProfileService.deleteUserResume(req.auth.sub);

    res.status(200).json({ status: 'success', message: 'Currículo removido com sucesso.' });
  } catch (err) {
    next(err);
  }
}

export async function updateTechStack(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = updateTechStackSchema.parse(req.body);
    const updated = await ProfileService.updateTechStack(req.auth.sub, dto);

    res.status(200).json({ status: 'success', message: 'Stack tecnológica atualizada com sucesso.', data: updated });
  } catch (err) {
    next(err);
  }
}

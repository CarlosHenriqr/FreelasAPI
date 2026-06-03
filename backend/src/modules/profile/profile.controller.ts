import { Request, Response, NextFunction } from 'express';
import * as ProfileService from './profile.service';
import {
  updateUserProfileSchema,
  updateUserResumeSchema,
  updateTechStackSchema,
  updateCompanyProfileSchema,
  updateMeSchema,
  experienceSchema,
  portfolioItemSchema,
  changePasswordSchema,
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

export async function getPublicUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.id;
    if (!userId) {
      return next(new AppError(400, 'ID do freelancer não informado.', 'MISSING_USER_ID'));
    }

    const profile = await ProfileService.getPublicUserProfile(userId);
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    next(err);
  }
}

export async function getPublicCompanyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = req.params.id;
    if (!companyId) {
      return next(new AppError(400, 'ID da empresa não informado.', 'MISSING_COMPANY_ID'));
    }

    const profile = await ProfileService.getPublicCompanyProfile(companyId);
    res.status(200).json({ status: 'success', data: profile });
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

export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) {
      return next(new AppError(401, 'Não autorizado.', 'UNAUTHORIZED'));
    }

    const dto = updateMeSchema.parse(req.body);

    if (req.auth.type === 'user') {
      const updated = await ProfileService.updateUserProfile(req.auth.sub, dto);
      res.status(200).json({
        status: 'success',
        message: 'Perfil atualizado com sucesso.',
        data: updated,
      });
      return;
    }

    if (req.auth.type === 'company') {
      const updated = await ProfileService.updateCompanyProfile(req.auth.sub, dto);
      res.status(200).json({
        status: 'success',
        message: 'Perfil atualizado com sucesso.',
        data: updated,
      });
      return;
    }

    next(new AppError(401, 'Não autorizado.', 'UNAUTHORIZED'));
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

export async function uploadUserAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const updated = await ProfileService.uploadUserAvatar(req.auth.sub, req.file!);

    res.status(200).json({
      status: 'success',
      message: 'Avatar atualizado com sucesso.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadCompanyAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const updated = await ProfileService.uploadCompanyAvatar(req.auth.sub, req.file!);

    res.status(200).json({
      status: 'success',
      message: 'Avatar atualizado com sucesso.',
      data: updated,
    });
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

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) {
      return next(new AppError(401, 'Não autorizado.', 'UNAUTHORIZED'));
    }

    const dto = changePasswordSchema.parse(req.body);

    if (req.auth.type === 'user') {
      await ProfileService.changeUserPassword(req.auth.sub, dto);
    } else if (req.auth.type === 'company') {
      await ProfileService.changeCompanyPassword(req.auth.sub, dto);
    } else {
      return next(new AppError(401, 'Não autorizado.', 'UNAUTHORIZED'));
    }

    res.status(200).json({ status: 'success', message: 'Senha alterada com sucesso.' });
  } catch (err) {
    next(err);
  }
}

export async function listExperiences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const items = await ProfileService.listExperiences(req.auth.sub);
    res.status(200).json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
}

export async function createExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = experienceSchema.parse(req.body);
    const item = await ProfileService.createExperience(req.auth.sub, dto);
    res.status(201).json({ status: 'success', message: 'Experiência adicionada com sucesso.', data: item });
  } catch (err) {
    next(err);
  }
}

export async function updateExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = experienceSchema.parse(req.body);
    const item = await ProfileService.updateExperience(req.auth.sub, req.params.id, dto);
    res.status(200).json({ status: 'success', message: 'Experiência atualizada com sucesso.', data: item });
  } catch (err) {
    next(err);
  }
}

export async function deleteExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    await ProfileService.deleteExperience(req.auth.sub, req.params.id);
    res.status(200).json({ status: 'success', message: 'Experiência removida com sucesso.' });
  } catch (err) {
    next(err);
  }
}

export async function listPortfolio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const items = await ProfileService.listPortfolio(req.auth.sub);
    res.status(200).json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
}

export async function createPortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = portfolioItemSchema.parse(req.body);
    const item = await ProfileService.createPortfolioItem(req.auth.sub, dto);
    res.status(201).json({ status: 'success', message: 'Item de portfólio adicionado com sucesso.', data: item });
  } catch (err) {
    next(err);
  }
}

export async function updatePortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const dto = portfolioItemSchema.parse(req.body);
    const item = await ProfileService.updatePortfolioItem(req.auth.sub, req.params.id, dto);
    res.status(200).json({ status: 'success', message: 'Item de portfólio atualizado com sucesso.', data: item });
  } catch (err) {
    next(err);
  }
}

export async function deletePortfolioItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.auth?.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    await ProfileService.deletePortfolioItem(req.auth.sub, req.params.id);
    res.status(200).json({ status: 'success', message: 'Item de portfólio removido com sucesso.' });
  } catch (err) {
    next(err);
  }
}

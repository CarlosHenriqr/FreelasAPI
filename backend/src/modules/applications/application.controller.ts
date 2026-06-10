import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import * as ApplicationService from './application.service';
import {
  listCompanyApplicationsQuerySchema,
  listMyApplicationsQuerySchema,
  updateApplicationStatusSchema,
} from './application.schema';

export async function updateApplicationStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      return next(new AppError(400, 'ID da candidatura não informado.', 'MISSING_APPLICATION_ID'));
    }

    const dto = updateApplicationStatusSchema.parse(req.body);
    const application = await ApplicationService.updateApplicationStatus(
      req.auth.sub,
      applicationId,
      dto,
    );

    res.status(200).json({
      status: 'success',
      message: 'Status da candidatura atualizado com sucesso.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      return next(new AppError(400, 'ID da candidatura não informado.', 'MISSING_APPLICATION_ID'));
    }

    const application = await ApplicationService.cancelApplication(req.auth.sub, applicationId);

    res.status(200).json({
      status: 'success',
      message: 'Candidatura cancelada com sucesso.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const query = listMyApplicationsQuerySchema.parse(req.query);
    const applications = await ApplicationService.listMyApplications(req.auth.sub, query);

    res.status(200).json({ status: 'success', data: applications });
  } catch (err) {
    next(err);
  }
}

export async function confirmApplicationCompletion(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || (req.auth.type !== 'user' && req.auth.type !== 'company')) {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      return next(new AppError(400, 'ID da candidatura não informado.', 'MISSING_APPLICATION_ID'));
    }

    const application = await ApplicationService.confirmApplicationCompletion(
      { type: req.auth.type, id: req.auth.sub },
      applicationId,
    );

    res.status(200).json({
      status: 'success',
      message:
        application.status === 'COMPLETED'
          ? 'Projeto finalizado por ambas as partes.'
          : 'Confirmação de conclusão registrada. Aguardando a outra parte.',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

export async function listCompanyApplications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const query = listCompanyApplicationsQuerySchema.parse(req.query);
    const applications = await ApplicationService.listCompanyApplications(req.auth.sub, query);

    res.status(200).json({ status: 'success', data: applications });
  } catch (err) {
    next(err);
  }
}

export async function getCompanyApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'company') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      return next(new AppError(400, 'ID da candidatura não informado.', 'MISSING_APPLICATION_ID'));
    }

    const data = await ApplicationService.getCompanyApplicationById(req.auth.sub, applicationId);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function getMyApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.auth || req.auth.type !== 'user') {
      return next(new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN'));
    }

    const applicationId = req.params.id;
    if (!applicationId) {
      return next(new AppError(400, 'ID da candidatura não informado.', 'MISSING_APPLICATION_ID'));
    }

    const application = await ApplicationService.getMyApplicationById(req.auth.sub, applicationId);

    res.status(200).json({ status: 'success', data: application });
  } catch (err) {
    next(err);
  }
}

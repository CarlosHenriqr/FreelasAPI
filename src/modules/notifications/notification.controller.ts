import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { listNotificationsQuerySchema } from './notification.schema';
import * as NotificationService from './notification.service';

function getRecipient(req: Request): { type: 'user' | 'company'; id: string } {
  if (!req.auth) {
    throw new AppError(401, 'Não autorizado.', 'UNAUTHORIZED');
  }
  if (req.auth.type !== 'user' && req.auth.type !== 'company') {
    throw new AppError(403, 'Acesso não autorizado para este perfil.', 'FORBIDDEN');
  }

  return {
    type: req.auth.type,
    id: req.auth.sub,
  };
}

export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const recipient = getRecipient(req);
    const query = listNotificationsQuerySchema.parse(req.query);
    const data = await NotificationService.listNotifications(recipient, query);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const recipient = getRecipient(req);
    const notificationId = req.params.id;

    if (!notificationId) {
      return next(new AppError(400, 'ID da notificação não informado.', 'MISSING_NOTIFICATION_ID'));
    }

    const data = await NotificationService.markAsRead(recipient, notificationId);
    res.status(200).json({ status: 'success', message: 'Notificação marcada como lida.', data });
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const recipient = getRecipient(req);
    const data = await NotificationService.getUnreadCount(recipient);
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

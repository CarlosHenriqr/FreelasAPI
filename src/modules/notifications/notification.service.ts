import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { sanitizeString } from '../../utils/sanitize.util';
import type { ListNotificationsQueryDTO } from './notification.schema';

type NotificationRecipient =
  | { type: 'user'; id: string }
  | { type: 'company'; id: string };

function recipientWhere(recipient: NotificationRecipient) {
  return recipient.type === 'user' ? { userId: recipient.id } : { companyId: recipient.id };
}

function ensureNotificationOwnership(
  recipient: NotificationRecipient,
  notification: { userId: string | null; companyId: string | null } | null,
): asserts notification is { userId: string | null; companyId: string | null } {
  if (!notification) {
    throw new AppError(404, 'Notificação não encontrada.', 'NOTIFICATION_NOT_FOUND');
  }

  if (recipient.type === 'user' && notification.userId !== recipient.id) {
    throw new AppError(403, 'Acesso negado a esta notificação.', 'FORBIDDEN');
  }

  if (recipient.type === 'company' && notification.companyId !== recipient.id) {
    throw new AppError(403, 'Acesso negado a esta notificação.', 'FORBIDDEN');
  }
}

export async function listNotifications(
  recipient: NotificationRecipient,
  query: ListNotificationsQueryDTO,
) {
  const where = {
    ...recipientWhere(recipient),
    ...(query.read === undefined ? {} : { read: query.read }),
  };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit,
      select: {
        id: true,
        type: true,
        content: true,
        data: true,
        read: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
  };
}

export async function markAsRead(recipient: NotificationRecipient, notificationId: string) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true, companyId: true, read: true },
  });

  ensureNotificationOwnership(recipient, existing);

  if (existing.read) {
    return { id: existing.id, read: true };
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
    select: {
      id: true,
      read: true,
      type: true,
      content: true,
      data: true,
      createdAt: true,
    },
  });

  return updated;
}

export async function getUnreadCount(recipient: NotificationRecipient) {
  const total = await prisma.notification.count({
    where: {
      ...recipientWhere(recipient),
      read: false,
    },
  });

  return { unreadCount: total };
}

export async function createNotificationForUser(params: {
  userId: string;
  type: string;
  content: string;
  data?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      content: sanitizeString(params.content),
      ...(params.data !== undefined ? { data: params.data } : {}),
    },
    select: { id: true },
  });
}

export async function createNotificationForCompany(params: {
  companyId: string;
  type: string;
  content: string;
  data?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      companyId: params.companyId,
      type: params.type,
      content: sanitizeString(params.content),
      ...(params.data !== undefined ? { data: params.data } : {}),
    },
    select: { id: true },
  });
}

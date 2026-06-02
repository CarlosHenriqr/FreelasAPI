import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import type {
  AdminJobsQueryDTO,
  AdminTargetTypeQueryDTO,
  AdminUserListQueryDTO,
} from './admin.schema';

async function registerAuditLog(params: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: object;
}) {
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: params.adminUserId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      ...(params.metadata ? { metadata: params.metadata } : {}),
    },
  });
}

export async function listUsers(query: AdminUserListQueryDTO) {
  const skip = (query.page - 1) * query.limit;

  if (query.type === 'company') {
    const [items, total] = await prisma.$transaction([
      prisma.company.findMany({
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          isBlocked: true,
          createdAt: true,
        },
      }),
      prisma.company.count(),
    ]);

    return { items, total, page: query.page, limit: query.limit, type: query.type };
  }

  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        isBlocked: true,
        isAdmin: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return { items, total, page: query.page, limit: query.limit, type: query.type };
}

export async function blockUser(adminUserId: string, targetId: string, query: AdminTargetTypeQueryDTO) {
  if (query.type === 'company') {
    const existing = await prisma.company.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!existing) throw new AppError(404, 'Empresa não encontrada.', 'COMPANY_NOT_FOUND');

    const updated = await prisma.company.update({
      where: { id: targetId },
      data: { isBlocked: true, isActive: false },
      select: { id: true, name: true, isBlocked: true, isActive: true },
    });

    await registerAuditLog({
      adminUserId,
      action: 'BLOCK_COMPANY',
      targetType: 'company',
      targetId,
    });

    return updated;
  }

  const existing = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, isAdmin: true },
  });
  if (!existing) throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  if (existing.isAdmin) throw new AppError(409, 'Não é permitido bloquear outro admin.', 'ADMIN_PROTECTED');

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isBlocked: true, isActive: false },
    select: { id: true, name: true, isBlocked: true, isActive: true },
  });

  await registerAuditLog({
    adminUserId,
    action: 'BLOCK_USER',
    targetType: 'user',
    targetId,
  });

  return updated;
}

export async function unblockUser(adminUserId: string, targetId: string, query: AdminTargetTypeQueryDTO) {
  if (query.type === 'company') {
    const existing = await prisma.company.findUnique({ where: { id: targetId }, select: { id: true } });
    if (!existing) throw new AppError(404, 'Empresa não encontrada.', 'COMPANY_NOT_FOUND');

    const updated = await prisma.company.update({
      where: { id: targetId },
      data: { isBlocked: false, isActive: true, blockedUntil: null, loginAttempts: 0 },
      select: { id: true, name: true, isBlocked: true, isActive: true },
    });

    await registerAuditLog({
      adminUserId,
      action: 'UNBLOCK_COMPANY',
      targetType: 'company',
      targetId,
    });

    return updated;
  }

  const existing = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
  if (!existing) throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isBlocked: false, isActive: true, blockedUntil: null, loginAttempts: 0 },
    select: { id: true, name: true, isBlocked: true, isActive: true, isAdmin: true },
  });

  await registerAuditLog({
    adminUserId,
    action: 'UNBLOCK_USER',
    targetType: 'user',
    targetId,
  });

  return updated;
}

export async function listJobs(query: AdminJobsQueryDTO) {
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await prisma.$transaction([
    prisma.job.findMany({
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        isActive: true,
        isFilled: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.job.count(),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

export async function moderateRemoveJob(adminUserId: string, jobId: string) {
  const existing = await prisma.job.findUnique({ where: { id: jobId }, select: { id: true } });
  if (!existing) {
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { status: 'CANCELLED', isActive: false, isFilled: false },
    select: {
      id: true,
      title: true,
      status: true,
      isActive: true,
      isFilled: true,
      updatedAt: true,
    },
  });

  await registerAuditLog({
    adminUserId,
    action: 'MODERATE_REMOVE_JOB',
    targetType: 'job',
    targetId: jobId,
  });

  return updated;
}

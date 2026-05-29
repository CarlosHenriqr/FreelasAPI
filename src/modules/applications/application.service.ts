import { ApplicationStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { createNotificationForUser } from '../notifications/notification.service';
import type { ListMyApplicationsQueryDTO, UpdateApplicationStatusDTO } from './application.schema';

const TERMINAL_STATUSES: ApplicationStatus[] = ['COMPLETED', 'REJECTED', 'CANCELLED'];

const COMPANY_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: ['REVIEWED', 'ACCEPTED', 'REJECTED'],
  REVIEWED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['COMPLETED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

const USER_CANCELLABLE: ApplicationStatus[] = ['PENDING', 'REVIEWED'];

function assertCompanyTransition(current: ApplicationStatus, next: ApplicationStatus): void {
  const allowed = COMPANY_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new AppError(
      422,
      `Transição inválida de ${current} para ${next}.`,
      'INVALID_STATUS_TRANSITION',
    );
  }
}

export async function updateApplicationStatus(
  companyId: string,
  applicationId: string,
  dto: UpdateApplicationStatusDTO,
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      job: { select: { companyId: true, title: true } },
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }
  if (application.job.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Esta candidatura não pertence à sua empresa.', 'FORBIDDEN');
  }
  if (TERMINAL_STATUSES.includes(application.status)) {
    throw new AppError(
      409,
      'Candidatura em status final e não pode ser alterada.',
      'APPLICATION_STATUS_FINAL',
    );
  }

  const nextStatus = dto.status as ApplicationStatus;
  assertCompanyTransition(application.status, nextStatus);

  const updated = await prisma.$transaction(async (tx) => {
    const applicationUpdated = await tx.application.update({
      where: { id: applicationId },
      data: { status: nextStatus },
      select: {
        id: true,
        status: true,
        resumeUrl: true,
        coverLetter: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (nextStatus === 'COMPLETED') {
      await tx.job.update({
        where: { id: applicationUpdated.job.id },
        data: {
          status: 'CLOSED',
          isActive: false,
          isFilled: true,
        },
      });
    }

    return applicationUpdated;
  });

  await createNotificationForUser({
    userId: updated.user.id,
    type: 'APPLICATION_STATUS_CHANGED',
    content: `Sua candidatura foi atualizada para ${updated.status}.`,
    data: {
      applicationId: updated.id,
      jobId: updated.job.id,
      previousStatus: application.status,
      nextStatus: updated.status,
    },
  });

  return updated;
}

export async function cancelApplication(userId: string, applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }
  if (application.userId !== userId) {
    throw new AppError(403, 'Você só pode cancelar suas próprias candidaturas.', 'FORBIDDEN');
  }
  if (!USER_CANCELLABLE.includes(application.status)) {
    throw new AppError(
      409,
      'Esta candidatura não pode ser cancelada no status atual.',
      'APPLICATION_CANNOT_CANCEL',
    );
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'CANCELLED' },
    select: {
      id: true,
      status: true,
      jobId: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return updated;
}

export async function listMyApplications(userId: string, query: ListMyApplicationsQueryDTO) {
  const applications = await prisma.application.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status as ApplicationStatus } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      resumeUrl: true,
      coverLetter: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: {
          id: true,
          title: true,
          isActive: true,
          isFilled: true,
          expiresAt: true,
          company: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return applications;
}

import { ApplicationStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { sendApplicationAcceptedEmail } from '../../utils/email.util';
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

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: 'Pendente',
  REVIEWED: 'Em análise',
  ACCEPTED: 'Aceita',
  REJECTED: 'Recusada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

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

function buildStatusNotificationContent(params: {
  nextStatus: ApplicationStatus;
  companyName: string;
  jobTitle: string;
  companyEmail?: string | null;
  companyPhone?: string | null;
}): { type: string; content: string } {
  const { nextStatus, companyName, jobTitle, companyEmail, companyPhone } = params;

  if (nextStatus === 'ACCEPTED') {
    const contactHint =
      companyEmail || companyPhone
        ? ` A empresa ${companyName} entrará em contato pelo seu e-mail ou telefone cadastrados`
        : ` A empresa ${companyName} entrará em contato usando os dados do seu perfil`;

    return {
      type: 'APPLICATION_ACCEPTED',
      content: `Parabéns! Sua candidatura para "${jobTitle}" foi aceita.${contactHint}.`,
    };
  }

  if (nextStatus === 'REJECTED') {
    return {
      type: 'APPLICATION_REJECTED',
      content: `Sua candidatura para "${jobTitle}" foi recusada por ${companyName}.`,
    };
  }

  return {
    type: 'APPLICATION_STATUS_CHANGED',
    content: `Sua candidatura para "${jobTitle}" foi atualizada para ${STATUS_LABELS[nextStatus]}.`,
  };
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
      job: {
        select: {
          companyId: true,
          title: true,
          company: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
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
            phone: true,
            avatarUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
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

  const company = application.job.company;
  const notification = buildStatusNotificationContent({
    nextStatus,
    companyName: company.name,
    jobTitle: application.job.title,
    companyEmail: company.email,
    companyPhone: company.phone,
  });

  await createNotificationForUser({
    userId: updated.user.id,
    type: notification.type,
    content: notification.content,
    data: {
      applicationId: updated.id,
      jobId: updated.job.id,
      previousStatus: application.status,
      nextStatus: updated.status,
      companyName: company.name,
      companyEmail: company.email,
      companyPhone: company.phone,
      jobTitle: application.job.title,
    },
  });

  if (nextStatus === 'ACCEPTED') {
    await sendApplicationAcceptedEmail({
      to: updated.user.email,
      userName: updated.user.name,
      companyName: company.name,
      jobTitle: application.job.title,
      companyEmail: company.email,
      companyPhone: company.phone,
    });
  }

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

const myApplicationJobSelect = {
  id: true,
  title: true,
  description: true,
  requirements: true,
  deadline: true,
  expiresAt: true,
  status: true,
  isActive: true,
  isFilled: true,
  createdAt: true,
  technologies: {
    select: {
      type: true,
      technology: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  company: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
    },
  },
} as const;

export async function listMyApplications(userId: string, query: ListMyApplicationsQueryDTO) {
  const applications = await prisma.application.findMany({
    where: {
      userId,
      ...(query.status ? { status: query.status as ApplicationStatus } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jobId: true,
      status: true,
      resumeUrl: true,
      coverLetter: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: myApplicationJobSelect,
      },
    },
  });

  return applications;
}

export async function getMyApplicationById(userId: string, applicationId: string) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: {
      id: true,
      jobId: true,
      status: true,
      resumeUrl: true,
      coverLetter: true,
      createdAt: true,
      updatedAt: true,
      job: {
        select: myApplicationJobSelect,
      },
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }

  return application;
}

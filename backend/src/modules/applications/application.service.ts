import { ApplicationStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { sendApplicationAcceptedEmail } from '../../utils/email.util';
import {
  createNotificationForCompany,
  createNotificationForUser,
} from '../notifications/notification.service';
import { computeApplicantMatchScores } from '../../utils/recommendation.util';
import type {
  ListCompanyApplicationsQueryDTO,
  ListMyApplicationsQueryDTO,
  UpdateApplicationStatusDTO,
} from './application.schema';

const TERMINAL_STATUSES: ApplicationStatus[] = ['COMPLETED', 'REJECTED', 'CANCELLED'];

const COMPANY_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: ['REVIEWED', 'ACCEPTED', 'REJECTED'],
  REVIEWED: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
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
        companyCompletedAt: true,
        userCompletedAt: true,
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
    void sendApplicationAcceptedEmail({
      to: updated.user.email,
      userName: updated.user.name,
      companyName: company.name,
      jobTitle: application.job.title,
      companyEmail: company.email,
      companyPhone: company.phone,
    }).catch(() => undefined);
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
      companyCompletedAt: true,
      userCompletedAt: true,
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
      companyCompletedAt: true,
      userCompletedAt: true,
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

const companyApplicationUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  cpf: true,
} as const;

const companyApplicationJobSelect = {
  id: true,
  title: true,
  description: true,
  requirements: true,
  deadline: true,
  expiresAt: true,
  status: true,
  isActive: true,
  isFilled: true,
  companyId: true,
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
} as const;

export async function listCompanyApplications(
  companyId: string,
  query: ListCompanyApplicationsQueryDTO,
) {
  const applications = await prisma.application.findMany({
    where: {
      job: { companyId },
      ...(query.jobId ? { jobId: query.jobId } : {}),
      ...(query.status ? { status: query.status as ApplicationStatus } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      jobId: true,
      userId: true,
      status: true,
      resumeUrl: true,
      coverLetter: true,
      companyCompletedAt: true,
      userCompletedAt: true,
      createdAt: true,
      updatedAt: true,
      user: { select: companyApplicationUserSelect },
      job: { select: { id: true, title: true } },
    },
  });

  const byJob = new Map<string, string[]>();
  for (const app of applications) {
    const list = byJob.get(app.jobId) ?? [];
    list.push(app.userId);
    byJob.set(app.jobId, list);
  }

  const matchByUserJob = new Map<string, Awaited<ReturnType<typeof computeApplicantMatchScores>>[string]>();
  await Promise.all(
    [...byJob.entries()].map(async ([jobId, userIds]) => {
      const scores = await computeApplicantMatchScores(jobId, userIds);
      for (const [userId, score] of Object.entries(scores)) {
        matchByUserJob.set(`${jobId}:${userId}`, score);
      }
    }),
  );

  return applications.map((item) => {
    const match = matchByUserJob.get(`${item.jobId}:${item.userId}`);
    return {
      ...item,
      matchScore: match?.matchScore ?? 0,
      matchPercent: match?.matchPercent ?? 0,
      matchedTechnologies: match?.matchedTechnologies ?? [],
      user: {
        ...item.user,
        cpf: item.user.cpf
          ? item.user.cpf.replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2')
          : item.user.cpf,
      },
    };
  });
}

export async function getCompanyApplicationById(companyId: string, applicationId: string) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: { companyId },
    },
    select: {
      id: true,
      jobId: true,
      userId: true,
      status: true,
      resumeUrl: true,
      coverLetter: true,
      companyCompletedAt: true,
      userCompletedAt: true,
      createdAt: true,
      updatedAt: true,
      user: { select: companyApplicationUserSelect },
      job: { select: companyApplicationJobSelect },
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }

  const matchScores = await computeApplicantMatchScores(application.jobId, [application.userId]);
  const match = matchScores[application.userId];

  return {
    application: {
      ...application,
      matchScore: match?.matchScore ?? 0,
      matchPercent: match?.matchPercent ?? 0,
      matchedTechnologies: match?.matchedTechnologies ?? [],
      user: {
        ...application.user,
        cpf: application.user.cpf
          ? application.user.cpf.replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2')
          : application.user.cpf,
      },
    },
    job: application.job,
  };
}

type CompletionActor = { type: 'user' | 'company'; id: string };

const completionApplicationSelect = {
  id: true,
  status: true,
  resumeUrl: true,
  coverLetter: true,
  companyCompletedAt: true,
  userCompletedAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  jobId: true,
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
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  },
} as const;

async function closeJobOnCompletion(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], jobId: string) {
  await tx.job.update({
    where: { id: jobId },
    data: {
      status: 'CLOSED',
      isActive: false,
      isFilled: true,
    },
  });
}

export async function confirmApplicationCompletion(actor: CompletionActor, applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      userId: true,
      companyCompletedAt: true,
      userCompletedAt: true,
      job: {
        select: {
          id: true,
          title: true,
          companyId: true,
          company: { select: { name: true } },
        },
      },
      user: { select: { name: true } },
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }
  if (application.status !== 'ACCEPTED') {
    throw new AppError(
      409,
      'A confirmação de conclusão só é permitida para candidaturas aceitas em andamento.',
      'COMPLETION_REQUIRES_ACCEPTED',
    );
  }

  if (actor.type === 'user') {
    if (application.userId !== actor.id) {
      throw new AppError(403, 'Você só pode confirmar suas próprias candidaturas.', 'FORBIDDEN');
    }
    if (application.userCompletedAt) {
      const current = await prisma.application.findUnique({
        where: { id: applicationId },
        select: completionApplicationSelect,
      });
      return current!;
    }
  } else {
    if (application.job.companyId !== actor.id) {
      throw new AppError(403, 'Acesso negado. Esta candidatura não pertence à sua empresa.', 'FORBIDDEN');
    }
    if (application.companyCompletedAt) {
      const current = await prisma.application.findUnique({
        where: { id: applicationId },
        select: completionApplicationSelect,
      });
      return current!;
    }
  }

  const now = new Date();
  const companyWillConfirm = actor.type === 'company';
  const userWillConfirm = actor.type === 'user';
  const bothWillConfirm =
    (companyWillConfirm || !!application.companyCompletedAt) &&
    (userWillConfirm || !!application.userCompletedAt);

  const updated = await prisma.$transaction(async (tx) => {
    const applicationUpdated = await tx.application.update({
      where: { id: applicationId },
      data: {
        ...(companyWillConfirm ? { companyCompletedAt: now } : {}),
        ...(userWillConfirm ? { userCompletedAt: now } : {}),
        ...(bothWillConfirm ? { status: 'COMPLETED' } : {}),
      },
      select: completionApplicationSelect,
    });

    if (bothWillConfirm) {
      await closeJobOnCompletion(tx, applicationUpdated.job.id);
    }

    return applicationUpdated;
  });

  const jobTitle = application.job.title;
  const companyName = application.job.company.name;
  const freelancerName = application.user.name;

  if (bothWillConfirm) {
    await createNotificationForUser({
      userId: updated.userId,
      type: 'APPLICATION_COMPLETED',
      content: `O projeto "${jobTitle}" foi finalizado por ambas as partes. Você já pode avaliar a empresa.`,
      data: {
        applicationId: updated.id,
        jobId: updated.jobId,
        jobTitle,
        companyName,
      },
    });
    await createNotificationForCompany({
      companyId: updated.job.companyId,
      type: 'APPLICATION_COMPLETED',
      content: `O projeto "${jobTitle}" com ${freelancerName} foi finalizado. Você já pode avaliar o freelancer.`,
      data: {
        applicationId: updated.id,
        jobId: updated.jobId,
        jobTitle,
        freelancerName,
      },
    });
  } else if (actor.type === 'company') {
    await createNotificationForUser({
      userId: updated.userId,
      type: 'APPLICATION_COMPLETION_PENDING',
      content: `${companyName} confirmou a conclusão de "${jobTitle}". Confirme também para finalizar o projeto.`,
      data: {
        applicationId: updated.id,
        jobId: updated.jobId,
        jobTitle,
        companyName,
      },
    });
  } else {
    await createNotificationForCompany({
      companyId: updated.job.companyId,
      type: 'APPLICATION_COMPLETION_PENDING',
      content: `${freelancerName} confirmou a conclusão de "${jobTitle}". Confirme também para finalizar o projeto.`,
      data: {
        applicationId: updated.id,
        jobId: updated.jobId,
        jobTitle,
        freelancerName,
      },
    });
  }

  return updated;
}

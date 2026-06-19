import { prisma } from '../../config/database';
import { sanitizeString } from '../../utils/sanitize.util';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { createNotificationForCompany } from '../notifications/notification.service';
import { assertCanCreateJob, assertCanApply } from '../plans/plan.service';
import { computeApplicantMatchScores } from '../../utils/recommendation.util';
import type {
  ApplyToJobDTO,
  CreateJobDTO,
  ListJobApplicationsQueryDTO,
  ListJobsQueryDTO,
  UpdateJobStatusDTO,
  UpdateJobDTO,
} from './job.schema';

type JobStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'CANCELLED';

const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  OPEN: ['PAUSED', 'CLOSED', 'CANCELLED'],
  PAUSED: ['OPEN', 'CLOSED', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: [],
};

function assertJobStatusTransition(current: JobStatus, next: JobStatus): void {
  const allowed = JOB_STATUS_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new AppError(422, `Transição inválida de ${current} para ${next}.`, 'INVALID_JOB_STATUS_TRANSITION');
  }
}

function toLegacyFlags(status: JobStatus): { isActive: boolean; isFilled: boolean } {
  switch (status) {
    case 'OPEN':
      return { isActive: true, isFilled: false };
    case 'PAUSED':
      return { isActive: false, isFilled: false };
    case 'CLOSED':
      return { isActive: false, isFilled: true };
    case 'CANCELLED':
      return { isActive: false, isFilled: false };
    default:
      return { isActive: false, isFilled: false };
  }
}

export async function createJob(companyId: string, dto: CreateJobDTO) {
  await assertCanCreateJob(companyId);

  const title = sanitizeString(dto.title);
  const description = sanitizeString(dto.description);
  const requirements = sanitizeString(dto.requirements ?? '');

  if (dto.expiresAt <= new Date()) {
    throw new AppError(422, 'A data de expiração deve ser futura.', 'INVALID_EXPIRES_AT');
  }
  if (dto.deadline <= new Date()) {
    throw new AppError(422, 'O prazo (deadline) deve ser futuro.', 'INVALID_DEADLINE');
  }
  if (dto.deadline > dto.expiresAt) {
    throw new AppError(422, 'O prazo (deadline) não pode ser após a expiração.', 'INVALID_DEADLINE_RANGE');
  }

  const allTechnologyIds = [...dto.requiredTechnologyIds, ...dto.desirableTechnologyIds];
  if (allTechnologyIds.length > 0) {
    const count = await prisma.technology.count({
      where: { id: { in: allTechnologyIds } },
    });
    if (count !== allTechnologyIds.length) {
      throw new AppError(400, 'Uma ou mais tecnologias não existem.', 'INVALID_TECHNOLOGY_IDS');
    }
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      requirements,
      deadline: dto.deadline,
      expiresAt: dto.expiresAt,
      paymentType: dto.paymentType,
      currency: dto.currency ?? 'BRL',
      budgetMin: dto.paymentType === 'FIXED_RANGE' ? dto.budgetMin : null,
      budgetMax: dto.paymentType === 'FIXED_RANGE' ? dto.budgetMax : null,
      hourlyRate: dto.paymentType === 'HOURLY' ? dto.hourlyRate : null,
      companyId,
      technologies: {
        create: [
          ...dto.requiredTechnologyIds.map((technologyId) => ({
            technologyId,
            type: 'REQUIRED' as const,
          })),
          ...dto.desirableTechnologyIds.map((technologyId) => ({
            technologyId,
            type: 'DESIRABLE' as const,
          })),
        ],
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      requirements: true,
      deadline: true,
      expiresAt: true,
      isActive: true,
      isFilled: true,
      status: true,
      companyId: true,
      paymentType: true,
      budgetMin: true,
      budgetMax: true,
      hourlyRate: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
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
    },
  });

  return job;
}

const jobPaymentSelect = {
  paymentType: true,
  budgetMin: true,
  budgetMax: true,
  hourlyRate: true,
  currency: true,
} as const;

export async function listJobs(query: ListJobsQueryDTO) {
  const search = query.search ? sanitizeString(query.search) : undefined;
  const active = query.active;
  const status = query.status as JobStatus | undefined;
  const queryTechnologyIds = query.technologyIds
    ? (Array.isArray(query.technologyIds) ? query.technologyIds : query.technologyIds.split(','))
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  const jobs = await prisma.job.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(status || active === undefined ? {} : active ? { status: 'OPEN' } : { status: { not: 'OPEN' } }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(queryTechnologyIds.length > 0
        ? query.matchMode === 'all'
          ? {
              AND: queryTechnologyIds.map((technologyId) => ({
                technologies: { some: { technologyId } },
              })),
            }
          : {
              technologies: { some: { technologyId: { in: queryTechnologyIds } } },
            }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    ...(query.limit ? { take: query.limit, skip: ((query.page ?? 1) - 1) * query.limit } : {}),
    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      expiresAt: true,
      isActive: true,
      isFilled: true,
      status: true,
      companyId: true,
      ...jobPaymentSelect,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
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
    },
  });

  return jobs;
}

const companyJobListSelect = {
  id: true,
  title: true,
  description: true,
  requirements: true,
  deadline: true,
  expiresAt: true,
  isActive: true,
  isFilled: true,
  status: true,
  companyId: true,
  ...jobPaymentSelect,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      applications: true,
    },
  },
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

export async function listCompanyJobs(companyId: string) {
  return prisma.job.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: companyJobListSelect,
  });
}

export async function getJobById(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      requirements: true,
      deadline: true,
      expiresAt: true,
      isActive: true,
      isFilled: true,
      status: true,
      ...jobPaymentSelect,
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
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
    },
  });

  if (!job) {
    throw new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND');
  }

  return job;
}

export async function updateJob(companyId: string, jobId: string, dto: UpdateJobDTO) {
  const existing = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!existing) {
    throw new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND');
  }
  if (existing.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Este projeto não pertence à sua empresa.', 'FORBIDDEN');
  }

  const data: Record<string, unknown> = {};

  if (dto.title !== undefined) data.title = sanitizeString(dto.title);
  if (dto.description !== undefined) data.description = sanitizeString(dto.description);
  if (dto.requirements !== undefined) data.requirements = sanitizeString(dto.requirements);
  if (dto.deadline !== undefined) data.deadline = dto.deadline;
  if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt;
  if (dto.paymentType !== undefined) {
    data.paymentType = dto.paymentType;
    data.currency = dto.currency ?? 'BRL';
    if (dto.paymentType === 'FIXED_RANGE') {
      data.budgetMin = dto.budgetMin ?? null;
      data.budgetMax = dto.budgetMax ?? null;
      data.hourlyRate = null;
    } else {
      data.hourlyRate = dto.hourlyRate ?? null;
      data.budgetMin = null;
      data.budgetMax = null;
    }
  } else {
    if (dto.currency !== undefined) data.currency = dto.currency;
    if (dto.budgetMin !== undefined) data.budgetMin = dto.budgetMin;
    if (dto.budgetMax !== undefined) data.budgetMax = dto.budgetMax;
    if (dto.hourlyRate !== undefined) data.hourlyRate = dto.hourlyRate;
  }

  const wantsTechUpdate = dto.requiredTechnologyIds !== undefined || dto.desirableTechnologyIds !== undefined;

  if (Object.keys(data).length === 0 && !wantsTechUpdate) {
    throw new AppError(422, 'Nenhum campo para atualizar.', 'NO_FIELDS_TO_UPDATE');
  }

  const nextDeadline = (data.deadline as Date | undefined) ?? undefined;
  const nextExpiresAt = (data.expiresAt as Date | undefined) ?? undefined;

  if (nextDeadline && nextDeadline <= new Date()) {
    throw new AppError(422, 'O prazo (deadline) deve ser futuro.', 'INVALID_DEADLINE');
  }
  if (nextExpiresAt && nextExpiresAt <= new Date()) {
    throw new AppError(422, 'A data de expiração deve ser futura.', 'INVALID_EXPIRES_AT');
  }
  if (nextDeadline && nextExpiresAt && nextDeadline > nextExpiresAt) {
    throw new AppError(422, 'O prazo (deadline) não pode ser após a expiração.', 'INVALID_DEADLINE_RANGE');
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (wantsTechUpdate) {
      const requiredIds = dto.requiredTechnologyIds ?? [];
      const desirableIds = dto.desirableTechnologyIds ?? [];
      const overlap = requiredIds.filter((id: string) => desirableIds.includes(id));
      if (overlap.length > 0) {
        throw new AppError(
          422,
          'Uma tecnologia não pode ser obrigatória e desejável ao mesmo tempo.',
          'INVALID_JOB_TECHNOLOGIES',
        );
      }

      const allTechnologyIds = [...requiredIds, ...desirableIds];
      if (allTechnologyIds.length > 0) {
        const count = await tx.technology.count({
          where: { id: { in: allTechnologyIds } },
        });
        if (count !== allTechnologyIds.length) {
          throw new AppError(400, 'Uma ou mais tecnologias não existem.', 'INVALID_TECHNOLOGY_IDS');
        }
      }

      await tx.jobTechnology.deleteMany({ where: { jobId } });
      if (allTechnologyIds.length > 0) {
        await tx.jobTechnology.createMany({
          data: [
            ...requiredIds.map((technologyId: string) => ({ jobId, technologyId, type: 'REQUIRED' as const })),
            ...desirableIds.map((technologyId: string) => ({ jobId, technologyId, type: 'DESIRABLE' as const })),
          ],
        });
      }
    }

    return tx.job.update({
      where: { id: jobId },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        requirements: true,
        deadline: true,
        expiresAt: true,
        isActive: true,
        isFilled: true,
        status: true,
        companyId: true,
        ...jobPaymentSelect,
        updatedAt: true,
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
      },
    });
  });

  return updated;
}

export async function deleteJob(companyId: string, jobId: string) {
  const existing = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!existing) {
    throw new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND');
  }
  if (existing.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Este projeto não pertence à sua empresa.', 'FORBIDDEN');
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { status: 'CANCELLED', isActive: false, isFilled: false },
    select: {
      id: true,
      isActive: true,
      isFilled: true,
      status: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function applyToJob(userId: string, jobId: string, dto: ApplyToJobDTO) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      isActive: true,
      isFilled: true,
      status: true,
      expiresAt: true,
      companyId: true,
    },
  });

  if (!job) {
    throw new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND');
  }
  if (job.status !== 'OPEN' || !job.isActive || job.isFilled || job.expiresAt <= new Date()) {
    throw new AppError(409, 'Este projeto não aceita novas candidaturas.', 'JOB_NOT_AVAILABLE');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, isBlocked: true, resumeUrl: true },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }
  if (!user.isActive || user.isBlocked) {
    throw new AppError(403, 'Seu usuário está inativo ou bloqueado.', 'USER_NOT_ALLOWED');
  }

  await assertCanApply(userId);

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(409, 'Você já se candidatou para este projeto.', 'APPLICATION_ALREADY_EXISTS');
  }

  const resumeUrl = dto.resumeUrl ?? user.resumeUrl;
  if (!resumeUrl) {
    throw new AppError(
      422,
      'Currículo obrigatório para candidatura. Atualize seu perfil ou envie resumeUrl.',
      'MISSING_RESUME_URL',
    );
  }

  const application = await prisma.application.create({
    data: {
      jobId,
      userId,
      resumeUrl,
      coverLetter: dto.coverLetter ? sanitizeString(dto.coverLetter) : null,
    },
    select: {
      id: true,
      jobId: true,
      userId: true,
      status: true,
      resumeUrl: true,
      coverLetter: true,
      createdAt: true,
    },
  });

  await createNotificationForCompany({
    companyId: job.companyId,
    type: 'NEW_APPLICATION',
    content: 'Você recebeu uma nova candidatura em um projeto.',
    data: {
      applicationId: application.id,
      jobId: job.id,
    },
  });

  return application;
}

export async function getJobApplications(companyId: string, jobId: string, query: ListJobApplicationsQueryDTO) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!job) {
    throw new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND');
  }
  if (job.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Este projeto não pertence à sua empresa.', 'FORBIDDEN');
  }

  const applications = await prisma.application.findMany({
    where: {
      jobId,
      ...(query.status ? { status: query.status } : {}),
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
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          cpf: true,
        },
      },
    },
  });

  const userIds = applications.map((item) => item.userId);
  const matchScores = await computeApplicantMatchScores(jobId, userIds);

  return applications.map((item) => {
    const match = matchScores[item.userId];
    return {
      ...item,
      matchScore: match?.matchScore ?? 0,
      matchPercent: match?.matchPercent ?? 0,
      matchedTechnologies: match?.matchedTechnologies ?? [],
      user: {
        ...item.user,
        cpf: item.user.cpf ? item.user.cpf.replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2') : item.user.cpf,
      },
    };
  });
}

export async function getJobCandidates(companyId: string, jobId: string, query: ListJobApplicationsQueryDTO) {
  const applications = await getJobApplications(companyId, jobId, query);

  return applications.map((item) => ({
    applicationId: item.id,
    status: item.status,
    appliedAt: item.createdAt,
    candidate: item.user,
  }));
}

export async function updateJobStatus(companyId: string, jobId: string, dto: UpdateJobStatusDTO) {
  const existing = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      companyId: true,
      status: true,
      isFilled: true,
      expiresAt: true,
    },
  });

  if (!existing) {
    throw new AppError(404, 'Projeto não encontrado.', 'JOB_NOT_FOUND');
  }
  if (existing.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Este projeto não pertence à sua empresa.', 'FORBIDDEN');
  }

  const nextStatus = dto.status as JobStatus;
  const currentStatus = existing.status as JobStatus;
  if (nextStatus === currentStatus) {
    throw new AppError(409, 'O projeto já está neste status.', 'JOB_STATUS_ALREADY_SET');
  }

  assertJobStatusTransition(currentStatus, nextStatus);

  if (nextStatus === 'OPEN' && (existing.isFilled || existing.expiresAt <= new Date())) {
    throw new AppError(
      409,
      'Não é possível reabrir projeto preenchido ou expirado.',
      'JOB_CANNOT_REOPEN',
    );
  }

  const legacyFlags = toLegacyFlags(nextStatus);
  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: nextStatus,
      isActive: legacyFlags.isActive,
      isFilled: legacyFlags.isFilled,
    },
    select: {
      id: true,
      title: true,
      status: true,
      isActive: true,
      isFilled: true,
      deadline: true,
      expiresAt: true,
      updatedAt: true,
    },
  });

  return updated;
}


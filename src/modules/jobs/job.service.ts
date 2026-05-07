import { prisma } from '../../config/database';
import { sanitizeString } from '../../utils/sanitize.util';
import { AppError } from '../../middlewares/errorHandler.middleware';
import type {
  ApplyToJobDTO,
  CreateJobDTO,
  ListJobApplicationsQueryDTO,
  ListJobsQueryDTO,
  UpdateJobDTO,
} from './job.schema';

export async function createJob(companyId: string, dto: CreateJobDTO) {
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
      companyId: true,
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

export async function listJobs(query: ListJobsQueryDTO) {
  const search = query.search ? sanitizeString(query.search) : undefined;
  const active = query.active;
  const queryTechnologyIds = query.technologyIds
    ? (Array.isArray(query.technologyIds) ? query.technologyIds : query.technologyIds.split(','))
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  const jobs = await prisma.job.findMany({
    where: {
      ...(active === undefined ? {} : { isActive: active }),
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
    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      expiresAt: true,
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
    },
  });

  return jobs;
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
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }

  return job;
}

export async function updateJob(companyId: string, jobId: string, dto: UpdateJobDTO) {
  const existing = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!existing) {
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }
  if (existing.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Esta vaga não pertence à sua empresa.', 'FORBIDDEN');
  }

  const data: Record<string, unknown> = {};

  if (dto.title !== undefined) data.title = sanitizeString(dto.title);
  if (dto.description !== undefined) data.description = sanitizeString(dto.description);
  if (dto.requirements !== undefined) data.requirements = sanitizeString(dto.requirements);
  if (dto.deadline !== undefined) data.deadline = dto.deadline;
  if (dto.expiresAt !== undefined) data.expiresAt = dto.expiresAt;

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
        companyId: true,
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
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }
  if (existing.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Esta vaga não pertence à sua empresa.', 'FORBIDDEN');
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { isActive: false },
    select: {
      id: true,
      isActive: true,
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
      expiresAt: true,
      companyId: true,
    },
  });

  if (!job) {
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }
  if (!job.isActive || job.isFilled || job.expiresAt <= new Date()) {
    throw new AppError(409, 'Esta vaga não aceita novas candidaturas.', 'JOB_NOT_AVAILABLE');
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

  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId, jobId } },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(409, 'Você já se candidatou para esta vaga.', 'APPLICATION_ALREADY_EXISTS');
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

  return application;
}

export async function getJobApplications(companyId: string, jobId: string, query: ListJobApplicationsQueryDTO) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true },
  });

  if (!job) {
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }
  if (job.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Esta vaga não pertence à sua empresa.', 'FORBIDDEN');
  }

  const applications = await prisma.application.findMany({
    where: {
      jobId,
      ...(query.status ? { status: query.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
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
          cpf: true,
        },
      },
    },
  });

  return applications.map((item) => ({
    ...item,
    user: {
      ...item.user,
      cpf: item.user.cpf ? item.user.cpf.replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2') : item.user.cpf,
    },
  }));
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


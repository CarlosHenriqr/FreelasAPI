import { prisma } from '../../config/database';
import { sanitizeString } from '../../utils/sanitize.util';
import { AppError } from '../../middlewares/errorHandler.middleware';
import type { CreateJobDTO, ListJobsQueryDTO } from './job.schema';

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

  const job = await prisma.job.create({
    data: {
      title,
      description,
      requirements,
      deadline: dto.deadline,
      expiresAt: dto.expiresAt,
      companyId,
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
    },
  });

  return job;
}

export async function listJobs(query: ListJobsQueryDTO) {
  const search = query.search ? sanitizeString(query.search) : undefined;
  const active = query.active;

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
    },
  });

  return jobs;
}


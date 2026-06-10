import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { createNotificationForUser } from '../notifications/notification.service';
import { recommendCandidates, recommendJobsForUser } from '../../utils/recommendation.util';
import type { MatchingQueryDTO } from './matching.schema';

export async function getRecommendedCandidates(
  companyId: string,
  jobId: string,
  query: MatchingQueryDTO,
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, companyId: true, status: true },
  });

  if (!job) {
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }
  if (job.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Esta vaga não pertence à sua empresa.', 'FORBIDDEN');
  }
  if (job.status === 'CANCELLED') {
    throw new AppError(409, 'Não há matching para vaga cancelada.', 'JOB_NOT_AVAILABLE_FOR_MATCHING');
  }

  const candidates = await recommendCandidates(jobId, query.limit);
  return candidates;
}

export async function getRecommendedJobs(userId: string, query: MatchingQueryDTO) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, isBlocked: true },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }
  if (!user.isActive || user.isBlocked) {
    throw new AppError(403, 'Seu usuário está inativo ou bloqueado.', 'USER_NOT_ALLOWED');
  }

  const jobs = await recommendJobsForUser(userId, query.limit);
  return jobs;
}

export async function expressHiringInterest(
  companyId: string,
  jobId: string,
  candidateUserId: string,
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      status: true,
      companyId: true,
      company: { select: { id: true, name: true } },
    },
  });

  if (!job) {
    throw new AppError(404, 'Vaga não encontrada.', 'JOB_NOT_FOUND');
  }
  if (job.companyId !== companyId) {
    throw new AppError(403, 'Acesso negado. Esta vaga não pertence à sua empresa.', 'FORBIDDEN');
  }
  if (job.status !== 'OPEN') {
    throw new AppError(
      409,
      'Só é possível manifestar interesse em projetos com status aberto.',
      'JOB_NOT_OPEN',
    );
  }

  const candidate = await prisma.user.findUnique({
    where: { id: candidateUserId },
    select: { id: true, name: true, isActive: true, isBlocked: true },
  });

  if (!candidate || !candidate.isActive || candidate.isBlocked) {
    throw new AppError(404, 'Candidato não encontrado ou indisponível.', 'CANDIDATE_NOT_FOUND');
  }

  const existingApplication = await prisma.application.findUnique({
    where: { userId_jobId: { userId: candidateUserId, jobId } },
    select: { id: true },
  });

  if (existingApplication) {
    throw new AppError(
      409,
      'Este candidato já se candidatou a este projeto.',
      'CANDIDATE_ALREADY_APPLIED',
    );
  }

  const existingInterest = await prisma.notification.findFirst({
    where: {
      userId: candidateUserId,
      type: 'COMPANY_HIRING_INTEREST',
      data: { path: ['jobId'], equals: jobId },
    },
    select: { id: true },
  });

  if (existingInterest) {
    throw new AppError(
      409,
      'Interesse já manifestado para este candidato neste projeto.',
      'INTEREST_ALREADY_SENT',
    );
  }

  const companyName = job.company.name;

  await createNotificationForUser({
    userId: candidateUserId,
    type: 'COMPANY_HIRING_INTEREST',
    content: `${companyName} demonstrou interesse em contratá-lo para o projeto "${job.title}". Veja os detalhes e candidate-se.`,
    data: {
      jobId: job.id,
      jobTitle: job.title,
      companyId: job.company.id,
      companyName,
      matchContext: 'company_recommendation',
    },
  });

  return {
    jobId: job.id,
    jobTitle: job.title,
    candidateUserId: candidate.id,
    candidateName: candidate.name,
  };
}

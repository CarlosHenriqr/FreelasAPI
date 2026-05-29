import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
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

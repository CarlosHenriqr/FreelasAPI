import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import {
  getDefaultPlanCode,
  getUpgradePlanCode,
  type PlanAudience,
  type PlanCode,
  type PlanLimits,
} from './plan.catalog';

type PlanRecord = {
  id: string;
  audience: PlanAudience;
  code: string;
  name: string;
  description: string;
  priceLabel: string;
  limits: PlanLimits;
};

export type PlanUsageMetric = {
  key: string;
  label: string;
  used: number;
  limit: number | null;
};

export type PlanMeResponse = {
  audience: PlanAudience;
  plan: {
    code: string;
    name: string;
    description: string;
    priceLabel: string;
    limits: PlanLimits;
  };
  usage: PlanUsageMetric[];
  upgradePlanCode: PlanCode | null;
};

function parseLimits(raw: Prisma.JsonValue): PlanLimits {
  const value = raw as PlanLimits;
  return {
    maxActiveJobs: value.maxActiveJobs ?? null,
    maxApplicationsPerMonth: value.maxApplicationsPerMonth ?? null,
    matchingCandidateLimit: value.matchingCandidateLimit ?? 5,
    matchingJobLimit: value.matchingJobLimit ?? 10,
    profileBoostWeight: value.profileBoostWeight ?? 0,
  };
}

function toPlanRecord(plan: {
  id: string;
  audience: PlanAudience;
  code: string;
  name: string;
  description: string;
  priceLabel: string;
  limits: Prisma.JsonValue;
}): PlanRecord {
  return {
    id: plan.id,
    audience: plan.audience,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    priceLabel: plan.priceLabel,
    limits: parseLimits(plan.limits),
  };
}

function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function findPlanByAudienceCode(audience: PlanAudience, code: PlanCode) {
  const plan = await prisma.plan.findUnique({
    where: { audience_code: { audience, code } },
  });
  if (!plan) {
    throw new AppError(500, 'Plano não configurado no catálogo.', 'PLAN_NOT_CONFIGURED');
  }
  return toPlanRecord(plan);
}

export async function ensureDefaultUserSubscription(userId: string) {
  const existing = await prisma.userSubscription.findUnique({ where: { userId } });
  if (existing) return;

  const plan = await findPlanByAudienceCode('USER', getDefaultPlanCode('USER'));
  await prisma.userSubscription.create({
    data: { userId, planId: plan.id },
  });
}

export async function ensureDefaultCompanySubscription(companyId: string) {
  const existing = await prisma.companySubscription.findUnique({ where: { companyId } });
  if (existing) return;

  const plan = await findPlanByAudienceCode('COMPANY', getDefaultPlanCode('COMPANY'));
  await prisma.companySubscription.create({
    data: { companyId, planId: plan.id },
  });
}

async function getUserPlanRecord(userId: string): Promise<PlanRecord> {
  await ensureDefaultUserSubscription(userId);
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== 'ACTIVE') {
    return findPlanByAudienceCode('USER', getDefaultPlanCode('USER'));
  }
  return toPlanRecord(subscription.plan);
}

async function getCompanyPlanRecord(companyId: string): Promise<PlanRecord> {
  await ensureDefaultCompanySubscription(companyId);
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== 'ACTIVE') {
    return findPlanByAudienceCode('COMPANY', getDefaultPlanCode('COMPANY'));
  }
  return toPlanRecord(subscription.plan);
}

export async function countActiveCompanyJobs(companyId: string): Promise<number> {
  return prisma.job.count({
    where: {
      companyId,
      status: { in: ['OPEN', 'PAUSED'] },
    },
  });
}

export async function countUserApplicationsThisMonth(userId: string): Promise<number> {
  return prisma.application.count({
    where: {
      userId,
      createdAt: { gte: monthStart() },
    },
  });
}

function throwPlanLimit(
  audience: PlanAudience,
  planCode: string,
  metric: PlanUsageMetric,
): never {
  throw new AppError(
    403,
    `Limite do plano atingido (${metric.label}). Faça upgrade para continuar.`,
    'PLAN_LIMIT_REACHED',
    {
      upgradeAudience: audience,
      planCode,
      limit: metric.limit,
      current: metric.used,
      metric: metric.key,
    },
  );
}

export async function assertCanCreateJob(companyId: string): Promise<void> {
  const plan = await getCompanyPlanRecord(companyId);
  const limit = plan.limits.maxActiveJobs;
  if (limit == null) return;

  const used = await countActiveCompanyJobs(companyId);
  if (used >= limit) {
    throwPlanLimit('COMPANY', plan.code, {
      key: 'maxActiveJobs',
      label: 'Projetos ativos',
      used,
      limit,
    });
  }
}

export async function assertCanApply(userId: string): Promise<void> {
  const plan = await getUserPlanRecord(userId);
  const limit = plan.limits.maxApplicationsPerMonth;
  if (limit == null) return;

  const used = await countUserApplicationsThisMonth(userId);
  if (used >= limit) {
    throwPlanLimit('USER', plan.code, {
      key: 'maxApplicationsPerMonth',
      label: 'Candidaturas no mês',
      used,
      limit,
    });
  }
}

export async function getMatchingCandidateLimit(companyId: string, requested?: number): Promise<number> {
  const plan = await getCompanyPlanRecord(companyId);
  const cap = plan.limits.matchingCandidateLimit;
  if (requested == null) return cap;
  return Math.min(requested, cap);
}

export async function getMatchingJobLimit(userId: string, requested?: number): Promise<number> {
  const plan = await getUserPlanRecord(userId);
  const cap = plan.limits.matchingJobLimit;
  if (requested == null) return cap;
  return Math.min(requested, cap);
}

export async function getProfileBoostWeights(userIds: string[]): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: { in: userIds }, status: 'ACTIVE' },
    include: { plan: true },
  });

  const map = new Map<string, number>();
  for (const userId of userIds) {
    map.set(userId, 0);
  }
  for (const sub of subscriptions) {
    map.set(sub.userId, parseLimits(sub.plan.limits).profileBoostWeight);
  }
  return map;
}

export async function getPlanMeForUser(userId: string): Promise<PlanMeResponse> {
  const plan = await getUserPlanRecord(userId);
  const applicationsUsed = await countUserApplicationsThisMonth(userId);

  return {
    audience: 'USER',
    plan: {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceLabel: plan.priceLabel,
      limits: plan.limits,
    },
    usage: [
      {
        key: 'maxApplicationsPerMonth',
        label: 'Candidaturas no mês',
        used: applicationsUsed,
        limit: plan.limits.maxApplicationsPerMonth ?? null,
      },
      {
        key: 'matchingJobLimit',
        label: 'Projetos recomendados por consulta',
        used: 0,
        limit: plan.limits.matchingJobLimit,
      },
    ],
    upgradePlanCode: plan.code === 'PRO' ? null : getUpgradePlanCode('USER'),
  };
}

export async function getPlanMeForCompany(companyId: string): Promise<PlanMeResponse> {
  const plan = await getCompanyPlanRecord(companyId);
  const activeJobs = await countActiveCompanyJobs(companyId);

  return {
    audience: 'COMPANY',
    plan: {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceLabel: plan.priceLabel,
      limits: plan.limits,
    },
    usage: [
      {
        key: 'maxActiveJobs',
        label: 'Projetos ativos',
        used: activeJobs,
        limit: plan.limits.maxActiveJobs ?? null,
      },
      {
        key: 'matchingCandidateLimit',
        label: 'Candidatos recomendados por projeto',
        used: 0,
        limit: plan.limits.matchingCandidateLimit,
      },
    ],
    upgradePlanCode: plan.code === 'PRO' ? null : getUpgradePlanCode('COMPANY'),
  };
}

export async function mockUpgrade(
  audience: PlanAudience,
  accountId: string,
  targetCode?: PlanCode,
): Promise<PlanMeResponse> {
  const code = targetCode ?? getUpgradePlanCode(audience);
  const plan = await findPlanByAudienceCode(audience, code);

  if (audience === 'USER') {
    await ensureDefaultUserSubscription(accountId);
    await prisma.userSubscription.update({
      where: { userId: accountId },
      data: { planId: plan.id, status: 'ACTIVE', endsAt: null },
    });
    return getPlanMeForUser(accountId);
  }

  await ensureDefaultCompanySubscription(accountId);
  await prisma.companySubscription.update({
    where: { companyId: accountId },
    data: { planId: plan.id, status: 'ACTIVE', endsAt: null },
  });
  return getPlanMeForCompany(accountId);
}

export async function listPublicPlans(audience: PlanAudience) {
  const plans = await prisma.plan.findMany({
    where: { audience, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return plans.map((plan) => ({
    code: plan.code,
    name: plan.name,
    description: plan.description,
    priceLabel: plan.priceLabel,
    limits: parseLimits(plan.limits),
  }));
}

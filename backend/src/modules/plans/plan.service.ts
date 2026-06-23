import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import {
  getDefaultPlanCode,
  getUpgradePlanCode,
  type BillingInterval,
  type PlanAudience,
  type PlanCode,
  type PlanLimits,
  type PlanPricing,
} from './plan.catalog';

type PlanRecord = {
  id: string;
  audience: PlanAudience;
  code: string;
  name: string;
  description: string;
  priceLabel: string;
  annualPriceLabel: string | null;
  annualMonthlyEquivalentLabel: string | null;
  annualSavingsLabel: string | null;
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
    pricing: PlanPricing;
    limits: PlanLimits;
  };
  billingInterval: BillingInterval;
  cancelAtPeriodEnd: boolean;
  renewsAt: string | null;
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
  annualPriceLabel: string | null;
  annualMonthlyEquivalentLabel: string | null;
  annualSavingsLabel: string | null;
  limits: Prisma.JsonValue;
}): PlanRecord {
  return {
    id: plan.id,
    audience: plan.audience,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    priceLabel: plan.priceLabel,
    annualPriceLabel: plan.annualPriceLabel,
    annualMonthlyEquivalentLabel: plan.annualMonthlyEquivalentLabel,
    annualSavingsLabel: plan.annualSavingsLabel,
    limits: parseLimits(plan.limits),
  };
}

function buildPlanPricing(plan: PlanRecord): PlanPricing {
  const pricing: PlanPricing = {
    monthly: { priceLabel: plan.priceLabel },
  };

  if (
    plan.annualPriceLabel &&
    plan.annualMonthlyEquivalentLabel &&
    plan.annualSavingsLabel
  ) {
    pricing.annual = {
      priceLabel: plan.annualPriceLabel,
      monthlyEquivalentLabel: plan.annualMonthlyEquivalentLabel,
      savingsLabel: plan.annualSavingsLabel,
    };
  }

  return pricing;
}

function effectivePriceLabel(plan: PlanRecord, billingInterval: BillingInterval): string {
  if (billingInterval === 'YEARLY' && plan.annualPriceLabel) {
    return plan.annualPriceLabel;
  }
  return plan.priceLabel;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function subscriptionEndsAt(billingInterval: BillingInterval): Date {
  const now = new Date();
  return billingInterval === 'YEARLY' ? addYears(now, 1) : addMonths(now, 1);
}

function isPaidPlanCode(audience: PlanAudience, code: string): boolean {
  return code !== getDefaultPlanCode(audience);
}

function subscriptionPeriodEnd(
  billingInterval: BillingInterval,
  existingEndsAt: Date | null,
): Date {
  if (existingEndsAt && existingEndsAt > new Date()) {
    return existingEndsAt;
  }
  return subscriptionEndsAt(billingInterval);
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

async function expireUserSubscriptionIfNeeded(userId: string): Promise<void> {
  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== 'ACTIVE') return;
  if (!isPaidPlanCode('USER', subscription.plan.code)) return;
  if (!subscription.endsAt || subscription.endsAt > new Date()) return;

  const freePlan = await findPlanByAudienceCode('USER', getDefaultPlanCode('USER'));
  await prisma.userSubscription.update({
    where: { userId },
    data: {
      planId: freePlan.id,
      billingInterval: 'MONTHLY',
      cancelAtPeriodEnd: false,
      endsAt: null,
      status: 'ACTIVE',
    },
  });
}

async function expireCompanySubscriptionIfNeeded(companyId: string): Promise<void> {
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== 'ACTIVE') return;
  if (!isPaidPlanCode('COMPANY', subscription.plan.code)) return;
  if (!subscription.endsAt || subscription.endsAt > new Date()) return;

  const freePlan = await findPlanByAudienceCode('COMPANY', getDefaultPlanCode('COMPANY'));
  await prisma.companySubscription.update({
    where: { companyId },
    data: {
      planId: freePlan.id,
      billingInterval: 'MONTHLY',
      cancelAtPeriodEnd: false,
      endsAt: null,
      status: 'ACTIVE',
    },
  });
}

async function getUserPlanContext(userId: string): Promise<{
  plan: PlanRecord;
  billingInterval: BillingInterval;
  renewsAt: Date | null;
  cancelAtPeriodEnd: boolean;
}> {
  await ensureDefaultUserSubscription(userId);
  await expireUserSubscriptionIfNeeded(userId);

  const subscription = await prisma.userSubscription.findUnique({
    where: { userId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== 'ACTIVE') {
    const plan = await findPlanByAudienceCode('USER', getDefaultPlanCode('USER'));
    return { plan, billingInterval: 'MONTHLY', renewsAt: null, cancelAtPeriodEnd: false };
  }
  return {
    plan: toPlanRecord(subscription.plan),
    billingInterval: subscription.billingInterval,
    renewsAt: subscription.endsAt,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

async function getCompanyPlanContext(companyId: string): Promise<{
  plan: PlanRecord;
  billingInterval: BillingInterval;
  renewsAt: Date | null;
  cancelAtPeriodEnd: boolean;
}> {
  await ensureDefaultCompanySubscription(companyId);
  await expireCompanySubscriptionIfNeeded(companyId);

  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId },
    include: { plan: true },
  });
  if (!subscription || subscription.status !== 'ACTIVE') {
    const plan = await findPlanByAudienceCode('COMPANY', getDefaultPlanCode('COMPANY'));
    return { plan, billingInterval: 'MONTHLY', renewsAt: null, cancelAtPeriodEnd: false };
  }
  return {
    plan: toPlanRecord(subscription.plan),
    billingInterval: subscription.billingInterval,
    renewsAt: subscription.endsAt,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  };
}

async function getUserPlanRecord(userId: string): Promise<PlanRecord> {
  const ctx = await getUserPlanContext(userId);
  return ctx.plan;
}

async function getCompanyPlanRecord(companyId: string): Promise<PlanRecord> {
  const ctx = await getCompanyPlanContext(companyId);
  return ctx.plan;
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

  const now = new Date();
  const subscriptions = await prisma.userSubscription.findMany({
    where: {
      userId: { in: userIds },
      status: 'ACTIVE',
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
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
  const { plan, billingInterval, renewsAt, cancelAtPeriodEnd } = await getUserPlanContext(userId);
  const applicationsUsed = await countUserApplicationsThisMonth(userId);
  const pricing = buildPlanPricing(plan);

  return {
    audience: 'USER',
    plan: {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceLabel: effectivePriceLabel(plan, billingInterval),
      pricing,
      limits: plan.limits,
    },
    billingInterval,
    cancelAtPeriodEnd,
    renewsAt: renewsAt?.toISOString() ?? null,
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
  const { plan, billingInterval, renewsAt, cancelAtPeriodEnd } = await getCompanyPlanContext(companyId);
  const activeJobs = await countActiveCompanyJobs(companyId);
  const pricing = buildPlanPricing(plan);

  return {
    audience: 'COMPANY',
    plan: {
      code: plan.code,
      name: plan.name,
      description: plan.description,
      priceLabel: effectivePriceLabel(plan, billingInterval),
      pricing,
      limits: plan.limits,
    },
    billingInterval,
    cancelAtPeriodEnd,
    renewsAt: renewsAt?.toISOString() ?? null,
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
  billingInterval: BillingInterval = 'MONTHLY',
): Promise<PlanMeResponse> {
  const code = targetCode ?? getUpgradePlanCode(audience);
  const plan = await findPlanByAudienceCode(audience, code);

  if (billingInterval === 'YEARLY' && !plan.annualPriceLabel) {
    throw new AppError(
      400,
      'Este plano não possui opção de cobrança anual.',
      'PLAN_ANNUAL_NOT_AVAILABLE',
    );
  }

  const endsAt = subscriptionEndsAt(billingInterval);

  if (audience === 'USER') {
    await ensureDefaultUserSubscription(accountId);
    await prisma.userSubscription.update({
      where: { userId: accountId },
      data: {
        planId: plan.id,
        status: 'ACTIVE',
        billingInterval,
        cancelAtPeriodEnd: false,
        startsAt: new Date(),
        endsAt,
      },
    });
    return getPlanMeForUser(accountId);
  }

  await ensureDefaultCompanySubscription(accountId);
  await prisma.companySubscription.update({
    where: { companyId: accountId },
    data: {
      planId: plan.id,
      status: 'ACTIVE',
      billingInterval,
      cancelAtPeriodEnd: false,
      startsAt: new Date(),
      endsAt,
    },
  });
  return getPlanMeForCompany(accountId);
}

async function scheduleSubscriptionCancellation(
  audience: PlanAudience,
  accountId: string,
): Promise<PlanMeResponse> {
  if (audience === 'USER') {
    await ensureDefaultUserSubscription(accountId);
    const subscription = await prisma.userSubscription.findUnique({
      where: { userId: accountId },
      include: { plan: true },
    });
    if (!subscription) {
      throw new AppError(404, 'Assinatura não encontrada.', 'SUBSCRIPTION_NOT_FOUND');
    }
    if (!isPaidPlanCode('USER', subscription.plan.code)) {
      throw new AppError(400, 'Você já está no plano grátis.', 'SUBSCRIPTION_NOT_PAID');
    }
    if (subscription.cancelAtPeriodEnd) {
      return getPlanMeForUser(accountId);
    }

    const endsAt = subscriptionPeriodEnd(subscription.billingInterval, subscription.endsAt);
    await prisma.userSubscription.update({
      where: { userId: accountId },
      data: { cancelAtPeriodEnd: true, endsAt },
    });
    return getPlanMeForUser(accountId);
  }

  await ensureDefaultCompanySubscription(accountId);
  const subscription = await prisma.companySubscription.findUnique({
    where: { companyId: accountId },
    include: { plan: true },
  });
  if (!subscription) {
    throw new AppError(404, 'Assinatura não encontrada.', 'SUBSCRIPTION_NOT_FOUND');
  }
  if (!isPaidPlanCode('COMPANY', subscription.plan.code)) {
    throw new AppError(400, 'Você já está no plano grátis.', 'SUBSCRIPTION_NOT_PAID');
  }
  if (subscription.cancelAtPeriodEnd) {
    return getPlanMeForCompany(accountId);
  }

  const endsAt = subscriptionPeriodEnd(subscription.billingInterval, subscription.endsAt);
  await prisma.companySubscription.update({
    where: { companyId: accountId },
    data: { cancelAtPeriodEnd: true, endsAt },
  });
  return getPlanMeForCompany(accountId);
}

export async function cancelSubscription(
  audience: PlanAudience,
  accountId: string,
): Promise<PlanMeResponse> {
  return scheduleSubscriptionCancellation(audience, accountId);
}

export async function listPublicPlans(audience: PlanAudience) {
  const plans = await prisma.plan.findMany({
    where: { audience, isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  return plans.map((plan) => {
    const record = toPlanRecord(plan);
    return {
      code: record.code,
      name: record.name,
      description: record.description,
      priceLabel: record.priceLabel,
      pricing: buildPlanPricing(record),
      limits: record.limits,
    };
  });
}

export type PlanAudience = 'USER' | 'COMPANY';

export type PlanCode = 'FREE' | 'PRO' | 'STARTER';

export type BillingInterval = 'MONTHLY' | 'YEARLY';

export type PlanPricing = {
  monthly: { priceLabel: string };
  annual?: {
    priceLabel: string;
    monthlyEquivalentLabel: string;
    savingsLabel: string;
  };
};

export type PlanLimits = {
  maxActiveJobs?: number | null;
  maxApplicationsPerMonth?: number | null;
  matchingCandidateLimit: number;
  matchingJobLimit: number;
  profileBoostWeight: number;
};

export type PlanDefinition = {
  audience: PlanAudience;
  code: PlanCode;
  name: string;
  description: string;
  priceLabel: string;
  limits: PlanLimits;
  sortOrder: number;
};

export const PLAN_CATALOG: PlanDefinition[] = [
  {
    audience: 'USER',
    code: 'FREE',
    name: 'Free',
    description: 'Perfil completo, candidaturas e recomendações essenciais.',
    priceLabel: 'Grátis',
    limits: {
      maxApplicationsPerMonth: 15,
      matchingJobLimit: 10,
      matchingCandidateLimit: 0,
      profileBoostWeight: 0,
    },
    sortOrder: 1,
  },
  {
    audience: 'USER',
    code: 'PRO',
    name: 'Pro',
    description: 'Mais candidaturas por mês e leve destaque no matching.',
    priceLabel: 'R$ 39/mês',
    limits: {
      maxApplicationsPerMonth: 50,
      matchingJobLimit: 30,
      matchingCandidateLimit: 0,
      profileBoostWeight: 5,
    },
    sortOrder: 2,
  },
  {
    audience: 'COMPANY',
    code: 'STARTER',
    name: 'Starter',
    description: 'Publique projetos e gerencie candidatos no fluxo principal.',
    priceLabel: 'Grátis',
    limits: {
      maxActiveJobs: 2,
      maxApplicationsPerMonth: null,
      matchingCandidateLimit: 5,
      matchingJobLimit: 0,
      profileBoostWeight: 0,
    },
    sortOrder: 1,
  },
  {
    audience: 'COMPANY',
    code: 'PRO',
    name: 'Growth',
    description: 'Mais projetos ativos e matching ampliado de candidatos.',
    priceLabel: 'R$ 79/mês',
    limits: {
      maxActiveJobs: 10,
      maxApplicationsPerMonth: null,
      matchingCandidateLimit: 20,
      matchingJobLimit: 0,
      profileBoostWeight: 0,
    },
    sortOrder: 2,
  },
];

export function getDefaultPlanCode(audience: PlanAudience): PlanCode {
  return audience === 'USER' ? 'FREE' : 'STARTER';
}

export function getUpgradePlanCode(audience: PlanAudience): PlanCode {
  return 'PRO';
}

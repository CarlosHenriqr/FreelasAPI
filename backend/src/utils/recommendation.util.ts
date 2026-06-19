import { prisma } from '../config/database';
import { getProfileBoostWeights } from '../modules/plans/plan.service';

export type MatchResult = {
  matchScore: number;
  matchPercent: number;
  matchedTechnologies: string[];
};

type UserTechEntry = {
  technologyId: string;
  technology: { name: string };
};

export function calculateTechMatch(
  requiredTechIds: string[],
  desirableTechIds: string[],
  userTechStack: UserTechEntry[],
): MatchResult {
  if (requiredTechIds.length === 0 && desirableTechIds.length === 0) {
    return { matchScore: 0, matchPercent: 0, matchedTechnologies: [] };
  }

  const userTechIds = new Set(userTechStack.map((ut) => ut.technologyId));
  const matchedRequired = requiredTechIds.filter((id) => userTechIds.has(id));
  const matchedDesirable = desirableTechIds.filter((id) => userTechIds.has(id));
  const requiredScore = requiredTechIds.length
    ? (matchedRequired.length / requiredTechIds.length) * 100
    : 100;
  const desirableScore = desirableTechIds.length
    ? (matchedDesirable.length / desirableTechIds.length) * 100
    : 0;
  const matchScore = Math.round(
    Math.min(100, requiredScore * 0.8 + desirableScore * 0.2) * 100,
  ) / 100;
  const matchedIds = [...matchedRequired, ...matchedDesirable];
  const matchedTechnologies = userTechStack
    .filter((ut) => matchedIds.includes(ut.technologyId))
    .map((ut) => ut.technology.name);

  return { matchScore, matchPercent: matchScore, matchedTechnologies };
}

export async function computeApplicantMatchScores(
  jobId: string,
  userIds: string[],
): Promise<Record<string, MatchResult>> {
  if (userIds.length === 0) return {};

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      technologies: {
        include: { technology: true },
      },
    },
  });

  if (!job) return {};

  const requiredTechIds = job.technologies
    .filter((jt) => jt.type === 'REQUIRED')
    .map((jt) => jt.technologyId);
  const desirableTechIds = job.technologies
    .filter((jt) => jt.type === 'DESIRABLE')
    .map((jt) => jt.technologyId);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: {
      techStack: {
        include: { technology: true },
      },
    },
  });

  const scores: Record<string, MatchResult> = {};
  for (const user of users) {
    scores[user.id] = calculateTechMatch(requiredTechIds, desirableTechIds, user.techStack);
  }

  return scores;
}

export type RecommendedCandidate = {
  id: string;
  name: string;
  email: string;
  resumeUrl: string | null;
  matchScore: number;
  matchedTechnologies: string[];
};

export type RecommendedJob = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  expiresAt: Date;
  status: 'OPEN' | 'PAUSED' | 'CLOSED' | 'CANCELLED';
  isActive: boolean;
  isFilled: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  matchScore: number;
  matchPercent: number;
  matchedTechnologies: string[];
  technologies: {
    type: 'REQUIRED' | 'DESIRABLE';
    technology: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  company: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export async function recommendCandidates(
  jobId: string,
  limit = 20,
): Promise<RecommendedCandidate[]> {
  const jobWithTechnologies = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      technologies: {
        include: { technology: true },
      },
    },
  });

  if (!jobWithTechnologies) return [];

  const requiredTechIds = jobWithTechnologies.technologies
    .filter((jt) => jt.type === 'REQUIRED')
    .map((jt) => jt.technologyId);
  const desirableTechIds = jobWithTechnologies.technologies
    .filter((jt) => jt.type === 'DESIRABLE')
    .map((jt) => jt.technologyId);
  const allJobTechIds = [...requiredTechIds, ...desirableTechIds];

  if (allJobTechIds.length === 0) {
    const activeUsers = await prisma.user.findMany({
      where: {
        isActive: true,
        isBlocked: false,
        resumeUrl: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        resumeUrl: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return activeUsers.map((u) => ({
      ...u,
      matchScore: 0,
      matchedTechnologies: [],
    }));
  }

  const usersWithStack = await prisma.user.findMany({
    where: {
      isActive: true,
      isBlocked: false,
      resumeUrl: { not: null },
      techStack: {
        some: {
          technologyId: { in: allJobTechIds },
        },
      },
    },
    include: {
      techStack: {
        include: { technology: true },
      },
    },
    take: Math.max(limit * 5, 50),
  });

  const candidates: RecommendedCandidate[] = usersWithStack
    .map((user) => {
      const match = calculateTechMatch(requiredTechIds, desirableTechIds, user.techStack);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        resumeUrl: user.resumeUrl,
        matchScore: match.matchScore,
        matchedTechnologies: match.matchedTechnologies,
      };
    })
    .filter((c) => c.matchScore > 0);

  const boostWeights = await getProfileBoostWeights(candidates.map((c) => c.id));
  const boostedCandidates = candidates
    .map((candidate) => {
      const boost = boostWeights.get(candidate.id) ?? 0;
      const matchScore = Math.min(100, Math.round((candidate.matchScore + boost) * 100) / 100);
      return { ...candidate, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  const usersWithoutStack = await prisma.user.findMany({
    where: {
      isActive: true,
      isBlocked: false,
      resumeUrl: { not: null },
      id: { notIn: boostedCandidates.map((c) => c.id) },
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      resumeUrl: true,
    },
    take: Math.max(0, limit - boostedCandidates.length),
    orderBy: { createdAt: 'desc' },
  });

  boostedCandidates.push(
    ...usersWithoutStack.map((u) => ({
      ...u,
      matchScore: 0,
      matchedTechnologies: [],
    })),
  );

  return boostedCandidates;
}

export async function recommendJobsForUser(userId: string, limit = 20): Promise<RecommendedJob[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
      isBlocked: true,
      techStack: {
        include: { technology: true },
      },
    },
  });

  if (!user || !user.isActive || user.isBlocked) return [];

  const jobs = await prisma.job.findMany({
    where: {
      status: 'OPEN',
      isActive: true,
      isFilled: false,
      expiresAt: { gt: new Date() },
    },
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
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
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
    orderBy: { createdAt: 'desc' },
    take: Math.max(limit * 2, limit),
  });

  const scored = jobs
    .map((job) => {
      const required = job.technologies.filter((jt) => jt.type === 'REQUIRED');
      const desirable = job.technologies.filter((jt) => jt.type === 'DESIRABLE');
      const userStack = user.techStack.map((item) => ({
        technologyId: item.technologyId,
        technology: { name: item.technology.name },
      }));
      const match = calculateTechMatch(
        required.map((jt) => jt.technology.id),
        desirable.map((jt) => jt.technology.id),
        userStack,
      );

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        deadline: job.deadline,
        expiresAt: job.expiresAt,
        status: job.status,
        isActive: job.isActive,
        isFilled: job.isFilled,
        companyId: job.companyId,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        technologies: job.technologies,
        company: job.company,
        matchScore: match.matchScore,
        matchPercent: match.matchPercent,
        matchedTechnologies: match.matchedTechnologies,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
}

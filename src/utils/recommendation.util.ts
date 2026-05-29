import { prisma } from '../config/database';

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
  matchScore: number;
  matchedTechnologies: string[];
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
    },
    include: {
      techStack: {
        include: { technology: true },
      },
    },
  });

  const candidates: RecommendedCandidate[] = usersWithStack
    .map((user) => {
      const userTechIds = new Set(user.techStack.map((ut) => ut.technologyId));
      const matchedRequired = requiredTechIds.filter((id) => userTechIds.has(id));
      const matchedDesirable = desirableTechIds.filter((id) => userTechIds.has(id));
      const requiredScore = requiredTechIds.length
        ? (matchedRequired.length / requiredTechIds.length) * 100
        : 100;
      const desirableScore = desirableTechIds.length
        ? (matchedDesirable.length / desirableTechIds.length) * 100
        : 0;
      const matchScore = Math.min(100, requiredScore * 0.8 + desirableScore * 0.2);
      const matchedIds = [...matchedRequired, ...matchedDesirable];

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        resumeUrl: user.resumeUrl,
        matchScore: Math.round(matchScore * 100) / 100,
        matchedTechnologies: user.techStack
          .filter((ut) => matchedIds.includes(ut.technologyId))
          .map((ut) => ut.technology.name),
      };
    })
    .filter((c) => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  const usersWithoutStack = await prisma.user.findMany({
    where: {
      isActive: true,
      isBlocked: false,
      resumeUrl: { not: null },
      id: { notIn: candidates.map((c) => c.id) },
    },
    select: {
      id: true,
      name: true,
      email: true,
      resumeUrl: true,
    },
    take: Math.max(0, limit - candidates.length),
    orderBy: { createdAt: 'desc' },
  });

  candidates.push(
    ...usersWithoutStack.map((u) => ({
      ...u,
      matchScore: 0,
      matchedTechnologies: [],
    })),
  );

  return candidates;
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

  const userTechIds = new Set(user.techStack.map((item) => item.technologyId));
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
      company: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      technologies: {
        include: {
          technology: true,
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
      const matchedRequired = required.filter((jt) => userTechIds.has(jt.technologyId));
      const matchedDesirable = desirable.filter((jt) => userTechIds.has(jt.technologyId));

      const requiredScore = required.length ? (matchedRequired.length / required.length) * 100 : 100;
      const desirableScore = desirable.length ? (matchedDesirable.length / desirable.length) * 100 : 0;
      const matchScore = Math.min(100, requiredScore * 0.8 + desirableScore * 0.2);

      const matchedTechnologies = [...matchedRequired, ...matchedDesirable].map(
        (item) => item.technology.name,
      );

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        matchScore: Math.round(matchScore * 100) / 100,
        matchedTechnologies,
        company: job.company,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
}

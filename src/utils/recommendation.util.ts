import { prisma } from '../config/database';

export type RecommendedCandidate = {
  id: string;
  name: string;
  email: string;
  resumeUrl: string | null;
  matchScore: number;
  matchedTechnologies: string[];
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

  const jobTechIds = jobWithTechnologies.technologies.map((jt) => jt.technologyId);

  if (jobTechIds.length === 0) {
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
      const matchedIds = jobTechIds.filter((id) => userTechIds.has(id));
      const matchScore = (matchedIds.length / jobTechIds.length) * 100;

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

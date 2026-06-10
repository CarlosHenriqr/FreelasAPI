import { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { sanitizeString } from '../../utils/sanitize.util';
import type { CreateReviewDTO, ListReviewsQueryDTO } from './review.schema';

type ReviewActor = {
  type: 'user' | 'company';
  id: string;
};

function receivedWhere(actor: ReviewActor) {
  return actor.type === 'user'
    ? { reviewedType: 'USER' as const, reviewedUserId: actor.id }
    : { reviewedType: 'COMPANY' as const, reviewedCompanyId: actor.id };
}

export async function createReview(actor: ReviewActor, dto: CreateReviewDTO) {
  const application = await prisma.application.findUnique({
    where: { id: dto.applicationId },
    select: {
      id: true,
      status: true,
      userId: true,
      jobId: true,
      job: {
        select: {
          companyId: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }
  if (application.status !== 'COMPLETED') {
    throw new AppError(
      409,
      'Avaliações só são permitidas após conclusão do vínculo.',
      'REVIEW_REQUIRES_COMPLETED_APPLICATION',
    );
  }

  const reviewData: Prisma.ReviewCreateInput = {
    application: { connect: { id: application.id } },
    job: { connect: { id: application.jobId } },
    rating: dto.rating,
    ...(dto.comment ? { comment: sanitizeString(dto.comment) } : {}),
    reviewerType: actor.type === 'user' ? 'USER' : 'COMPANY',
    reviewedType: actor.type === 'user' ? 'COMPANY' : 'USER',
  };

  if (actor.type === 'user') {
    if (application.userId !== actor.id) {
      throw new AppError(403, 'Você só pode avaliar vínculos dos quais participou.', 'FORBIDDEN');
    }
    reviewData.reviewerUser = { connect: { id: actor.id } };
    reviewData.reviewedCompany = { connect: { id: application.job.companyId } };
  } else {
    if (application.job.companyId !== actor.id) {
      throw new AppError(403, 'Você só pode avaliar vínculos dos quais participou.', 'FORBIDDEN');
    }
    reviewData.reviewerCompany = { connect: { id: actor.id } };
    reviewData.reviewedUser = { connect: { id: application.userId } };
  }

  try {
    return await prisma.review.create({
      data: reviewData,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewerType: true,
        reviewedType: true,
        applicationId: true,
        jobId: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Avaliação já registrada para este vínculo e direção.', 'REVIEW_DUPLICATE');
    }
    throw error;
  }
}

export async function listReceivedReviews(actor: ReviewActor, query: ListReviewsQueryDTO) {
  const where = receivedWhere(actor);
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        reviewerType: true,
        reviewerUser: { select: { id: true, name: true, avatarUrl: true } },
        reviewerCompany: { select: { id: true, name: true, avatarUrl: true } },
        job: { select: { id: true, title: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
  };
}

export async function getApplicationReviewStatus(actor: ReviewActor, applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      userId: true,
      job: { select: { companyId: true } },
    },
  });

  if (!application) {
    throw new AppError(404, 'Candidatura não encontrada.', 'APPLICATION_NOT_FOUND');
  }

  if (actor.type === 'user' && application.userId !== actor.id) {
    throw new AppError(403, 'Você só pode consultar avaliações dos seus vínculos.', 'FORBIDDEN');
  }
  if (actor.type === 'company' && application.job.companyId !== actor.id) {
    throw new AppError(403, 'Acesso negado. Esta candidatura não pertence à sua empresa.', 'FORBIDDEN');
  }

  const reviews = await prisma.review.findMany({
    where: { applicationId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewerType: true,
      reviewedType: true,
    },
  });

  const userReview = reviews.find((r) => r.reviewerType === 'USER') ?? null;
  const companyReview = reviews.find((r) => r.reviewerType === 'COMPANY') ?? null;

  return {
    applicationId,
    status: application.status,
    userReviewed: !!userReview,
    companyReviewed: !!companyReview,
    userReview,
    companyReview,
    canReview:
      application.status === 'COMPLETED' &&
      (actor.type === 'user' ? !userReview : !companyReview),
  };
}

export async function getReviewSummary(actor: ReviewActor) {
  const where = receivedWhere(actor);

  const aggregate = await prisma.review.aggregate({
    where,
    _avg: { rating: true },
    _count: { rating: true },
  });

  const distributionCounts = await prisma.$transaction(
    [1, 2, 3, 4, 5].map((rating) =>
      prisma.review.count({
        where: {
          ...where,
          rating,
        },
      }),
    ),
  );

  return {
    averageRating: aggregate._avg.rating ?? 0,
    totalReviews: aggregate._count.rating ?? 0,
    distribution: distributionCounts.map((count, idx) => ({
      rating: idx + 1,
      count,
    })),
  };
}

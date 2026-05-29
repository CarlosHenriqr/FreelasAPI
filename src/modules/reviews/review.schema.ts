import { z } from 'zod';

export const createReviewSchema = z.object({
  applicationId: z.string().uuid('ID de candidatura inválido.'),
  rating: z.number().int().min(1, 'A nota mínima é 1.').max(5, 'A nota máxima é 5.'),
  comment: z.string().min(3).max(2000).optional(),
});

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListReviewsQueryDTO = z.infer<typeof listReviewsQuerySchema>;

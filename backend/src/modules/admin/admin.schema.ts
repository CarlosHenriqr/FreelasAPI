import { z } from 'zod';

export const adminUserListQuerySchema = z.object({
  type: z.enum(['user', 'company']).default('user'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminUserListQueryDTO = z.infer<typeof adminUserListQuerySchema>;

export const adminTargetTypeQuerySchema = z.object({
  type: z.enum(['user', 'company']),
});

export type AdminTargetTypeQueryDTO = z.infer<typeof adminTargetTypeQuerySchema>;

export const adminJobsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminJobsQueryDTO = z.infer<typeof adminJobsQuerySchema>;

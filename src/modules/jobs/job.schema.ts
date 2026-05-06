import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  requirements: z.string().min(0).max(5000).default(''),
  deadline: z.coerce.date(),
  expiresAt: z.coerce.date(),
});

export type CreateJobDTO = z.infer<typeof createJobSchema>;

export const listJobsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  active: z.coerce.boolean().optional(),
});

export type ListJobsQueryDTO = z.infer<typeof listJobsQuerySchema>;


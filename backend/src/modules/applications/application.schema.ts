import { z } from 'zod';

export const applicationStatusValues = [
  'PENDING',
  'REVIEWED',
  'ACCEPTED',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
] as const;

export type ApplicationStatusValue = (typeof applicationStatusValues)[number];

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['REVIEWED', 'ACCEPTED', 'REJECTED']),
});

export type UpdateApplicationStatusDTO = z.infer<typeof updateApplicationStatusSchema>;

export const listMyApplicationsQuerySchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
});

export type ListMyApplicationsQueryDTO = z.infer<typeof listMyApplicationsQuerySchema>;

export const listCompanyApplicationsQuerySchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
  jobId: z.string().uuid().optional(),
});

export type ListCompanyApplicationsQueryDTO = z.infer<typeof listCompanyApplicationsQuerySchema>;

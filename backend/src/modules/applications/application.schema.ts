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
  status: z.enum(['REVIEWED', 'ACCEPTED', 'COMPLETED', 'REJECTED']),
});

export type UpdateApplicationStatusDTO = z.infer<typeof updateApplicationStatusSchema>;

export const listMyApplicationsQuerySchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
});

export type ListMyApplicationsQueryDTO = z.infer<typeof listMyApplicationsQuerySchema>;

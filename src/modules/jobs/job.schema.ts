import { z } from 'zod';

const applicationStatusValues = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'CANCELLED'] as const;
const matchModeValues = ['any', 'all'] as const;
export const jobStatusValues = ['OPEN', 'PAUSED', 'CLOSED', 'CANCELLED'] as const;

const jobStatusSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'ABERTA') return 'OPEN';
  if (normalized === 'PAUSADA') return 'PAUSED';
  if (normalized === 'ENCERRADA') return 'CLOSED';
  if (normalized === 'CANCELADA') return 'CANCELLED';
  return normalized;
}, z.enum(jobStatusValues));

const techIdsSchema = z
  .array(z.string().uuid('ID de tecnologia inválido.'))
  .max(30, 'Máximo de 30 tecnologias por campo.')
  .default([]);

const createJobBaseSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  requirements: z.string().min(0).max(5000).default(''),
  deadline: z.coerce.date(),
  expiresAt: z.coerce.date(),
  requiredTechnologyIds: techIdsSchema,
  desirableTechnologyIds: techIdsSchema,
});

const validateJobTechnologies = (
  value: { requiredTechnologyIds: string[]; desirableTechnologyIds: string[] },
  ctx: z.RefinementCtx,
) => {
  const overlap = value.requiredTechnologyIds.filter((id) => value.desirableTechnologyIds.includes(id));
  if (overlap.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Uma tecnologia não pode ser obrigatória e desejável ao mesmo tempo.',
      path: ['desirableTechnologyIds'],
    });
  }
};

export const createJobSchema = createJobBaseSchema.superRefine(validateJobTechnologies);

export type CreateJobDTO = z.infer<typeof createJobSchema>;

export const updateJobSchema = createJobBaseSchema.partial().superRefine((value, ctx) => {
  validateJobTechnologies(
    {
      requiredTechnologyIds: value.requiredTechnologyIds ?? [],
      desirableTechnologyIds: value.desirableTechnologyIds ?? [],
    },
    ctx,
  );
});
export type UpdateJobDTO = z.infer<typeof updateJobSchema>;

export const listJobsQuerySchema = z.object({
  search: z.string().min(1).optional(),
  active: z.coerce.boolean().optional(),
  status: jobStatusSchema.optional(),
  technologyIds: z.union([z.string(), z.array(z.string())]).optional(),
  matchMode: z.enum(matchModeValues).optional().default('any'),
});

export type ListJobsQueryDTO = z.infer<typeof listJobsQuerySchema>;

export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
});

export type UpdateJobStatusDTO = z.infer<typeof updateJobStatusSchema>;

export const applyToJobSchema = z.object({
  resumeUrl: z.string().url().optional(),
  coverLetter: z.string().min(10).max(4000).optional(),
});

export type ApplyToJobDTO = z.infer<typeof applyToJobSchema>;

export const listJobApplicationsQuerySchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
});

export type ListJobApplicationsQueryDTO = z.infer<typeof listJobApplicationsQuerySchema>;


import { z } from 'zod';

const applicationStatusValues = ['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'] as const;
const matchModeValues = ['any', 'all'] as const;

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
  technologyIds: z.union([z.string(), z.array(z.string())]).optional(),
  matchMode: z.enum(matchModeValues).optional().default('any'),
});

export type ListJobsQueryDTO = z.infer<typeof listJobsQuerySchema>;

export const applyToJobSchema = z.object({
  resumeUrl: z.string().url().optional(),
  coverLetter: z.string().min(10).max(4000).optional(),
});

export type ApplyToJobDTO = z.infer<typeof applyToJobSchema>;

export const listJobApplicationsQuerySchema = z.object({
  status: z.enum(applicationStatusValues).optional(),
});

export type ListJobApplicationsQueryDTO = z.infer<typeof listJobApplicationsQuerySchema>;


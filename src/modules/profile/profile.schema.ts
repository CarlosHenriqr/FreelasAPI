import { z } from 'zod';

const urlSchema = z.string().url('URL inválida.').max(500, 'URL muito longa.').or(z.literal(''));

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').max(100, 'Nome muito longo.').optional(),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.').or(z.literal('')).optional(),
  avatarUrl: urlSchema.optional(),
  bio: z.string().max(1500, 'Bio muito longa.').optional(),
});

export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileSchema>;

export const updateUserResumeSchema = z.object({
  resumeUrl: z.string().url('URL do currículo inválida.').max(500),
});

export type UpdateUserResumeDTO = z.infer<typeof updateUserResumeSchema>;

const skillLevelSchema = z.enum(['BASICO', 'INTERMEDIARIO', 'AVANCADO', 'ESPECIALISTA']);

const legacyTechIdsSchema = z
  .array(z.string().uuid('ID de tecnologia inválido.'))
  .min(1, 'Selecione ao menos uma tecnologia.')
  .max(30, 'Máximo de 30 tecnologias permitidas.');

const skillsSchema = z
  .array(
    z.object({
      technologyId: z.string().uuid('ID de tecnologia inválido.'),
      level: skillLevelSchema,
    }),
  )
  .min(1, 'Selecione ao menos uma skill.')
  .max(30, 'Máximo de 30 skills permitidas.');

export const updateTechStackSchema = z
  .object({
    technologyIds: legacyTechIdsSchema.optional(),
    skills: skillsSchema.optional(),
  })
  .refine((v) => !!v.skills || !!v.technologyIds, {
    message: 'Informe `skills` ou `technologyIds`.',
    path: ['skills'],
  });

export type UpdateTechStackDTO = z.infer<typeof updateTechStackSchema>;

export const updateCompanyProfileSchema = z.object({
  name: z.string().min(2, 'Razão social deve ter no mínimo 2 caracteres.').max(150, 'Razão social muito longa.').optional(),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.').or(z.literal('')).optional(),
  avatarUrl: urlSchema.optional(),
});

export type UpdateCompanyProfileDTO = z.infer<typeof updateCompanyProfileSchema>;

export const updateMeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').max(150, 'Nome muito longo.').optional(),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.').or(z.literal('')).optional(),
  avatarUrl: urlSchema.optional(),
  bio: z.string().max(1500, 'Bio muito longa.').optional(),
});

export type UpdateMeDTO = z.infer<typeof updateMeSchema>;

export const experienceSchema = z
  .object({
    companyName: z.string().min(2).max(120),
    roleTitle: z.string().min(2).max(120).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    description: z.string().max(2000).optional(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: 'A data final não pode ser anterior à data inicial.',
    path: ['endDate'],
  });

export type ExperienceDTO = z.infer<typeof experienceSchema>;

export const portfolioItemSchema = z.object({
  title: z.string().min(2).max(120),
  url: z.string().url('URL inválida.').max(500),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().url('URL inválida.').max(500).optional(),
});

export type PortfolioItemDTO = z.infer<typeof portfolioItemSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, 'Senha atual inválida.').max(200),
    newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres.').max(200),
    confirmNewPassword: z.string().min(8).max(200),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    message: 'Confirmação de senha não confere.',
    path: ['confirmNewPassword'],
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: 'A nova senha deve ser diferente da senha atual.',
    path: ['newPassword'],
  });

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;

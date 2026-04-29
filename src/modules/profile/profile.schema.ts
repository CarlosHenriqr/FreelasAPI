import { z } from 'zod';

const urlSchema = z.string().url('URL inválida.').max(500, 'URL muito longa.').or(z.literal(''));

export const updateUserProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.').max(100, 'Nome muito longo.').optional(),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.').or(z.literal('')).optional(),
  avatarUrl: urlSchema.optional(),
});

export type UpdateUserProfileDTO = z.infer<typeof updateUserProfileSchema>;

export const updateUserResumeSchema = z.object({
  resumeUrl: z.string().url('URL do currículo inválida.').max(500),
});

export type UpdateUserResumeDTO = z.infer<typeof updateUserResumeSchema>;

export const updateTechStackSchema = z.object({
  technologyIds: z
    .array(z.string().uuid('ID de tecnologia inválido.'))
    .min(1, 'Selecione ao menos uma tecnologia.')
    .max(30, 'Máximo de 30 tecnologias permitidas.'),
});

export type UpdateTechStackDTO = z.infer<typeof updateTechStackSchema>;

export const updateCompanyProfileSchema = z.object({
  name: z.string().min(2, 'Razão social deve ter no mínimo 2 caracteres.').max(150, 'Razão social muito longa.').optional(),
  phone: z.string().regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.').or(z.literal('')).optional(),
  avatarUrl: urlSchema.optional(),
});

export type UpdateCompanyProfileDTO = z.infer<typeof updateCompanyProfileSchema>;

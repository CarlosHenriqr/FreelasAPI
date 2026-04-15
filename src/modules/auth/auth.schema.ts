import { z } from 'zod';
import { isValidCPF } from '../../utils/cpf.util';
import { isValidCNPJ } from '../../utils/cnpj.util';

// ─── Política de senha (RN.06 – ConfigPerfil) ─────────────────────────────────
// Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número
const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número.');

// ─── Registro de Freelancer ───────────────────────────────────────────────────
export const registerUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres.')
    .max(100, 'Nome muito longo.'),
  email: z.string().email('E-mail inválido.').toLowerCase(),
  password: passwordSchema,
  cpf: z
    .string()
    .refine((v) => isValidCPF(v), { message: 'CPF inválido.' }),
  phone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.')
    .optional(),
});

export type RegisterUserDTO = z.infer<typeof registerUserSchema>;

// ─── Registro de Empresa ──────────────────────────────────────────────────────
export const registerCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Razão social deve ter no mínimo 2 caracteres.')
    .max(150, 'Razão social muito longa.'),
  email: z
  .string()
  .trim()
  .toLowerCase()
  .email('E-mail inválido.'),
  password: passwordSchema,
  cnpj: z
    .string()
    .refine((v) => isValidCNPJ(v), { message: 'CNPJ inválido.' }),
  phone: z
    .string()
    .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido.')
    .optional(),
});

export type RegisterCompanyDTO = z.infer<typeof registerCompanySchema>;

// ─── Login (compartilhado — distingue por type no body) ───────────────────────
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase(),
  password: z.string().min(1, 'Senha obrigatória.'),
  type: z.enum(['user', 'company'], {
    errorMap: () => ({ message: 'Tipo deve ser "user" ou "company".' }),
  }),
});

export type LoginDTO = z.infer<typeof loginSchema>;

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório.'),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório.'),
});

export type LogoutDTO = z.infer<typeof logoutSchema>;
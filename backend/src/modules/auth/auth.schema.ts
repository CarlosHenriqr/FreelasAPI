import { z } from 'zod';
import { isValidCPF, normalizeCPF } from '../../utils/cpf.util';
import { isValidCNPJ, normalizeCNPJ } from '../../utils/cnpj.util';

// ─── Política de senha (RN.06 – ConfigPerfil) ─────────────────────────────────
// Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número
export const passwordSchema = z
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
// Campo `email` aceita e-mail, CPF (freelancer) ou CNPJ (empresa).
export const loginSchema = z
  .object({
    email: z.string().min(1, 'Informe e-mail, CPF ou CNPJ.'),
    password: z.string().min(1, 'Senha obrigatória.'),
    type: z.enum(['user', 'company'], {
      errorMap: () => ({ message: 'Tipo deve ser "user" ou "company".' }),
    }),
  })
  .superRefine((data, ctx) => {
    const value = data.email.trim();
    if (value.includes('@')) {
      const parsed = z.string().email('E-mail inválido.').safeParse(value.toLowerCase());
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'E-mail inválido.',
        });
      }
      return;
    }

    if (data.type === 'user') {
      if (!isValidCPF(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'CPF inválido.',
        });
      }
      return;
    }

    if (!isValidCNPJ(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['email'],
        message: 'CNPJ inválido.',
      });
    }
  });

export type LoginDTO = z.infer<typeof loginSchema>;

export type UserLoginIdentifier =
  | { kind: 'email'; value: string }
  | { kind: 'cpf'; value: string };

export type CompanyLoginIdentifier =
  | { kind: 'email'; value: string }
  | { kind: 'cnpj'; value: string };

export function parseUserLoginIdentifier(raw: string): UserLoginIdentifier {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return { kind: 'email', value: trimmed.toLowerCase() };
  }
  return { kind: 'cpf', value: normalizeCPF(trimmed) };
}

export function parseCompanyLoginIdentifier(raw: string): CompanyLoginIdentifier {
  const trimmed = raw.trim();
  if (trimmed.includes('@')) {
    return { kind: 'email', value: trimmed.toLowerCase() };
  }
  return { kind: 'cnpj', value: normalizeCNPJ(trimmed) };
}

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

// ─── Recuperação de senha ─────────────────────────────────────────────────────
const passwordResetAccountTypeSchema = z.enum(['user', 'company']).default('user');

export const requestPasswordResetSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase(),
  type: passwordResetAccountTypeSchema,
});

export type RequestPasswordResetDTO = z.infer<typeof requestPasswordResetSchema>;

export const verifyPasswordResetCodeSchema = z.object({
  email: z.string().email('E-mail inválido.').toLowerCase(),
  code: z
    .string()
    .regex(/^\d{6}$/, 'Código inválido. Informe 6 dígitos.'),
  type: passwordResetAccountTypeSchema,
});

export type VerifyPasswordResetCodeDTO = z.infer<typeof verifyPasswordResetCodeSchema>;

export const resetPasswordWithCodeSchema = z
  .object({
    email: z.string().email('E-mail inválido.').toLowerCase(),
    code: z
      .string()
      .regex(/^\d{6}$/, 'Código inválido. Informe 6 dígitos.'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(8).max(200),
    type: passwordResetAccountTypeSchema,
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: 'Confirmação de senha não confere.',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordWithCodeDTO = z.infer<typeof resetPasswordWithCodeSchema>;
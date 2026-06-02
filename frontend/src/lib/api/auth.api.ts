import { apiRequest, clearAuthSession, setAuthSession } from '@/lib/api/client';
import type { AuthTokens, AuthUser } from '@/types/api';

export type LoginPayload = {
  email: string;
  password: string;
  type: 'user' | 'company';
};

export type RegisterUserPayload = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone?: string;
};

export type RegisterCompanyPayload = {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  segment?: string;
};

type AuthResponse = AuthTokens & { user: AuthUser };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: payload, auth: false }),

  registerUser: (payload: RegisterUserPayload) =>
    apiRequest<AuthResponse>('/auth/register/user', { method: 'POST', body: payload, auth: false }),

  registerCompany: (payload: RegisterCompanyPayload) =>
    apiRequest<AuthResponse>('/auth/register/company', { method: 'POST', body: payload, auth: false }),

  logout: async (refreshToken: string) => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } });
    } finally {
      clearAuthSession();
    }
  },

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/password/forgot', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  verifyResetCode: (email: string, code: string) =>
    apiRequest<{ valid: boolean }>('/auth/password/verify-code', {
      method: 'POST',
      body: { email, code },
      auth: false,
    }),

  resetPassword: (payload: {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    apiRequest<{ message: string }>('/auth/password/reset', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  persistSession(data: AuthResponse) {
    setAuthSession(
      { accessToken: data.accessToken, refreshToken: data.refreshToken },
      data.user,
    );
  },
};

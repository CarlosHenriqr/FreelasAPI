import { apiRequest } from '@/lib/api/client';
import { apiUploadForm } from '@/lib/api/upload';
import type {
  CreateExperiencePayload,
  Experience,
  PortfolioItem,
  SkillLevel,
  UserProfile,
} from '@/types/api';

export const profileApi = {
  me: () => apiRequest<UserProfile>('/profile/me'),

  updateMe: (payload: Partial<UserProfile>) =>
    apiRequest<UserProfile>('/profile/me', { method: 'PUT', body: payload }),

  updateUser: (payload: Partial<UserProfile>) =>
    apiRequest<UserProfile>('/profile/user/me', { method: 'PATCH', body: payload }),

  uploadUserAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return apiUploadForm<UserProfile>('/profile/user/me/avatar', form);
  },

  updateCompany: (payload: Partial<UserProfile>) =>
    apiRequest<UserProfile>('/profile/company/me', { method: 'PATCH', body: payload }),

  uploadCompanyAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return apiUploadForm<UserProfile>('/profile/company/me/avatar', form);
  },

  updateResume: (resumeUrl: string) =>
    apiRequest<UserProfile>('/profile/user/me/resume', { method: 'PUT', body: { resumeUrl } }),

  deleteResume: () => apiRequest('/profile/user/me/resume', { method: 'DELETE' }),

  updateTechStack: (skills: Array<{ technologyId: string; level: SkillLevel }>) =>
    apiRequest<UserProfile>('/profile/user/me/tech-stack', {
      method: 'PATCH',
      body: { skills },
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/profile/me/password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    }),

  getPublicUser: (id: string) =>
    apiRequest<UserProfile>(`/profile/users/${id}`, { auth: false }),

  getPublicCompany: (id: string) =>
    apiRequest<UserProfile>(`/profile/companies/${id}`, { auth: false }),

  listExperiences: () => apiRequest<Experience[]>('/profile/me/experiences'),

  createExperience: (payload: CreateExperiencePayload) =>
    apiRequest<Experience>('/profile/me/experiences', { method: 'POST', body: payload }),

  updateExperience: (id: string, payload: Partial<Experience>) =>
    apiRequest<Experience>(`/profile/me/experiences/${id}`, { method: 'PUT', body: payload }),

  deleteExperience: (id: string) =>
    apiRequest(`/profile/me/experiences/${id}`, { method: 'DELETE' }),

  listPortfolio: () => apiRequest<PortfolioItem[]>('/profile/me/portfolio'),

  createPortfolio: (payload: Omit<PortfolioItem, 'id'>) =>
    apiRequest<PortfolioItem>('/profile/me/portfolio', { method: 'POST', body: payload }),

  updatePortfolio: (id: string, payload: Partial<PortfolioItem>) =>
    apiRequest<PortfolioItem>(`/profile/me/portfolio/${id}`, { method: 'PUT', body: payload }),

  deletePortfolio: (id: string) =>
    apiRequest(`/profile/me/portfolio/${id}`, { method: 'DELETE' }),
};

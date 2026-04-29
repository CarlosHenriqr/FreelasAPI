import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { sanitizeString } from '../../utils/sanitize.util';
import type {
  UpdateUserProfileDTO,
  UpdateUserResumeDTO,
  UpdateTechStackDTO,
  UpdateCompanyProfileDTO,
} from './profile.schema';

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      resumeUrl: true,
      cpf: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      techStack: { include: { technology: true } },
    },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  return user;
}

export async function updateUserProfile(userId: string, dto: UpdateUserProfileDTO) {
  const data: Record<string, unknown> = {};

  if (dto.name !== undefined) data.name = sanitizeString(dto.name);
  if (dto.phone !== undefined) data.phone = dto.phone || null;
  if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl || null;

  if (Object.keys(data).length === 0) {
    throw new AppError(422, 'Nenhum campo para atualizar.', 'NO_FIELDS_TO_UPDATE');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      resumeUrl: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function updateUserResume(userId: string, dto: UpdateUserResumeDTO) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { resumeUrl: dto.resumeUrl },
    select: {
      id: true,
      name: true,
      email: true,
      resumeUrl: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function deleteUserResume(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { resumeUrl: null },
  });
}

export async function updateTechStack(userId: string, dto: UpdateTechStackDTO) {
  const existingTechCount = await prisma.technology.count({
    where: { id: { in: dto.technologyIds } },
  });

  if (existingTechCount !== dto.technologyIds.length) {
    throw new AppError(400, 'Uma ou mais tecnologias não existem.', 'INVALID_TECHNOLOGY_IDS');
  }

  await prisma.userTechnology.deleteMany({ where: { userId } });

  if (dto.technologyIds.length > 0) {
    await prisma.userTechnology.createMany({
      data: dto.technologyIds.map((techId) => ({
        userId,
        technologyId: techId,
      })),
    });
  }

  const updated = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      techStack: { include: { technology: true } },
    },
  });

  return updated;
}

export async function getCompanyProfile(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      cnpj: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!company) {
    throw new AppError(404, 'Empresa não encontrada.', 'COMPANY_NOT_FOUND');
  }

  return company;
}

export async function updateCompanyProfile(companyId: string, dto: UpdateCompanyProfileDTO) {
  const data: Record<string, unknown> = {};

  if (dto.name !== undefined) data.name = sanitizeString(dto.name);
  if (dto.phone !== undefined) data.phone = dto.phone || null;
  if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl || null;

  if (Object.keys(data).length === 0) {
    throw new AppError(422, 'Nenhum campo para atualizar.', 'NO_FIELDS_TO_UPDATE');
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updated;
}

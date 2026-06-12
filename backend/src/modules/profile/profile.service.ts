import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { sanitizeString } from '../../utils/sanitize.util';
import { uploadAvatarToStorage } from '../../services/avatarStorage.service';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import type {
  UpdateUserProfileDTO,
  UpdateUserResumeDTO,
  UpdateTechStackDTO,
  UpdateCompanyProfileDTO,
  ChangePasswordDTO,
  ExperienceDTO,
  PortfolioItemDTO,
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
      bio: true,
      cpf: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      techStack: { include: { technology: true } },
      experiences: {
        orderBy: { startDate: 'desc' },
      },
      portfolio: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  return {
    ...user,
    cpf: user.cpf ? user.cpf.replace(/^(\d{3})\d{6}(\d{2})$/, '$1******$2') : user.cpf,
  };
}

export async function getPublicUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      techStack: {
        select: {
          level: true,
          technology: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      experiences: {
        orderBy: { startDate: 'desc' },
        select: {
          id: true,
          companyName: true,
          roleTitle: true,
          startDate: true,
          endDate: true,
          description: true,
        },
      },
      portfolio: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          url: true,
          description: true,
          imageUrl: true,
          createdAt: true,
        },
      },
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'Freelancer não encontrado.', 'USER_NOT_FOUND');
  }

  return user;
}

export async function updateUserProfile(userId: string, dto: UpdateUserProfileDTO) {
  const data: Record<string, unknown> = {};

  if (dto.name !== undefined) data.name = sanitizeString(dto.name);
  if (dto.phone !== undefined) data.phone = dto.phone || null;
  if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl || null;
  if ((dto as { bio?: string }).bio !== undefined) {
    const sanitizedBio = sanitizeString((dto as { bio?: string }).bio ?? '');
    if (!sanitizedBio) {
      throw new AppError(422, 'Bio obrigatória (mínimo 10 caracteres).', 'BIO_TOO_SHORT');
    }
    data.bio = sanitizedBio;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(422, 'Nenhum campo para atualizar.', 'NO_FIELDS_TO_UPDATE');
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { resumeUrl: true },
  });

  if (!existingUser) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  if (!existingUser.resumeUrl && (dto.bio !== undefined || dto.phone !== undefined)) {
    throw new AppError(
      422,
      'Currículo obrigatório para completar o perfil. Publique a URL do currículo antes de salvar.',
      'MISSING_RESUME_URL',
    );
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
      bio: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function listExperiences(userId: string) {
  const items = await prisma.userExperience.findMany({
    where: { userId },
    orderBy: { startDate: 'desc' },
  });
  return items;
}

export async function createExperience(userId: string, dto: ExperienceDTO) {
  const item = await prisma.userExperience.create({
    data: {
      userId,
      companyName: sanitizeString(dto.companyName),
      roleTitle: sanitizeString(dto.roleTitle),
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      description: dto.description ? sanitizeString(dto.description) : null,
    },
  });
  return item;
}

export async function updateExperience(userId: string, experienceId: string, dto: ExperienceDTO) {
  const existing = await prisma.userExperience.findUnique({
    where: { id: experienceId },
    select: { userId: true },
  });
  if (!existing) {
    throw new AppError(404, 'Experiência não encontrada.', 'EXPERIENCE_NOT_FOUND');
  }
  if (existing.userId !== userId) {
    throw new AppError(403, 'Acesso negado.', 'FORBIDDEN');
  }

  const item = await prisma.userExperience.update({
    where: { id: experienceId },
    data: {
      companyName: sanitizeString(dto.companyName),
      roleTitle: sanitizeString(dto.roleTitle),
      startDate: dto.startDate,
      endDate: dto.endDate ?? null,
      description: dto.description ? sanitizeString(dto.description) : null,
    },
  });
  return item;
}

export async function deleteExperience(userId: string, experienceId: string): Promise<void> {
  const existing = await prisma.userExperience.findUnique({
    where: { id: experienceId },
    select: { userId: true },
  });
  if (!existing) {
    throw new AppError(404, 'Experiência não encontrada.', 'EXPERIENCE_NOT_FOUND');
  }
  if (existing.userId !== userId) {
    throw new AppError(403, 'Acesso negado.', 'FORBIDDEN');
  }

  await prisma.userExperience.delete({ where: { id: experienceId } });
}

export async function listPortfolio(userId: string) {
  const items = await prisma.userPortfolioItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return items;
}

export async function createPortfolioItem(userId: string, dto: PortfolioItemDTO) {
  const item = await prisma.userPortfolioItem.create({
    data: {
      userId,
      title: sanitizeString(dto.title),
      url: dto.url,
      description: dto.description ? sanitizeString(dto.description) : null,
      imageUrl: dto.imageUrl ?? null,
    },
  });
  return item;
}

export async function updatePortfolioItem(userId: string, itemId: string, dto: PortfolioItemDTO) {
  const existing = await prisma.userPortfolioItem.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });
  if (!existing) {
    throw new AppError(404, 'Item de portfólio não encontrado.', 'PORTFOLIO_ITEM_NOT_FOUND');
  }
  if (existing.userId !== userId) {
    throw new AppError(403, 'Acesso negado.', 'FORBIDDEN');
  }

  const item = await prisma.userPortfolioItem.update({
    where: { id: itemId },
    data: {
      title: sanitizeString(dto.title),
      url: dto.url,
      description: dto.description ? sanitizeString(dto.description) : null,
      imageUrl: dto.imageUrl ?? null,
    },
  });
  return item;
}

export async function deletePortfolioItem(userId: string, itemId: string): Promise<void> {
  const existing = await prisma.userPortfolioItem.findUnique({
    where: { id: itemId },
    select: { userId: true },
  });
  if (!existing) {
    throw new AppError(404, 'Item de portfólio não encontrado.', 'PORTFOLIO_ITEM_NOT_FOUND');
  }
  if (existing.userId !== userId) {
    throw new AppError(403, 'Acesso negado.', 'FORBIDDEN');
  }

  await prisma.userPortfolioItem.delete({ where: { id: itemId } });
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { resumeUrl: true },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  if (!user.resumeUrl) {
    throw new AppError(
      422,
      'Currículo obrigatório para completar o perfil. Publique a URL do currículo antes de salvar.',
      'MISSING_RESUME_URL',
    );
  }

  const skills =
    dto.skills ??
    (dto.technologyIds ?? []).map((technologyId) => ({
      technologyId,
      level: 'BASICO' as const,
    }));

  const uniqueSkills = Array.from(
    new Map(skills.map((item) => [item.technologyId, item])).values(),
  );

  const technologyIds = uniqueSkills.map((s) => s.technologyId);

  const existingTechCount = await prisma.technology.count({
    where: { id: { in: technologyIds } },
  });

  if (existingTechCount !== technologyIds.length) {
    throw new AppError(400, 'Uma ou mais tecnologias não existem.', 'INVALID_TECHNOLOGY_IDS');
  }

  await prisma.userTechnology.deleteMany({ where: { userId } });

  if (uniqueSkills.length > 0) {
    await prisma.userTechnology.createMany({
      data: uniqueSkills.map((item) => ({
        userId,
        technologyId: item.technologyId,
        level: item.level,
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

  return {
    ...company,
    cnpj: company.cnpj ? company.cnpj.replace(/^(\d{2})\d{10}(\d{2})$/, '$1**********$2') : company.cnpj,
  };
}

export async function getPublicCompanyProfile(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      jobs: {
        where: {
          status: 'OPEN',
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          deadline: true,
          expiresAt: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          jobs: true,
        },
      },
      createdAt: true,
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

export async function uploadUserAvatar(userId: string, file: Express.Multer.File) {
  const avatarUrl = await uploadAvatarToStorage(userId, file);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function uploadCompanyAvatar(companyId: string, file: Express.Multer.File) {
  const avatarUrl = await uploadAvatarToStorage(companyId, file);

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: { avatarUrl },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });

  return updated;
}

export async function changeUserPassword(userId: string, dto: ChangePasswordDTO): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  if (!user) {
    throw new AppError(404, 'Usuário não encontrado.', 'USER_NOT_FOUND');
  }

  const ok = await bcrypt.compare(dto.currentPassword, user.password);
  if (!ok) {
    throw new AppError(401, 'Senha atual incorreta.', 'INVALID_CURRENT_PASSWORD');
  }

  const hashed = await bcrypt.hash(dto.newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  });
}

export async function changeCompanyPassword(companyId: string, dto: ChangePasswordDTO): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { password: true },
  });

  if (!company) {
    throw new AppError(404, 'Empresa não encontrada.', 'COMPANY_NOT_FOUND');
  }

  const ok = await bcrypt.compare(dto.currentPassword, company.password);
  if (!ok) {
    throw new AppError(401, 'Senha atual incorreta.', 'INVALID_CURRENT_PASSWORD');
  }

  const hashed = await bcrypt.hash(dto.newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.company.update({
    where: { id: companyId },
    data: { password: hashed },
  });
}

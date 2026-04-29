import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import type { CreateTechnologyDTO } from './technology.schema';

export async function listTechnologies(search?: string) {
  const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};

  const technologies = await prisma.technology.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
    },
    orderBy: { name: 'asc' },
  });

  return technologies;
}

export async function createTechnology(dto: CreateTechnologyDTO) {
  const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const existing = await prisma.technology.findFirst({
    where: { OR: [{ name: dto.name }, { slug }] },
  });

  if (existing) {
    throw new AppError(409, 'Tecnologia já cadastrada.', 'TECHNOLOGY_CONFLICT');
  }

  const technology = await prisma.technology.create({
    data: { name: dto.name, slug },
  });

  return technology;
}

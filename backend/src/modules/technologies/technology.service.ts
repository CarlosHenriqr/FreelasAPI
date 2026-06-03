import { prisma } from '../../config/database';
import { AppError } from '../../middlewares/errorHandler.middleware';
import type { CreateTechnologyDTO } from './technology.schema';
import { normalizeTechnologyName, TECHNOLOGY_CATALOG } from './technology.catalog';

const catalogByNormalizedName = new Map(
  TECHNOLOGY_CATALOG.map((item) => [normalizeTechnologyName(item.name), item]),
);

export async function listTechnologies(search?: string) {
  const count = await prisma.technology.count();
  if (count === 0) {
    await seedDefaultTechnologies();
  }

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

  return technologies.map((tech) => ({
    ...tech,
    category: catalogByNormalizedName.get(normalizeTechnologyName(tech.name))?.category ?? 'Outros',
  }));
}

export async function createTechnology(dto: CreateTechnologyDTO) {
  const normalizedName = normalizeTechnologyName(dto.name);
  const catalogItem = catalogByNormalizedName.get(normalizedName);
  if (!catalogItem) {
    throw new AppError(
      422,
      'Skill fora do catálogo permitido. Utilize uma tecnologia pré-definida.',
      'INVALID_TECHNOLOGY_NAME',
    );
  }

  const slug = catalogItem.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const existing = await prisma.technology.findFirst({
    where: { OR: [{ name: catalogItem.name }, { slug }] },
  });

  if (existing) {
    throw new AppError(409, 'Tecnologia já cadastrada.', 'TECHNOLOGY_CONFLICT');
  }

  const technology = await prisma.technology.create({
    data: { name: catalogItem.name, slug },
  });

  return {
    ...technology,
    category: catalogItem.category,
  };
}

export async function seedDefaultTechnologies() {
  const data = TECHNOLOGY_CATALOG.map((item) => ({
    name: item.name,
    slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }));

  await prisma.technology.createMany({
    data,
    skipDuplicates: true,
  });

  return listTechnologies();
}

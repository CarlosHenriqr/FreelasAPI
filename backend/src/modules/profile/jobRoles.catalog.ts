export const JOB_ROLE_LABELS = [
  'Desenvolvedor Júnior',
  'Desenvolvedor Pleno',
  'Desenvolvedor Sênior',
  'Desenvolvedor Full Stack',
  'Engenheiro de Software',
  'Tech Lead',
  'Arquiteto de Software',
  'UI Designer',
  'UX Designer',
  'Product Designer',
  'Designer Gráfico',
  'UX Researcher',
  'Web Designer',
  'DevOps Engineer',
  'SRE',
  'Engenheiro de Cloud',
  'Administrador de Sistemas',
  'Analista de Dados',
  'Engenheiro de Dados',
  'Cientista de Dados',
  'Engenheiro de Machine Learning',
  'Product Manager',
  'Product Owner',
  'Scrum Master',
  'Gerente de Projetos',
  'CTO',
  'Analista de QA',
  'Engenheiro de Qualidade',
  'QA Automation',
  'Estagiário',
  'Freelancer',
  'Consultor Técnico',
] as const;

const knownRoles = new Set<string>(JOB_ROLE_LABELS);

export function isAllowedJobRole(title: string): boolean {
  const trimmed = title.trim();
  if (trimmed.length < 2 || trimmed.length > 120) return false;
  return knownRoles.has(trimmed) || trimmed.length >= 2;
}

export function isCatalogJobRole(title: string): boolean {
  return knownRoles.has(title.trim());
}

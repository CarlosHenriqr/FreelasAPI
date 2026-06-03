export const JOB_ROLE_OTHER_VALUE = '__other__';

export const DEFAULT_JOB_ROLE = 'Desenvolvedor Júnior';

export type JobRoleCategory =
  | 'Desenvolvimento'
  | 'Design e UX'
  | 'DevOps e Infra'
  | 'Dados e IA'
  | 'Produto e Gestão'
  | 'Qualidade'
  | 'Outros';

export type JobRoleCatalogItem = {
  label: string;
  category: JobRoleCategory;
};

export const JOB_ROLE_CATALOG: JobRoleCatalogItem[] = [
  { label: 'Desenvolvedor Júnior', category: 'Desenvolvimento' },
  { label: 'Desenvolvedor Pleno', category: 'Desenvolvimento' },
  { label: 'Desenvolvedor Sênior', category: 'Desenvolvimento' },
  { label: 'Desenvolvedor Full Stack', category: 'Desenvolvimento' },
  { label: 'Engenheiro de Software', category: 'Desenvolvimento' },
  { label: 'Tech Lead', category: 'Desenvolvimento' },
  { label: 'Arquiteto de Software', category: 'Desenvolvimento' },

  { label: 'UI Designer', category: 'Design e UX' },
  { label: 'UX Designer', category: 'Design e UX' },
  { label: 'Product Designer', category: 'Design e UX' },
  { label: 'Designer Gráfico', category: 'Design e UX' },
  { label: 'UX Researcher', category: 'Design e UX' },
  { label: 'Web Designer', category: 'Design e UX' },

  { label: 'DevOps Engineer', category: 'DevOps e Infra' },
  { label: 'SRE', category: 'DevOps e Infra' },
  { label: 'Engenheiro de Cloud', category: 'DevOps e Infra' },
  { label: 'Administrador de Sistemas', category: 'DevOps e Infra' },

  { label: 'Analista de Dados', category: 'Dados e IA' },
  { label: 'Engenheiro de Dados', category: 'Dados e IA' },
  { label: 'Cientista de Dados', category: 'Dados e IA' },
  { label: 'Engenheiro de Machine Learning', category: 'Dados e IA' },

  { label: 'Product Manager', category: 'Produto e Gestão' },
  { label: 'Product Owner', category: 'Produto e Gestão' },
  { label: 'Scrum Master', category: 'Produto e Gestão' },
  { label: 'Gerente de Projetos', category: 'Produto e Gestão' },
  { label: 'CTO', category: 'Produto e Gestão' },

  { label: 'Analista de QA', category: 'Qualidade' },
  { label: 'Engenheiro de Qualidade', category: 'Qualidade' },
  { label: 'QA Automation', category: 'Qualidade' },

  { label: 'Estagiário', category: 'Outros' },
  { label: 'Freelancer', category: 'Outros' },
  { label: 'Consultor Técnico', category: 'Outros' },
];

export const JOB_ROLE_LABELS = JOB_ROLE_CATALOG.map((r) => r.label);

export const JOB_ROLE_CATEGORIES: JobRoleCategory[] = [
  'Desenvolvimento',
  'Design e UX',
  'DevOps e Infra',
  'Dados e IA',
  'Produto e Gestão',
  'Qualidade',
  'Outros',
];

export function jobRolesByCategory(): Array<{ category: JobRoleCategory; roles: string[] }> {
  return JOB_ROLE_CATEGORIES.map((category) => ({
    category,
    roles: JOB_ROLE_CATALOG.filter((r) => r.category === category).map((r) => r.label),
  }));
}

export function isKnownJobRole(label: string): boolean {
  return JOB_ROLE_LABELS.includes(label);
}

export function resolveRoleTitle(preset: string, custom: string): string {
  if (preset === JOB_ROLE_OTHER_VALUE) {
    return custom.trim();
  }
  return preset;
}

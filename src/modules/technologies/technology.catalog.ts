export type TechnologyCatalogItem = {
  name: string;
  category:
    | 'Frontend'
    | 'Backend'
    | 'Mobile'
    | 'Banco de Dados'
    | 'DevOps/Cloud'
    | 'Design/Produto'
    | 'Outros';
};

export const TECHNOLOGY_CATALOG: TechnologyCatalogItem[] = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Vue', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'HTML', category: 'Frontend' },
  { name: 'CSS', category: 'Frontend' },
  { name: 'JavaScript', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },

  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'NestJS', category: 'Backend' },
  { name: 'Java', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'PHP', category: 'Backend' },
  { name: 'Laravel', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Django', category: 'Backend' },
  { name: 'C#', category: 'Backend' },
  { name: '.NET', category: 'Backend' },

  { name: 'React Native', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Kotlin', category: 'Mobile' },
  { name: 'Swift', category: 'Mobile' },

  { name: 'PostgreSQL', category: 'Banco de Dados' },
  { name: 'MySQL', category: 'Banco de Dados' },
  { name: 'MongoDB', category: 'Banco de Dados' },
  { name: 'SQLite', category: 'Banco de Dados' },
  { name: 'Redis', category: 'Banco de Dados' },

  { name: 'Docker', category: 'DevOps/Cloud' },
  { name: 'AWS', category: 'DevOps/Cloud' },
  { name: 'Azure', category: 'DevOps/Cloud' },
  { name: 'GitHub Actions', category: 'DevOps/Cloud' },
  { name: 'Linux', category: 'DevOps/Cloud' },
  { name: 'Nginx', category: 'DevOps/Cloud' },

  { name: 'Figma', category: 'Design/Produto' },
  { name: 'UI/UX', category: 'Design/Produto' },
  { name: 'Photoshop', category: 'Design/Produto' },
  { name: 'Illustrator', category: 'Design/Produto' },

  { name: 'Git', category: 'Outros' },
  { name: 'APIs REST', category: 'Outros' },
  { name: 'GraphQL', category: 'Outros' },
  { name: 'Testes', category: 'Outros' },
  { name: 'Cypress', category: 'Outros' },
  { name: 'Jest', category: 'Outros' },
];

export function normalizeTechnologyName(name: string): string {
  return name.trim().toLowerCase();
}

import { z } from 'zod';

export const createTechnologySchema = z.object({
  name: z.string().min(1, 'Nome da tecnologia é obrigatório.').max(50, 'Nome muito longo.'),
});

export type CreateTechnologyDTO = z.infer<typeof createTechnologySchema>;

import { z } from 'zod';

export const matchingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type MatchingQueryDTO = z.infer<typeof matchingQuerySchema>;

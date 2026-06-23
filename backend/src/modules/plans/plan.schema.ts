import { z } from 'zod';

export const mockUpgradeSchema = z.object({
  targetCode: z.enum(['FREE', 'PRO', 'STARTER']).optional(),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']).optional(),
});

export type MockUpgradeDTO = z.infer<typeof mockUpgradeSchema>;

export const listPlansQuerySchema = z.object({
  audience: z.enum(['USER', 'COMPANY']).optional(),
});

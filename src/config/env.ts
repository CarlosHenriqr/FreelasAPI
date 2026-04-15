import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  MAX_LOGIN_ATTEMPTS: z.coerce.number().default(5),
  BLOCK_DURATION_MINUTES: z.coerce.number().default(30),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌  Variáveis de ambiente inválidas:');
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _parsed.data;
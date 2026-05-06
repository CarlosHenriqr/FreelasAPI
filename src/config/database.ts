import { PrismaClient } from '@prisma/client';

// Singleton — evita múltiplas conexões em hot reload (dev)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Evita vazar dados sensíveis em logs de query no console.
    // Se precisar inspecionar queries, prefira habilitar localmente e temporariamente.
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
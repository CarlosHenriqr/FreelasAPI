// Carrega variáveis de ambiente ANTES de qualquer outro import
import 'dotenv/config';

import { env } from './config/env';
import { prisma } from './config/database';
import { isSupabaseStorageConfigured } from './config/supabase';
import app from './app';

async function bootstrap() {
  // Testa conexão com o banco antes de subir o servidor
  try {
    await prisma.$connect();
    console.log('✅  Banco de dados conectado.');
  } catch (err) {
    console.error('❌  Falha ao conectar no banco de dados:', err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`🚀  Servidor rodando em http://localhost:${env.PORT}`);
    console.log(`🌍  Ambiente: ${env.NODE_ENV}`);
    if (!isSupabaseStorageConfigured()) {
      console.warn('⚠️  Supabase Storage não configurado — upload de avatar desabilitado.');
    } else {
      console.log('✅  Supabase Storage configurado para upload de avatar.');
    }
  });

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n⚠️   Sinal ${signal} recebido. Encerrando servidor...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('🔌  Conexão com banco encerrada. Processo finalizado.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap();
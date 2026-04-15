import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
1
const app = express();

// ─── Segurança de headers HTTP (RNF02) ────────────────────────────────────────
app.use(helmet());

// ─── Confia no primeiro proxy (necessário para rate-limit por IP real) ────────
app.set('trust proxy', 1);

// ─── Rate limit global (proteção geral contra DDoS / abuso) ──────────────────
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300,                   // 300 req/IP na janela
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Muitas requisições. Tente novamente em alguns minutos.',
    },
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));    // recusa payloads muito grandes
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);

// Health check simples
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 para rotas não encontradas
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Rota não encontrada.' });
});

// ─── Handler de erros centralizado (deve ser o último middleware) ──────────────
app.use(errorHandler);

export default app;
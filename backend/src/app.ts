import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import technologyRoutes from './modules/technologies/technology.routes';
import jobRoutes from './modules/jobs/job.routes';
import applicationRoutes from './modules/applications/application.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import reviewRoutes from './modules/reviews/review.routes';
import matchingRoutes from './modules/matching/matching.routes';
import adminRoutes from './modules/admin/admin.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { isAllowedCorsOrigin } from './config/cors';

const app = express();

// ─── CORS (frontend em dev/produção + previews Cloudflare Pages) ─────────────
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
  }),
);

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
      success: false,
      message: 'Muitas requisições. Tente novamente em alguns minutos.',
      code: 'TOO_MANY_REQUESTS',
    },
  }),
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '64kb' }));    // recusa payloads muito grandes
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// ─── Rotas ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/technologies', technologyRoutes);
app.use('/vagas', jobRoutes);
app.use('/applications', applicationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/reviews', reviewRoutes);
app.use('/matching', matchingRoutes);
app.use('/admin', adminRoutes);

// Health check simples
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 para rotas não encontradas
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada.', code: 'ROUTE_NOT_FOUND' });
});

// ─── Handler de erros centralizado (deve ser o último middleware) ──────────────
app.use(errorHandler);

export default app;

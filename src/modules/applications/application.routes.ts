import { Router } from 'express';
import { authenticate, requireType } from '../../middlewares/auth.middleware';
import * as ApplicationController from './application.controller';

const router = Router();

// GET /applications/me — candidaturas do freelancer logado
router.get(
  '/me',
  authenticate,
  requireType('user'),
  ApplicationController.listMyApplications,
);

// PATCH /applications/:id/status — empresa altera status
router.patch(
  '/:id/status',
  authenticate,
  requireType('company'),
  ApplicationController.updateApplicationStatus,
);

// PATCH /applications/:id/cancel — freelancer cancela candidatura
router.patch(
  '/:id/cancel',
  authenticate,
  requireType('user'),
  ApplicationController.cancelApplication,
);

export default router;

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

router.get(
  '/me/:id',
  authenticate,
  requireType('user'),
  ApplicationController.getMyApplication,
);

// GET /applications/company — candidaturas da empresa (agregado)
router.get(
  '/company',
  authenticate,
  requireType('company'),
  ApplicationController.listCompanyApplications,
);

// GET /applications/:id — detalhe da candidatura (empresa)
router.get(
  '/:id',
  authenticate,
  requireType('company'),
  ApplicationController.getCompanyApplication,
);

// PATCH /applications/:id/status — empresa altera status
router.patch(
  '/:id/status',
  authenticate,
  requireType('company'),
  ApplicationController.updateApplicationStatus,
);

// PATCH /applications/:id/confirm-completion — empresa ou freelancer confirma conclusão
router.patch(
  '/:id/confirm-completion',
  authenticate,
  ApplicationController.confirmApplicationCompletion,
);

// PATCH /applications/:id/cancel — freelancer cancela candidatura
router.patch(
  '/:id/cancel',
  authenticate,
  requireType('user'),
  ApplicationController.cancelApplication,
);

export default router;

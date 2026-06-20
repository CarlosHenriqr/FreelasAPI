import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as PlanController from './plan.controller';

const router = Router();

router.get('/', PlanController.listPlans);
router.get('/me', authenticate, PlanController.getMyPlan);
router.post('/mock-upgrade', authenticate, PlanController.mockUpgrade);
router.post('/cancel', authenticate, PlanController.cancelSubscription);

export default router;

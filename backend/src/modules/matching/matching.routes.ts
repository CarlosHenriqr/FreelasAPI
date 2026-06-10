import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as MatchingController from './matching.controller';

const router = Router();

router.use(authenticate);

router.get('/jobs', MatchingController.getRecommendedJobs);
router.get('/jobs/:jobId/candidates', MatchingController.getRecommendedCandidates);
router.post(
  '/jobs/:jobId/candidates/:userId/interest',
  MatchingController.expressHiringInterest,
);

export default router;

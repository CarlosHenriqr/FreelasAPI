import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as ReviewController from './review.controller';

const router = Router();

router.use(authenticate);

router.post('/', ReviewController.createReview);
router.get('/received', ReviewController.listReceivedReviews);
router.get('/summary', ReviewController.getReviewSummary);

export default router;

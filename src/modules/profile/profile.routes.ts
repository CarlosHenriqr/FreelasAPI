import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as ProfileController from './profile.controller';

const router = Router();

router.use(authenticate);

router.get('/me', ProfileController.getUserProfile);
router.patch('/user/me', ProfileController.updateUserProfile);
router.put('/user/me/resume', ProfileController.updateUserResume);
router.delete('/user/me/resume', ProfileController.deleteUserResume);
router.patch('/user/me/tech-stack', ProfileController.updateTechStack);
router.patch('/company/me', ProfileController.updateCompanyProfile);

export default router;

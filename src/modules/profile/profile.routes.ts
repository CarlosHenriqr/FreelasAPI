import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as ProfileController from './profile.controller';

const router = Router();

router.use(authenticate);

router.get('/me', ProfileController.getUserProfile);
router.put('/me', ProfileController.updateMe);
router.put('/me/password', ProfileController.changePassword);
router.patch('/user/me', ProfileController.updateUserProfile);
router.put('/user/me/resume', ProfileController.updateUserResume);
router.delete('/user/me/resume', ProfileController.deleteUserResume);
router.patch('/user/me/tech-stack', ProfileController.updateTechStack);
router.patch('/company/me', ProfileController.updateCompanyProfile);

// ─── Experiências (somente freelancer) ─────────────────────────────────────────
router.get('/me/experiences', ProfileController.listExperiences);
router.post('/me/experiences', ProfileController.createExperience);
router.put('/me/experiences/:id', ProfileController.updateExperience);
router.delete('/me/experiences/:id', ProfileController.deleteExperience);

// ─── Portfólio em destaque (somente freelancer) ───────────────────────────────
router.get('/me/portfolio', ProfileController.listPortfolio);
router.post('/me/portfolio', ProfileController.createPortfolioItem);
router.put('/me/portfolio/:id', ProfileController.updatePortfolioItem);
router.delete('/me/portfolio/:id', ProfileController.deletePortfolioItem);

export default router;

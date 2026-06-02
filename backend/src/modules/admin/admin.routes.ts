import { Router } from 'express';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import * as AdminController from './admin.controller';

const router = Router();

router.use(authenticate, requireRole('admin'));

router.get('/users', AdminController.listUsers);
router.patch('/users/:id/block', AdminController.blockUser);
router.patch('/users/:id/unblock', AdminController.unblockUser);
router.get('/jobs', AdminController.listJobs);
router.patch('/jobs/:id/moderate-remove', AdminController.moderateRemoveJob);

export default router;

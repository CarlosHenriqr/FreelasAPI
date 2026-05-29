import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as NotificationController from './notification.controller';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.listNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markNotificationAsRead);

export default router;

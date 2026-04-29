import { Router } from 'express';
import { authenticate, requireType } from '../../middlewares/auth.middleware';
import * as TechnologyController from './technology.controller';

const router = Router();

router.get('/', TechnologyController.listTechnologies);

router.post('/', authenticate, requireType('company'), TechnologyController.createTechnology);

export default router;

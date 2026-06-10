import { Router } from 'express';
import { authenticate, requireType } from '../../middlewares/auth.middleware';
import * as JobController from './job.controller';

const router = Router();

// GET /vagas?search=...&active=true|false
router.get('/', JobController.listJobs);

// GET /vagas/me — vagas da empresa logada
router.get('/me', authenticate, requireType('company'), JobController.listMyJobs);

// POST /vagas (somente empresa)
router.post('/', authenticate, requireType('company'), JobController.createJob);

// GET /vagas/:id
router.get('/:id', JobController.getJob);

// PUT /vagas/:id (somente empresa)
router.put('/:id', authenticate, requireType('company'), JobController.updateJob);

// PATCH /vagas/:id/status (somente empresa)
router.patch('/:id/status', authenticate, requireType('company'), JobController.updateJobStatus);

// DELETE /vagas/:id (somente empresa)
router.delete('/:id', authenticate, requireType('company'), JobController.deleteJob);

// POST /vagas/:id/apply (somente usuário)
router.post('/:id/apply', authenticate, requireType('user'), JobController.applyToJob);

// GET /vagas/:id/applications (somente empresa)
router.get('/:id/applications', authenticate, requireType('company'), JobController.getJobApplications);

// GET /vagas/:id/candidates (somente empresa)
router.get('/:id/candidates', authenticate, requireType('company'), JobController.getJobCandidates);

// GET /vagas/:id/messages (somente empresa)
router.get('/:id/messages', authenticate, requireType('company'), JobController.getJobMessages);



export default router;


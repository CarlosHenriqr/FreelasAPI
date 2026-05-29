import { Router } from 'express';
import * as AuthController from './auth.controller';
import {
  loginRateLimiter,
  registerRateLimiter,
  refreshRateLimiter,
  passwordResetRateLimiter,
} from '../../middlewares/rateLimiter.middleware';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

/**
 * @route  POST /auth/register/user
 * @desc   Cadastra um novo freelancer (CPF)
 * @access Público
 */
router.post('/register/user', registerRateLimiter, AuthController.registerUser);

/**
 * @route  POST /auth/register/company
 * @desc   Cadastra uma nova empresa (CNPJ)
 * @access Público
 */
router.post('/register/company', registerRateLimiter, AuthController.registerCompany);

/**
 * @route  POST /auth/login
 * @desc   Autentica usuário ou empresa — retorna access + refresh tokens
 * @body   { email, password, type: "user" | "company" }
 * @access Público
 */
router.post('/login', loginRateLimiter, AuthController.login);

/**
 * @route  POST /auth/refresh
 * @desc   Gera novo par de tokens (rotate refresh token)
 * @body   { refreshToken }
 * @access Público (valida o refresh token internamente)
 */
router.post('/refresh', refreshRateLimiter, AuthController.refresh);

/**
 * @route  POST /auth/logout
 * @desc   Revoga o refresh token no banco
 * @body   { refreshToken }
 * @access Privado (requer access token válido)
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * @route  POST /auth/password/forgot
 * @desc   Solicita código de recuperação por e-mail
 * @body   { email }
 * @access Público
 */
router.post('/password/forgot', passwordResetRateLimiter, AuthController.requestPasswordReset);

/**
 * @route  POST /auth/password/verify-code
 * @desc   Valida o código de recuperação
 * @body   { email, code }
 * @access Público
 */
router.post('/password/verify-code', passwordResetRateLimiter, AuthController.verifyPasswordResetCode);

/**
 * @route  POST /auth/password/reset
 * @desc   Altera a senha usando código validado
 * @body   { email, code, newPassword, confirmNewPassword }
 * @access Público
 */
router.post('/password/reset', passwordResetRateLimiter, AuthController.resetPasswordWithCode);

export default router;
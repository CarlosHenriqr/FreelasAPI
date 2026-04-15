import { Request, Response, NextFunction } from 'express';
import {
  registerUserSchema,
  registerCompanySchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from './auth.schema';
import * as AuthService from './auth.service';

// POST /auth/register/user
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = registerUserSchema.parse(req.body);
    const result = await AuthService.registerUser(dto);

    res.status(201).json({
      status: 'success',
      message: 'Freelancer cadastrado com sucesso.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/register/company
export async function registerCompany(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = registerCompanySchema.parse(req.body);
    const result = await AuthService.registerCompany(dto);

    res.status(201).json({
      status: 'success',
      message: 'Empresa cadastrada com sucesso.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/login
export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = loginSchema.parse(req.body);
    const result = await AuthService.login(dto);

    res.status(200).json({
      status: 'success',
      message: 'Login realizado com sucesso.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/refresh
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = refreshTokenSchema.parse(req.body);
    const tokens = await AuthService.refreshTokens(dto);

    res.status(200).json({
      status: 'success',
      data: tokens,
    });
  } catch (err) {
    next(err);
  }
}

// POST /auth/logout
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const dto = logoutSchema.parse(req.body);
    await AuthService.logout(dto);

    res.status(200).json({
      status: 'success',
      message: 'Logout realizado com sucesso.',
    });
  } catch (err) {
    next(err);
  }
}
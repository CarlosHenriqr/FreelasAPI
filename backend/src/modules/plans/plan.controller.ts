import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../middlewares/errorHandler.middleware';
import { listPlansQuerySchema, mockUpgradeSchema } from './plan.schema';
import * as PlanService from './plan.service';

export async function getMyPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) {
      return next(new AppError(401, 'Não autenticado.', 'UNAUTHORIZED'));
    }

    const data =
      req.auth.type === 'company'
        ? await PlanService.getPlanMeForCompany(req.auth.sub)
        : await PlanService.getPlanMeForUser(req.auth.sub);

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

export async function mockUpgrade(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.auth) {
      return next(new AppError(401, 'Não autenticado.', 'UNAUTHORIZED'));
    }

    const dto = mockUpgradeSchema.parse(req.body);
    const audience = req.auth.type === 'company' ? 'COMPANY' : 'USER';
    const data = await PlanService.mockUpgrade(audience, req.auth.sub, dto.targetCode);

    res.status(200).json({
      status: 'success',
      message: 'Plano atualizado (simulação — sem cobrança).',
      data,
    });
  } catch (err) {
    next(err);
  }
}

export async function listPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = listPlansQuerySchema.parse(req.query);
    const audiences = query.audience ? [query.audience] : (['USER', 'COMPANY'] as const);

    const data = await Promise.all(
      audiences.map(async (audience) => ({
        audience,
        plans: await PlanService.listPublicPlans(audience),
      })),
    );

    res.status(200).json({ status: 'success', data });
  } catch (err) {
    next(err);
  }
}

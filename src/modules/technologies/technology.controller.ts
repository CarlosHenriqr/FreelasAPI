import { Request, Response, NextFunction } from 'express';
import * as TechnologyService from './technology.service';
import { createTechnologySchema } from './technology.schema';

export async function listTechnologies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search } = req.query;
    const technologies = await TechnologyService.listTechnologies(
      typeof search === 'string' ? search : undefined,
    );

    res.status(200).json({ status: 'success', data: technologies });
  } catch (err) {
    next(err);
  }
}

export async function createTechnology(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createTechnologySchema.parse(req.body);
    const technology = await TechnologyService.createTechnology(dto);

    res.status(201).json({ status: 'success', message: 'Tecnologia cadastrada com sucesso.', data: technology });
  } catch (err) {
    next(err);
  }
}

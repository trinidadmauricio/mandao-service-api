/**
 * Controller para Categories
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateCategoryUseCase } from '../../application/use-cases/CreateCategoryUseCase';
import { GetCategoryUseCase } from '../../application/use-cases/GetCategoryUseCase';
import { ListCategoriesUseCase } from '../../application/use-cases/ListCategoriesUseCase';
import { UpdateCategoryUseCase } from '../../application/use-cases/UpdateCategoryUseCase';
import { DeleteCategoryUseCase } from '../../application/use-cases/DeleteCategoryUseCase';
import { createCategorySchema, updateCategorySchema } from '../../application/dto/CreateCategoryDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CategoryController {
  constructor(
    @inject(TYPES.CreateCategoryUseCase) private createUseCase: CreateCategoryUseCase,
    @inject(TYPES.GetCategoryUseCase) private getUseCase: GetCategoryUseCase,
    @inject(TYPES.ListCategoriesUseCase) private listUseCase: ListCategoriesUseCase,
    @inject(TYPES.UpdateCategoryUseCase) private updateUseCase: UpdateCategoryUseCase,
    @inject(TYPES.DeleteCategoryUseCase) private deleteUseCase: DeleteCategoryUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createCategorySchema.parse({
        ...req.body,
        tenant_id: req.tenant?.id || req.body.tenant_id,
      });
      const category = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      logger.error('Error creating category', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const category = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      logger.error('Error getting category', { error });
      if (error instanceof Error && error.message === 'Category not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      const parent_id = req.query.parent_id as string | undefined;
      const categories = await this.listUseCase.execute(tenant_id, parent_id || null);

      res.status(200).json({
        status: 'success',
        data: categories,
      });
    } catch (error) {
      logger.error('Error listing categories', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateCategorySchema.parse(req.body);
      const category = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      logger.error('Error updating category', { error });
      if (error instanceof Error && error.message === 'Category not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting category', { error });
      if (error instanceof Error && error.message === 'Category not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


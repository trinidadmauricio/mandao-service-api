/**
 * Controller para Brands
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateBrandUseCase } from '../../application/use-cases/CreateBrandUseCase';
import { GetBrandUseCase } from '../../application/use-cases/GetBrandUseCase';
import { ListBrandsUseCase } from '../../application/use-cases/ListBrandsUseCase';
import { UpdateBrandUseCase } from '../../application/use-cases/UpdateBrandUseCase';
import { DeleteBrandUseCase } from '../../application/use-cases/DeleteBrandUseCase';
import { createBrandSchema, updateBrandSchema } from '../../application/dto/CreateBrandDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class BrandController {
  constructor(
    @inject(TYPES.CreateBrandUseCase) private createUseCase: CreateBrandUseCase,
    @inject(TYPES.GetBrandUseCase) private getUseCase: GetBrandUseCase,
    @inject(TYPES.ListBrandsUseCase) private listUseCase: ListBrandsUseCase,
    @inject(TYPES.UpdateBrandUseCase) private updateUseCase: UpdateBrandUseCase,
    @inject(TYPES.DeleteBrandUseCase) private deleteUseCase: DeleteBrandUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createBrandSchema.parse({
        ...req.body,
        tenant_id: req.tenant?.id || req.body.tenant_id,
      });
      const brand = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: brand,
      });
    } catch (error) {
      logger.error('Error creating brand', { error });
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
      const brand = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: brand,
      });
    } catch (error) {
      logger.error('Error getting brand', { error });
      if (error instanceof Error && error.message === 'Brand not found') {
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
      const brands = await this.listUseCase.execute(tenant_id);

      res.status(200).json({
        status: 'success',
        data: brands,
      });
    } catch (error) {
      logger.error('Error listing brands', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateBrandSchema.parse(req.body);
      const brand = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: brand,
      });
    } catch (error) {
      logger.error('Error updating brand', { error });
      if (error instanceof Error && error.message === 'Brand not found') {
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
      logger.error('Error deleting brand', { error });
      if (error instanceof Error && error.message === 'Brand not found') {
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


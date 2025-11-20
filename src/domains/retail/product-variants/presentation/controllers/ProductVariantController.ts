/**
 * Controller para ProductVariants
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateProductVariantUseCase } from '../../application/use-cases/CreateProductVariantUseCase';
import { GetProductVariantUseCase } from '../../application/use-cases/GetProductVariantUseCase';
import { ListProductVariantsUseCase } from '../../application/use-cases/ListProductVariantsUseCase';
import { UpdateProductVariantUseCase } from '../../application/use-cases/UpdateProductVariantUseCase';
import { DeleteProductVariantUseCase } from '../../application/use-cases/DeleteProductVariantUseCase';
import {
  createProductVariantSchema,
  updateProductVariantSchema,
} from '../../application/dto/CreateProductVariantDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ProductVariantController {
  constructor(
    @inject(TYPES.CreateProductVariantUseCase) private createUseCase: CreateProductVariantUseCase,
    @inject(TYPES.GetProductVariantUseCase) private getUseCase: GetProductVariantUseCase,
    @inject(TYPES.ListProductVariantsUseCase) private listUseCase: ListProductVariantsUseCase,
    @inject(TYPES.UpdateProductVariantUseCase) private updateUseCase: UpdateProductVariantUseCase,
    @inject(TYPES.DeleteProductVariantUseCase) private deleteUseCase: DeleteProductVariantUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createProductVariantSchema.parse({
        ...req.body,
        tenant_id: req.tenant?.id || req.body.tenant_id,
      });
      const variant = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(variant),
      });
    } catch (error) {
      logger.error('Error creating product variant', { error });
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
      const variant = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(variant),
      });
    } catch (error) {
      logger.error('Error getting product variant', { error });
      if (error instanceof Error && error.message === 'Product variant not found') {
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
      const product_id = req.query.product_id as string | undefined;
      const variants = await this.listUseCase.execute(tenant_id, product_id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(variants),
      });
    } catch (error) {
      logger.error('Error listing product variants', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateProductVariantSchema.parse(req.body);
      const variant = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(variant),
      });
    } catch (error) {
      logger.error('Error updating product variant', { error });
      if (error instanceof Error && error.message === 'Product variant not found') {
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
      logger.error('Error deleting product variant', { error });
      if (error instanceof Error && error.message === 'Product variant not found') {
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


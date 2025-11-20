/**
 * Controller para Products
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateProductUseCase } from '../../application/use-cases/CreateProductUseCase';
import { GetProductUseCase } from '../../application/use-cases/GetProductUseCase';
import { ListProductsUseCase } from '../../application/use-cases/ListProductsUseCase';
import { UpdateProductUseCase } from '../../application/use-cases/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../application/use-cases/DeleteProductUseCase';
import { createProductSchema, updateProductSchema } from '../../application/dto/CreateProductDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ProductController {
  constructor(
    @inject(TYPES.CreateProductUseCase) private createUseCase: CreateProductUseCase,
    @inject(TYPES.GetProductUseCase) private getUseCase: GetProductUseCase,
    @inject(TYPES.ListProductsUseCase) private listUseCase: ListProductsUseCase,
    @inject(TYPES.UpdateProductUseCase) private updateUseCase: UpdateProductUseCase,
    @inject(TYPES.DeleteProductUseCase) private deleteUseCase: DeleteProductUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createProductSchema.parse({
        ...req.body,
        tenant_id: req.tenant?.id || req.body.tenant_id,
      });
      const product = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(product),
      });
    } catch (error) {
      logger.error('Error creating product', { error });
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
      const product = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(product),
      });
    } catch (error) {
      logger.error('Error getting product', { error });
      if (error instanceof Error && error.message === 'Product not found') {
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
      const category_id = req.query.category_id as string | undefined;
      const is_active = req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined;
      const products = await this.listUseCase.execute(tenant_id, category_id, is_active);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(products),
      });
    } catch (error) {
      logger.error('Error listing products', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateProductSchema.parse(req.body);
      const product = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(product),
      });
    } catch (error) {
      logger.error('Error updating product', { error });
      if (error instanceof Error && error.message === 'Product not found') {
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
      logger.error('Error deleting product', { error });
      if (error instanceof Error && error.message === 'Product not found') {
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


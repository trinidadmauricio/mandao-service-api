/**
 * Controller para Storefront API
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { ListStorefrontProductsUseCase } from '../../application/use-cases/ListStorefrontProductsUseCase';
import { GetStorefrontProductUseCase } from '../../application/use-cases/GetStorefrontProductUseCase';
import { CheckoutUseCase } from '../../application/use-cases/CheckoutUseCase';
import { checkoutSchema } from '../../application/dto/CheckoutDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class StorefrontController {
  constructor(
    @inject(TYPES.ListStorefrontProductsUseCase) private listProductsUseCase: ListStorefrontProductsUseCase,
    @inject(TYPES.GetStorefrontProductUseCase) private getProductUseCase: GetStorefrontProductUseCase,
    @inject(TYPES.CheckoutUseCase) private checkoutUseCase: CheckoutUseCase
  ) {}

  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const category_id = req.query.category_id as string | undefined;
      const is_active = req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined;
      const locale = (req.query.locale as string) || req.locale || 'es';
      const currency = (req.query.currency as string) || req.currency || 'USD';
      const page = req.query.page ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const products = await this.listProductsUseCase.execute({
        tenant_id,
        category_id,
        is_active,
        locale,
        currency,
        page,
        limit,
      });

      res.status(200).json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      logger.error('Error listing storefront products', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getProduct(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const { id } = req.params;
      const locale = (req.query.locale as string) || req.locale || 'es';
      const currency = (req.query.currency as string) || req.currency || 'USD';

      const product = await this.getProductUseCase.execute({
        product_id: id,
        tenant_id,
        locale,
        currency,
      });

      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      logger.error('Error getting storefront product', { error });
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

  async checkout(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      const user_id = req.user?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      if (!user_id) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const dto = checkoutSchema.parse({
        ...req.body,
        tenant_id,
        currency: req.body.currency || req.currency || undefined,
        locale: req.body.locale || req.locale || undefined,
      });

      const result = await this.checkoutUseCase.execute(dto, user_id);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error in checkout', { error });
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
}


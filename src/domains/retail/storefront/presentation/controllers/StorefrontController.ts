/**
 * Controller para Storefront API
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { ListStorefrontProductsUseCase } from '../../application/use-cases/ListStorefrontProductsUseCase';
import { GetStorefrontProductUseCase } from '../../application/use-cases/GetStorefrontProductUseCase';
import { GetStorefrontConfigUseCase } from '../../application/use-cases/GetStorefrontConfigUseCase';
import { ListStorefrontCategoriesUseCase } from '../../application/use-cases/ListStorefrontCategoriesUseCase';
import { GetStorefrontCategoryBySlugUseCase } from '../../application/use-cases/GetStorefrontCategoryBySlugUseCase';
import { ListStorefrontBrandsUseCase } from '../../application/use-cases/ListStorefrontBrandsUseCase';
import { SearchStorefrontUseCase } from '../../application/use-cases/SearchStorefrontUseCase';
import { CheckoutUseCase } from '../../application/use-cases/CheckoutUseCase';
import { checkoutSchema } from '../../application/dto/CheckoutDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class StorefrontController {
  constructor(
    @inject(TYPES.ListStorefrontProductsUseCase) private listProductsUseCase: ListStorefrontProductsUseCase,
    @inject(TYPES.GetStorefrontProductUseCase) private getProductUseCase: GetStorefrontProductUseCase,
    @inject(TYPES.GetStorefrontConfigUseCase) private getConfigUseCase: GetStorefrontConfigUseCase,
    @inject(TYPES.ListStorefrontCategoriesUseCase) private listCategoriesUseCase: ListStorefrontCategoriesUseCase,
    @inject(TYPES.GetStorefrontCategoryBySlugUseCase) private getCategoryBySlugUseCase: GetStorefrontCategoryBySlugUseCase,
    @inject(TYPES.ListStorefrontBrandsUseCase) private listBrandsUseCase: ListStorefrontBrandsUseCase,
    @inject(TYPES.SearchStorefrontUseCase) private searchUseCase: SearchStorefrontUseCase,
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

  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      // Intentar obtener tenant_id de múltiples fuentes
      let tenant_id = req.tenant?.id;
      
      // Si no hay tenant del middleware, intentar desde header X-Subdomain
      if (!tenant_id) {
        const subdomain = req.headers['x-subdomain'] as string;
        if (subdomain) {
          // Buscar storefront por subdomain y obtener tenant_id
          const storefront = await this.prisma.storefront.findUnique({
            where: { subdomain },
            select: { tenant_id: true },
          });
          if (storefront) {
            tenant_id = storefront.tenant_id;
          }
        }
      }
      
      // Si aún no hay tenant_id, intentar desde header X-Tenant-Id
      if (!tenant_id) {
        tenant_id = req.headers['x-tenant-id'] as string;
      }
      
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found. Please provide X-Tenant-Id header or X-Subdomain header.',
        });
        return;
      }

      const config = await this.getConfigUseCase.execute({
        tenant_id,
      });

      res.status(200).json({
        status: 'success',
        data: config,
      });
    } catch (error) {
      logger.error('Error getting storefront config', { error });
      if (error instanceof Error) {
        const statusCode = error.message.includes('not found') ? 404 : 500;
        res.status(statusCode).json({
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

  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const include_children = req.query.include_children === 'true' || req.query.include_children === undefined;

      const categories = await this.listCategoriesUseCase.execute({
        tenant_id,
        include_children,
      });

      res.status(200).json({
        status: 'success',
        data: categories,
      });
    } catch (error) {
      logger.error('Error listing storefront categories', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getCategoryBySlug(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const { slug } = req.params;

      const category = await this.getCategoryBySlugUseCase.execute({
        tenant_id,
        slug,
      });

      res.status(200).json({
        status: 'success',
        data: category,
      });
    } catch (error) {
      logger.error('Error getting storefront category', { error });
      if (error instanceof Error) {
        const statusCode = error.message.includes('not found') || error.message.includes('not active') ? 404 : 500;
        res.status(statusCode).json({
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

  async listBrands(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const brands = await this.listBrandsUseCase.execute({
        tenant_id,
      });

      res.status(200).json({
        status: 'success',
        data: brands,
      });
    } catch (error) {
      logger.error('Error listing storefront brands', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async search(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const query = (req.query.q as string) || '';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const results = await this.searchUseCase.execute(tenant_id, query, limit);

      res.status(200).json({
        status: 'success',
        data: results,
      });
    } catch (error) {
      logger.error('Error searching storefront', { error });
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


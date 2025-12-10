/**
 * Controller para Wishlist
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { GetWishlistUseCase } from '../../application/use-cases/GetWishlistUseCase';
import { AddToWishlistUseCase } from '../../application/use-cases/AddToWishlistUseCase';
import { RemoveFromWishlistUseCase } from '../../application/use-cases/RemoveFromWishlistUseCase';
import { addToWishlistSchema } from '../../application/dto/AddToWishlistDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';
import { PrismaClient } from '@prisma/client';

@injectable()
export class WishlistController {
  constructor(
    @inject(TYPES.GetWishlistUseCase) private getWishlistUseCase: GetWishlistUseCase,
    @inject(TYPES.AddToWishlistUseCase) private addToWishlistUseCase: AddToWishlistUseCase,
    @inject(TYPES.RemoveFromWishlistUseCase)
    private removeFromWishlistUseCase: RemoveFromWishlistUseCase,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const items = await this.getWishlistUseCase.execute(req.tenant.id, req.user.id);

      // Obtener información de productos
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await this.prisma.product.findUnique({
            where: { id: item.product_id },
            include: {
              category: true,
              brand: true,
            },
          });

          return {
            id: item.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            product: product
              ? {
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  selling_price: product.selling_price,
                  compare_at_price: product.compare_at_price,
                  currency: product.currency,
                  featured_image_url: product.featured_image_url,
                  is_featured: product.is_featured,
                  category: product.category
                    ? {
                        id: product.category.id,
                        name: product.category.name,
                        slug: product.category.slug,
                      }
                    : null,
                  brand: product.brand
                    ? {
                        id: product.brand.id,
                        name: product.brand.name,
                        slug: product.brand.slug,
                      }
                    : null,
                }
              : null,
            created_at: item.created_at,
          };
        })
      );

      res.status(200).json({
        status: 'success',
        data: itemsWithProducts,
      });
    } catch (error) {
      logger.error('Error listing wishlist', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async add(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const dto = addToWishlistSchema.parse(req.body);
      const item = await this.addToWishlistUseCase.execute(req.tenant.id, req.user.id, dto);

      // Obtener información del producto
      const product = await this.prisma.product.findUnique({
        where: { id: item.product_id },
        include: {
          category: true,
          brand: true,
        },
      });

      res.status(201).json({
        status: 'success',
        data: {
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          product: product
            ? {
                id: product.id,
                name: product.name,
                description: product.description,
                selling_price: product.selling_price,
                compare_at_price: product.compare_at_price,
                currency: product.currency,
                featured_image_url: product.featured_image_url,
                is_featured: product.is_featured,
                category: product.category
                  ? {
                      id: product.category.id,
                      name: product.category.name,
                      slug: product.category.slug,
                    }
                  : null,
                brand: product.brand
                  ? {
                      id: product.brand.id,
                      name: product.brand.name,
                      slug: product.brand.slug,
                    }
                  : null,
              }
            : null,
          created_at: item.created_at,
        },
      });
    } catch (error) {
      logger.error('Error adding to wishlist', { error });
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: (error as any).errors,
        });
        return;
      }
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

  async remove(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const { product_id } = req.params;
      const variant_id = req.query.variant_id ? (req.query.variant_id as string) : undefined;

      await this.removeFromWishlistUseCase.execute(
        req.tenant.id,
        req.user.id,
        product_id,
        variant_id
      );

      res.status(204).send();
    } catch (error) {
      logger.error('Error removing from wishlist', { error });
      if (error instanceof Error && error.message === 'Wishlist item not found') {
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


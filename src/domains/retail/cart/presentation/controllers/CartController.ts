/**
 * Controller para Cart API
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { GetCartUseCase } from '../../application/use-cases/GetCartUseCase';
import { AddCartItemUseCase } from '../../application/use-cases/AddCartItemUseCase';
import { UpdateCartItemUseCase } from '../../application/use-cases/UpdateCartItemUseCase';
import { RemoveCartItemUseCase } from '../../application/use-cases/RemoveCartItemUseCase';
import { ClearCartUseCase } from '../../application/use-cases/ClearCartUseCase';
import { ApplyCouponUseCase } from '../../application/use-cases/ApplyCouponUseCase';
import { RemoveCouponUseCase } from '../../application/use-cases/RemoveCouponUseCase';
import { addCartItemSchema } from '../../application/dto/AddCartItemDto';
import { updateCartItemSchema } from '../../application/dto/UpdateCartItemDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';
import { Cart } from '../../domain/entities/Cart';

@injectable()
export class CartController {
  constructor(
    @inject(TYPES.GetCartUseCase) private getCartUseCase: GetCartUseCase,
    @inject(TYPES.AddCartItemUseCase) private addCartItemUseCase: AddCartItemUseCase,
    @inject(TYPES.UpdateCartItemUseCase) private updateCartItemUseCase: UpdateCartItemUseCase,
    @inject(TYPES.RemoveCartItemUseCase) private removeCartItemUseCase: RemoveCartItemUseCase,
    @inject(TYPES.ClearCartUseCase) private clearCartUseCase: ClearCartUseCase,
    @inject(TYPES.ApplyCouponUseCase) private applyCouponUseCase: ApplyCouponUseCase,
    @inject(TYPES.RemoveCouponUseCase) private removeCouponUseCase: RemoveCouponUseCase
  ) {}

  private mapCartToResponse(cart: Cart) {
    return {
      id: cart.id,
      items: cart.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
      subtotal: cart.calculateSubtotal(),
      total_items: cart.getTotalItems(),
      coupon_code: cart.coupon_code,
    };
  }

  private getErrorStatusCode(error: Error): number {
    if (error.message.includes('not found') || error.message.includes('not active')) {
      return 404;
    }
    if (error.message.includes('Insufficient stock')) {
      return 400;
    }
    if (error.message.includes('belongs to different tenant')) {
      return 403;
    }
    return 400;
  }

  async getCart(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const customer_id = req.user?.id || null;
      const session_id = req.headers['x-session-id'] as string | undefined;

      const cart = await this.getCartUseCase.execute({
        tenant_id,
        customer_id,
        session_id: session_id || null,
      });

      if (!cart) {
        res.status(200).json({
          status: 'success',
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: this.mapCartToResponse(cart),
      });
    } catch (error) {
      logger.error('Error getting cart', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const customer_id = req.user?.id || null;
      const session_id = req.headers['x-session-id'] as string | undefined;

      const dto = addCartItemSchema.parse(req.body);

      const cart = await this.addCartItemUseCase.execute({
        tenant_id,
        customer_id,
        session_id: session_id || null,
        item: dto,
      });

      res.status(200).json({
        status: 'success',
        data: this.mapCartToResponse(cart),
      });
    } catch (error) {
      logger.error('Error adding cart item', { error });
      if (error instanceof Error) {
        res.status(this.getErrorStatusCode(error)).json({
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

  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const { item_id } = req.params;
      const dto = updateCartItemSchema.parse(req.body);

      const cart = await this.updateCartItemUseCase.execute({
        tenant_id,
        item_id,
        data: dto,
      });

      res.status(200).json({
        status: 'success',
        data: this.mapCartToResponse(cart),
      });
    } catch (error) {
      logger.error('Error updating cart item', { error });
      if (error instanceof Error) {
        res.status(this.getErrorStatusCode(error)).json({
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

  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const { item_id } = req.params;

      const cart = await this.removeCartItemUseCase.execute({
        tenant_id,
        item_id,
      });

      res.status(200).json({
        status: 'success',
        data: this.mapCartToResponse(cart),
      });
    } catch (error) {
      logger.error('Error removing cart item', { error });
      if (error instanceof Error) {
        const statusCode = error.message.includes('not found') ? 404 : 400;
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

  async clearCart(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const customer_id = req.user?.id || null;
      const session_id = req.headers['x-session-id'] as string | undefined;

      await this.clearCartUseCase.execute({
        tenant_id,
        customer_id,
        session_id: session_id || null,
      });

      res.status(200).json({
        status: 'success',
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      logger.error('Error clearing cart', { error });
      if (error instanceof Error) {
        const statusCode = error.message.includes('not found') ? 404 : 400;
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

  async applyCoupon(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const customer_id = req.user?.id || null;
      const session_id = req.headers['x-session-id'] as string | undefined;
      const { coupon_code } = req.body;

      if (!coupon_code || typeof coupon_code !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Coupon code is required',
        });
        return;
      }

      const cart = await this.applyCouponUseCase.execute({
        tenant_id,
        customer_id,
        session_id,
        coupon_code,
      });

      res.status(200).json({
        status: 'success',
        data: this.mapCartToResponse(cart),
      });
    } catch (error: any) {
      logger.error('Error applying coupon to cart', { error });
      const statusCode = this.getErrorStatusCode(error);
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Internal server error',
      });
    }
  }

  async removeCoupon(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const customer_id = req.user?.id || null;
      const session_id = req.headers['x-session-id'] as string | undefined;

      const cart = await this.removeCouponUseCase.execute({
        tenant_id,
        customer_id,
        session_id,
      });

      res.status(200).json({
        status: 'success',
        data: this.mapCartToResponse(cart),
      });
    } catch (error: any) {
      logger.error('Error removing coupon from cart', { error });
      const statusCode = this.getErrorStatusCode(error);
      res.status(statusCode).json({
        status: 'error',
        message: error.message || 'Internal server error',
      });
    }
  }
}


/**
 * Controller para Orders
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateOnDemandOrderUseCase } from '../../application/use-cases/CreateOnDemandOrderUseCase';
import { CreateRetailOrderUseCase } from '../../application/use-cases/CreateRetailOrderUseCase';
import { GetOrderUseCase } from '../../application/use-cases/GetOrderUseCase';
import { ListOrdersUseCase } from '../../application/use-cases/ListOrdersUseCase';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/UpdateOrderStatusUseCase';
import { AssignDriverUseCase } from '../../application/use-cases/AssignDriverUseCase';
import { ChangeBranchUseCase } from '../../application/use-cases/ChangeBranchUseCase';
import { ModifyItemsUseCase } from '../../application/use-cases/ModifyItemsUseCase';
import { RecalculateTotalsUseCase } from '../../application/use-cases/RecalculateTotalsUseCase';
import { AddDeliveryProofUseCase } from '../../application/use-cases/AddDeliveryProofUseCase';
import { AddDeliveryRatingUseCase } from '../../application/use-cases/AddDeliveryRatingUseCase';
import { createOnDemandOrderSchema } from '../../application/dto/CreateOnDemandOrderDto';
import {
  updateOrderStatusSchema,
  assignDriverSchema,
  changeBranchSchema,
  modifyItemsSchema,
  recalculateTotalsSchema,
  addDeliveryProofSchema,
  addDeliveryRatingSchema,
} from '../../application/dto/OrderDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class OrderController {
  constructor(
    @inject(TYPES.CreateOnDemandOrderUseCase) private createOnDemandOrderUseCase: CreateOnDemandOrderUseCase,
    @inject(TYPES.CreateRetailOrderUseCase) private createRetailOrderUseCase: CreateRetailOrderUseCase,
    @inject(TYPES.GetOrderUseCase) private getOrderUseCase: GetOrderUseCase,
    @inject(TYPES.ListOrdersUseCase) private listOrdersUseCase: ListOrdersUseCase,
    @inject(TYPES.UpdateOrderStatusUseCase) private updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    @inject(TYPES.AssignDriverUseCase) private assignDriverUseCase: AssignDriverUseCase,
    @inject(TYPES.ChangeBranchUseCase) private changeBranchUseCase: ChangeBranchUseCase,
    @inject(TYPES.ModifyItemsUseCase) private modifyItemsUseCase: ModifyItemsUseCase,
    @inject(TYPES.RecalculateTotalsUseCase) private recalculateTotalsUseCase: RecalculateTotalsUseCase,
    @inject(TYPES.AddDeliveryProofUseCase) private addDeliveryProofUseCase: AddDeliveryProofUseCase,
    @inject(TYPES.AddDeliveryRatingUseCase) private addDeliveryRatingUseCase: AddDeliveryRatingUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const status = req.query.status as string | undefined;
      
      // Si el usuario es LOGISTICS_PROVIDER, filtrar por su logistics_provider_id
      const logistics_provider_id = req.user?.role === 'LOGISTICS_PROVIDER' 
        ? req.user.logistics_provider_id || undefined
        : undefined;

      const orders = await this.listOrdersUseCase.execute(tenant_id, status, logistics_provider_id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(orders),
      });
    } catch (error) {
      logger.error('Error listing orders', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.getOrderUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(order),
      });
    } catch (error) {
      logger.error('Error getting order', { error });
      if (error instanceof Error && error.message === 'Order not found') {
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

  async createOnDemand(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = createOnDemandOrderSchema.parse({
        ...req.body,
        tenant_id,
      });

      const result = await this.createOnDemandOrderUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse({
          order: result.order,
          order_number: result.order_number,
          order_display_number: result.order_display_number,
          tracking_code: result.tracking_code,
        }),
      });
    } catch (error) {
      logger.error('Error creating on-demand order', { error });
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

  async createRetail(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      // El DTO de CreateRetailOrder viene del contrato compartido
      const dto = {
        ...req.body,
        tenant_id,
      };

      const result = await this.createRetailOrderUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(result),
      });
    } catch (error) {
      logger.error('Error creating retail order', { error });
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

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;
      const user_id = req.user?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = updateOrderStatusSchema.parse(req.body);
      await this.updateOrderStatusUseCase.execute({
        order_id: id,
        to_status: body.to_status,
        changed_by_user_id: user_id,
        notes: body.notes,
        cancellation_reason: body.cancellation_reason,
      });

      res.status(200).json({
        status: 'success',
        message: 'Order status updated successfully',
      });
    } catch (error) {
      logger.error('Error updating order status', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async assignDriver(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;
      const user_id = req.user?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = assignDriverSchema.parse(req.body);
      await this.assignDriverUseCase.execute({
        order_id: id,
        driver_id: body.driver_id,
        assigned_by_user_id: user_id,
      });

      res.status(200).json({
        status: 'success',
        message: 'Driver assigned successfully',
      });
    } catch (error) {
      logger.error('Error assigning driver', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found' || error.message === 'Driver not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async changeBranch(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;
      const user_id = req.user?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = changeBranchSchema.parse(req.body);
      await this.changeBranchUseCase.execute({
        order_id: id,
        branch_id: body.branch_id,
        assigned_by_user_id: user_id,
      });

      res.status(200).json({
        status: 'success',
        message: 'Branch changed successfully',
      });
    } catch (error) {
      logger.error('Error changing branch', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found' || error.message === 'Branch not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async modifyItems(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = modifyItemsSchema.parse(req.body);
      await this.modifyItemsUseCase.execute({
        order_id: id,
        items: body.items,
      });

      res.status(200).json({
        status: 'success',
        message: 'Items modified successfully',
      });
    } catch (error) {
      logger.error('Error modifying items', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;
      const user_id = req.user?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const cancellation_reason = req.body.cancellation_reason as string | undefined;

      await this.updateOrderStatusUseCase.execute({
        order_id: id,
        to_status: 'CANCELLED',
        changed_by_user_id: user_id,
        cancellation_reason: cancellation_reason,
      });

      res.status(200).json({
        status: 'success',
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling order', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async recalculateTotals(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = recalculateTotalsSchema.parse(req.body);
      await this.recalculateTotalsUseCase.execute({
        order_id: id,
        tax_rate: body.tax_rate,
        discount_amount: body.discount_amount,
      });

      res.status(200).json({
        status: 'success',
        message: 'Totals recalculated successfully',
      });
    } catch (error) {
      logger.error('Error recalculating totals', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async addDeliveryProof(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = addDeliveryProofSchema.parse(req.body);
      await this.addDeliveryProofUseCase.execute({
        order_id: id,
        proof_type: body.proof_type,
        proof_data: body.proof_data,
        delivered_to_name: body.delivered_to_name,
        delivered_at: body.delivered_at,
        driver_notes: body.driver_notes,
      });

      res.status(201).json({
        status: 'success',
        message: 'Delivery proof added successfully',
      });
    } catch (error) {
      logger.error('Error adding delivery proof', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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

  async addDeliveryRating(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenant_id = req.tenant?.id;

      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const body = addDeliveryRatingSchema.parse(req.body);
      await this.addDeliveryRatingUseCase.execute({
        order_id: id,
        customer_rating: body.customer_rating,
        driver_rating: body.driver_rating,
        customer_comment: body.customer_comment,
        driver_comment: body.driver_comment,
      });

      res.status(201).json({
        status: 'success',
        message: 'Delivery rating added successfully',
      });
    } catch (error) {
      logger.error('Error adding delivery rating', { error });
      if (error instanceof Error) {
        if (error.message === 'Order not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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


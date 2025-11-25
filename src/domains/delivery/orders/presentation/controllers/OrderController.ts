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
import { createRetailOrderSchema } from '../../application/dto/CreateRetailOrderDto';
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
import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';

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
    @inject(TYPES.AddDeliveryRatingUseCase) private addDeliveryRatingUseCase: AddDeliveryRatingUseCase,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
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

      // Obtener relaciones de la orden
      const [orderDrivers, orderBranches, orderItems, orderSummaryTotals, orderStatusHistory] = await Promise.all([
        this.prisma.orderDriver.findMany({
          where: { order_id: id },
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.orderBranch.findMany({
          where: { order_id: id },
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.orderItem.findMany({
          where: { order_id: id },
          orderBy: { created_at: 'asc' },
        }),
        this.prisma.orderSummaryTotal.findMany({
          where: { order_id: id },
          orderBy: { version: 'desc' },
        }),
        this.prisma.orderStatusHistory.findMany({
          where: { order_id: id },
          orderBy: { created_at: 'desc' },
        }),
      ]);

      // Obtener información del driver actual si existe
      const currentDriver = orderDrivers.find((od) => od.is_current);
      let driverUser = null;
      if (currentDriver?.driver_id) {
        // Obtener el usuario del driver
        const driver = await this.prisma.driver.findUnique({
          where: { id: currentDriver.driver_id },
          select: { user_id: true },
        });
        if (driver) {
          const user = await this.userRepository.findById(driver.user_id);
          if (user) {
            driverUser = {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone: user.phone,
            };
          }
        }
      }

      const orderResponse = {
        id: order.id,
        tenant_id: order.tenant_id,
        order_number: order.order_number.toString(),
        order_display_number: order.order_display_number,
        order_type: order.order_type,
        customer_id: order.customer_id,
        customer_snapshot: order.customer_snapshot,
        delivery_address: order.delivery_address,
        delivery_lat: order.delivery_lat,
        delivery_lng: order.delivery_lng,
        pickup_address: order.pickup_address,
        pickup_lat: order.pickup_lat,
        pickup_lng: order.pickup_lng,
        status: order.status,
        cancellation_reason: order.cancellation_reason,
        scheduled_pickup_at: order.scheduled_pickup_at?.toISOString(),
        estimated_delivery_at: order.estimated_delivery_at.toISOString(),
        special_instructions: order.special_instructions,
        priority: order.priority,
        cargo_description: order.cargo_description,
        tracking_code: order.tracking_code,
        created_at: order.created_at.toISOString(),
        updated_at: order.updated_at.toISOString(),
        order_drivers: orderDrivers.map((od) => ({
          id: od.id,
          driver_id: od.driver_id,
          driver_snapshot: od.driver_snapshot,
          is_current: od.is_current,
          assigned_at: od.assigned_at.toISOString(),
          created_at: od.created_at.toISOString(),
          // Incluir información del usuario si es el driver actual
          ...(od.is_current && driverUser ? { driver_user: driverUser } : {}),
        })),
        order_branches: orderBranches.map((ob) => ({
          id: ob.id,
          branch_snapshot: ob.branch_snapshot,
          is_current: ob.is_current,
          assigned_at: ob.assigned_at.toISOString(),
          created_at: ob.created_at.toISOString(),
        })),
        order_items: orderItems.map((oi) => ({
          id: oi.id,
          product_snapshot: oi.product_snapshot,
          quantity: oi.quantity.toString(),
          unit_price: oi.unit_price.toString(),
          subtotal: oi.subtotal.toString(),
          notes: oi.notes,
          created_at: oi.created_at.toISOString(),
        })),
        order_summary_totals: orderSummaryTotals.map((ost) => ({
          id: ost.id,
          version: ost.version,
          subtotal: ost.subtotal.toString(),
          tax_rate: ost.tax_rate.toString(),
          tax_amount: ost.tax_amount.toString(),
          delivery_fee: ost.delivery_fee.toString(),
          discount_amount: ost.discount_amount.toString(),
          total_amount: ost.total_amount.toString(),
          currency: ost.currency,
          is_current: ost.is_current,
          created_at: ost.created_at.toISOString(),
        })),
        order_status_history: orderStatusHistory.map((osh) => ({
          id: osh.id,
          from_status: osh.from_status,
          to_status: osh.to_status,
          notes: osh.notes,
          created_at: osh.created_at.toISOString(),
        })),
      };

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(orderResponse),
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

      // Validar y convertir el DTO usando Zod
      const dto = createRetailOrderSchema.parse({
        ...req.body,
        tenant_id,
      });

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


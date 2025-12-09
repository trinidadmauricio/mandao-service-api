/**
 * Controller para Customer Orders
 * Endpoints específicos para que los customers vean sus órdenes
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { GetOrderUseCase } from '../../application/use-cases/GetOrderUseCase';
import { ListOrdersUseCase } from '../../application/use-cases/ListOrdersUseCase';
import { listOrdersFiltersSchema } from '../../application/dto/ListOrdersFiltersDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';
import { PrismaClient } from '@prisma/client';

@injectable()
export class CustomerOrderController {
  constructor(
    @inject(TYPES.GetOrderUseCase) private getOrderUseCase: GetOrderUseCase,
    @inject(TYPES.ListOrdersUseCase) private listOrdersUseCase: ListOrdersUseCase,
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

      const tenant_id = req.tenant.id;
      const customer_id = req.user.id;

      // Extraer y validar filtros de query params
      const filtersInput: Record<string, unknown> = {};
      if (req.query.search) {
        filtersInput.search = req.query.search as string;
      }
      if (req.query.status) {
        filtersInput.status = req.query.status as string;
      }
      if (req.query.page) {
        filtersInput.page = req.query.page;
      }
      if (req.query.limit) {
        filtersInput.limit = req.query.limit;
      }

      // Validar con schema Zod (solo si hay filtros)
      const filters =
        Object.keys(filtersInput).length > 0
          ? listOrdersFiltersSchema.parse(filtersInput)
          : undefined;

      // Obtener órdenes del customer usando el repositorio directamente
      // Necesitamos filtrar por customer_id
      const where: any = {
        tenant_id,
        customer_id,
      };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.search) {
        where.OR = [
          { order_display_number: { contains: filters.search, mode: 'insensitive' } },
          { tracking_code: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.order.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(orders),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      logger.error('Error listing customer orders', { error });
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid filter parameters',
          errors: error,
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
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const customer_id = req.user.id;
      const tenant_id = req.tenant.id;

      // Verificar que la orden pertenece al customer
      const order = await this.prisma.order.findFirst({
        where: {
          id,
          tenant_id,
          customer_id,
        },
      });

      if (!order) {
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }

      // Obtener relaciones de la orden
      const [orderDrivers, orderBranches, orderItems, orderSummaryTotals, orderStatusHistory] =
        await Promise.all([
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
            orderBy: { created_at: 'desc' },
          }),
          this.prisma.orderSummaryTotal.findMany({
            where: { order_id: id },
            orderBy: { created_at: 'desc' },
          }),
          this.prisma.orderStatusHistory.findMany({
            where: { order_id: id },
            orderBy: { created_at: 'desc' },
          }),
        ]);

      // Obtener el total actual
      const currentTotal = orderSummaryTotals.find((t) => t.is_current) || orderSummaryTotals[0];

      const response = {
        ...order,
        order_drivers: orderDrivers,
        order_branches: orderBranches,
        order_items: orderItems,
        order_summary_totals: orderSummaryTotals,
        current_total: currentTotal,
        status_history: orderStatusHistory,
      };

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(response),
      });
    } catch (error) {
      logger.error('Error getting customer order', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


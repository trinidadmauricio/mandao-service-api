/**
 * Use Case: Actualizar Estado de Orden
 * 
 * Valida transiciones usando OrderStateMachine y crea OrderStatusHistory
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { OrderStateMachine } from '../../domain/services/OrderStateMachine';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface UpdateOrderStatusDto {
  order_id: string;
  to_status: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  changed_by_user_id?: string;
  notes?: string;
  cancellation_reason?: string;
}

@injectable()
export class UpdateOrderStatusUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: UpdateOrderStatusDto): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validar transición
    if (!OrderStateMachine.isValidTransition(order.status, dto.to_status)) {
      throw new Error(
        `Invalid status transition from ${order.status} to ${dto.to_status}`
      );
    }

    // Validar cancelación
    if (dto.to_status === 'CANCELLED' && !OrderStateMachine.canCancel(order.status)) {
      throw new Error('Cannot cancel order in current status');
    }

    // Usar transacción para atomicidad
    await this.prisma.$transaction(async (tx) => {
      // Actualizar estado de la orden directamente con Prisma
      await tx.order.update({
        where: { id: dto.order_id },
        data: {
          status: dto.to_status,
          cancellation_reason: dto.cancellation_reason ?? undefined,
        },
      });

      // Crear OrderStatusHistory
      await tx.orderStatusHistory.create({
        data: {
          order_id: dto.order_id,
          from_status: order.status,
          to_status: dto.to_status,
          changed_by_user_id: dto.changed_by_user_id ?? null,
          notes: dto.notes ?? null,
        },
      });
    });
  }
}


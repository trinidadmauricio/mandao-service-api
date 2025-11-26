/**
 * Use Case: Marcar Orden como Automática
 * 
 * LOGISTICS_PROVIDER/SUPERVISOR pueden marcar órdenes para asignación automática de driver
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

export interface MarkAsAutomaticDto {
  order_id: string;
  marked_by_user_id?: string;
}

export interface MarkAsAutomaticContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class MarkAsAutomaticUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: MarkAsAutomaticDto, context?: MarkAsAutomaticContext): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validar que hay contexto (usuario autenticado)
    if (!context) {
      throw new Error('Marking order as automatic requires authentication context');
    }

    const currentRole = context.currentUserRole as UserRole;
    const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

    // Validación CRÍTICA: Solo LOGISTICS_PROVIDER o SUPERVISOR pueden marcar como automático
    if (currentRole !== UserRole.LOGISTICS_PROVIDER && currentRole !== UserRole.SUPERVISOR) {
      throw new Error('Only LOGISTICS_PROVIDER or SUPERVISOR can mark orders as automatic');
    }

    // Validar que el usuario tiene logistics_provider_id
    if (!currentUserLogisticsProviderId) {
      throw new Error(`${currentRole} user must have logistics_provider_id to mark orders as automatic`);
    }

    // Verificar que la orden está asignada a su proveedor
    const currentOrderDriver = await this.prisma.orderDriver.findFirst({
      where: {
        order_id: dto.order_id,
        is_current: true,
      },
    });

    if (!currentOrderDriver || !currentOrderDriver.logistics_provider_id) {
      throw new Error('Order must be assigned to a LOGISTICS_PROVIDER before marking as automatic');
    }

    if (currentOrderDriver.logistics_provider_id !== currentUserLogisticsProviderId) {
      throw new Error('You can only mark orders assigned to your logistics provider as automatic');
    }

    // Marcar la orden como automática (usar un campo especial o actualizar estado)
    // Por ahora, actualizamos el estado a ASSIGNED si está en PENDING/CONFIRMED
    // y agregamos una nota en el historial
    await this.prisma.$transaction(async (tx) => {
      if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
        await tx.order.update({
          where: { id: dto.order_id },
          data: { status: 'ASSIGNED' },
        });

        await tx.orderStatusHistory.create({
          data: {
            order_id: dto.order_id,
            from_status: order.status,
            to_status: 'ASSIGNED',
            changed_by_user_id: dto.marked_by_user_id ?? null,
            notes: 'Order marked as automatic - driver will be assigned automatically by system',
          },
        });
      }
    });
  }
}


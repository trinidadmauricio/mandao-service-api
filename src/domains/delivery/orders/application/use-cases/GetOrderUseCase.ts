/**
 * Use Case: Obtener Orden por ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';
import { PrismaClient } from '@prisma/client';

export interface GetOrderContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class GetOrderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(id: string, context?: GetOrderContext): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validar ownership para LOGISTICS_PROVIDER y SUPERVISOR
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        // Verificar que la orden esté asignada al proveedor del usuario
        const currentOrderDriver = await this.prisma.orderDriver.findFirst({
          where: {
            order_id: id,
            is_current: true,
          },
        });

        if (!currentOrderDriver || !currentOrderDriver.logistics_provider_id) {
          throw new Error('You do not have permission to access this order');
        }

        if (currentOrderDriver.logistics_provider_id !== currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to access this order');
        }
      }
    }

    return order;
  }
}


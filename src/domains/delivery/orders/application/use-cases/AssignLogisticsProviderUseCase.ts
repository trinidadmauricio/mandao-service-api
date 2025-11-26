/**
 * Use Case: Asignar LOGISTICS_PROVIDER a Orden
 * 
 * Solo SAAS roles o sistema pueden asignar órdenes a LOGISTICS_PROVIDER
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ILogisticsProviderRepository } from '../../../logistics-providers/domain/repositories/ILogisticsProviderRepository';
import { PrismaClient, Prisma } from '@prisma/client';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

export interface AssignLogisticsProviderDto {
  order_id: string;
  logistics_provider_id: string;
  assigned_by_user_id?: string;
}

export interface AssignLogisticsProviderContext {
  currentUserRole: string;
  isSystemProcess?: boolean; // Para procesos automáticos del sistema
}

@injectable()
export class AssignLogisticsProviderUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.ILogisticsProviderRepository) private logisticsProviderRepository: ILogisticsProviderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: AssignLogisticsProviderDto, context?: AssignLogisticsProviderContext): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Verificar que el logistics provider existe
    const logisticsProvider = await this.logisticsProviderRepository.findById(dto.logistics_provider_id);
    if (!logisticsProvider) {
      throw new Error('Logistics provider not found');
    }

    // Validación CRÍTICA: Solo SAAS roles o sistema pueden asignar LOGISTICS_PROVIDER
    if (context && !context.isSystemProcess) {
      const currentRole = context.currentUserRole as UserRole;
      
      if (currentRole !== UserRole.SAAS_ADMIN && currentRole !== UserRole.SAAS_EDITOR) {
        throw new Error('Only SAAS roles or system processes can assign orders to LOGISTICS_PROVIDER');
      }
    }

    // Crear snapshot del logistics provider
    const logisticsProviderSnapshot = {
      id: logisticsProvider.id,
      company_name: logisticsProvider.company_name,
      tax_id: logisticsProvider.tax_id,
      representative_name: logisticsProvider.representative_name,
      contact_phone: logisticsProvider.representative_phone,
      verification_status: logisticsProvider.verification_status,
    };

    // Usar transacción para atomicidad
    await this.prisma.$transaction(async (tx) => {
      // Marcar todos los order_drivers anteriores como is_current = false
      // (si había un driver asignado, se desasigna al cambiar de proveedor)
      await tx.orderDriver.updateMany({
        where: {
          order_id: dto.order_id,
          is_current: true,
        },
        data: {
          is_current: false,
          unassigned_at: new Date(),
        },
      });

      // Crear order_driver sin driver_id pero con logistics_provider_id
      // Esto asigna la orden al LOGISTICS_PROVIDER sin asignar un driver específico
      // El driver se asignará después por LOGISTICS_PROVIDER/SUPERVISOR o sistema
      await tx.orderDriver.create({
        data: {
          order_id: dto.order_id,
          driver_id: null, // Sin driver asignado aún
          logistics_provider_id: dto.logistics_provider_id,
          driver_snapshot: logisticsProviderSnapshot as Prisma.InputJsonValue,
          assigned_at: new Date(),
          is_current: true,
          assigned_by_user_id: dto.assigned_by_user_id ?? null,
        },
      });
      
      // Actualizar estado de la orden si es necesario
      if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
        await tx.order.update({
          where: { id: dto.order_id },
          data: { 
            status: 'ASSIGNED',
          },
        });

        // Crear OrderStatusHistory
        await tx.orderStatusHistory.create({
          data: {
            order_id: dto.order_id,
            from_status: order.status,
            to_status: 'ASSIGNED',
            changed_by_user_id: dto.assigned_by_user_id ?? null,
            notes: `Assigned to logistics provider: ${logisticsProvider.company_name}`,
          },
        });
      }
    });
  }
}


/**
 * Use Case: Asignar Driver a Orden
 *
 * Patrón inmutable: INSERT nuevo order_drivers, marca anteriores como is_current = false
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IDriverRepository } from '../../../drivers/domain/repositories/IDriverRepository';
import { ILogisticsProviderRepository } from '../../../logistics-providers/domain/repositories/ILogisticsProviderRepository';
import { PrismaClient, Prisma } from '@prisma/client';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

export interface AssignDriverDto {
  order_id: string;
  driver_id: string;
  assigned_by_user_id?: string;
}

export interface AssignDriverContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class AssignDriverUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.IDriverRepository) private driverRepository: IDriverRepository,
    @inject(TYPES.ILogisticsProviderRepository)
    private logisticsProviderRepository: ILogisticsProviderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: AssignDriverDto, context?: AssignDriverContext): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Verificar que el driver existe
    const driver = await this.driverRepository.findById(dto.driver_id);
    if (!driver) {
      throw new Error('Driver not found');
    }

    if (!driver.isAvailable()) {
      throw new Error('Driver is not available');
    }

    // Obtener logistics provider del driver
    const logisticsProvider = await this.logisticsProviderRepository.findById(
      driver.logistics_provider_id
    );
    if (!logisticsProvider) {
      throw new Error('Logistics provider not found');
    }

    // Validaciones CRÍTICAS de asignación de driver
    if (context) {
      const currentRole = context.currentUserRole as UserRole;

      // Verificar si la orden está asignada a un LOGISTICS_PROVIDER
      // La orden debe tener un order_driver con logistics_provider_id (puede o no tener driver_id)
      const currentOrderDriver = await this.prisma.orderDriver.findFirst({
        where: {
          order_id: dto.order_id,
          is_current: true,
        },
      });

      if (!currentOrderDriver || !currentOrderDriver.logistics_provider_id) {
        throw new Error('Order must be assigned to a LOGISTICS_PROVIDER before assigning a driver');
      }

      // Validar permisos según el rol
      // SAAS roles pueden asignar cualquier driver a cualquier orden (sin restricciones)
      if (currentRole === UserRole.SAAS_ADMIN || currentRole === UserRole.SAAS_EDITOR) {
        // Sin restricciones adicionales
      } else if (
        currentRole === UserRole.LOGISTICS_PROVIDER ||
        currentRole === UserRole.SUPERVISOR
      ) {
        // Validar que la orden está asignada al mismo logistics_provider del usuario
        if (currentOrderDriver.logistics_provider_id !== context.currentUserLogisticsProviderId) {
          throw new Error(
            'User can only assign drivers to orders assigned to their logistics provider'
          );
        }
        // Validar que el driver pertenece al mismo logistics_provider del usuario
        if (driver.logistics_provider_id !== context.currentUserLogisticsProviderId) {
          throw new Error('User can only assign drivers from their own logistics provider fleet');
        }
      } else {
        throw new Error(
          `Users with role ${currentRole} cannot assign drivers. Only SAAS roles, LOGISTICS_PROVIDER, and SUPERVISOR can assign drivers.`
        );
      }
    }

    // Crear snapshot del driver
    const driverSnapshot = {
      id: driver.id,
      identity_document: driver.identity_document,
      driving_license: driver.driving_license,
      name: `${driver.identity_document}`, // Simplificado
      vehicle_id: driver.vehicle_id,
      work_type: driver.work_type,
    };

    // Usar transacción para atomicidad
    await this.prisma.$transaction(async (tx) => {
      // Marcar todos los order_drivers anteriores como is_current = false
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

      // INSERT nuevo order_drivers
      await tx.orderDriver.create({
        data: {
          order_id: dto.order_id,
          driver_id: dto.driver_id,
          logistics_provider_id: driver.logistics_provider_id,
          driver_snapshot: driverSnapshot as Prisma.InputJsonValue,
          assigned_at: new Date(),
          is_current: true,
          assigned_by_user_id: dto.assigned_by_user_id ?? null,
        },
      });

      // Si la orden está en PENDING o CONFIRMED, cambiar a ASSIGNED
      if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
        await tx.order.update({
          where: { id: dto.order_id },
          data: { status: 'ASSIGNED' },
        });

        // Crear OrderStatusHistory
        await tx.orderStatusHistory.create({
          data: {
            order_id: dto.order_id,
            from_status: order.status,
            to_status: 'ASSIGNED',
            changed_by_user_id: dto.assigned_by_user_id ?? null,
            notes: 'Driver assigned',
          },
        });
      }
    });
  }
}

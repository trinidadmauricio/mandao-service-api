/**
 * Use Case: Obtener reporte de drivers (performance)
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { TYPES } from '../../../../../config/types';

export interface DriverReportItem {
  driver_id: string;
  driver_name: string;
  logistics_provider_name: string;
  total_deliveries: number;
  completed_deliveries: number;
  cancelled_deliveries: number;
  average_rating: number;
  on_time_rate: number;
  total_earnings: number;
  currency: string;
}

export interface DriverReportResult {
  items: DriverReportItem[];
  summary: {
    total_drivers: number;
    total_deliveries: number;
    average_rating: number;
    on_time_rate: number;
  };
}

@injectable()
export class GetDriversReportUseCase {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(tenant_id: string, logistics_provider_id?: string): Promise<DriverReportResult> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Construir where clause
    const where: Prisma.DriverWhereInput = {
      logistics_provider: {
        tenant_id,
      },
    };

    if (logistics_provider_id) {
      where.logistics_provider_id = logistics_provider_id;
    }

    // Obtener drivers
    const drivers = await this.prisma.driver.findMany({
      where,
      include: {
        logistics_provider: true,
        order_drivers: {
          include: {
            order: true,
          },
        },
        delivery_ratings: true,
      },
    });

    // Transformar a formato de reporte
    const items: DriverReportItem[] = drivers.map((driver) => {
      // Obtener nombre del driver desde order_drivers snapshot
      const firstOrderDriver = driver.order_drivers[0];
      const driverSnapshot = firstOrderDriver
        ? (firstOrderDriver.driver_snapshot as Record<string, unknown>)
        : null;
      const driverName = (driverSnapshot && typeof driverSnapshot === 'object' && 'name' in driverSnapshot && typeof driverSnapshot.name === 'string') ? driverSnapshot.name : 'N/A';

      const orders = driver.order_drivers.map((od) => od.order);
      const completedOrders = orders.filter((o) => o.status === 'DELIVERED');
      const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED');

      // Calcular on-time rate (simplificado: asumimos que todas las entregadas fueron a tiempo)
      const onTimeRate = completedOrders.length > 0 ? 1.0 : 0;

      // Calcular earnings (simplificado: asumimos que cada entrega tiene un fee)
      const totalEarnings = completedOrders.length * 10; // Placeholder

      return {
        driver_id: driver.id,
        driver_name: driverName,
        logistics_provider_name: driver.logistics_provider.company_name,
        total_deliveries: orders.length,
        completed_deliveries: completedOrders.length,
        cancelled_deliveries: cancelledOrders.length,
        average_rating: driver.rating_avg ? Number(driver.rating_avg) : 0,
        on_time_rate: onTimeRate,
        total_earnings: totalEarnings,
        currency: tenant.default_currency,
      };
    });

    // Calcular summary
    const totalDeliveriesCount = items.reduce((sum, item) => sum + item.total_deliveries, 0);
    const totalRatings = items.filter((item) => item.average_rating > 0);
    const averageRating =
      totalRatings.length > 0
        ? totalRatings.reduce((sum, item) => sum + item.average_rating, 0) / totalRatings.length
        : 0;
    const averageOnTimeRate =
      items.length > 0
        ? items.reduce((sum, item) => sum + item.on_time_rate, 0) / items.length
        : 0;

    return {
      items,
      summary: {
        total_drivers: items.length,
        total_deliveries: totalDeliveriesCount,
        average_rating: averageRating,
        on_time_rate: averageOnTimeRate,
      },
    };
  }
}


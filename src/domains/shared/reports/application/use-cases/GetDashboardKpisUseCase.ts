/**
 * Use Case: Obtener KPIs del dashboard
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { currencyService } from '../../../currency/CurrencyService';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { TYPES } from '../../../../../config/types';
import { CurrencyCode } from '../../../currency/CurrencyService';

export interface DashboardKpis {
  orders: {
    total: number;
    today: number;
    this_month: number;
    pending: number;
    in_transit: number;
    delivered: number;
  };
  revenue: {
    total: number;
    today: number;
    this_month: number;
    currency: string;
    formatted_total: string;
    formatted_today: string;
    formatted_this_month: string;
  };
  products: {
    total: number;
    low_stock: number;
  };
  drivers: {
    total: number;
    active: number;
    available: number;
  };
  branches: {
    total: number;
    active: number;
  };
}

@injectable()
export class GetDashboardKpisUseCase {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(
    tenant_id: string | null,
    logistics_provider_id?: string | null
  ): Promise<DashboardKpis> {
    // Si hay tenant_id, validar que existe y obtener currency
    // Si no hay tenant_id pero hay logistics_provider_id, usar USD como default
    let currency = 'USD';
    if (tenant_id) {
      const tenant = await this.tenantRepository.findById(tenant_id);
      if (!tenant) {
        throw new Error('Tenant not found');
      }
      currency = tenant.default_currency;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Construir where clause base para órdenes
    const orderWhereBase: Prisma.OrderWhereInput = {};
    if (tenant_id) {
      orderWhereBase.tenant_id = tenant_id;
    }
    if (logistics_provider_id) {
      orderWhereBase.order_drivers = {
        some: {
          is_current: true,
          logistics_provider_id,
        },
      };
    }

    // Órdenes
    const [totalOrders, todayOrders, monthOrders, pendingOrders, inTransitOrders, deliveredOrders] =
      await Promise.all([
        this.prisma.order.count({ where: orderWhereBase }),
        this.prisma.order.count({
          where: {
            ...orderWhereBase,
            created_at: { gte: todayStart },
          },
        }),
        this.prisma.order.count({
          where: {
            ...orderWhereBase,
            created_at: { gte: monthStart },
          },
        }),
        this.prisma.order.count({
          where: { ...orderWhereBase, status: 'PENDING' },
        }),
        this.prisma.order.count({
          where: { ...orderWhereBase, status: 'IN_TRANSIT' },
        }),
        this.prisma.order.count({
          where: { ...orderWhereBase, status: 'DELIVERED' },
        }),
      ]);

    // Revenue (de OrderSummaryTotal)
    const revenueOrderWhere: Prisma.OrderWhereInput = {};
    if (tenant_id) {
      revenueOrderWhere.tenant_id = tenant_id;
    }
    if (logistics_provider_id) {
      revenueOrderWhere.order_drivers = {
        some: {
          is_current: true,
          logistics_provider_id,
        },
      };
    }

    const allOrderTotals = await this.prisma.orderSummaryTotal.findMany({
      where: {
        order: revenueOrderWhere,
        is_current: true,
        currency,
      },
    });

    const totalRevenue = allOrderTotals.reduce((sum, total) => sum + Number(total.total_amount), 0);

    const todayOrderTotals = await this.prisma.orderSummaryTotal.findMany({
      where: {
        order: {
          ...revenueOrderWhere,
          created_at: { gte: todayStart },
        },
        is_current: true,
        currency,
      },
    });
    const todayRevenue = todayOrderTotals.reduce(
      (sum, total) => sum + Number(total.total_amount),
      0
    );

    const monthOrderTotals = await this.prisma.orderSummaryTotal.findMany({
      where: {
        order: {
          ...revenueOrderWhere,
          created_at: { gte: monthStart },
        },
        is_current: true,
        currency,
      },
    });
    const monthRevenue = monthOrderTotals.reduce(
      (sum, total) => sum + Number(total.total_amount),
      0
    );

    // Products (solo si hay tenant_id, LOGISTICS_PROVIDER no tiene productos)
    const [totalProducts, lowStockProducts] = await Promise.all([
      tenant_id ? this.prisma.product.count({ where: { tenant_id } }) : Promise.resolve(0),
      tenant_id
        ? this.prisma.stockByBranch.count({
            where: {
              tenant_id,
              available_stock: { lt: 10 }, // Threshold para low stock
            },
          })
        : Promise.resolve(0),
    ]);

    // Drivers
    const driverWhere: Prisma.DriverWhereInput = {};
    if (tenant_id) {
      driverWhere.logistics_provider = { tenant_id };
    }
    if (logistics_provider_id) {
      driverWhere.logistics_provider_id = logistics_provider_id;
    }

    const [totalDrivers, activeDrivers, availableDrivers] = await Promise.all([
      this.prisma.driver.count({ where: driverWhere }),
      this.prisma.driver.count({
        where: {
          ...driverWhere,
          availability_status: { in: ['AVAILABLE', 'BUSY'] },
        },
      }),
      this.prisma.driver.count({
        where: {
          ...driverWhere,
          availability_status: 'AVAILABLE',
        },
      }),
    ]);

    // Branches (solo si hay tenant_id, LOGISTICS_PROVIDER no tiene branches)
    const [totalBranches, activeBranches] = await Promise.all([
      tenant_id ? this.prisma.branch.count({ where: { tenant_id } }) : Promise.resolve(0),
      tenant_id
        ? this.prisma.branch.count({
            where: {
              tenant_id,
            },
          })
        : Promise.resolve(0),
    ]);

    return {
      orders: {
        total: totalOrders,
        today: todayOrders,
        this_month: monthOrders,
        pending: pendingOrders,
        in_transit: inTransitOrders,
        delivered: deliveredOrders,
      },
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        this_month: monthRevenue,
        currency,
        formatted_total: currencyService.format(totalRevenue, currency as CurrencyCode),
        formatted_today: currencyService.format(todayRevenue, currency as CurrencyCode),
        formatted_this_month: currencyService.format(monthRevenue, currency as CurrencyCode),
      },
      products: {
        total: totalProducts,
        low_stock: lowStockProducts,
      },
      drivers: {
        total: totalDrivers,
        active: activeDrivers,
        available: availableDrivers,
      },
      branches: {
        total: totalBranches,
        active: activeBranches,
      },
    };
  }
}

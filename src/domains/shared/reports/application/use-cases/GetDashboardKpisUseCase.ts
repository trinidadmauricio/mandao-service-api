/**
 * Use Case: Obtener KPIs del dashboard
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
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

  async execute(tenant_id: string): Promise<DashboardKpis> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const currency = tenant.default_currency;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Órdenes
    const [totalOrders, todayOrders, monthOrders, pendingOrders, inTransitOrders, deliveredOrders] =
      await Promise.all([
        this.prisma.order.count({ where: { tenant_id } }),
        this.prisma.order.count({
          where: {
            tenant_id,
            created_at: { gte: todayStart },
          },
        }),
        this.prisma.order.count({
          where: {
            tenant_id,
            created_at: { gte: monthStart },
          },
        }),
        this.prisma.order.count({
          where: { tenant_id, status: 'PENDING' },
        }),
        this.prisma.order.count({
          where: { tenant_id, status: 'IN_TRANSIT' },
        }),
        this.prisma.order.count({
          where: { tenant_id, status: 'DELIVERED' },
        }),
      ]);

    // Revenue (de OrderSummaryTotal)
    const allOrderTotals = await this.prisma.orderSummaryTotal.findMany({
      where: {
        order: { tenant_id },
        is_current: true,
        currency,
      },
    });

    const totalRevenue = allOrderTotals.reduce((sum, total) => sum + Number(total.total_amount), 0);

    const todayOrderTotals = await this.prisma.orderSummaryTotal.findMany({
      where: {
        order: {
          tenant_id,
          created_at: { gte: todayStart },
        },
        is_current: true,
        currency,
      },
    });
    const todayRevenue = todayOrderTotals.reduce((sum, total) => sum + Number(total.total_amount), 0);

    const monthOrderTotals = await this.prisma.orderSummaryTotal.findMany({
      where: {
        order: {
          tenant_id,
          created_at: { gte: monthStart },
        },
        is_current: true,
        currency,
      },
    });
    const monthRevenue = monthOrderTotals.reduce((sum, total) => sum + Number(total.total_amount), 0);

    // Products
    const [totalProducts, lowStockProducts] = await Promise.all([
      this.prisma.product.count({ where: { tenant_id } }),
      this.prisma.stockByBranch.count({
        where: {
          tenant_id,
          available_stock: { lt: 10 }, // Threshold para low stock
        },
      }),
    ]);

    // Drivers
    const [totalDrivers, activeDrivers, availableDrivers] = await Promise.all([
      this.prisma.driver.count({
        where: {
          logistics_provider: { tenant_id },
        },
      }),
      this.prisma.driver.count({
        where: {
          logistics_provider: { tenant_id },
          availability_status: { in: ['AVAILABLE', 'BUSY'] },
        },
      }),
      this.prisma.driver.count({
        where: {
          logistics_provider: { tenant_id },
          availability_status: 'AVAILABLE',
        },
      }),
    ]);

    // Branches
    const [totalBranches, activeBranches] = await Promise.all([
      this.prisma.branch.count({ where: { tenant_id } }),
      this.prisma.branch.count({
        where: {
          tenant_id,
        },
      }),
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


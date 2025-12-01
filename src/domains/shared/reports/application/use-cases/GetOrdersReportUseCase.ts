/**
 * Use Case: Obtener reporte de órdenes con filtros
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { OrderReportFiltersDto } from '../dto/OrderReportFiltersDto';
import { currencyService } from '../../../currency/CurrencyService';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { TYPES } from '../../../../../config/types';
import { CurrencyCode } from '../../../currency/CurrencyService';

export interface OrderReportItem {
  id: string;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
  order_type: string;
  status: string;
  customer_name: string;
  delivery_address: string;
  total_amount: number;
  currency: string;
  formatted_total: string;
  created_at: Date;
  estimated_delivery_at: Date | null;
  driver_name: string | null;
  branch_name: string | null;
}

export interface OrderReportResult {
  items: OrderReportItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  summary: {
    total_orders: number;
    total_amount: number;
    currency: string;
    formatted_total: string;
    by_status: Record<string, number>;
    by_currency: Record<string, { count: number; total: number }>;
  };
}

@injectable()
export class GetOrdersReportUseCase {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(
    tenant_id: string | null,
    filters: OrderReportFiltersDto,
    logistics_provider_id?: string | null
  ): Promise<OrderReportResult> {
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

    // Construir where clause
    const where: Prisma.OrderWhereInput = {};

    // Si hay tenant_id, filtrar por tenant
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }

    // Si hay logistics_provider_id, filtrar por logistics_provider en order_drivers
    if (logistics_provider_id) {
      where.order_drivers = {
        some: {
          is_current: true,
          logistics_provider_id,
        },
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.order_type) {
      where.order_type = filters.order_type;
    }

    if (filters.currency) {
      // Filtrar por currency del OrderSummaryTotal
      where.order_summary_totals = {
        some: {
          is_current: true,
          currency: filters.currency,
        },
      };
    }

    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) {
        where.created_at.gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.created_at.lte = new Date(filters.date_to);
      }
    }

    if (filters.branch_id) {
      where.order_branches = {
        some: {
          is_current: true,
          branch_id: filters.branch_id,
        },
      };
    }

    if (filters.driver_id) {
      where.order_drivers = {
        some: {
          is_current: true,
          driver_id: filters.driver_id,
        },
      };
    }

    // Contar total
    const total = await this.prisma.order.count({ where });

    // Obtener órdenes con paginación
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        order_summary_totals: {
          where: { is_current: true },
          take: 1,
        },
        order_branches: {
          where: { is_current: true },
          take: 1,
        },
        order_drivers: {
          where: { is_current: true },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    });

    // Obtener branches y drivers por separado (usar snapshots)
    const orderIds = orders.map((o) => o.id);
    const branches = await this.prisma.orderBranch.findMany({
      where: {
        order_id: { in: orderIds },
        is_current: true,
      },
    });
    const drivers = await this.prisma.orderDriver.findMany({
      where: {
        order_id: { in: orderIds },
        is_current: true,
      },
    });

    const branchMap = new Map(
      branches.map((b) => [b.order_id, b.branch_snapshot as Record<string, unknown>])
    );
    const driverMap = new Map(
      drivers.map((d) => [d.order_id, d.driver_snapshot as Record<string, unknown>])
    );

    // Transformar a formato de reporte
    const items: OrderReportItem[] = orders.map((order) => {
      const total = order.order_summary_totals[0];
      const branchSnapshot = branchMap.get(order.id) as Record<string, unknown> | undefined;
      const driverSnapshot = driverMap.get(order.id) as Record<string, unknown> | undefined;
      const customer = order.customer_snapshot as Record<string, unknown> | null;
      const delivery = order.delivery_address as Record<string, unknown> | null;

      const orderCurrency = total?.currency || currency;
      const totalAmount = total ? Number(total.total_amount) : 0;

      return {
        id: order.id,
        order_number: order.order_display_number,
        order_display_number: order.order_display_number,
        tracking_code: order.tracking_code,
        order_type: order.order_type,
        status: order.status,
        customer_name:
          customer &&
          typeof customer === 'object' &&
          'name' in customer &&
          typeof customer.name === 'string'
            ? customer.name
            : 'N/A',
        delivery_address:
          delivery &&
          typeof delivery === 'object' &&
          'street' in delivery &&
          typeof delivery.street === 'string'
            ? delivery.street
            : 'N/A',
        total_amount: totalAmount,
        currency: orderCurrency,
        formatted_total: currencyService.format(totalAmount, orderCurrency as CurrencyCode),
        created_at: order.created_at,
        estimated_delivery_at: order.estimated_delivery_at,
        driver_name:
          driverSnapshot &&
          typeof driverSnapshot === 'object' &&
          'name' in driverSnapshot &&
          typeof driverSnapshot.name === 'string'
            ? driverSnapshot.name
            : null,
        branch_name:
          branchSnapshot &&
          typeof branchSnapshot === 'object' &&
          'name' in branchSnapshot &&
          typeof branchSnapshot.name === 'string'
            ? branchSnapshot.name
            : null,
      };
    });

    // Calcular summary
    const allOrders = await this.prisma.order.findMany({
      where,
      include: {
        order_summary_totals: {
          where: { is_current: true },
          take: 1,
        },
      },
    });

    const summary = {
      total_orders: allOrders.length,
      total_amount: 0,
      currency,
      formatted_total: '',
      by_status: {} as Record<string, number>,
      by_currency: {} as Record<string, { count: number; total: number }>,
    };

    // Agrupar por status y currency
    for (const order of allOrders) {
      // Por status
      summary.by_status[order.status] = (summary.by_status[order.status] || 0) + 1;

      // Por currency
      const orderTotal = order.order_summary_totals[0];
      if (orderTotal) {
        const orderCurrency = orderTotal.currency;
        if (!summary.by_currency[orderCurrency]) {
          summary.by_currency[orderCurrency] = { count: 0, total: 0 };
        }
        summary.by_currency[orderCurrency].count += 1;
        summary.by_currency[orderCurrency].total += Number(orderTotal.total_amount);
      }
    }

    // Calcular total en currency del tenant
    // Convertir todos los totales a la currency del tenant (simplificado, asume misma currency)
    summary.total_amount = allOrders.reduce((sum, order) => {
      const orderTotal = order.order_summary_totals[0];
      if (orderTotal && orderTotal.currency === currency) {
        return sum + Number(orderTotal.total_amount);
      }
      return sum;
    }, 0);

    summary.formatted_total = currencyService.format(
      summary.total_amount,
      currency as CurrencyCode
    );

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      total_pages: Math.ceil(total / filters.limit),
      summary,
    };
  }
}

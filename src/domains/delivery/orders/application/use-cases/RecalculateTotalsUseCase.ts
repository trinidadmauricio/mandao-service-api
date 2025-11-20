/**
 * Use Case: Recalcular Totals de Orden
 * 
 * Patrón inmutable: INSERT nuevo order_summary_totals, marca anterior como is_current = false
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { DeliveryCostCalculator } from '../../../delivery-cost/application/services/DeliveryCostCalculator';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface RecalculateTotalsDto {
  order_id: string;
  tax_rate?: number;
  discount_amount?: number;
}

@injectable()
export class RecalculateTotalsUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.DeliveryCostCalculator) private deliveryCostCalculator: DeliveryCostCalculator,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: RecalculateTotalsDto): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Obtener tenant
    const tenant = await this.tenantRepository.findById(order.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Obtener items actuales de la orden
    const items = await this.prisma.orderItem.findMany({
      where: { order_id: dto.order_id },
      orderBy: { created_at: 'desc' }, // Los más recientes primero
    });

    // Calcular subtotal de items (sumar los más recientes)
    // Agrupar por product_id+variant_id y tomar el más reciente de cada uno
    const itemsMap = new Map<string, typeof items[0]>();
    for (const item of items) {
      const key = `${item.product_id || 'null'}-${item.variant_id || 'null'}`;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, item);
      }
    }

    const items_subtotal = Array.from(itemsMap.values()).reduce(
      (sum, item) => sum + Number(item.subtotal),
      0
    );

    // Calcular distancia y costo de entrega
    const distance_km = this.calculateDistance(
      order.pickup_lat || order.delivery_lat,
      order.pickup_lng || order.delivery_lng,
      order.delivery_lat,
      order.delivery_lng
    );

    const deliveryCost = await this.deliveryCostCalculator.calculate({
      tenant_id: order.tenant_id,
      distance_km,
      vehicle_type: 'MOTORCYCLE',
      priority: order.priority,
      currency: tenant.default_currency,
    });

    // Obtener total anterior para calcular versión
    const previousTotal = await this.prisma.orderSummaryTotal.findFirst({
      where: {
        order_id: dto.order_id,
        is_current: true,
      },
    });

    const version = previousTotal ? previousTotal.version + 1 : 1;

    // Calcular totales
    const subtotal = items_subtotal;
    const tax_rate = dto.tax_rate ?? 0.0;
    const tax_amount = subtotal * tax_rate;
    const delivery_fee = deliveryCost.total;
    const discount_amount = dto.discount_amount ?? 0.0;
    const total_amount = subtotal + tax_amount + delivery_fee - discount_amount;

    // Usar transacción para atomicidad
    await this.prisma.$transaction(async (tx) => {
      // Marcar total anterior como is_current = false
      if (previousTotal) {
        await tx.orderSummaryTotal.update({
          where: { id: previousTotal.id },
          data: { is_current: false },
        });
      }

      // INSERT nuevo order_summary_totals
      await tx.orderSummaryTotal.create({
        data: {
          order_id: dto.order_id,
          version,
          subtotal,
          tax_rate,
          tax_amount,
          delivery_fee,
          discount_amount,
          total_amount,
          currency: tenant.default_currency,
          calculation_metadata: {
            delivery_cost_calculation: deliveryCost,
            distance_km,
            items_count: itemsMap.size,
          } as unknown as Prisma.InputJsonValue,
          is_current: true,
        },
      });
    });
  }

  /**
   * Calcula distancia en km usando fórmula de Haversine
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}


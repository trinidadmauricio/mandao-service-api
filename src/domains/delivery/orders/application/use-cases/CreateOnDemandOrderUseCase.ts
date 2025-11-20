/**
 * Use Case: Crear Orden On-Demand
 * 
 * Crea una orden de tipo ON_DEMAND sin productos previamente registrados.
 * Usa patrón inmutable: todos los cambios generan nuevos registros.
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { OrderNumberService } from '../../../../shared/order-counters/application/services/OrderNumberService';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { DeliveryCostCalculator } from '../../../delivery-cost/application/services/DeliveryCostCalculator';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateOnDemandOrderDto } from '../dto/CreateOnDemandOrderDto';
import { Order, OrderType, OrderStatus, OrderPriority } from '../../domain/entities/Order';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';

export interface CreateOnDemandOrderResult {
  order: Order;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
}

@injectable()
export class CreateOnDemandOrderUseCase {
  constructor(
    @inject(TYPES.OrderNumberService) private orderNumberService: OrderNumberService,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.DeliveryCostCalculator) private deliveryCostCalculator: DeliveryCostCalculator,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: CreateOnDemandOrderDto): Promise<CreateOnDemandOrderResult> {
    // Validar tenant
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!tenant.isActive()) {
      throw new Error('Tenant is not active');
    }

    // Validar tenant type (debe ser ON_DEMAND o HYBRID)
    if (tenant.type !== 'ON_DEMAND' && tenant.type !== 'HYBRID') {
      throw new Error('This operation requires tenant type ON_DEMAND or HYBRID');
    }

    // Obtener order number
    const order_display_number = await this.orderNumberService.getNextOrderNumber(dto.tenant_id);
    const order_number = BigInt(order_display_number.replace(/[^0-9]/g, ''));

    // Calcular distancia (simplificado - en producción usar geocoding)
    const distance_km = this.calculateDistance(
      dto.pickup_address?.lat || dto.delivery_address.lat,
      dto.pickup_address?.lng || dto.delivery_address.lng,
      dto.delivery_address.lat,
      dto.delivery_address.lng
    );

    // Calcular costo de entrega
    const deliveryCost = await this.deliveryCostCalculator.calculate({
      tenant_id: dto.tenant_id,
      distance_km,
      vehicle_type: 'MOTORCYCLE', // Default para on-demand
      priority: dto.priority || 'NORMAL',
      currency: tenant.default_currency,
    });

    // Calcular subtotal de items
    const items_subtotal = dto.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );

    // Calcular totales
    const subtotal = items_subtotal;
    const tax_rate = 0.0; // Por ahora sin tax
    const tax_amount = subtotal * tax_rate;
    const delivery_fee = deliveryCost.total;
    const discount_amount = 0.0;
    const total_amount = subtotal + tax_amount + delivery_fee - discount_amount;

    // Generar tracking code
    const tracking_code = `TRK-${generateSecureToken(12).toUpperCase()}`;

    // Crear orden y relaciones en transacción
    const result = await this.prisma.$transaction(async (tx) => {
      // Crear orden directamente con Prisma
      const orderData = await tx.order.create({
        data: {
          tenant_id: dto.tenant_id,
          order_number,
          order_display_number,
          order_type: 'ON_DEMAND',
          customer_id: null,
          customer_snapshot: dto.customer_snapshot as Prisma.InputJsonValue,
          delivery_address: dto.delivery_address as Prisma.InputJsonValue,
          delivery_lat: dto.delivery_address.lat,
          delivery_lng: dto.delivery_address.lng,
          pickup_address: dto.pickup_address ? (dto.pickup_address as Prisma.InputJsonValue) : Prisma.JsonNull,
          pickup_lat: dto.pickup_address?.lat ?? null,
          pickup_lng: dto.pickup_address?.lng ?? null,
          status: 'PENDING',
          scheduled_pickup_at: dto.scheduled_pickup_at ?? null,
          estimated_delivery_at: dto.estimated_delivery_at,
          special_instructions: dto.special_instructions ?? null,
          priority: dto.priority || 'NORMAL',
          cargo_description: dto.cargo_description ?? null,
          tracking_code,
        },
      });

      // Crear order_items
      for (const item of dto.items) {
        await tx.orderItem.create({
          data: {
            order_id: orderData.id,
            product_id: null, // On-demand no tiene product_id
            variant_id: null,
            product_snapshot: item.product_snapshot as Prisma.InputJsonValue,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.unit_price * item.quantity,
            notes: item.notes ?? null,
          },
        });
      }

      // Crear order_summary_totals
      await tx.orderSummaryTotal.create({
        data: {
          order_id: orderData.id,
          version: 1,
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
          } as unknown as Prisma.InputJsonValue,
          is_current: true,
        },
      });

      return orderData;
    });

    // Convertir a entidad de dominio
    const order = new Order(
      result.id,
      result.tenant_id,
      result.order_number,
      result.order_display_number,
      result.order_type as OrderType,
      result.customer_id,
      result.customer_snapshot as Record<string, unknown>,
      result.delivery_address as Record<string, unknown>,
      Number(result.delivery_lat),
      Number(result.delivery_lng),
      result.pickup_address ? (result.pickup_address as Record<string, unknown>) : null,
      result.pickup_lat ? Number(result.pickup_lat) : null,
      result.pickup_lng ? Number(result.pickup_lng) : null,
      result.status as OrderStatus,
      result.cancellation_reason,
      result.scheduled_pickup_at,
      result.estimated_delivery_at,
      result.special_instructions,
      result.priority as OrderPriority,
      result.cargo_description,
      result.tracking_code,
      result.created_at,
      result.updated_at
    );

    return {
      order,
      order_number: order_display_number,
      order_display_number,
      tracking_code,
    };
  }

  /**
   * Calcula distancia en km usando fórmula de Haversine (simplificada)
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


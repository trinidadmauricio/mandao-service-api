/**
 * Use Case: Crear Orden Retail
 * 
 * Crea una orden de tipo RETAIL con productos previamente registrados.
 * Usa patrón inmutable: todos los cambios generan nuevos registros.
 * Este use case es llamado desde el dominio Retail a través de IDeliveryClient.
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { OrderNumberService } from '../../../../shared/order-counters/application/services/OrderNumberService';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { DeliveryCostCalculator } from '../../../delivery-cost/application/services/DeliveryCostCalculator';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateOrderResponse } from '../../../../shared/contracts/order.contracts';
import { Order, OrderType, OrderStatus, OrderPriority } from '../../domain/entities/Order';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';
import { CreateRetailOrderDto } from '../dto/CreateRetailOrderDto';
import { IProductRepository } from '../../../../retail/products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../../retail/product-variants/domain/repositories/IProductVariantRepository';

@injectable()
export class CreateRetailOrderUseCase {
  constructor(
    @inject(TYPES.OrderNumberService) private orderNumberService: OrderNumberService,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.DeliveryCostCalculator) private deliveryCostCalculator: DeliveryCostCalculator,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository) private variantRepository: IProductVariantRepository
  ) {}

  async execute(request: CreateRetailOrderDto): Promise<CreateOrderResponse> {
    // Validar tenant
    const tenant = await this.tenantRepository.findById(request.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!tenant.isActive()) {
      throw new Error('Tenant is not active');
    }

    // Validar tenant type (debe ser RETAIL o HYBRID)
    if (tenant.type !== 'RETAIL' && tenant.type !== 'HYBRID') {
      throw new Error('This operation requires tenant type RETAIL or HYBRID');
    }

    // Procesar items: obtener productos y crear snapshots si no vienen
    const processedItems = await Promise.all(
      request.items.map(async (item) => {
        // Si ya tiene product_snapshot y unit_price, usarlos
        if (item.product_snapshot && item.unit_price !== undefined) {
          return {
            product_id: item.product_id,
            variant_id: item.variant_id,
            product_snapshot: item.product_snapshot,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes,
          };
        }

        // Si no tiene product_snapshot, obtener producto/variant
        if (!item.product_id) {
          throw new Error('Product ID is required when product_snapshot is not provided');
        }

        let product;
        let variant = null;
        let unit_price: number;
        let product_snapshot: {
          name: string;
          sku: string;
          price: number;
          currency: string;
          [key: string]: unknown;
        };

        if (item.variant_id) {
          // Obtener variant y producto
          variant = await this.variantRepository.findById(item.variant_id);
          if (!variant) {
            throw new Error(`Variant ${item.variant_id} not found`);
          }
          if (variant.tenant_id !== request.tenant_id) {
            throw new Error('Variant belongs to different tenant');
          }

          product = await this.productRepository.findById(variant.product_id);
          if (!product) {
            throw new Error('Product not found for variant');
          }

          // Precio del variant = precio base del producto + ajuste del variant
          unit_price = Number(product.selling_price) + Number(variant.price_adjustment);
          product_snapshot = {
            name: product.name,
            sku: variant.sku,
            price: unit_price,
            currency: variant.currency,
            variant_options: {
              option1_name: variant.option1_name,
              option1_value: variant.option1_value,
              option2_name: variant.option2_name,
              option2_value: variant.option2_value,
              option3_name: variant.option3_name,
              option3_value: variant.option3_value,
            },
          };
        } else {
          // Obtener solo producto
          product = await this.productRepository.findById(item.product_id);
          if (!product) {
            throw new Error(`Product ${item.product_id} not found`);
          }
          if (product.tenant_id !== request.tenant_id) {
            throw new Error('Product belongs to different tenant');
          }

          unit_price = Number(product.selling_price);
          product_snapshot = {
            name: product.name,
            sku: product.sku,
            price: unit_price,
            currency: product.currency,
          };
        }

        return {
          product_id: item.product_id,
          variant_id: item.variant_id,
          product_snapshot,
          quantity: item.quantity,
          unit_price,
          notes: item.notes,
        };
      })
    );

    // Obtener order number
    const order_display_number = await this.orderNumberService.getNextOrderNumber(request.tenant_id);
    const order_number = BigInt(order_display_number.replace(/[^0-9]/g, ''));

    // Calcular distancia
    const distance_km = this.calculateDistance(
      request.pickup_address?.lat || request.delivery_address.lat,
      request.pickup_address?.lng || request.delivery_address.lng,
      request.delivery_address.lat,
      request.delivery_address.lng
    );

    // Calcular costo de entrega
    const deliveryCost = await this.deliveryCostCalculator.calculate({
      tenant_id: request.tenant_id,
      distance_km,
      vehicle_type: 'MOTORCYCLE', // Default para retail
      priority: request.priority || 'NORMAL',
      currency: request.currency || tenant.default_currency,
    });

    // Calcular subtotal de items
    const items_subtotal = processedItems.reduce(
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
      // Crear orden
      const orderData = await tx.order.create({
        data: {
          tenant_id: request.tenant_id,
          order_number,
          order_display_number,
          order_type: 'RETAIL',
          customer_id: null, // Retail puede tener customer_id en el futuro
          customer_snapshot: request.customer_snapshot as Prisma.InputJsonValue,
          delivery_address: request.delivery_address as Prisma.InputJsonValue,
          delivery_lat: request.delivery_address.lat,
          delivery_lng: request.delivery_address.lng,
          pickup_address: request.pickup_address ? (request.pickup_address as Prisma.InputJsonValue) : Prisma.JsonNull,
          pickup_lat: request.pickup_address?.lat ?? null,
          pickup_lng: request.pickup_address?.lng ?? null,
          status: 'PENDING',
          scheduled_pickup_at: request.scheduled_pickup_at ?? null,
          estimated_delivery_at: request.estimated_delivery_at,
          special_instructions: request.special_instructions ?? null,
          priority: request.priority || 'NORMAL',
          cargo_description: null,
          tracking_code,
        },
      });

      // Crear order_items con product_snapshot
      for (const item of processedItems) {
        await tx.orderItem.create({
          data: {
            order_id: orderData.id,
            product_id: item.product_id ?? null,
            variant_id: item.variant_id ?? null,
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
          currency: request.currency || tenant.default_currency,
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
      id: order.id,
      order_number: order_display_number,
      order_display_number,
      tracking_code,
      status: order.status,
      created_at: order.created_at,
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


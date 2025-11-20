/**
 * Use Case: Checkout de Storefront
 * 
 * Maneja el flujo completo de checkout:
 * 1. Valida stock disponible
 * 2. Reserva stock
 * 3. Crea orden en delivery
 * 4. Libera stock si falla
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { CheckoutDto } from '../dto/CheckoutDto';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { StockCalculator } from '../../../inventory/application/services/StockCalculator';
import { StockReservationService } from '../../../inventory/application/services/StockReservationService';
import { IDeliveryClient } from '../../../clients/IDeliveryClient';
import { CreateOrderRequest } from '../../../../shared/contracts/order.contracts';
import { ITenantRepository } from '../../../../shared/tenants/domain/repositories/ITenantRepository';
import { TYPES } from '../../../../../config/types';

export interface CheckoutResult {
  order_id: string;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
  status: string;
  created_at: Date;
}

@injectable()
export class CheckoutUseCase {
  constructor(
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository) private variantRepository: IProductVariantRepository,
    @inject(TYPES.StockCalculator) private stockCalculator: StockCalculator,
    @inject(TYPES.StockReservationService) private stockReservationService: StockReservationService,
    @inject(TYPES.DeliveryClient) private deliveryClient: IDeliveryClient,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: CheckoutDto, created_by_user_id: string): Promise<CheckoutResult> {
    // Validar tenant
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const currency = dto.currency || tenant.default_currency;

    // 1. Validar y obtener productos/variants con precios
    const orderItems: CreateOrderRequest['items'] = [];
    const stockReservations: Array<{
      product_id: string;
      variant_id: string | null;
      branch_id: string;
      quantity: number;
    }> = [];

    for (const item of dto.items) {
      let product;
      let variant = null;
      let unit_price: number;
      let product_snapshot: CreateOrderRequest['items'][0]['product_snapshot'];

      if (item.variant_id) {
        variant = await this.variantRepository.findById(item.variant_id);
        if (!variant) {
          throw new Error(`Variant ${item.variant_id} not found`);
        }
        if (variant.tenant_id !== dto.tenant_id) {
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
        } as CreateOrderRequest['items'][0]['product_snapshot'];

        stockReservations.push({
          product_id: product.id,
          variant_id: variant.id,
          branch_id: dto.branch_id,
          quantity: item.quantity,
        });
      } else if (item.product_id) {
        product = await this.productRepository.findById(item.product_id);
        if (!product) {
          throw new Error(`Product ${item.product_id} not found`);
        }
        if (product.tenant_id !== dto.tenant_id) {
          throw new Error('Product belongs to different tenant');
        }

        unit_price = Number(product.selling_price);
        product_snapshot = {
          name: product.name,
          sku: product.sku,
          price: unit_price,
          currency: product.currency,
        } as CreateOrderRequest['items'][0]['product_snapshot'];

        stockReservations.push({
          product_id: product.id,
          variant_id: null,
          branch_id: dto.branch_id,
          quantity: item.quantity,
        });
      } else {
        throw new Error('Either product_id or variant_id must be provided');
      }

      // Validar currency
      if (variant && variant.currency !== currency) {
        throw new Error(`Currency mismatch: variant is in ${variant.currency}, requested ${currency}`);
      }
      if (!variant && product.currency !== currency) {
        throw new Error(`Currency mismatch: product is in ${product.currency}, requested ${currency}`);
      }

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_snapshot,
        quantity: item.quantity,
        unit_price,
        notes: undefined,
      });
    }

    // 2. Validar stock disponible
    const stockAvailability = await this.stockCalculator.getMultipleStockAvailability(
      dto.tenant_id,
      stockReservations
    );

    const insufficientStock = stockAvailability.filter((item) => !item.has_stock);
    if (insufficientStock.length > 0) {
      throw new Error(
        `Insufficient stock for: ${insufficientStock.map((i) => i.product_id).join(', ')}`
      );
    }

    // 3. Reservar stock
    const reservations: Array<{ 
      stock: import('../../../inventory/domain/entities/StockByBranch').StockByBranch; 
      movement: import('../../../inventory/domain/entities/InventoryMovement').InventoryMovement 
    }> = [];
    try {
      for (const reservation of stockReservations) {
        const result = await this.stockReservationService.reserveStock({
          tenant_id: dto.tenant_id,
          product_id: reservation.product_id,
          variant_id: reservation.variant_id,
          branch_id: reservation.branch_id,
          quantity: reservation.quantity,
          reference_type: 'ORDER',
          reference_id: 'pending', // Se actualizará después
          created_by_user_id,
        });
        reservations.push(result);
      }

      // 4. Crear orden en delivery
      const orderRequest: CreateOrderRequest = {
        tenant_id: dto.tenant_id,
        order_type: 'RETAIL',
        customer_snapshot: dto.customer,
        delivery_address: dto.delivery_address,
        pickup_address: dto.pickup_address,
        items: orderItems,
        currency,
        special_instructions: dto.special_instructions,
        scheduled_pickup_at: dto.scheduled_pickup_at ? new Date(dto.scheduled_pickup_at) : undefined,
        estimated_delivery_at: new Date(dto.estimated_delivery_at),
        priority: dto.priority || 'NORMAL',
      };

      const orderResponse = await this.deliveryClient.createOrder(orderRequest);

      // 5. Actualizar reference_id en las reservas
      // Nota: En producción, esto debería hacerse en una transacción
      // Por ahora, las reservas ya están creadas con 'pending'

      return {
        order_id: orderResponse.id,
        order_number: orderResponse.order_number,
        order_display_number: orderResponse.order_display_number,
        tracking_code: orderResponse.tracking_code,
        status: orderResponse.status,
        created_at: orderResponse.created_at,
      };
    } catch (error) {
      // 6. Si falla, liberar stock reservado
      for (const reservation of reservations) {
        try {
          await this.stockReservationService.releaseStock({
            tenant_id: dto.tenant_id,
            product_id: reservation.stock.product_id,
            variant_id: reservation.stock.variant_id,
            branch_id: reservation.stock.branch_id,
            quantity: reservation.movement.quantity,
            reference_type: 'ORDER',
            reference_id: 'cancelled',
            created_by_user_id,
            notes: 'Order creation failed',
          });
        } catch (releaseError) {
          // Log error pero no fallar
          console.error('Error releasing stock:', releaseError);
        }
      }
      throw error;
    }
  }
}


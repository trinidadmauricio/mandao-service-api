/**
 * Use Case: Modificar Items de Orden
 * 
 * Patrón inmutable: INSERT todos los items de nueva versión completa
 * Los items anteriores se mantienen para historial (no UPDATE ni DELETE)
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { RecalculateTotalsUseCase } from './RecalculateTotalsUseCase';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface OrderItemDto {
  product_id?: string | null;
  variant_id?: string | null;
  product_snapshot: Record<string, unknown>;
  quantity: number;
  unit_price: number;
  notes?: string | null;
}

export interface ModifyItemsDto {
  order_id: string;
  items: OrderItemDto[];
}

@injectable()
export class ModifyItemsUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.RecalculateTotalsUseCase) private recalculateTotalsUseCase: RecalculateTotalsUseCase,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: ModifyItemsDto): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validar que la orden puede ser modificada
    if (order.isCompleted()) {
      throw new Error('Cannot modify items of completed order');
    }

    if (dto.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Usar transacción para atomicidad
    await this.prisma.$transaction(async (tx) => {
      // INSERT todos los items de la nueva versión
      // Los items anteriores se mantienen para historial (no se eliminan)
      for (const item of dto.items) {
        await tx.orderItem.create({
          data: {
            order_id: dto.order_id,
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
    });

    // Recalcular totales automáticamente después de modificar items
    // Esto asegura que los totales reflejen los nuevos items
    await this.recalculateTotalsUseCase.execute({
      order_id: dto.order_id,
    });
  }
}


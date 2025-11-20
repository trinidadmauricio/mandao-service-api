/**
 * Use Case: Agregar Delivery Proof
 * 
 * Agrega prueba de entrega (fotos, firmas, etc.) a una orden
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface AddDeliveryProofDto {
  order_id: string;
  proof_type: 'SIGNATURE' | 'PHOTO' | 'CODE' | 'NONE';
  proof_data: Record<string, unknown>;
  delivered_to_name: string;
  delivered_at: Date;
  driver_notes?: string;
}

@injectable()
export class AddDeliveryProofUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: AddDeliveryProofDto): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validar que la orden está en tránsito o entregada
    if (!['IN_TRANSIT', 'DELIVERED'].includes(order.status)) {
      throw new Error('Cannot add delivery proof for order in current status');
    }

    // Crear delivery proof
    await this.prisma.orderDeliveryProof.create({
      data: {
        order_id: dto.order_id,
        proof_type: dto.proof_type,
        proof_data: dto.proof_data as Prisma.InputJsonValue,
        delivered_to_name: dto.delivered_to_name,
        delivered_at: dto.delivered_at,
        driver_notes: dto.driver_notes ?? null,
      },
    });
  }
}


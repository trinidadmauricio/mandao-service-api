/**
 * Use Case: Agregar Rating de Entrega
 * 
 * Agrega calificación de la entrega por parte del cliente
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface AddDeliveryRatingDto {
  order_id: string;
  customer_rating: number; // 1-5
  driver_rating?: number; // 1-5 (opcional, rating del driver hacia el cliente)
  customer_comment?: string;
  driver_comment?: string;
}

@injectable()
export class AddDeliveryRatingUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: AddDeliveryRatingDto): Promise<void> {
    // Validar ratings
    if (dto.customer_rating < 1 || dto.customer_rating > 5) {
      throw new Error('Customer rating must be between 1 and 5');
    }
    if (dto.driver_rating && (dto.driver_rating < 1 || dto.driver_rating > 5)) {
      throw new Error('Driver rating must be between 1 and 5');
    }

    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validar que la orden está entregada
    if (order.status !== 'DELIVERED') {
      throw new Error('Can only rate delivered orders');
    }

    // Obtener driver actual de la orden
    const currentDriver = await this.prisma.orderDriver.findFirst({
      where: {
        order_id: dto.order_id,
        is_current: true,
      },
    });

    if (!currentDriver || !currentDriver.driver_id) {
      throw new Error('Order does not have an assigned driver');
    }

    // Crear rating
    await this.prisma.deliveryRating.create({
      data: {
        order_id: dto.order_id,
        driver_id: currentDriver.driver_id,
        customer_rating: dto.customer_rating,
        driver_rating: dto.driver_rating ?? null,
        customer_comment: dto.customer_comment ?? null,
        driver_comment: dto.driver_comment ?? null,
      },
    });

    // Actualizar rating promedio del driver (simplificado - en producción usar trigger o job)
    const driverRatings = await this.prisma.deliveryRating.findMany({
      where: { driver_id: currentDriver.driver_id },
    });

    const avgRating =
      driverRatings.reduce((sum, r) => sum + Number(r.customer_rating), 0) / driverRatings.length;

    await this.prisma.driver.update({
      where: { id: currentDriver.driver_id },
      data: { rating_avg: avgRating },
    });
  }
}


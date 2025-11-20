/**
 * Implementación de OrderPaymentTransaction Repository usando Prisma
 */

import { PrismaClient } from '@prisma/client';
import {
  IOrderPaymentTransactionRepository,
  CreateOrderPaymentTransactionData,
} from '../../domain/repositories/IOrderPaymentTransactionRepository';
import { OrderPaymentTransaction } from '../../domain/entities/OrderPaymentTransaction';

export class PrismaOrderPaymentTransactionRepository implements IOrderPaymentTransactionRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<OrderPaymentTransaction | null> {
    const data = await this.prisma.orderPaymentTransaction.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByOrderId(order_id: string): Promise<OrderPaymentTransaction[]> {
    const data = await this.prisma.orderPaymentTransaction.findMany({
      where: { order_id },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findByPaymentTransactionId(payment_transaction_id: string): Promise<OrderPaymentTransaction[]> {
    const data = await this.prisma.orderPaymentTransaction.findMany({
      where: { payment_transaction_id },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateOrderPaymentTransactionData): Promise<OrderPaymentTransaction> {
    const created = await this.prisma.orderPaymentTransaction.create({
      data: {
        order_id: data.order_id,
        payment_transaction_id: data.payment_transaction_id,
      },
    });

    return this.toDomain(created);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orderPaymentTransaction.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    order_id: string;
    payment_transaction_id: string;
    created_at: Date;
  }): OrderPaymentTransaction {
    return new OrderPaymentTransaction(
      data.id,
      data.order_id,
      data.payment_transaction_id,
      data.created_at
    );
  }
}


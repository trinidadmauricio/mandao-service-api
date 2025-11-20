/**
 * Implementación de PaymentTransaction Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import type { TransactionType as PrismaTransactionType, PaymentMethod as PrismaPaymentMethod, PaymentStatus as PrismaPaymentStatus } from '@prisma/client';
import {
  IPaymentTransactionRepository,
  CreatePaymentTransactionData,
  UpdatePaymentTransactionData,
} from '../../domain/repositories/IPaymentTransactionRepository';
import {
  PaymentTransaction,
  PaymentTransactionStatus,
  PaymentTransactionType,
  PaymentMethod,
} from '../../domain/entities/PaymentTransaction';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaPaymentTransactionRepository implements IPaymentTransactionRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<PaymentTransaction | null> {
    const data = await this.prisma.paymentTransaction.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByOrderId(order_id: string): Promise<PaymentTransaction[]> {
    // Buscar a través de OrderPaymentTransaction
    const orderPayments = await this.prisma.orderPaymentTransaction.findMany({
      where: { order_id },
      include: { payment_transaction: true },
    });

    return orderPayments.map((op) => this.toDomain(op.payment_transaction));
  }

  async findByPaymentIntentId(payment_intent_id: string): Promise<PaymentTransaction | null> {
    const data = await this.prisma.paymentTransaction.findFirst({
      where: { payment_intent_id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(
    tenant_id?: string,
    status?: PaymentTransactionStatus,
    transaction_type?: PaymentTransactionType
  ): Promise<PaymentTransaction[]> {
    const where: Prisma.PaymentTransactionWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (status) where.status = status;
    if (transaction_type) where.transaction_type = transaction_type;

    const data = await this.prisma.paymentTransaction.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreatePaymentTransactionData): Promise<PaymentTransaction> {
    const created = await this.prisma.paymentTransaction.create({
      data: {
        tenant_id: data.tenant_id,
        transaction_type: data.transaction_type as PrismaTransactionType,
        payment_method: data.payment_method as PrismaPaymentMethod,
        amount: data.amount,
        currency: data.currency,
        payment_intent_id: data.payment_intent_id ?? null,
        charge_id: data.charge_id ?? null,
        refund_id: data.refund_id ?? null,
        status: (data.status || 'PENDING') as PrismaPaymentStatus,
        failure_reason: data.failure_reason ?? null,
        card_last4: data.card_last4 ?? null,
        card_brand: data.card_brand ?? null,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdatePaymentTransactionData): Promise<PaymentTransaction> {
    const updated = await this.prisma.paymentTransaction.update({
      where: { id },
      data: {
        status: data.status ? (data.status as PrismaPaymentStatus) : undefined,
        payment_intent_id: data.payment_intent_id ?? undefined,
        charge_id: data.charge_id ?? undefined,
        refund_id: data.refund_id ?? undefined,
        failure_reason: data.failure_reason ?? undefined,
        card_last4: data.card_last4 ?? undefined,
        card_brand: data.card_brand ?? undefined,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
      },
    });

    return this.toDomain(updated);
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    transaction_type: string;
    payment_method: string;
    payment_intent_id: string | null;
    charge_id: string | null;
    refund_id: string | null;
    amount: Prisma.Decimal | number;
    currency: string;
    status: string;
    failure_reason: string | null;
    card_last4: string | null;
    card_brand: string | null;
    metadata: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
  }): PaymentTransaction {
    return new PaymentTransaction(
      data.id,
      data.tenant_id,
      data.transaction_type as PaymentTransactionType,
      data.payment_method as PaymentMethod,
      data.payment_intent_id,
      data.charge_id,
      data.refund_id,
      Number(data.amount),
      data.currency,
      data.status as PaymentTransactionStatus,
      data.failure_reason,
      data.card_last4,
      data.card_brand,
      data.metadata as Record<string, unknown> | null,
      data.created_at,
      data.updated_at
    );
  }
}


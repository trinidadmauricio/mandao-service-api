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
  ListPaymentTransactionsFilters,
  PaymentTransactionWithOrderId,
  PaymentTransactionsListResult,
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

  async findAllWithFilters(
    tenant_id: string,
    filters: ListPaymentTransactionsFilters
  ): Promise<PaymentTransactionsListResult> {
    const where: Prisma.PaymentTransactionWhereInput = {
      tenant_id,
    };

    if (filters.status) where.status = filters.status as PrismaPaymentStatus;
    if (filters.transaction_type) where.transaction_type = filters.transaction_type as PrismaTransactionType;
    if (filters.payment_method) where.payment_method = filters.payment_method as PrismaPaymentMethod;

    // Filtrar por fecha
    if (filters.start_date || filters.end_date) {
      where.created_at = {};
      if (filters.start_date) {
        where.created_at.gte = filters.start_date;
      }
      if (filters.end_date) {
        where.created_at.lte = filters.end_date;
      }
    }

    // Filtrar por order_id usando relación
    if (filters.order_id) {
      where.order_payments = {
        some: {
          order_id: filters.order_id,
        },
      };
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Obtener total de registros (sin paginación)
    const total = await this.prisma.paymentTransaction.count({ where });

    // Obtener transacciones con paginación e incluir relaciones order_payments
    const transactions = await this.prisma.paymentTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        order_payments: {
          select: {
            order_id: true,
          },
          take: 1, // Solo necesitamos el primer order_id
        },
      },
    });

    // Mapear a PaymentTransactionWithOrderId
    const data: PaymentTransactionWithOrderId[] = transactions.map((item) => {
      const transaction = this.toDomain(item);
      return {
        id: transaction.id,
        tenant_id: transaction.tenant_id,
        transaction_type: transaction.transaction_type,
        payment_method: transaction.payment_method,
        payment_intent_id: transaction.payment_intent_id,
        charge_id: transaction.charge_id,
        refund_id: transaction.refund_id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        failure_reason: transaction.failure_reason,
        card_last4: transaction.card_last4,
        card_brand: transaction.card_brand,
        metadata: transaction.metadata,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        order_id: item.order_payments[0]?.order_id || null,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
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


/**
 * Implementación de OrderCounter Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import {
  IOrderCounterRepository,
  CreateOrderCounterData,
  UpdateOrderCounterData,
} from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaOrderCounterRepository implements IOrderCounterRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<OrderCounter | null> {
    const data = await this.prisma.orderCounter.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTenantId(tenant_id: string): Promise<OrderCounter | null> {
    const data = await this.prisma.orderCounter.findUnique({
      where: { tenant_id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async create(data: CreateOrderCounterData): Promise<OrderCounter> {
    const created = await this.prisma.orderCounter.create({
      data: {
        tenant_id: data.tenant_id,
        prefix: data.prefix ?? null,
        padding_length: data.padding_length ?? 6,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateOrderCounterData): Promise<OrderCounter> {
    const updated = await this.prisma.orderCounter.update({
      where: { id },
      data: {
        current_value: data.current_value,
        prefix: data.prefix,
        padding_length: data.padding_length,
        last_reset_at: data.last_reset_at,
      },
    });

    return this.toDomain(updated);
  }

  async increment(id: string): Promise<OrderCounter> {
    // Usar transacción para incremento atómico
    const updated = await this.prisma.$transaction(async (tx) => {
      const counter = await tx.orderCounter.findUnique({
        where: { id },
      });

      if (!counter) {
        throw new Error('Order counter not found');
      }

      return await tx.orderCounter.update({
        where: { id },
        data: {
          current_value: {
            increment: 1,
          },
        },
      });
    });

    return this.toDomain(updated);
  }

  async incrementWithLock(tenant_id: string): Promise<OrderCounter> {
    // Usar transacción con row lock (SELECT FOR UPDATE) para concurrencia segura
    const updated = await this.prisma.$transaction(async (tx) => {
      // SELECT FOR UPDATE bloquea la fila hasta que termine la transacción
      const counter = await tx.$queryRaw<
        Array<{
          id: string;
          tenant_id: string;
          current_value: bigint;
          prefix: string | null;
          padding_length: number;
          last_reset_at: Date | null;
          created_at: Date;
          updated_at: Date;
        }>
      >`
        SELECT * FROM "shared"."order_counters"
        WHERE tenant_id = ${tenant_id}
        FOR UPDATE
      `;

      if (!counter || counter.length === 0) {
        throw new Error('Order counter not found');
      }

      const counterData = counter[0];

      // Incrementar y actualizar
      return await tx.orderCounter.update({
        where: { id: counterData.id },
        data: {
          current_value: {
            increment: 1,
          },
        },
      });
    });

    return this.toDomain(updated);
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    current_value: bigint;
    prefix: string | null;
    padding_length: number;
    last_reset_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }): OrderCounter {
    return new OrderCounter(
      data.id,
      data.tenant_id,
      data.current_value,
      data.prefix,
      data.padding_length,
      data.last_reset_at,
      data.created_at,
      data.updated_at
    );
  }
}

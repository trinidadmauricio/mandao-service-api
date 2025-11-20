/**
 * Implementación de SubscriptionPlan Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  ISubscriptionPlanRepository,
  CreateSubscriptionPlanData,
  UpdateSubscriptionPlanData,
} from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaSubscriptionPlanRepository implements ISubscriptionPlanRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<SubscriptionPlan | null> {
    const data = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(): Promise<SubscriptionPlan[]> {
    const data = await this.prisma.subscriptionPlan.findMany({
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
    const created = await this.prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        type: data.type,
        price_monthly: data.price_monthly,
        price_yearly: data.price_yearly,
        features: data.features as Prisma.InputJsonValue,
        max_products: data.max_products ?? null,
        max_orders_month: data.max_orders_month ?? null,
        max_branches: data.max_branches ?? null,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlan> {
    const updated = await this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: data.name,
        price_monthly: data.price_monthly,
        price_yearly: data.price_yearly,
        features: data.features as Prisma.InputJsonValue | undefined,
        max_products: data.max_products,
        max_orders_month: data.max_orders_month,
        max_branches: data.max_branches,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    name: string;
    type: 'BASIC' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
    price_monthly: Prisma.Decimal;
    price_yearly: Prisma.Decimal;
    features: Prisma.JsonValue;
    max_products: number | null;
    max_orders_month: number | null;
    max_branches: number | null;
    created_at: Date;
    updated_at: Date;
  }): SubscriptionPlan {
    // Convertir Prisma.JsonValue a Record<string, unknown>
    const features =
      data.features && typeof data.features === 'object' && !Array.isArray(data.features)
        ? (data.features as Record<string, unknown>)
        : {};

    return new SubscriptionPlan(
      data.id,
      data.name,
      data.type,
      Number(data.price_monthly),
      Number(data.price_yearly),
      features,
      data.max_products,
      data.max_orders_month,
      data.max_branches,
      data.created_at,
      data.updated_at
    );
  }
}

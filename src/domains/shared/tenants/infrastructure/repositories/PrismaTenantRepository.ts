/**
 * Implementación de Tenant Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  ITenantRepository,
  CreateTenantData,
  UpdateTenantData,
} from '../../domain/repositories/ITenantRepository';
import { Tenant } from '../../domain/entities/Tenant';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaTenantRepository implements ITenantRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Tenant | null> {
    const data = await this.prisma.tenant.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const data = await this.prisma.tenant.findUnique({
      where: { slug },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(): Promise<Tenant[]> {
    const data = await this.prisma.tenant.findMany({
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateTenantData): Promise<Tenant> {
    const created = await this.prisma.tenant.create({
      data: {
        slug: data.slug,
        name: data.name,
        type: data.type,
        subscription_plan_id: data.subscription_plan_id,
        default_locale: data.default_locale || 'es',
        default_currency: data.default_currency || 'USD',
        settings: (data.settings || {}) as Prisma.InputJsonValue,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateTenantData): Promise<Tenant> {
    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        name: data.name,
        subscription_plan_id: data.subscription_plan_id,
        subscription_status: data.subscription_status,
        subscription_expires_at: data.subscription_expires_at,
        default_locale: data.default_locale,
        default_currency: data.default_currency,
        settings: data.settings as Prisma.InputJsonValue | undefined,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tenant.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    slug: string;
    name: string;
    type: 'RETAIL' | 'ON_DEMAND' | 'HYBRID';
    subscription_plan_id: string | null;
    subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
    subscription_expires_at: Date | null;
    default_locale: string;
    default_currency: string;
    settings: Prisma.JsonValue | null;
    created_at: Date;
    updated_at: Date;
  }): Tenant {
    // Convertir Prisma.JsonValue a Record<string, unknown>
    const settings =
      data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)
        ? (data.settings as Record<string, unknown>)
        : null;

    return new Tenant(
      data.id,
      data.slug,
      data.name,
      data.type,
      data.subscription_plan_id,
      data.subscription_status,
      data.subscription_expires_at,
      data.default_locale,
      data.default_currency,
      settings,
      data.created_at,
      data.updated_at
    );
  }
}

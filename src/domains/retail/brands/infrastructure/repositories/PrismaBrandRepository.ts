/**
 * Implementación de Brand Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IBrandRepository, CreateBrandData, UpdateBrandData } from '../../domain/repositories/IBrandRepository';
import { Brand } from '../../domain/entities/Brand';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaBrandRepository implements IBrandRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Brand | null> {
    const data = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findBySlug(tenant_id: string, slug: string): Promise<Brand | null> {
    const data = await this.prisma.brand.findUnique({
      where: {
        tenant_id_slug: {
          tenant_id,
          slug,
        },
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string): Promise<Brand[]> {
    const where = tenant_id ? { tenant_id } : {};
    const data = await this.prisma.brand.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateBrandData): Promise<Brand> {
    const created = await this.prisma.brand.create({
      data: {
        tenant_id: data.tenant_id,
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url ?? null,
        description: data.description ?? null,
        is_active: data.is_active ?? true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateBrandData): Promise<Brand> {
    const updated = await this.prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        logo_url: data.logo_url ?? undefined,
        description: data.description ?? undefined,
        is_active: data.is_active,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.brand.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): Brand {
    return new Brand(
      data.id,
      data.tenant_id,
      data.name,
      data.slug,
      data.logo_url,
      data.description,
      data.is_active,
      data.created_at,
      data.updated_at
    );
  }
}


/**
 * Implementación de Category Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  ICategoryRepository,
  CreateCategoryData,
  UpdateCategoryData,
} from '../../domain/repositories/ICategoryRepository';
import { Category } from '../../domain/entities/Category';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Category | null> {
    const data = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findBySlug(tenant_id: string, slug: string): Promise<Category | null> {
    const data = await this.prisma.category.findUnique({
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

  async findAll(tenant_id?: string, parent_id?: string | null): Promise<Category[]> {
    const where: Prisma.CategoryWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (parent_id !== undefined) where.parent_id = parent_id;

    const data = await this.prisma.category.findMany({
      where,
      orderBy: { display_order: 'asc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const created = await this.prisma.category.create({
      data: {
        tenant_id: data.tenant_id,
        parent_id: data.parent_id ?? null,
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        image_url: data.image_url ?? null,
        display_order: data.display_order ?? 0,
        is_active: data.is_active ?? true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const updated = await this.prisma.category.update({
      where: { id },
      data: {
        parent_id: data.parent_id ?? undefined,
        name: data.name,
        slug: data.slug,
        description: data.description ?? undefined,
        image_url: data.image_url ?? undefined,
        display_order: data.display_order,
        is_active: data.is_active,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    parent_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    display_order: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): Category {
    return new Category(
      data.id,
      data.tenant_id,
      data.parent_id,
      data.name,
      data.slug,
      data.description,
      data.image_url,
      data.display_order,
      data.is_active,
      data.created_at,
      data.updated_at
    );
  }
}

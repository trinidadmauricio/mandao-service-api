/**
 * Implementación de Product Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { IProductRepository, CreateProductData, UpdateProductData } from '../../domain/repositories/IProductRepository';
import { Product, UnitOfMeasure } from '../../domain/entities/Product';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaProductRepository implements IProductRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const data = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findBySku(tenant_id: string, sku: string): Promise<Product | null> {
    const data = await this.prisma.product.findUnique({
      where: {
        tenant_id_sku: {
          tenant_id,
          sku,
        },
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string, category_id?: string, is_active?: boolean): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (category_id) where.category_id = category_id;
    if (is_active !== undefined) where.is_active = is_active;

    const data = await this.prisma.product.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateProductData): Promise<Product> {
    const created = await this.prisma.product.create({
      data: {
        tenant_id: data.tenant_id,
        sku: data.sku,
        barcode: data.barcode ?? null,
        name: data.name,
        description: data.description ?? null,
        name_translations: data.name_translations ? (data.name_translations as Prisma.InputJsonValue) : Prisma.JsonNull,
        description_translations: data.description_translations ? (data.description_translations as Prisma.InputJsonValue) : Prisma.JsonNull,
        category_id: data.category_id,
        brand_id: data.brand_id ?? null,
        cost_price: data.cost_price,
        selling_price: data.selling_price,
        compare_at_price: data.compare_at_price ?? null,
        currency: data.currency ?? 'USD',
        track_inventory: data.track_inventory ?? true,
        current_stock: data.current_stock ?? 0,
        min_stock_alert: data.min_stock_alert ?? 0,
        uom: data.uom ?? 'UNIT',
        weight_kg: data.weight_kg ?? null,
        dimensions: data.dimensions ? (data.dimensions as Prisma.InputJsonValue) : Prisma.JsonNull,
        images: data.images as Prisma.InputJsonValue,
        featured_image_url: data.featured_image_url ?? null,
        has_variants: data.has_variants ?? false,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        meta_title: data.meta_title ?? null,
        meta_description: data.meta_description ?? null,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        sku: data.sku,
        barcode: data.barcode ?? undefined,
        name: data.name,
        description: data.description ?? undefined,
        name_translations: data.name_translations ? (data.name_translations as Prisma.InputJsonValue) : undefined,
        description_translations: data.description_translations ? (data.description_translations as Prisma.InputJsonValue) : undefined,
        category_id: data.category_id,
        brand_id: data.brand_id ?? undefined,
        cost_price: data.cost_price,
        selling_price: data.selling_price,
        compare_at_price: data.compare_at_price ?? undefined,
        currency: data.currency,
        track_inventory: data.track_inventory,
        current_stock: data.current_stock,
        min_stock_alert: data.min_stock_alert,
        uom: data.uom,
        weight_kg: data.weight_kg ?? undefined,
        dimensions: data.dimensions ? (data.dimensions as Prisma.InputJsonValue) : undefined,
        images: data.images ? (data.images as Prisma.InputJsonValue) : undefined,
        featured_image_url: data.featured_image_url ?? undefined,
        has_variants: data.has_variants,
        is_active: data.is_active,
        is_featured: data.is_featured,
        meta_title: data.meta_title ?? undefined,
        meta_description: data.meta_description ?? undefined,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    sku: string;
    barcode: string | null;
    name: string;
    description: string | null;
    name_translations: Prisma.JsonValue | null;
    description_translations: Prisma.JsonValue | null;
    category_id: string;
    brand_id: string | null;
    cost_price: Prisma.Decimal | number;
    selling_price: Prisma.Decimal | number;
    compare_at_price: Prisma.Decimal | number | null;
    currency: string;
    track_inventory: boolean;
    current_stock: number;
    min_stock_alert: number;
    uom: string;
    weight_kg: Prisma.Decimal | number | null;
    dimensions: Prisma.JsonValue | null;
    images: Prisma.JsonValue;
    featured_image_url: string | null;
    has_variants: boolean;
    is_active: boolean;
    is_featured: boolean;
    meta_title: string | null;
    meta_description: string | null;
    created_at: Date;
    updated_at: Date;
  }): Product {
    return new Product(
      data.id,
      data.tenant_id,
      data.sku,
      data.barcode,
      data.name,
      data.description,
      data.name_translations ? (data.name_translations as Record<string, string>) : null,
      data.description_translations ? (data.description_translations as Record<string, string>) : null,
      data.category_id,
      data.brand_id,
      Number(data.cost_price),
      Number(data.selling_price),
      data.compare_at_price ? Number(data.compare_at_price) : null,
      data.currency,
      data.track_inventory,
      data.current_stock,
      data.min_stock_alert,
      data.uom as UnitOfMeasure,
      data.weight_kg ? Number(data.weight_kg) : null,
      data.dimensions ? (data.dimensions as Record<string, unknown>) : null,
      data.images as Record<string, unknown>,
      data.featured_image_url,
      data.has_variants,
      data.is_active,
      data.is_featured,
      data.meta_title,
      data.meta_description,
      data.created_at,
      data.updated_at
    );
  }
}


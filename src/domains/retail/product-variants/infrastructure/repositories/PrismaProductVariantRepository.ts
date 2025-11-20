/**
 * Implementación de ProductVariant Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IProductVariantRepository,
  CreateProductVariantData,
  UpdateProductVariantData,
} from '../../domain/repositories/IProductVariantRepository';
import { ProductVariant } from '../../domain/entities/ProductVariant';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaProductVariantRepository implements IProductVariantRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<ProductVariant | null> {
    const data = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findBySku(tenant_id: string, sku: string): Promise<ProductVariant | null> {
    const data = await this.prisma.productVariant.findUnique({
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

  async findByProductId(product_id: string): Promise<ProductVariant[]> {
    const data = await this.prisma.productVariant.findMany({
      where: { product_id },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAll(tenant_id?: string, product_id?: string): Promise<ProductVariant[]> {
    const where: Prisma.ProductVariantWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (product_id) where.product_id = product_id;

    const data = await this.prisma.productVariant.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateProductVariantData): Promise<ProductVariant> {
    const created = await this.prisma.productVariant.create({
      data: {
        product_id: data.product_id,
        tenant_id: data.tenant_id,
        sku: data.sku,
        barcode: data.barcode ?? null,
        option1_name: data.option1_name ?? null,
        option1_value: data.option1_value ?? null,
        option2_name: data.option2_name ?? null,
        option2_value: data.option2_value ?? null,
        option3_name: data.option3_name ?? null,
        option3_value: data.option3_value ?? null,
        price_adjustment: data.price_adjustment ?? 0,
        cost_price: data.cost_price ?? null,
        currency: data.currency ?? 'USD',
        track_inventory: data.track_inventory ?? true,
        current_stock: data.current_stock ?? 0,
        weight_kg: data.weight_kg ?? null,
        image_url: data.image_url ?? null,
        is_active: data.is_active ?? true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateProductVariantData): Promise<ProductVariant> {
    const updated = await this.prisma.productVariant.update({
      where: { id },
      data: {
        sku: data.sku,
        barcode: data.barcode ?? undefined,
        option1_name: data.option1_name ?? undefined,
        option1_value: data.option1_value ?? undefined,
        option2_name: data.option2_name ?? undefined,
        option2_value: data.option2_value ?? undefined,
        option3_name: data.option3_name ?? undefined,
        option3_value: data.option3_value ?? undefined,
        price_adjustment: data.price_adjustment,
        cost_price: data.cost_price ?? undefined,
        currency: data.currency,
        track_inventory: data.track_inventory,
        current_stock: data.current_stock,
        weight_kg: data.weight_kg ?? undefined,
        image_url: data.image_url ?? undefined,
        is_active: data.is_active,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.productVariant.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    product_id: string;
    tenant_id: string;
    sku: string;
    barcode: string | null;
    option1_name: string | null;
    option1_value: string | null;
    option2_name: string | null;
    option2_value: string | null;
    option3_name: string | null;
    option3_value: string | null;
    price_adjustment: Prisma.Decimal | number;
    cost_price: Prisma.Decimal | number | null;
    currency: string;
    track_inventory: boolean;
    current_stock: number;
    weight_kg: Prisma.Decimal | number | null;
    image_url: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): ProductVariant {
    return new ProductVariant(
      data.id,
      data.product_id,
      data.tenant_id,
      data.sku,
      data.barcode,
      data.option1_name,
      data.option1_value,
      data.option2_name,
      data.option2_value,
      data.option3_name,
      data.option3_value,
      Number(data.price_adjustment),
      data.cost_price ? Number(data.cost_price) : null,
      data.currency,
      data.track_inventory,
      data.current_stock,
      data.weight_kg ? Number(data.weight_kg) : null,
      data.image_url,
      data.is_active,
      data.created_at,
      data.updated_at
    );
  }
}


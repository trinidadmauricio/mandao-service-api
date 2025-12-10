/**
 * Prisma implementation de IWishlistRepository
 */

import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { WishlistItem } from '../../domain/entities/WishlistItem';
import {
  IWishlistRepository,
  CreateWishlistItemData,
} from '../../domain/repositories/IWishlistRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaWishlistRepository implements IWishlistRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findAllByCustomer(tenant_id: string, customer_id: string): Promise<WishlistItem[]> {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        tenant_id,
        customer_id,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return items.map(this.mapToDomain);
  }

  async findByProductAndVariant(
    tenant_id: string,
    customer_id: string,
    product_id: string,
    variant_id?: string | null
  ): Promise<WishlistItem | null> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: {
        tenant_id_customer_id_product_id_variant_id: {
          tenant_id,
          customer_id,
          product_id,
          variant_id: variant_id ?? null,
        } as any,
      },
    });

    return item ? this.mapToDomain(item) : null;
  }

  async create(data: CreateWishlistItemData): Promise<WishlistItem> {
    const item = await this.prisma.wishlistItem.create({
      data: {
        tenant_id: data.tenant_id,
        customer_id: data.customer_id,
        product_id: data.product_id,
        variant_id: data.variant_id ?? null,
      },
    });

    return this.mapToDomain(item);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.wishlistItem.delete({
      where: { id },
    });
  }

  async deleteByProductAndVariant(
    tenant_id: string,
    customer_id: string,
    product_id: string,
    variant_id?: string | null
  ): Promise<void> {
    await this.prisma.wishlistItem.deleteMany({
      where: {
        tenant_id,
        customer_id,
        product_id,
        variant_id: variant_id ?? null,
      },
    });
  }

  private mapToDomain(item: any): WishlistItem {
    return new WishlistItem(
      item.id,
      item.tenant_id,
      item.customer_id,
      item.product_id,
      item.variant_id,
      item.created_at
    );
  }
}


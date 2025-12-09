/**
 * Implementación de Cart Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import {
  ICartRepository,
  CreateCartData,
  UpdateCartData,
  CreateCartItemData,
  UpdateCartItemData,
} from '../../domain/repositories/ICartRepository';
import { Cart } from '../../domain/entities/Cart';
import { CartItem } from '../../domain/entities/CartItem';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaCartRepository implements ICartRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Cart | null> {
    const data = await this.prisma.cart.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTenantAndCustomer(tenant_id: string, customer_id: string): Promise<Cart | null> {
    const data = await this.prisma.cart.findUnique({
      where: {
        tenant_id_customer_id: {
          tenant_id,
          customer_id,
        },
      },
      include: {
        items: true,
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTenantAndSession(tenant_id: string, session_id: string): Promise<Cart | null> {
    const data = await this.prisma.cart.findFirst({
      where: {
        tenant_id,
        session_id,
      },
      include: {
        items: true,
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async create(data: CreateCartData): Promise<Cart> {
    const created = await this.prisma.cart.create({
      data: {
        tenant_id: data.tenant_id,
        customer_id: data.customer_id ?? null,
        session_id: data.session_id ?? null,
        coupon_code: data.coupon_code ?? null,
        expires_at: data.expires_at ?? null,
      },
      include: {
        items: true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateCartData): Promise<Cart> {
    const updated = await this.prisma.cart.update({
      where: { id },
      data: {
        coupon_code: data.coupon_code ?? undefined,
        expires_at: data.expires_at ?? undefined,
      },
      include: {
        items: true,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cart.delete({
      where: { id },
    });
  }

  async addItem(cart_id: string, data: CreateCartItemData): Promise<CartItem> {
    const created = await this.prisma.cartItem.create({
      data: {
        cart_id,
        product_id: data.product_id,
        variant_id: data.variant_id ?? null,
        quantity: data.quantity,
        unit_price: data.unit_price,
      },
    });

    return this.toCartItemDomain(created);
  }

  async updateItem(item_id: string, data: UpdateCartItemData): Promise<CartItem> {
    const updated = await this.prisma.cartItem.update({
      where: { id: item_id },
      data: {
        quantity: data.quantity,
      },
    });

    return this.toCartItemDomain(updated);
  }

  async removeItem(item_id: string): Promise<void> {
    await this.prisma.cartItem.delete({
      where: { id: item_id },
    });
  }

  async clearItems(cart_id: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cart_id },
    });
  }

  async findCartByItemId(item_id: string): Promise<Cart | null> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: item_id },
      include: {
        cart: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    return this.toDomain(item.cart);
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    customer_id: string | null;
    session_id: string | null;
    coupon_code: string | null;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
    items: Array<{
      id: string;
      cart_id: string;
      product_id: string;
      variant_id: string | null;
      quantity: number;
      unit_price: number | any; // Prisma Decimal type
      created_at: Date;
      updated_at: Date;
    }>;
  }): Cart {
    return new Cart(
      data.id,
      data.tenant_id,
      data.customer_id,
      data.session_id,
      data.coupon_code,
      data.expires_at,
      data.created_at,
      data.updated_at,
      data.items.map((item) => this.toCartItemDomain(item))
    );
  }

  private toCartItemDomain(data: {
    id: string;
    cart_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number | any; // Prisma Decimal type
    created_at: Date;
    updated_at: Date;
  }): CartItem {
    return new CartItem(
      data.id,
      data.cart_id,
      data.product_id,
      data.variant_id,
      data.quantity,
      Number(data.unit_price),
      data.created_at,
      data.updated_at
    );
  }
}


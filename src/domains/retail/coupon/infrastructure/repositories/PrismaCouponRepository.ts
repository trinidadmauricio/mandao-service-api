/**
 * Implementación de ICouponRepository usando Prisma
 */

import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';
import { ICouponRepository } from '../../domain/repositories/ICouponRepository';
import { Coupon, DiscountType } from '../../domain/entities/Coupon';

@injectable()
export class PrismaCouponRepository implements ICouponRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findByCode(tenant_id: string, code: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        tenant_id_code: {
          tenant_id,
          code: code.toUpperCase(),
        },
      },
    });

    if (!coupon) {
      return null;
    }

    return this.toDomain(coupon);
  }

  async findById(id: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return null;
    }

    return this.toDomain(coupon);
  }

  async incrementUses(id: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id },
      data: {
        current_uses: {
          increment: 1,
        },
      },
    });
  }

  async decrementUses(id: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id },
      data: {
        current_uses: {
          decrement: 1,
        },
      },
    });
  }

  private toDomain(coupon: any): Coupon {
    return new Coupon(
      coupon.id,
      coupon.tenant_id,
      coupon.code,
      coupon.discount_type === 'PERCENTAGE' ? DiscountType.PERCENTAGE : DiscountType.FIXED_AMOUNT,
      Number(coupon.discount_value),
      coupon.min_order_value ? Number(coupon.min_order_value) : null,
      coupon.max_uses,
      coupon.current_uses,
      coupon.valid_from,
      coupon.valid_until,
      coupon.is_active,
      coupon.created_at,
      coupon.updated_at
    );
  }
}


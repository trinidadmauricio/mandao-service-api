/**
 * Interface para Coupon Repository
 */

import { Coupon } from '../entities/Coupon';

export interface ICouponRepository {
  findByCode(tenant_id: string, code: string): Promise<Coupon | null>;
  findById(id: string): Promise<Coupon | null>;
  incrementUses(id: string): Promise<void>;
  decrementUses(id: string): Promise<void>;
}


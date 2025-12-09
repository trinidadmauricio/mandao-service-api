/**
 * Interface para Cart Repository
 */

import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';

export interface ICartRepository {
  findById(id: string): Promise<Cart | null>;
  findByTenantAndCustomer(tenant_id: string, customer_id: string): Promise<Cart | null>;
  findByTenantAndSession(tenant_id: string, session_id: string): Promise<Cart | null>;
  create(data: CreateCartData): Promise<Cart>;
  update(id: string, data: UpdateCartData): Promise<Cart>;
  delete(id: string): Promise<void>;
  findCartByItemId(item_id: string): Promise<Cart | null>;
  addItem(cart_id: string, data: CreateCartItemData): Promise<CartItem>;
  updateItem(item_id: string, data: UpdateCartItemData): Promise<CartItem>;
  removeItem(item_id: string): Promise<void>;
  clearItems(cart_id: string): Promise<void>;
}

export interface CreateCartData {
  tenant_id: string;
  customer_id?: string | null;
  session_id?: string | null;
  coupon_code?: string | null;
  expires_at?: Date | null;
}

export interface UpdateCartData {
  coupon_code?: string | null;
  expires_at?: Date | null;
}

export interface CreateCartItemData {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
}

export interface UpdateCartItemData {
  quantity: number;
}


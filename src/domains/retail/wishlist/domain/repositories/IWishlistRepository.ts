/**
 * Repository interface para WishlistItem
 */

import { WishlistItem } from '../entities/WishlistItem';

export interface CreateWishlistItemData {
  tenant_id: string;
  customer_id: string;
  product_id: string;
  variant_id?: string | null;
}

export interface IWishlistRepository {
  findAllByCustomer(tenant_id: string, customer_id: string): Promise<WishlistItem[]>;
  findByProductAndVariant(
    tenant_id: string,
    customer_id: string,
    product_id: string,
    variant_id?: string | null
  ): Promise<WishlistItem | null>;
  create(data: CreateWishlistItemData): Promise<WishlistItem>;
  delete(id: string): Promise<void>;
  deleteByProductAndVariant(
    tenant_id: string,
    customer_id: string,
    product_id: string,
    variant_id?: string | null
  ): Promise<void>;
}


/**
 * Use case para remover producto de wishlist
 */

import { injectable, inject } from 'inversify';
import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class RemoveFromWishlistUseCase {
  constructor(
    @inject(TYPES.WishlistRepository)
    private repository: IWishlistRepository
  ) {}

  async execute(
    tenant_id: string,
    customer_id: string,
    product_id: string,
    variant_id?: string | null
  ): Promise<void> {
    const item = await this.repository.findByProductAndVariant(
      tenant_id,
      customer_id,
      product_id,
      variant_id
    );

    if (!item) {
      throw new Error('Wishlist item not found');
    }

    await this.repository.delete(item.id);
  }
}


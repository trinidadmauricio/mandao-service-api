/**
 * Use case para obtener wishlist de un customer
 */

import { injectable, inject } from 'inversify';
import { IWishlistRepository } from '../../domain/repositories/IWishlistRepository';
import { WishlistItem } from '../../domain/entities/WishlistItem';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetWishlistUseCase {
  constructor(
    @inject(TYPES.WishlistRepository)
    private repository: IWishlistRepository
  ) {}

  async execute(tenant_id: string, customer_id: string): Promise<WishlistItem[]> {
    return this.repository.findAllByCustomer(tenant_id, customer_id);
  }
}


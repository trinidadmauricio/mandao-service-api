/**
 * Use case para eliminar una dirección de customer
 */

import { injectable, inject } from 'inversify';
import { ICustomerAddressRepository } from '../../domain/repositories/ICustomerAddressRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteCustomerAddressUseCase {
  constructor(
    @inject(TYPES.CustomerAddressRepository)
    private repository: ICustomerAddressRepository
  ) {}

  async execute(id: string): Promise<void> {
    const address = await this.repository.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }

    await this.repository.delete(id);
  }
}


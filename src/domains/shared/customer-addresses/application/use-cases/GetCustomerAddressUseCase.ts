/**
 * Use case para obtener una dirección por ID
 */

import { injectable, inject } from 'inversify';
import { ICustomerAddressRepository } from '../../domain/repositories/ICustomerAddressRepository';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetCustomerAddressUseCase {
  constructor(
    @inject(TYPES.CustomerAddressRepository)
    private repository: ICustomerAddressRepository
  ) {}

  async execute(id: string): Promise<CustomerAddress> {
    const address = await this.repository.findById(id);
    if (!address) {
      throw new Error('Address not found');
    }
    return address;
  }
}


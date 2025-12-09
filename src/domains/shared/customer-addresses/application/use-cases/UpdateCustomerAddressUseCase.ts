/**
 * Use case para actualizar una dirección de customer
 */

import { injectable, inject } from 'inversify';
import { ICustomerAddressRepository } from '../../domain/repositories/ICustomerAddressRepository';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { UpdateCustomerAddressDto } from '../dto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateCustomerAddressUseCase {
  constructor(
    @inject(TYPES.CustomerAddressRepository)
    private repository: ICustomerAddressRepository
  ) {}

  async execute(id: string, dto: UpdateCustomerAddressDto): Promise<CustomerAddress> {
    const existingAddress = await this.repository.findById(id);
    if (!existingAddress) {
      throw new Error('Address not found');
    }

    return this.repository.update(id, dto);
  }
}


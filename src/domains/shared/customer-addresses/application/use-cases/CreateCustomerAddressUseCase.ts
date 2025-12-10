/**
 * Use case para crear una dirección de customer
 */

import { injectable, inject } from 'inversify';
import { ICustomerAddressRepository } from '../../domain/repositories/ICustomerAddressRepository';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { CreateCustomerAddressDto } from '../dto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateCustomerAddressUseCase {
  constructor(
    @inject(TYPES.CustomerAddressRepository)
    private repository: ICustomerAddressRepository
  ) {}

  async execute(
    tenant_id: string,
    customer_id: string,
    dto: CreateCustomerAddressDto
  ): Promise<CustomerAddress> {
    return this.repository.create({
      tenant_id,
      customer_id,
      ...dto,
    });
  }
}


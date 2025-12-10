/**
 * Use case para obtener direcciones de un customer
 */

import { injectable, inject } from 'inversify';
import { ICustomerAddressRepository } from '../../domain/repositories/ICustomerAddressRepository';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetCustomerAddressesUseCase {
  constructor(
    @inject(TYPES.CustomerAddressRepository)
    private repository: ICustomerAddressRepository
  ) {}

  async execute(tenant_id: string, customer_id: string): Promise<CustomerAddress[]> {
    return this.repository.findAllByCustomer(tenant_id, customer_id);
  }
}


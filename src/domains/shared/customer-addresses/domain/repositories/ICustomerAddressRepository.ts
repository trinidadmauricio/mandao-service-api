/**
 * Repository interface para CustomerAddress
 */

import { CustomerAddress } from '../entities/CustomerAddress';

export interface CreateCustomerAddressData {
  tenant_id: string;
  customer_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street: string;
  street_line_2?: string | null;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  lat?: number | null;
  lng?: number | null;
  instructions?: string | null;
  is_default?: boolean;
}

export interface UpdateCustomerAddressData {
  label?: string;
  recipient_name?: string;
  phone?: string;
  street?: string;
  street_line_2?: string | null;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  lat?: number | null;
  lng?: number | null;
  instructions?: string | null;
  is_default?: boolean;
}

export interface ICustomerAddressRepository {
  findAllByCustomer(tenant_id: string, customer_id: string): Promise<CustomerAddress[]>;
  findById(id: string): Promise<CustomerAddress | null>;
  create(data: CreateCustomerAddressData): Promise<CustomerAddress>;
  update(id: string, data: UpdateCustomerAddressData): Promise<CustomerAddress>;
  delete(id: string): Promise<void>;
  setDefaultAddress(tenant_id: string, customer_id: string, address_id: string): Promise<void>;
}


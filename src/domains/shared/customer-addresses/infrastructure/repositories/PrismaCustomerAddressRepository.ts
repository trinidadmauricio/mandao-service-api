/**
 * Prisma implementation de ICustomerAddressRepository
 */

import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { CustomerAddress } from '../../domain/entities/CustomerAddress';
import {
  ICustomerAddressRepository,
  CreateCustomerAddressData,
  UpdateCustomerAddressData,
} from '../../domain/repositories/ICustomerAddressRepository';

@injectable()
export class PrismaCustomerAddressRepository implements ICustomerAddressRepository {
  constructor(private prisma: PrismaClient) {}

  async findAllByCustomer(tenant_id: string, customer_id: string): Promise<CustomerAddress[]> {
    const addresses = await this.prisma.customerAddress.findMany({
      where: {
        tenant_id,
        customer_id,
      },
      orderBy: [
        { is_default: 'desc' },
        { created_at: 'desc' },
      ],
    });

    return addresses.map(this.mapToDomain);
  }

  async findById(id: string): Promise<CustomerAddress | null> {
    const address = await this.prisma.customerAddress.findUnique({
      where: { id },
    });

    return address ? this.mapToDomain(address) : null;
  }

  async create(data: CreateCustomerAddressData): Promise<CustomerAddress> {
    // Si se marca como default, desmarcar otros
    if (data.is_default) {
      await this.prisma.customerAddress.updateMany({
        where: {
          tenant_id: data.tenant_id,
          customer_id: data.customer_id,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      });
    }

    const address = await this.prisma.customerAddress.create({
      data: {
        tenant_id: data.tenant_id,
        customer_id: data.customer_id,
        label: data.label,
        recipient_name: data.recipient_name,
        phone: data.phone,
        street: data.street,
        street_line_2: data.street_line_2 ?? null,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        country: data.country,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        instructions: data.instructions ?? null,
        is_default: data.is_default ?? false,
      },
    });

    return this.mapToDomain(address);
  }

  async update(id: string, data: UpdateCustomerAddressData): Promise<CustomerAddress> {
    // Si se marca como default, desmarcar otros
    if (data.is_default === true) {
      const address = await this.prisma.customerAddress.findUnique({
        where: { id },
        select: { tenant_id: true, customer_id: true },
      });

      if (address) {
        await this.prisma.customerAddress.updateMany({
          where: {
            tenant_id: address.tenant_id,
            customer_id: address.customer_id,
            is_default: true,
            id: { not: id },
          },
          data: {
            is_default: false,
          },
        });
      }
    }

    const address = await this.prisma.customerAddress.update({
      where: { id },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.recipient_name !== undefined && { recipient_name: data.recipient_name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.street !== undefined && { street: data.street }),
        ...(data.street_line_2 !== undefined && { street_line_2: data.street_line_2 }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.state !== undefined && { state: data.state }),
        ...(data.zip_code !== undefined && { zip_code: data.zip_code }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.lat !== undefined && { lat: data.lat }),
        ...(data.lng !== undefined && { lng: data.lng }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.is_default !== undefined && { is_default: data.is_default }),
      },
    });

    return this.mapToDomain(address);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customerAddress.delete({
      where: { id },
    });
  }

  async setDefaultAddress(tenant_id: string, customer_id: string, address_id: string): Promise<void> {
    await this.prisma.$transaction([
      // Desmarcar todos como default
      this.prisma.customerAddress.updateMany({
        where: {
          tenant_id,
          customer_id,
          is_default: true,
        },
        data: {
          is_default: false,
        },
      }),
      // Marcar el seleccionado como default
      this.prisma.customerAddress.update({
        where: { id: address_id },
        data: {
          is_default: true,
        },
      }),
    ]);
  }

  private mapToDomain(address: any): CustomerAddress {
    return new CustomerAddress(
      address.id,
      address.tenant_id,
      address.customer_id,
      address.label,
      address.recipient_name,
      address.phone,
      address.street,
      address.street_line_2,
      address.city,
      address.state,
      address.zip_code,
      address.country,
      address.lat ? Number(address.lat) : null,
      address.lng ? Number(address.lng) : null,
      address.instructions,
      address.is_default,
      address.created_at,
      address.updated_at
    );
  }
}


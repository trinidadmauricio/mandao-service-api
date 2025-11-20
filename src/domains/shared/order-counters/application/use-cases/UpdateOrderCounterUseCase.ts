/**
 * Use Case: Actualizar OrderCounter
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { OrderCounter } from '../../domain/entities/OrderCounter';
import { UpdateOrderCounterDto } from '../dto/UpdateOrderCounterDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateOrderCounterUseCase {
  constructor(@inject(TYPES.IOrderCounterRepository) private repository: IOrderCounterRepository) {}

  async execute(tenant_id: string, dto: UpdateOrderCounterDto): Promise<OrderCounter> {
    const existing = await this.repository.findByTenantId(tenant_id);

    if (!existing) {
      throw new Error('Order counter not found');
    }

    const updateData: Parameters<IOrderCounterRepository['update']>[1] = {
      prefix: dto.prefix,
      padding_length: dto.padding_length,
    };

    if (dto.reset) {
      updateData.current_value = BigInt(0);
      updateData.last_reset_at = new Date();
    } else if (dto.current_value !== undefined) {
      updateData.current_value = BigInt(dto.current_value);
    }

    return await this.repository.update(existing.id, updateData);
  }
}


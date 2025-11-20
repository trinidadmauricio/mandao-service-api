/**
 * Use Case: Eliminar LogisticsProvider
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteLogisticsProviderUseCase {
  constructor(@inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Logistics provider not found');
    }

    // Eliminar
    await this.repository.delete(id);
  }
}


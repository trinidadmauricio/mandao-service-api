/**
 * Use Case: Obtener LogisticsProvider
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetLogisticsProviderUseCase {
  constructor(@inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository) {}

  async execute(id: string): Promise<LogisticsProvider> {
    const provider = await this.repository.findById(id);
    if (!provider) {
      throw new Error('Logistics provider not found');
    }
    return provider;
  }
}


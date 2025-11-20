/**
 * Use Case: Listar LogisticsProviders
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListLogisticsProvidersUseCase {
  constructor(@inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository) {}

  async execute(tenant_id?: string): Promise<LogisticsProvider[]> {
    return await this.repository.findAll(tenant_id);
  }
}


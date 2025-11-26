/**
 * Use Case: Listar LogisticsProviders
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { ListLogisticsProvidersFiltersDto } from '../dto/ListLogisticsProvidersFiltersDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListLogisticsProvidersUseCase {
  constructor(
    @inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository
  ) {}

  async execute(
    tenant_id?: string,
    filters?: ListLogisticsProvidersFiltersDto
  ): Promise<LogisticsProvider[]> {
    // Si hay filtros, usar findAllWithFilters
    if (filters && this.hasFilters(filters)) {
      return await this.repository.findAllWithFilters(tenant_id, filters);
    }
    // Si no hay filtros, usar findAll para mantener compatibilidad
    return await this.repository.findAll(tenant_id);
  }

  private hasFilters(filters: ListLogisticsProvidersFiltersDto): boolean {
    return !!(
      filters.search ||
      filters.status ||
      filters.verification_status ||
      filters.is_global !== undefined
    );
  }
}

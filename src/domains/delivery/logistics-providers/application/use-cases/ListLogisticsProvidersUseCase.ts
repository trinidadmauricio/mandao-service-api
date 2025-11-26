/**
 * Use Case: Listar LogisticsProviders
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ILogisticsProviderRepository } from '../../domain/repositories/ILogisticsProviderRepository';
import { LogisticsProvider } from '../../domain/entities/LogisticsProvider';
import { ListLogisticsProvidersFiltersDto } from '../dto/ListLogisticsProvidersFiltersDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface ListLogisticsProvidersContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
}

@injectable()
export class ListLogisticsProvidersUseCase {
  constructor(
    @inject(TYPES.ILogisticsProviderRepository) private repository: ILogisticsProviderRepository
  ) {}

  async execute(
    tenant_id: string | undefined,
    filters: ListLogisticsProvidersFiltersDto | undefined,
    context: ListLogisticsProvidersContext | undefined
  ): Promise<LogisticsProvider[]> {
    // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, solo retornar su propio proveedor
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      const currentUserLogisticsProviderId = context.currentUserLogisticsProviderId;

      if (
        (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) &&
        currentUserLogisticsProviderId
      ) {
        const provider = await this.repository.findById(currentUserLogisticsProviderId);
        return provider ? [provider] : [];
      }
    }

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

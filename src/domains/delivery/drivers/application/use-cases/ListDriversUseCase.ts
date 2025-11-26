/**
 * Use Case: Listar Drivers
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository, DriversListResult } from '../../domain/repositories/IDriverRepository';
import { Driver } from '../../domain/entities/Driver';
import { ListDriversFiltersDto } from '../dto/ListDriversFiltersDto';
import { TYPES } from '../../../../../config/types';

import { DriverStatus } from '../../domain/entities/Driver';

@injectable()
export class ListDriversUseCase {
  constructor(@inject(TYPES.IDriverRepository) private repository: IDriverRepository) {}

  async execute(
    logistics_provider_id?: string,
    filters?: ListDriversFiltersDto
  ): Promise<DriversListResult>;
  async execute(
    logistics_provider_id?: string,
    availability_status?: DriverStatus
  ): Promise<Driver[]>;
  async execute(
    logistics_provider_id?: string,
    filtersOrStatus?: ListDriversFiltersDto | DriverStatus
  ): Promise<Driver[] | DriversListResult> {
    // Si el segundo parámetro es un objeto con propiedades del DTO, usar el nuevo método con filtros
    if (
      filtersOrStatus &&
      typeof filtersOrStatus === 'object' &&
      ('search' in filtersOrStatus ||
        'work_type' in filtersOrStatus ||
        'page' in filtersOrStatus ||
        'limit' in filtersOrStatus ||
        'logistics_provider_id' in filtersOrStatus)
    ) {
      const filters = filtersOrStatus as ListDriversFiltersDto;
      // Si hay filtros, usar findAllWithFilters
      if (this.hasFilters(filters)) {
        return await this.repository.findAllWithFilters(logistics_provider_id, filters);
      }
      // Si no hay filtros, usar findAll para mantener compatibilidad
      // Pero necesitamos convertir el resultado a DriversListResult
      const drivers = await this.repository.findAll(
        filters.logistics_provider_id || logistics_provider_id,
        filters.availability_status
      );
      return {
        data: drivers,
        total: drivers.length,
      };
    }

    // Compatibilidad con el método anterior (parámetros individuales)
    const availability_status = filtersOrStatus as DriverStatus | undefined;
    const drivers = await this.repository.findAll(logistics_provider_id, availability_status);
    return drivers;
  }

  private hasFilters(filters: ListDriversFiltersDto): boolean {
    return !!(
      filters.search ||
      filters.availability_status ||
      filters.work_type ||
      filters.logistics_provider_id ||
      filters.page ||
      filters.limit
    );
  }
}


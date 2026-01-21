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
    filters?: ListDriversFiltersDto,
    tenant_id?: string
  ): Promise<DriversListResult>;
  async execute(
    logistics_provider_id?: string,
    availability_status?: DriverStatus,
    tenant_id?: string
  ): Promise<Driver[]>;
  async execute(
    logistics_provider_id?: string,
    filtersOrStatus?: ListDriversFiltersDto | DriverStatus,
    tenant_id?: string
  ): Promise<Driver[] | DriversListResult> {
    // Si el segundo parámetro es un objeto con propiedades del DTO, usar el nuevo método con filtros
    // Verificar si es un objeto de filtros (no un string/enum que sería DriverStatus)
    if (
      filtersOrStatus &&
      typeof filtersOrStatus === 'object' &&
      !Array.isArray(filtersOrStatus) &&
      ('search' in filtersOrStatus ||
        'work_type' in filtersOrStatus ||
        'page' in filtersOrStatus ||
        'limit' in filtersOrStatus ||
        'logistics_provider_id' in filtersOrStatus ||
        'availability_status' in filtersOrStatus)
    ) {
      const filters = filtersOrStatus as ListDriversFiltersDto;
      // Siempre usar findAllWithFilters cuando hay un objeto de filtros
      return await this.repository.findAllWithFilters(logistics_provider_id, filters, tenant_id);
    }

    // Compatibilidad con el método anterior (parámetros individuales)
    // Si no es un objeto de filtros, tratar como DriverStatus directo
    const availability_status = filtersOrStatus as DriverStatus | undefined;
    const drivers = await this.repository.findAll(
      logistics_provider_id,
      availability_status,
      tenant_id
    );
    return drivers;
  }
}

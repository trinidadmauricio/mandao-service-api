/**
 * Use Case: Listar Órdenes
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository, OrdersListResult } from '../../domain/repositories/IOrderRepository';
import { ListOrdersFiltersDto } from '../dto/ListOrdersFiltersDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListOrdersUseCase {
  constructor(@inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository) {}

  async execute(
    tenant_id: string,
    logistics_provider_id: string | undefined,
    filters?: ListOrdersFiltersDto
  ): Promise<OrdersListResult> {
    // Si hay filtros, usar findAllWithFilters
    if (filters && this.hasFilters(filters)) {
      return await this.orderRepository.findAllWithFilters(tenant_id, logistics_provider_id, filters);
    }

    // Si no hay filtros, usar findAll para mantener compatibilidad
    // Pero necesitamos convertir el resultado a OrdersListResult
    const orders = await this.orderRepository.findAll(tenant_id, filters?.status, logistics_provider_id);
    return {
      data: orders,
      total: orders.length,
      page: filters?.page || 1,
      limit: filters?.limit || orders.length || 10,
      totalPages: Math.ceil(orders.length / (filters?.limit || orders.length || 10)),
    };
  }

  private hasFilters(filters: ListOrdersFiltersDto): boolean {
    return !!(
      filters.search ||
      filters.status ||
      filters.order_type ||
      filters.driver_id ||
      filters.branch_id ||
      filters.start_date ||
      filters.end_date ||
      filters.page ||
      filters.limit
    );
  }
}


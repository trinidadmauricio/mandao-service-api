/**
 * Use Case: Listar transacciones de pago
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import {
  IPaymentTransactionRepository,
  PaymentTransactionsListResult,
  ListPaymentTransactionsFilters,
} from '../../domain/repositories/IPaymentTransactionRepository';
import { PaymentTransactionStatus } from '../../domain/entities/PaymentTransaction';
import { ListPaymentTransactionsFiltersDto } from '../dto/ListPaymentTransactionsFiltersDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListPaymentTransactionsUseCase {
  constructor(
    @inject(TYPES.IPaymentTransactionRepository) private repository: IPaymentTransactionRepository
  ) {}

  async execute(
    tenant_id: string,
    filters?: ListPaymentTransactionsFiltersDto
  ): Promise<PaymentTransactionsListResult> {
    // Convertir DTO a filtros del repositorio
    const repoFilters: ListPaymentTransactionsFilters = {};

    if (filters?.transaction_type) {
      repoFilters.transaction_type = filters.transaction_type;
    }
    if (filters?.payment_method) {
      repoFilters.payment_method = filters.payment_method;
    }
    if (filters?.status) {
      repoFilters.status = filters.status as PaymentTransactionStatus;
    }
    if (filters?.order_id) {
      repoFilters.order_id = filters.order_id;
    }
    if (filters?.start_date) {
      repoFilters.start_date = new Date(filters.start_date);
    }
    if (filters?.end_date) {
      repoFilters.end_date = new Date(filters.end_date);
    }
    if (filters?.page) {
      repoFilters.page = filters.page;
    }
    if (filters?.limit) {
      repoFilters.limit = filters.limit;
    }

    // Usar findAllWithFilters siempre para obtener order_ids y paginación
    return await this.repository.findAllWithFilters(tenant_id, repoFilters);
  }
}


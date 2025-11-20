/**
 * Service para generar números de orden con concurrencia segura
 * Usa row locks (SELECT FOR UPDATE) para evitar race conditions
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderCounterRepository } from '../../domain/repositories/IOrderCounterRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class OrderNumberService {
  constructor(@inject(TYPES.IOrderCounterRepository) private repository: IOrderCounterRepository) {}

  /**
   * Genera el siguiente número de orden de forma segura con concurrencia
   * Usa row locks para evitar duplicados
   */
  async getNextOrderNumber(tenantId: string): Promise<string> {
    const counter = await this.repository.incrementWithLock(tenantId);
    return counter.generateNextNumber();
  }
}


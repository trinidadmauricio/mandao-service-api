/**
 * Interfaz para OrderCounter Repository
 */

import { OrderCounter } from '../entities/OrderCounter';

export interface CreateOrderCounterData {
  tenant_id: string;
  prefix?: string | null;
  padding_length?: number;
}

export interface UpdateOrderCounterData {
  current_value?: bigint;
  prefix?: string | null;
  padding_length?: number;
  last_reset_at?: Date | null;
}

export interface IOrderCounterRepository {
  findById(id: string): Promise<OrderCounter | null>;
  findByTenantId(tenant_id: string): Promise<OrderCounter | null>;
  create(data: CreateOrderCounterData): Promise<OrderCounter>;
  update(id: string, data: UpdateOrderCounterData): Promise<OrderCounter>;
  increment(id: string): Promise<OrderCounter>;
  /**
   * Incrementa el contador con row lock (SELECT FOR UPDATE) para concurrencia segura
   */
  incrementWithLock(tenant_id: string): Promise<OrderCounter>;
}


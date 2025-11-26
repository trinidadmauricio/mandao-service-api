/**
 * Interface para Order Repository
 */

import { Order } from '../entities/Order';
import { ListOrdersFiltersDto } from '../../application/dto/ListOrdersFiltersDto';

export interface OrdersListResult {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByTrackingCode(tracking_code: string): Promise<Order | null>;
  findAll(tenant_id?: string, status?: string, logistics_provider_id?: string): Promise<Order[]>;
  findAllWithFilters(
    tenant_id: string,
    logistics_provider_id: string | undefined,
    filters: ListOrdersFiltersDto
  ): Promise<OrdersListResult>;
  create(data: CreateOrderData): Promise<Order>;
  updateStatus(id: string, status: string, cancellation_reason?: string | null): Promise<Order>;
}

export interface CreateOrderData {
  tenant_id: string;
  order_number: bigint;
  order_display_number: string;
  order_type: 'RETAIL' | 'ON_DEMAND';
  customer_id?: string | null;
  customer_snapshot: Record<string, unknown>;
  delivery_address: Record<string, unknown>;
  delivery_lat: number;
  delivery_lng: number;
  pickup_address?: Record<string, unknown> | null;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
  scheduled_pickup_at?: Date | null;
  estimated_delivery_at: Date;
  special_instructions?: string | null;
  priority?: 'NORMAL' | 'URGENT';
  cargo_description?: string | null;
  tracking_code: string;
}


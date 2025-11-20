/**
 * Entidad Order
 */

export type OrderType = 'RETAIL' | 'ON_DEMAND';
export type OrderStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED';
export type OrderPriority = 'NORMAL' | 'URGENT';

export class Order {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly order_number: bigint,
    public readonly order_display_number: string,
    public readonly order_type: OrderType,
    public readonly customer_id: string | null,
    public readonly customer_snapshot: Record<string, unknown>,
    public readonly delivery_address: Record<string, unknown>,
    public readonly delivery_lat: number,
    public readonly delivery_lng: number,
    public readonly pickup_address: Record<string, unknown> | null,
    public readonly pickup_lat: number | null,
    public readonly pickup_lng: number | null,
    public readonly status: OrderStatus,
    public readonly cancellation_reason: string | null,
    public readonly scheduled_pickup_at: Date | null,
    public readonly estimated_delivery_at: Date,
    public readonly special_instructions: string | null,
    public readonly priority: OrderPriority,
    public readonly cargo_description: string | null,
    public readonly tracking_code: string,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si la orden puede ser cancelada
   */
  canBeCancelled(): boolean {
    return ['DRAFT', 'PENDING', 'CONFIRMED', 'ASSIGNED'].includes(this.status);
  }

  /**
   * Verifica si la orden está en tránsito
   */
  isInTransit(): boolean {
    return this.status === 'IN_TRANSIT';
  }

  /**
   * Verifica si la orden está completada
   */
  isCompleted(): boolean {
    return ['DELIVERED', 'CANCELLED', 'FAILED'].includes(this.status);
  }
}


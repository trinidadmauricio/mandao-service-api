/**
 * Contracts compartidos para comunicación entre dominios
 * Estos DTOs permiten comunicación desacoplada entre retail y delivery
 */

export interface CreateOrderRequest {
  tenant_id: string;
  order_type: 'RETAIL' | 'ON_DEMAND';
  customer_snapshot: {
    name: string;
    email?: string;
    phone: string;
  };
  delivery_address: {
    street: string;
    city: string;
    state?: string;
    zip_code?: string;
    country: string;
    lat: number;
    lng: number;
  };
  pickup_address?: {
    street: string;
    city: string;
    state?: string;
    zip_code?: string;
    country: string;
    lat: number;
    lng: number;
  };
  items: OrderItemRequest[];
  currency: string;
  special_instructions?: string;
  scheduled_pickup_at?: Date;
  estimated_delivery_at: Date;
  priority?: 'NORMAL' | 'URGENT';
}

export interface OrderItemRequest {
  product_id?: string;
  variant_id?: string;
  product_snapshot: {
    name: string;
    sku: string;
    price: number;
    currency: string;
    [key: string]: unknown;
  };
  quantity: number;
  unit_price: number;
  notes?: string;
}

export interface CreateOrderResponse {
  id: string;
  order_number: string;
  order_display_number: string;
  tracking_code: string;
  status: string;
  created_at: Date;
}

export interface OrderStatusUpdate {
  order_id: string;
  from_status?: string;
  to_status: string;
  changed_by_user_id?: string;
  notes?: string;
}

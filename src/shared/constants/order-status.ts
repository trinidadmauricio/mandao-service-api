export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum OrderType {
  RETAIL = 'RETAIL',
  ON_DEMAND = 'ON_DEMAND',
}

export enum OrderPriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}


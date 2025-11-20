/**
 * Contracts para pagos compartidos entre dominios
 */

export interface CreatePaymentRequest {
  tenant_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: 'CARD' | 'CASH' | 'TRANSFER' | 'WALLET';
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentResponse {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  payment_intent_id?: string;
  charge_id?: string;
  created_at: Date;
}

export interface RefundRequest {
  payment_transaction_id: string;
  amount?: number; // Si no se especifica, es refund completo
  reason?: string;
}

export interface RefundResponse {
  id: string;
  refund_id: string;
  amount: number;
  status: string;
  created_at: Date;
}

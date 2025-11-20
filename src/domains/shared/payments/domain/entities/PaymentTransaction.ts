/**
 * Entidad PaymentTransaction
 */

export type PaymentTransactionType = 'CHARGE' | 'REFUND' | 'AUTHORIZATION' | 'CAPTURE';
export type PaymentTransactionStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
export type PaymentMethod = 'CARD' | 'CASH' | 'TRANSFER' | 'WALLET';

export class PaymentTransaction {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly transaction_type: PaymentTransactionType,
    public readonly payment_method: PaymentMethod,
    public readonly payment_intent_id: string | null,
    public readonly charge_id: string | null,
    public readonly refund_id: string | null,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentTransactionStatus,
    public readonly failure_reason: string | null,
    public readonly card_last4: string | null,
    public readonly card_brand: string | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si la transacción está completada
   */
  isCompleted(): boolean {
    return this.status === 'SUCCEEDED';
  }

  /**
   * Verifica si la transacción está en proceso
   */
  isProcessing(): boolean {
    return this.status === 'PROCESSING' || this.status === 'PENDING';
  }

  /**
   * Verifica si la transacción falló
   */
  hasFailed(): boolean {
    return this.status === 'FAILED' || this.status === 'CANCELLED';
  }
}


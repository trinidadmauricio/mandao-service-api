/**
 * Entidad OrderPaymentTransaction (tabla pivot)
 */

export class OrderPaymentTransaction {
  constructor(
    public readonly id: string,
    public readonly order_id: string,
    public readonly payment_transaction_id: string,
    public readonly created_at: Date
  ) {}
}


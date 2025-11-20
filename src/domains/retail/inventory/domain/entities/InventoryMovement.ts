/**
 * Entidad InventoryMovement
 */

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVATION' | 'RELEASE' | 'TRANSFER';
export type ReferenceType = 'ORDER' | 'RETURN' | 'ADJUSTMENT' | 'TRANSFER' | 'RESERVATION';

export class InventoryMovement {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly product_id: string,
    public readonly variant_id: string | null,
    public readonly branch_id: string,
    public readonly movement_type: MovementType,
    public readonly quantity: number,
    public readonly stock_before: number,
    public readonly stock_after: number,
    public readonly reference_type: ReferenceType | null,
    public readonly reference_id: string | null,
    public readonly notes: string | null,
    public readonly created_by_user_id: string,
    public readonly created_at: Date
  ) {}

  /**
   * Verifica si el movimiento es de entrada
   */
  isIncoming(): boolean {
    return this.movement_type === 'IN' || this.movement_type === 'RELEASE';
  }

  /**
   * Verifica si el movimiento es de salida
   */
  isOutgoing(): boolean {
    return this.movement_type === 'OUT' || this.movement_type === 'RESERVATION';
  }
}


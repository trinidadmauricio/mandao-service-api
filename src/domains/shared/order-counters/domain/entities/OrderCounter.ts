/**
 * Entidad OrderCounter
 */

export class OrderCounter {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string,
    public readonly current_value: bigint,
    public readonly prefix: string | null,
    public readonly padding_length: number,
    public readonly last_reset_at: Date | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Genera el siguiente número de orden
   */
  generateNextNumber(): string {
    const nextValue = this.current_value + BigInt(1);
    const paddedValue = nextValue.toString().padStart(this.padding_length, '0');
    return this.prefix ? `${this.prefix}-${paddedValue}` : paddedValue;
  }
}


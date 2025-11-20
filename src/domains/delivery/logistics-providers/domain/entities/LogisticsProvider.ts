/**
 * Entidad LogisticsProvider
 */

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ProviderStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export class LogisticsProvider {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string | null,
    public readonly company_name: string,
    public readonly tax_id: string,
    public readonly representative_name: string,
    public readonly representative_phone: string,
    public readonly representative_document: string,
    public readonly verification_status: VerificationStatus,
    public readonly verification_documents: Record<string, unknown> | null,
    public readonly rating_avg: number | null,
    public readonly total_deliveries: number,
    public readonly status: ProviderStatus,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el proveedor está activo
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Verifica si el proveedor está verificado
   */
  isVerified(): boolean {
    return this.verification_status === 'VERIFIED';
  }
}


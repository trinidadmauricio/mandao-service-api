/**
 * Entidad Tenant
 */

export class Tenant {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly type: 'RETAIL' | 'ON_DEMAND' | 'HYBRID',
    public readonly subscription_plan_id: string | null,
    public readonly subscription_status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED',
    public readonly subscription_expires_at: Date | null,
    public readonly default_locale: string,
    public readonly default_currency: string,
    public readonly settings: Record<string, unknown> | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el tenant está activo
   */
  isActive(): boolean {
    return this.subscription_status === 'ACTIVE' || this.subscription_status === 'TRIAL';
  }

  /**
   * Verifica si el tenant está suspendido
   */
  isSuspended(): boolean {
    return this.subscription_status === 'SUSPENDED';
  }

  /**
   * Verifica si la suscripción ha expirado
   */
  isSubscriptionExpired(): boolean {
    if (!this.subscription_expires_at) {
      return false;
    }
    return new Date() > this.subscription_expires_at;
  }
}

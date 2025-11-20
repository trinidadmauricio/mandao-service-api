/**
 * Entidad User
 */

export class User {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string | null,
    public readonly email: string,
    public readonly password_hash: string,
    public readonly role: 'SAAS_ADMIN' | 'SAAS_EDITOR' | 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'CUSTOMER',
    public readonly first_name: string,
    public readonly last_name: string,
    public readonly phone: string | null,
    public readonly email_verified_at: Date | null,
    public readonly email_verification_token: string | null,
    public readonly password_reset_token: string | null,
    public readonly password_reset_expires_at: Date | null,
    public readonly last_login_at: Date | null,
    public readonly failed_login_attempts: number,
    public readonly locked_until: Date | null,
    public readonly status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    public readonly logistics_provider_id: string | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el usuario está activo
   */
  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  /**
   * Verifica si el usuario está bloqueado
   */
  isLocked(): boolean {
    if (!this.locked_until) {
      return false;
    }
    return new Date() < this.locked_until;
  }

  /**
   * Verifica si el email está verificado
   */
  isEmailVerified(): boolean {
    return this.email_verified_at !== null;
  }

  /**
   * Obtiene el nombre completo
   */
  getFullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}


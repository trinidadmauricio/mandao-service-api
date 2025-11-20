/**
 * Entidad OAuthAuthorizationCode
 */

export class OAuthAuthorizationCode {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly client_id: string,
    public readonly user_id: string,
    public readonly redirect_uri: string,
    public readonly scope: string,
    public readonly expires_at: Date,
    public readonly is_used: boolean,
    public readonly created_at: Date
  ) {}

  /**
   * Verifica si el code ha expirado
   */
  isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  /**
   * Verifica si el code puede ser usado
   */
  canBeUsed(): boolean {
    return !this.is_used && !this.isExpired();
  }
}


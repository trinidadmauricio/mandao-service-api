/**
 * Entidad OAuthRefreshToken
 */

export class OAuthRefreshToken {
  constructor(
    public readonly id: string,
    public readonly token: string,
    public readonly access_token_id: string,
    public readonly client_id: string,
    public readonly user_id: string,
    public readonly expires_at: Date,
    public readonly is_revoked: boolean,
    public readonly created_at: Date
  ) {}

  /**
   * Verifica si el token ha expirado
   */
  isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  /**
   * Verifica si el token es válido
   */
  isValid(): boolean {
    return !this.is_revoked && !this.isExpired();
  }
}


/**
 * Entidad OAuthClient
 */

export class OAuthClient {
  constructor(
    public readonly id: string,
    public readonly tenant_id: string | null,
    public readonly client_id: string,
    public readonly client_secret_hash: string,
    public readonly name: string,
    public readonly redirect_uris: string[],
    public readonly grant_types: string[],
    public readonly scope: string,
    public readonly is_confidential: boolean,
    public readonly is_active: boolean,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  /**
   * Verifica si el client está activo
   */
  isActive(): boolean {
    return this.is_active;
  }

  /**
   * Verifica si el redirect_uri es válido
   */
  isValidRedirectUri(uri: string): boolean {
    return this.redirect_uris.includes(uri);
  }

  /**
   * Verifica si el grant_type es soportado
   */
  supportsGrantType(grantType: string): boolean {
    return this.grant_types.includes(grantType);
  }
}


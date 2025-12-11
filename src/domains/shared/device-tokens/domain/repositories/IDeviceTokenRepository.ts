/**
 * Interface para Device Token Repository
 */

export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_info: Record<string, unknown> | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDeviceTokenData {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_info?: Record<string, unknown>;
}

export interface IDeviceTokenRepository {
  /**
   * Busca un token por su valor
   */
  findByToken(token: string): Promise<DeviceToken | null>;

  /**
   * Obtiene todos los tokens activos de un usuario
   */
  findActiveByUserId(userId: string): Promise<DeviceToken[]>;

  /**
   * Obtiene todos los tokens activos de múltiples usuarios
   */
  findActiveByUserIds(userIds: string[]): Promise<DeviceToken[]>;

  /**
   * Crea o actualiza un token (upsert)
   * Si el token ya existe, actualiza user_id, platform y device_info
   */
  upsert(data: CreateDeviceTokenData): Promise<DeviceToken>;

  /**
   * Desactiva un token específico
   */
  deactivate(token: string): Promise<void>;

  /**
   * Desactiva todos los tokens de un usuario
   */
  deactivateAllByUserId(userId: string): Promise<number>;

  /**
   * Elimina tokens inactivos más antiguos que ciertos días
   */
  deleteInactiveOlderThan(days: number): Promise<number>;
}


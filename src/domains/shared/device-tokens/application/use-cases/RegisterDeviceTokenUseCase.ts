/**
 * Use Case: Registrar Device Token
 * 
 * Registra o actualiza un token de dispositivo para push notifications
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDeviceTokenRepository, DeviceToken } from '../../domain/repositories/IDeviceTokenRepository';
import { TYPES } from '../../../../../config/types';

export interface RegisterDeviceTokenInput {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_info?: Record<string, unknown>;
}

@injectable()
export class RegisterDeviceTokenUseCase {
  constructor(
    @inject(TYPES.IDeviceTokenRepository)
    private deviceTokenRepository: IDeviceTokenRepository
  ) {}

  async execute(input: RegisterDeviceTokenInput): Promise<DeviceToken> {
    // Validar token no vacío
    if (!input.token || input.token.trim() === '') {
      throw new Error('Device token cannot be empty');
    }

    // Validar plataforma
    if (!['ios', 'android', 'web'].includes(input.platform)) {
      throw new Error('Invalid platform. Must be ios, android, or web');
    }

    // Upsert del token (crea o actualiza)
    const deviceToken = await this.deviceTokenRepository.upsert({
      user_id: input.user_id,
      token: input.token.trim(),
      platform: input.platform,
      device_info: input.device_info,
    });

    return deviceToken;
  }
}


/**
 * Controller para Device Tokens
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { RegisterDeviceTokenUseCase } from '../../application/use-cases/RegisterDeviceTokenUseCase';
import { IDeviceTokenRepository } from '../../domain/repositories/IDeviceTokenRepository';
import {
  registerDeviceTokenSchema,
  deactivateDeviceTokenSchema,
} from '../../application/dto/RegisterDeviceTokenDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeviceTokenController {
  constructor(
    @inject(TYPES.RegisterDeviceTokenUseCase)
    private registerUseCase: RegisterDeviceTokenUseCase,
    @inject(TYPES.IDeviceTokenRepository)
    private deviceTokenRepository: IDeviceTokenRepository
  ) {}

  /**
   * POST /api/v1/device-tokens
   * Registra un nuevo token de dispositivo para el usuario autenticado
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      const dto = registerDeviceTokenSchema.parse(req.body);

      const deviceToken = await this.registerUseCase.execute({
        user_id: req.user.id,
        token: dto.token,
        platform: dto.platform,
        device_info: dto.device_info,
      });

      res.status(201).json({
        status: 'success',
        data: {
          id: deviceToken.id,
          platform: deviceToken.platform,
          is_active: deviceToken.is_active,
          created_at: deviceToken.created_at.toISOString(),
        },
      });
    } catch (error) {
      logger.error('Error registering device token', { error });

      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid request body',
          errors: error,
        });
        return;
      }

      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/v1/device-tokens
   * Desactiva un token de dispositivo
   */
  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      const dto = deactivateDeviceTokenSchema.parse(req.body);

      // Verificar que el token pertenece al usuario
      const existingToken = await this.deviceTokenRepository.findByToken(dto.token);
      
      if (!existingToken) {
        res.status(404).json({
          status: 'error',
          message: 'Device token not found',
        });
        return;
      }

      if (existingToken.user_id !== req.user.id) {
        res.status(403).json({
          status: 'error',
          message: 'You can only deactivate your own device tokens',
        });
        return;
      }

      await this.deviceTokenRepository.deactivate(dto.token);

      res.status(200).json({
        status: 'success',
        message: 'Device token deactivated',
      });
    } catch (error) {
      logger.error('Error deactivating device token', { error });

      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid request body',
          errors: error,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/v1/device-tokens
   * Lista los tokens de dispositivo del usuario autenticado
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      const tokens = await this.deviceTokenRepository.findActiveByUserId(req.user.id);

      res.status(200).json({
        status: 'success',
        data: tokens.map((t) => ({
          id: t.id,
          platform: t.platform,
          device_info: t.device_info,
          is_active: t.is_active,
          created_at: t.created_at.toISOString(),
          updated_at: t.updated_at.toISOString(),
        })),
      });
    } catch (error) {
      logger.error('Error listing device tokens', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  /**
   * DELETE /api/v1/device-tokens/all
   * Desactiva todos los tokens de dispositivo del usuario autenticado (logout de todos los dispositivos)
   */
  async deactivateAll(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      const count = await this.deviceTokenRepository.deactivateAllByUserId(req.user.id);

      res.status(200).json({
        status: 'success',
        message: `${count} device token(s) deactivated`,
        data: { deactivated_count: count },
      });
    } catch (error) {
      logger.error('Error deactivating all device tokens', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


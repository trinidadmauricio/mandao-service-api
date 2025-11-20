/**
 * Controller para Autenticación Tradicional
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase';
import { RegisterUseCase } from '../../application/use-cases/RegisterUseCase';
import { VerifyEmailUseCase } from '../../application/use-cases/VerifyEmailUseCase';
import { RequestPasswordResetUseCase } from '../../application/use-cases/RequestPasswordResetUseCase';
import { ResetPasswordUseCase } from '../../application/use-cases/ResetPasswordUseCase';
import {
  loginSchema,
  registerSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
} from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase,
    @inject(TYPES.RegisterUseCase) private registerUseCase: RegisterUseCase,
    @inject(TYPES.VerifyEmailUseCase) private verifyEmailUseCase: VerifyEmailUseCase,
    @inject(TYPES.RequestPasswordResetUseCase)
    private requestPasswordResetUseCase: RequestPasswordResetUseCase,
    @inject(TYPES.ResetPasswordUseCase) private resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const dto = loginSchema.parse(req.body);
      const tenant_id = req.tenant?.id;
      const result = await this.loginUseCase.execute(dto, tenant_id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error in login', { error });
      if (error instanceof Error) {
        res.status(401).json({
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

  async register(req: Request, res: Response): Promise<void> {
    try {
      // Si no se proporciona tenant_id en el body y no hay tenant en la request,
      // permitir null (usuarios globales como SAAS_ADMIN)
      const tenant_id = req.body.tenant_id || req.tenant?.id || null;
      
      // Preparar el DTO: si tenant_id es null, pasarlo explícitamente
      // Si es undefined, no incluirlo (Zod lo manejará como optional)
      const dtoData: any = {
        ...req.body,
      };
      
      if (tenant_id !== undefined) {
        dtoData.tenant_id = tenant_id;
      }
      
      const dto = registerSchema.parse(dtoData);
      const { user, verification_token } = await this.registerUseCase.execute(dto);

      // No retornar password_hash ni verification_token en producción
      // En desarrollo, retornamos el token para facilitar testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { password_hash, email_verification_token, ...userResponse } = user as any;

      res.status(201).json({
        status: 'success',
        data: {
          user: userResponse,
          verification_token:
            process.env.NODE_ENV === 'development' ? verification_token : undefined,
          message: 'User registered successfully. Please verify your email.',
        },
      });
    } catch (error) {
      logger.error('Error in register', { error });
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

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({
          status: 'error',
          message: 'Verification token is required',
        });
        return;
      }

      await this.verifyEmailUseCase.execute(token);

      res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
      });
    } catch (error) {
      logger.error('Error in verify email', { error });
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

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const dto = resetPasswordRequestSchema.parse(req.body);
      await this.requestPasswordResetUseCase.execute(dto.email);

      // Siempre retornar éxito por seguridad
      res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      logger.error('Error in request password reset', { error });
      // Siempre retornar éxito por seguridad
      res.status(200).json({
        status: 'success',
        message: 'If the email exists, a password reset link has been sent',
      });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const dto = resetPasswordSchema.parse(req.body);
      await this.resetPasswordUseCase.execute(dto);

      res.status(200).json({
        status: 'success',
        message: 'Password reset successfully',
      });
    } catch (error) {
      logger.error('Error in reset password', { error });
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
}

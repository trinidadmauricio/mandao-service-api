/**
 * Use Case: Verificar Email
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { AuthService } from '../services/AuthService';
import { TYPES } from '../../../../../config/types';

@injectable()
export class VerifyEmailUseCase {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async execute(token: string): Promise<void> {
    await this.authService.verifyEmail(token);
  }
}


/**
 * Use Case: Reset Password
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { AuthService } from '../services/AuthService';
import { ResetPasswordDto } from '../dto/ResetPasswordDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ResetPasswordUseCase {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async execute(dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }
}


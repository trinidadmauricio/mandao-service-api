/**
 * Use Case: Login
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { AuthService } from '../services/AuthService';
import { LoginDto } from '../dto/LoginDto';
import { LoginResponse } from '../services/AuthService';
import { TYPES } from '../../../../../config/types';

@injectable()
export class LoginUseCase {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async execute(dto: LoginDto, tenant_id?: string): Promise<LoginResponse> {
    return await this.authService.login(dto, tenant_id);
  }
}


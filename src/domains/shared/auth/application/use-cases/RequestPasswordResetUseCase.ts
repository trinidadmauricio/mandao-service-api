/**
 * Use Case: Solicitar Reset de Password
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { AuthService } from '../services/AuthService';
import { TYPES } from '../../../../../config/types';

@injectable()
export class RequestPasswordResetUseCase {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async execute(email: string): Promise<void> {
    // Este método puede lanzar un error genérico por seguridad
    // No revela si el email existe o no
    try {
      await this.authService.generatePasswordResetToken(email);
    } catch (error) {
      // Por seguridad, siempre retornar éxito
      // El error real se loguea pero no se expone al cliente
    }
  }
}


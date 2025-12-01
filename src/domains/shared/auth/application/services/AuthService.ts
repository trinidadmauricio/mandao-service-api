/**
 * Servicio de Autenticación Tradicional
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { verifyPassword } from '../../../../../shared/utils/password.util';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { generateAccessToken } from '../../../../../shared/utils/jwt.util';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    email_verified: boolean;
    tenant_id?: string | null;
    logistics_provider_id?: string | null;
  };
}

@injectable()
export class AuthService {
  constructor(@inject(TYPES.IUserRepository) private userRepository: IUserRepository) {}

  /**
   * Autentica un usuario con email y password
   */
  async login(credentials: LoginCredentials, tenant_id?: string): Promise<LoginResponse> {
    // Buscar usuario por email
    const user = await this.userRepository.findByEmail(credentials.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verificar tenant isolation
    // Para SAAS_ADMIN, SAAS_EDITOR, LOGISTICS_PROVIDER y SUPERVISOR, permitir login sin tenant_id
    // Para otros usuarios, validar que el tenant_id coincida
    if (tenant_id && user.tenant_id !== tenant_id) {
      // Si el usuario NO es SAAS_ADMIN/SAAS_EDITOR/LOGISTICS_PROVIDER/SUPERVISOR, validar tenant
      if (
        user.role !== UserRole.SAAS_ADMIN &&
        user.role !== UserRole.SAAS_EDITOR &&
        user.role !== UserRole.LOGISTICS_PROVIDER &&
        user.role !== UserRole.SUPERVISOR
      ) {
        throw new Error('Invalid credentials');
      }
      // Si es SAAS_ADMIN/SAAS_EDITOR/LOGISTICS_PROVIDER/SUPERVISOR, permitir login aunque el tenant_id no coincida
      // (pueden tener tenant_id null y hacer login desde cualquier tenant o sin tenant)
    }

    // Verificar que el usuario esté activo
    if (!user.isActive()) {
      throw new Error('User account is not active');
    }

    // Verificar que el usuario no esté bloqueado
    if (user.isLocked()) {
      throw new Error('User account is locked');
    }

    // Verificar password
    const isValidPassword = await verifyPassword(credentials.password, user.password_hash);
    if (!isValidPassword) {
      // Incrementar intentos fallidos
      await this.userRepository.update(user.id, {
        failed_login_attempts: user.failed_login_attempts + 1,
        // Bloquear después de 5 intentos fallidos (15 minutos)
        locked_until:
          user.failed_login_attempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : undefined,
      });
      throw new Error('Invalid credentials');
    }

    // Resetear intentos fallidos y actualizar last_login_at
    await this.userRepository.update(user.id, {
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date(),
    });

    // Generar JWT token
    const accessToken = generateAccessToken(
      {
        sub: user.id,
        client_id: 'internal', // Para autenticación tradicional
        scope: 'read write',
      },
      '24h' // Tokens de login tradicional duran 24 horas
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 86400, // 24 horas en segundos
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.isEmailVerified(),
        tenant_id: user.tenant_id,
        logistics_provider_id: user.logistics_provider_id,
      },
    };
  }

  /**
   * Genera un token de verificación de email
   */
  async generateEmailVerificationToken(user_id: string): Promise<string> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified()) {
      throw new Error('Email already verified');
    }

    const token = generateSecureToken(32);

    await this.userRepository.update(user_id, {
      email_verification_token: token,
    });

    return token;
  }

  /**
   * Verifica el email de un usuario
   */
  async verifyEmail(token: string): Promise<void> {
    // Buscar usuario por token
    const users = await this.userRepository.findAll();
    const user = users.find((u) => u.email_verification_token === token);

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (user.isEmailVerified()) {
      throw new Error('Email already verified');
    }

    // Verificar email
    await this.userRepository.update(user.id, {
      email_verified_at: new Date(),
      email_verification_token: null,
    });
  }

  /**
   * Genera un token de reset de password
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      throw new Error('If the email exists, a password reset link has been sent');
    }

    const token = generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira en 1 hora

    await this.userRepository.update(user.id, {
      password_reset_token: token,
      password_reset_expires_at: expiresAt,
    });

    return token;
  }

  /**
   * Resetea la contraseña de un usuario
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Buscar usuario por token
    const users = await this.userRepository.findAll();
    const user = users.find(
      (u) =>
        u.password_reset_token === token &&
        u.password_reset_expires_at &&
        new Date() < u.password_reset_expires_at
    );

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Hashear nueva contraseña
    const { hashPassword } = await import('../../../../../shared/utils/password.util');
    const password_hash = await hashPassword(newPassword);

    // Actualizar password y limpiar token
    await this.userRepository.update(user.id, {
      password_hash,
      password_reset_token: null,
      password_reset_expires_at: null,
    });
  }
}

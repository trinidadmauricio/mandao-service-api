/**
 * Use Case: Registro
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../../users/domain/repositories/IUserRepository';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { User } from '../../../users/domain/entities/User';
import { RegisterDto } from '../dto/RegisterDto';
import { hashPassword } from '../../../../../shared/utils/password.util';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class RegisterUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(dto: RegisterDto): Promise<{ user: User; verification_token: string }> {
    // Validar que el email no exista
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    // Validar tenant
    // El registro público solo permite roles que requieren tenant
    // (CUSTOMER, MERCHANT_USER, OWNER, SUPERVISOR)
    // SAAS_ADMIN y SAAS_EDITOR no se pueden crear mediante registro público
    
    // Todos los roles permitidos en el registro requieren un tenant válido
    if (!dto.tenant_id) {
      throw new Error('Tenant is required for user registration');
    }
    
    // Validar que el tenant exista
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Hashear contraseña
    const password_hash = await hashPassword(dto.password);

    // Generar token de verificación
    const verification_token = generateSecureToken(32);

    // Crear usuario (tenant_id puede ser null si no se proporciona)
    const user = await this.userRepository.create({
      tenant_id: dto.tenant_id || null,
      email: dto.email,
      password_hash,
      role: dto.role || 'CUSTOMER',
      first_name: dto.first_name,
      last_name: dto.last_name,
      phone: dto.phone || null,
      status: 'ACTIVE',
    });

    // Actualizar con token de verificación
    const updatedUser = await this.userRepository.update(user.id, {
      email_verification_token: verification_token,
    });

    return {
      user: updatedUser,
      verification_token,
    };
  }
}


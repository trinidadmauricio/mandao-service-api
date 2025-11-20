/**
 * Use Case: Iniciar trial period para un tenant
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface StartTrialDto {
  tenant_id: string;
  trial_days?: number; // Por defecto 14 días
}

@injectable()
export class StartTrialUseCase {
  constructor(
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: StartTrialDto): Promise<void> {
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Si ya tiene un plan activo, no puede iniciar trial
    if (tenant.subscription_status === 'ACTIVE' && tenant.subscription_plan_id) {
      throw new Error('Tenant already has an active subscription');
    }

    const trialDays = dto.trial_days || 14;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + trialDays);

    await this.prisma.tenant.update({
      where: { id: dto.tenant_id },
      data: {
        subscription_status: 'TRIAL',
        subscription_expires_at: expiresAt,
      },
    });
  }
}


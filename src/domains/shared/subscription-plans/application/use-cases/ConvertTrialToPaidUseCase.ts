/**
 * Use Case: Convertir trial a plan pago
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface ConvertTrialToPaidDto {
  tenant_id: string;
  plan_id: string;
  billing_period: 'MONTHLY' | 'YEARLY';
}

@injectable()
export class ConvertTrialToPaidUseCase {
  constructor(
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.ISubscriptionPlanRepository) private subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: ConvertTrialToPaidDto): Promise<void> {
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (tenant.subscription_status !== 'TRIAL') {
      throw new Error('Tenant is not in trial period');
    }

    const plan = await this.subscriptionPlanRepository.findById(dto.plan_id);
    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    // Calcular nueva fecha de expiración
    const now = new Date();
    const expiresAt = new Date(now);
    
    if (dto.billing_period === 'YEARLY') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Actualizar tenant a plan pago
    await this.prisma.tenant.update({
      where: { id: dto.tenant_id },
      data: {
        subscription_plan_id: dto.plan_id,
        subscription_status: 'ACTIVE',
        subscription_expires_at: expiresAt,
      },
    });
  }
}


/**
 * Use Case: Cambiar plan de suscripción de un tenant
 * 
 * Permite upgrade/downgrade de planes con aplicación inmediata
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface ChangeTenantPlanDto {
  tenant_id: string;
  new_plan_id: string;
  billing_period?: 'MONTHLY' | 'YEARLY';
}

@injectable()
export class ChangeTenantPlanUseCase {
  constructor(
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.ISubscriptionPlanRepository) private subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: ChangeTenantPlanDto): Promise<void> {
    // Verificar que el tenant existe
    const tenant = await this.tenantRepository.findById(dto.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Verificar que el nuevo plan existe
    const newPlan = await this.subscriptionPlanRepository.findById(dto.new_plan_id);
    if (!newPlan) {
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

    // Actualizar tenant con nuevo plan
    await this.prisma.tenant.update({
      where: { id: dto.tenant_id },
      data: {
        subscription_plan_id: dto.new_plan_id,
        subscription_status: 'ACTIVE',
        subscription_expires_at: expiresAt,
      },
    });
  }
}


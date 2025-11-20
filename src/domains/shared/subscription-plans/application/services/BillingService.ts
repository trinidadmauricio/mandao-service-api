/**
 * Service para manejo de billing recurrente
 * 
 * Por ahora maneja fechas de expiración y renovación
 * En el futuro se integrará con Stripe para billing automático
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { PrismaClient } from '@prisma/client';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

export interface RenewSubscriptionParams {
  tenant_id: string;
  billing_period: 'MONTHLY' | 'YEARLY';
}

@injectable()
export class BillingService {
  constructor(
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  /**
   * Renueva la suscripción de un tenant
   */
  async renewSubscription(params: RenewSubscriptionParams): Promise<void> {
    const tenant = await this.tenantRepository.findById(params.tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!tenant.subscription_plan_id) {
      throw new Error('Tenant does not have a subscription plan');
    }

    // Calcular nueva fecha de expiración
    const now = new Date();
    const expiresAt = new Date(now);
    
    if (params.billing_period === 'YEARLY') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Actualizar fecha de expiración
    await this.prisma.tenant.update({
      where: { id: params.tenant_id },
      data: {
        subscription_expires_at: expiresAt,
        subscription_status: 'ACTIVE',
      },
    });

    logger.info('Subscription renewed', {
      tenant_id: params.tenant_id,
      billing_period: params.billing_period,
      expires_at: expiresAt,
    });
  }

  /**
   * Procesa renovaciones automáticas para tenants con suscripciones próximas a expirar
   * Este método debería ejecutarse periódicamente (ej: cron job)
   */
  async processAutoRenewals(): Promise<{ renewed: number; failed: number }> {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Buscar tenants con suscripciones que expiran en los próximos 7 días
    const tenantsToRenew = await this.prisma.tenant.findMany({
      where: {
        subscription_status: 'ACTIVE',
        subscription_plan_id: { not: null },
        subscription_expires_at: {
          gte: now,
          lte: nextWeek,
        },
      },
    });

    let renewed = 0;
    let failed = 0;

    for (const tenant of tenantsToRenew) {
      try {
        // Por defecto, renovar mensualmente
        // En el futuro, esto vendría de la configuración del tenant o del plan
        await this.renewSubscription({
          tenant_id: tenant.id,
          billing_period: 'MONTHLY',
        });
        renewed++;
      } catch (error) {
        logger.error('Failed to renew subscription', {
          tenant_id: tenant.id,
          error,
        });
        failed++;

        // Marcar como suspendido si falla la renovación
        await this.prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            subscription_status: 'SUSPENDED',
          },
        });
      }
    }

    return { renewed, failed };
  }

  /**
   * Suspende tenants con suscripciones expiradas
   */
  async suspendExpiredSubscriptions(): Promise<number> {
    const now = new Date();

    const result = await this.prisma.tenant.updateMany({
      where: {
        subscription_status: { in: ['ACTIVE', 'TRIAL'] },
        subscription_expires_at: {
          lt: now,
        },
      },
      data: {
        subscription_status: 'SUSPENDED',
      },
    });

    logger.info('Suspended expired subscriptions', {
      count: result.count,
    });

    return result.count;
  }
}


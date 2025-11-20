/**
 * Service para validar límites de suscripción
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number | null;
  message?: string;
}

@injectable()
export class SubscriptionLimitService {
  constructor(
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository,
    @inject(TYPES.ISubscriptionPlanRepository) private subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  /**
   * Verifica límite de productos
   */
  async checkProductLimit(tenant_id: string): Promise<LimitCheckResult> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant || !tenant.subscription_plan_id) {
      return {
        allowed: true,
        current: 0,
        limit: null,
      };
    }

    const plan = await this.subscriptionPlanRepository.findById(tenant.subscription_plan_id);
    if (!plan || !plan.hasProductLimit()) {
      return {
        allowed: true,
        current: 0,
        limit: null,
      };
    }

    // Contar productos del tenant
    const productCount = await this.prisma.product.count({
      where: {
        tenant_id,
      },
    });

    const allowed = plan.max_products === null || productCount < plan.max_products;

    return {
      allowed,
      current: productCount,
      limit: plan.max_products,
      message: allowed
        ? undefined
        : `Product limit reached. Current: ${productCount}, Limit: ${plan.max_products}`,
    };
  }

  /**
   * Verifica límite de branches
   */
  async checkBranchLimit(tenant_id: string): Promise<LimitCheckResult> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant || !tenant.subscription_plan_id) {
      return {
        allowed: true,
        current: 0,
        limit: null,
      };
    }

    const plan = await this.subscriptionPlanRepository.findById(tenant.subscription_plan_id);
    if (!plan || !plan.hasBranchLimit()) {
      return {
        allowed: true,
        current: 0,
        limit: null,
      };
    }

    // Contar branches del tenant
    const branchCount = await this.prisma.branch.count({
      where: {
        tenant_id,
      },
    });

    const allowed = plan.max_branches === null || branchCount < plan.max_branches;

    return {
      allowed,
      current: branchCount,
      limit: plan.max_branches,
      message: allowed
        ? undefined
        : `Branch limit reached. Current: ${branchCount}, Limit: ${plan.max_branches}`,
    };
  }

  /**
   * Verifica límite de órdenes mensuales
   */
  async checkOrderLimit(tenant_id: string): Promise<LimitCheckResult> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant || !tenant.subscription_plan_id) {
      return {
        allowed: true,
        current: 0,
        limit: null,
      };
    }

    const plan = await this.subscriptionPlanRepository.findById(tenant.subscription_plan_id);
    if (!plan || !plan.hasOrderLimit()) {
      return {
        allowed: true,
        current: 0,
        limit: null,
      };
    }

    // Contar órdenes del mes actual
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const orderCount = await this.prisma.order.count({
      where: {
        tenant_id,
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const allowed = plan.max_orders_month === null || orderCount < plan.max_orders_month;

    return {
      allowed,
      current: orderCount,
      limit: plan.max_orders_month,
      message: allowed
        ? undefined
        : `Monthly order limit reached. Current: ${orderCount}, Limit: ${plan.max_orders_month}`,
    };
  }

  /**
   * Verifica si el tenant está en trial y si ha expirado
   */
  async checkTrialStatus(tenant_id: string): Promise<{ isTrial: boolean; expired: boolean; expiresAt: Date | null }> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant) {
      return {
        isTrial: false,
        expired: false,
        expiresAt: null,
      };
    }

    const isTrial = tenant.subscription_status === 'TRIAL';
    const expiresAt = tenant.subscription_expires_at;
    const expired = expiresAt ? new Date() > expiresAt : false;

    return {
      isTrial,
      expired,
      expiresAt,
    };
  }
}


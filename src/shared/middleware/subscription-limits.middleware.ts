/**
 * Middleware para enforcement de límites de suscripción
 */

import { Request, Response, NextFunction } from 'express';
import { SubscriptionLimitService } from '../../domains/shared/subscription-plans/application/services/SubscriptionLimitService';
import { PrismaTenantRepository } from '../../domains/shared/tenants/infrastructure/repositories/PrismaTenantRepository';
import { PrismaSubscriptionPlanRepository } from '../../domains/shared/subscription-plans/infrastructure/repositories/PrismaSubscriptionPlanRepository';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { i18nService } from '../../domains/shared/i18n/I18nService';

const prisma = new PrismaClient();
const tenantRepository = new PrismaTenantRepository(prisma);
const subscriptionPlanRepository = new PrismaSubscriptionPlanRepository(prisma);
const limitService = new SubscriptionLimitService(tenantRepository, subscriptionPlanRepository, prisma);

/**
 * Middleware para verificar límite de productos
 */
export const checkProductLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenant_id = req.tenant?.id;
    if (!tenant_id) {
      res.status(400).json({
        status: 'error',
        message: 'Tenant not found',
      });
      return;
    }

    const result = await limitService.checkProductLimit(tenant_id);
    if (!result.allowed) {
      const locale = req.locale || 'es';
      i18nService.changeLanguage(locale);
      const message = i18nService.t('subscription.productLimitReached', {
        defaultValue: result.message || 'Product limit reached',
        current: result.current,
        limit: result.limit,
      });

      res.status(403).json({
        status: 'error',
        message,
        limit: {
          current: result.current,
          max: result.limit,
        },
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking product limit', { error });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Middleware para verificar límite de branches
 */
export const checkBranchLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenant_id = req.tenant?.id;
    if (!tenant_id) {
      res.status(400).json({
        status: 'error',
        message: 'Tenant not found',
      });
      return;
    }

    const result = await limitService.checkBranchLimit(tenant_id);
    if (!result.allowed) {
      const locale = req.locale || 'es';
      i18nService.changeLanguage(locale);
      const message = i18nService.t('subscription.branchLimitReached', {
        defaultValue: result.message || 'Branch limit reached',
        current: result.current,
        limit: result.limit,
      });

      res.status(403).json({
        status: 'error',
        message,
        limit: {
          current: result.current,
          max: result.limit,
        },
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking branch limit', { error });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Middleware para verificar límite de órdenes mensuales
 */
export const checkOrderLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenant_id = req.tenant?.id;
    if (!tenant_id) {
      res.status(400).json({
        status: 'error',
        message: 'Tenant not found',
      });
      return;
    }

    const result = await limitService.checkOrderLimit(tenant_id);
    if (!result.allowed) {
      const locale = req.locale || 'es';
      i18nService.changeLanguage(locale);
      const message = i18nService.t('subscription.orderLimitReached', {
        defaultValue: result.message || 'Monthly order limit reached',
        current: result.current,
        limit: result.limit,
      });

      res.status(403).json({
        status: 'error',
        message,
        limit: {
          current: result.current,
          max: result.limit,
        },
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Error checking order limit', { error });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};


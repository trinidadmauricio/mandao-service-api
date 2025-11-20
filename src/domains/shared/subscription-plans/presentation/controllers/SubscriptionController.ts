/**
 * Controller para Suscripciones
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { ChangeTenantPlanUseCase } from '../../application/use-cases/ChangeTenantPlanUseCase';
import { StartTrialUseCase } from '../../application/use-cases/StartTrialUseCase';
import { ConvertTrialToPaidUseCase } from '../../application/use-cases/ConvertTrialToPaidUseCase';
import { SubscriptionLimitService } from '../../application/services/SubscriptionLimitService';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class SubscriptionController {
  constructor(
    @inject(TYPES.ChangeTenantPlanUseCase) private changeTenantPlanUseCase: ChangeTenantPlanUseCase,
    @inject(TYPES.StartTrialUseCase) private startTrialUseCase: StartTrialUseCase,
    @inject(TYPES.ConvertTrialToPaidUseCase) private convertTrialToPaidUseCase: ConvertTrialToPaidUseCase,
    @inject(TYPES.SubscriptionLimitService) private limitService: SubscriptionLimitService
  ) {}

  async changePlan(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = {
        tenant_id,
        new_plan_id: req.body.plan_id,
        billing_period: req.body.billing_period || 'MONTHLY',
      };

      await this.changeTenantPlanUseCase.execute(dto);

      res.status(200).json({
        status: 'success',
        message: 'Plan changed successfully',
      });
    } catch (error) {
      logger.error('Error changing plan', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async startTrial(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = {
        tenant_id,
        trial_days: req.body.trial_days || 14,
      };

      await this.startTrialUseCase.execute(dto);

      res.status(200).json({
        status: 'success',
        message: 'Trial started successfully',
      });
    } catch (error) {
      logger.error('Error starting trial', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async convertTrialToPaid(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const dto = {
        tenant_id,
        plan_id: req.body.plan_id,
        billing_period: req.body.billing_period || 'MONTHLY',
      };

      await this.convertTrialToPaidUseCase.execute(dto);

      res.status(200).json({
        status: 'success',
        message: 'Trial converted to paid plan successfully',
      });
    } catch (error) {
      logger.error('Error converting trial to paid', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getLimits(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = req.tenant?.id;
      if (!tenant_id) {
        res.status(400).json({
          status: 'error',
          message: 'Tenant not found',
        });
        return;
      }

      const [productLimit, branchLimit, orderLimit, trialStatus] = await Promise.all([
        this.limitService.checkProductLimit(tenant_id),
        this.limitService.checkBranchLimit(tenant_id),
        this.limitService.checkOrderLimit(tenant_id),
        this.limitService.checkTrialStatus(tenant_id),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          products: {
            current: productLimit.current,
            limit: productLimit.limit,
            allowed: productLimit.allowed,
          },
          branches: {
            current: branchLimit.current,
            limit: branchLimit.limit,
            allowed: branchLimit.allowed,
          },
          orders: {
            current: orderLimit.current,
            limit: orderLimit.limit,
            allowed: orderLimit.allowed,
          },
          trial: trialStatus,
        },
      });
    } catch (error) {
      logger.error('Error getting limits', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


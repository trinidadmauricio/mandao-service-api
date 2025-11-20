/**
 * Controller para SubscriptionPlans
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateSubscriptionPlanUseCase } from '../../application/use-cases/CreateSubscriptionPlanUseCase';
import { GetSubscriptionPlanUseCase } from '../../application/use-cases/GetSubscriptionPlanUseCase';
import { ListSubscriptionPlansUseCase } from '../../application/use-cases/ListSubscriptionPlansUseCase';
import { UpdateSubscriptionPlanUseCase } from '../../application/use-cases/UpdateSubscriptionPlanUseCase';
import { DeleteSubscriptionPlanUseCase } from '../../application/use-cases/DeleteSubscriptionPlanUseCase';
import { createSubscriptionPlanSchema, updateSubscriptionPlanSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class SubscriptionPlanController {
  constructor(
    @inject(TYPES.CreateSubscriptionPlanUseCase) private createSubscriptionPlanUseCase: CreateSubscriptionPlanUseCase,
    @inject(TYPES.GetSubscriptionPlanUseCase) private getSubscriptionPlanUseCase: GetSubscriptionPlanUseCase,
    @inject(TYPES.ListSubscriptionPlansUseCase) private listSubscriptionPlansUseCase: ListSubscriptionPlansUseCase,
    @inject(TYPES.UpdateSubscriptionPlanUseCase) private updateSubscriptionPlanUseCase: UpdateSubscriptionPlanUseCase,
    @inject(TYPES.DeleteSubscriptionPlanUseCase) private deleteSubscriptionPlanUseCase: DeleteSubscriptionPlanUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createSubscriptionPlanSchema.parse(req.body);
      const plan = await this.createSubscriptionPlanUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      logger.error('Error creating subscription plan', { error });
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plan = await this.getSubscriptionPlanUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      logger.error('Error getting subscription plan', { error });
      if (error instanceof Error && error.message === 'Subscription plan not found') {
        res.status(404).json({
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

  async list(_req: Request, res: Response): Promise<void> {
    try {
      const plans = await this.listSubscriptionPlansUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: plans,
      });
    } catch (error) {
      logger.error('Error listing subscription plans', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateSubscriptionPlanSchema.parse(req.body);
      const plan = await this.updateSubscriptionPlanUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: plan,
      });
    } catch (error) {
      logger.error('Error updating subscription plan', { error });
      if (error instanceof Error && error.message === 'Subscription plan not found') {
        res.status(404).json({
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteSubscriptionPlanUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting subscription plan', { error });
      if (error instanceof Error && error.message === 'Subscription plan not found') {
        res.status(404).json({
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
}


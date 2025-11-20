/**
 * Use Case: Obtener SubscriptionPlan por ID
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { TYPES } from '../../../../../config/types';

@injectable()
export class GetSubscriptionPlanUseCase {
  constructor(@inject(TYPES.ISubscriptionPlanRepository) private repository: ISubscriptionPlanRepository) {}

  async execute(id: string): Promise<SubscriptionPlan> {
    const plan = await this.repository.findById(id);

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    return plan;
  }
}


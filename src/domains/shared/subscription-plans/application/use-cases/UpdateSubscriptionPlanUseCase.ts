/**
 * Use Case: Actualizar SubscriptionPlan
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ISubscriptionPlanRepository, UpdateSubscriptionPlanData } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UpdateSubscriptionPlanUseCase {
  constructor(@inject(TYPES.ISubscriptionPlanRepository) private repository: ISubscriptionPlanRepository) {}

  async execute(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlan> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('Subscription plan not found');
    }

    return await this.repository.update(id, data);
  }
}


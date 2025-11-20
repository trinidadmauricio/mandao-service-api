/**
 * Use Case: Eliminar SubscriptionPlan
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeleteSubscriptionPlanUseCase {
  constructor(@inject(TYPES.ISubscriptionPlanRepository) private repository: ISubscriptionPlanRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw new Error('Subscription plan not found');
    }

    await this.repository.delete(id);
  }
}


/**
 * Use Case: Listar todos los SubscriptionPlans
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ISubscriptionPlanRepository } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ListSubscriptionPlansUseCase {
  constructor(@inject(TYPES.ISubscriptionPlanRepository) private repository: ISubscriptionPlanRepository) {}

  async execute(): Promise<SubscriptionPlan[]> {
    return await this.repository.findAll();
  }
}


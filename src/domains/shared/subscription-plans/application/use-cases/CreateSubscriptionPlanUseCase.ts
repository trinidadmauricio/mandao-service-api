/**
 * Use Case: Crear SubscriptionPlan
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ISubscriptionPlanRepository, CreateSubscriptionPlanData } from '../../domain/repositories/ISubscriptionPlanRepository';
import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CreateSubscriptionPlanUseCase {
  constructor(@inject(TYPES.ISubscriptionPlanRepository) private repository: ISubscriptionPlanRepository) {}

  async execute(data: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
    return await this.repository.create(data);
  }
}


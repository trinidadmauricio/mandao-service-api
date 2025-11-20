/**
 * Interfaz para SubscriptionPlan Repository
 */

import { SubscriptionPlan } from '../entities/SubscriptionPlan';

export interface CreateSubscriptionPlanData {
  name: string;
  type: 'BASIC' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';
  price_monthly: number;
  price_yearly: number;
  features: Record<string, unknown>;
  max_products?: number | null;
  max_orders_month?: number | null;
  max_branches?: number | null;
}

export interface UpdateSubscriptionPlanData {
  name?: string;
  price_monthly?: number;
  price_yearly?: number;
  features?: Record<string, unknown>;
  max_products?: number | null;
  max_orders_month?: number | null;
  max_branches?: number | null;
}

export interface ISubscriptionPlanRepository {
  findById(id: string): Promise<SubscriptionPlan | null>;
  findAll(): Promise<SubscriptionPlan[]>;
  create(data: CreateSubscriptionPlanData): Promise<SubscriptionPlan>;
  update(id: string, data: UpdateSubscriptionPlanData): Promise<SubscriptionPlan>;
  delete(id: string): Promise<void>;
}


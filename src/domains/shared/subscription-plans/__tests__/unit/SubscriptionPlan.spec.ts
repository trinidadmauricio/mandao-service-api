/**
 * Tests unitarios para SubscriptionPlan entity
 */

import { SubscriptionPlan } from '../../domain/entities/SubscriptionPlan';

describe('SubscriptionPlan Entity', () => {
  describe('hasProductLimit', () => {
    it('should return true if max_products is set', () => {
      const plan = new SubscriptionPlan(
        'id',
        'Basic Plan',
        'BASIC',
        29.99,
        299.99,
        {},
        100,
        1000,
        1,
        new Date(),
        new Date()
      );

      expect(plan.hasProductLimit()).toBe(true);
    });

    it('should return false if max_products is null', () => {
      const plan = new SubscriptionPlan(
        'id',
        'Unlimited Plan',
        'ENTERPRISE',
        999.99,
        9999.99,
        {},
        null,
        null,
        null,
        new Date(),
        new Date()
      );

      expect(plan.hasProductLimit()).toBe(false);
    });
  });

  describe('hasOrderLimit', () => {
    it('should return true if max_orders_month is set', () => {
      const plan = new SubscriptionPlan(
        'id',
        'Basic Plan',
        'BASIC',
        29.99,
        299.99,
        {},
        100,
        1000,
        1,
        new Date(),
        new Date()
      );

      expect(plan.hasOrderLimit()).toBe(true);
    });

    it('should return false if max_orders_month is null', () => {
      const plan = new SubscriptionPlan(
        'id',
        'Unlimited Plan',
        'ENTERPRISE',
        999.99,
        9999.99,
        {},
        null,
        null,
        null,
        new Date(),
        new Date()
      );

      expect(plan.hasOrderLimit()).toBe(false);
    });
  });

  describe('hasBranchLimit', () => {
    it('should return true if max_branches is set', () => {
      const plan = new SubscriptionPlan(
        'id',
        'Basic Plan',
        'BASIC',
        29.99,
        299.99,
        {},
        100,
        1000,
        1,
        new Date(),
        new Date()
      );

      expect(plan.hasBranchLimit()).toBe(true);
    });

    it('should return false if max_branches is null', () => {
      const plan = new SubscriptionPlan(
        'id',
        'Unlimited Plan',
        'ENTERPRISE',
        999.99,
        9999.99,
        {},
        null,
        null,
        null,
        new Date(),
        new Date()
      );

      expect(plan.hasBranchLimit()).toBe(false);
    });
  });
});


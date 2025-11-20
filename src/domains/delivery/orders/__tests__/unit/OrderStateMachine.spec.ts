/**
 * Tests unitarios para OrderStateMachine
 */

import { OrderStateMachine } from '../../domain/services/OrderStateMachine';

describe('OrderStateMachine', () => {
  describe('isValidTransition', () => {
    it('should allow valid transitions', () => {
      expect(OrderStateMachine.isValidTransition('DRAFT', 'PENDING')).toBe(true);
      expect(OrderStateMachine.isValidTransition('PENDING', 'CONFIRMED')).toBe(true);
      expect(OrderStateMachine.isValidTransition('CONFIRMED', 'ASSIGNED')).toBe(true);
      expect(OrderStateMachine.isValidTransition('ASSIGNED', 'IN_TRANSIT')).toBe(true);
      expect(OrderStateMachine.isValidTransition('IN_TRANSIT', 'DELIVERED')).toBe(true);
    });

    it('should reject invalid transitions', () => {
      expect(OrderStateMachine.isValidTransition('DRAFT', 'DELIVERED')).toBe(false);
      expect(OrderStateMachine.isValidTransition('PENDING', 'IN_TRANSIT')).toBe(false);
      expect(OrderStateMachine.isValidTransition('DELIVERED', 'PENDING')).toBe(false);
    });

    it('should allow cancellation from valid states', () => {
      expect(OrderStateMachine.isValidTransition('DRAFT', 'CANCELLED')).toBe(true);
      expect(OrderStateMachine.isValidTransition('PENDING', 'CANCELLED')).toBe(true);
      expect(OrderStateMachine.isValidTransition('CONFIRMED', 'CANCELLED')).toBe(true);
      expect(OrderStateMachine.isValidTransition('ASSIGNED', 'CANCELLED')).toBe(true);
      expect(OrderStateMachine.isValidTransition('IN_TRANSIT', 'CANCELLED')).toBe(true);
    });
  });

  describe('getValidNextStates', () => {
    it('should return valid next states', () => {
      const nextStates = OrderStateMachine.getValidNextStates('PENDING');
      expect(nextStates).toContain('CONFIRMED');
      expect(nextStates).toContain('CANCELLED');
    });

    it('should return empty array for final states', () => {
      expect(OrderStateMachine.getValidNextStates('DELIVERED')).toEqual([]);
      expect(OrderStateMachine.getValidNextStates('CANCELLED')).toEqual([]);
      expect(OrderStateMachine.getValidNextStates('FAILED')).toEqual([]);
    });
  });

  describe('isFinalState', () => {
    it('should identify final states', () => {
      expect(OrderStateMachine.isFinalState('DELIVERED')).toBe(true);
      expect(OrderStateMachine.isFinalState('CANCELLED')).toBe(true);
      expect(OrderStateMachine.isFinalState('FAILED')).toBe(true);
    });

    it('should identify non-final states', () => {
      expect(OrderStateMachine.isFinalState('PENDING')).toBe(false);
      expect(OrderStateMachine.isFinalState('IN_TRANSIT')).toBe(false);
    });
  });

  describe('canCancel', () => {
    it('should allow cancellation from valid states', () => {
      expect(OrderStateMachine.canCancel('DRAFT')).toBe(true);
      expect(OrderStateMachine.canCancel('PENDING')).toBe(true);
      expect(OrderStateMachine.canCancel('CONFIRMED')).toBe(true);
      expect(OrderStateMachine.canCancel('ASSIGNED')).toBe(true);
      expect(OrderStateMachine.canCancel('IN_TRANSIT')).toBe(true);
    });

    it('should not allow cancellation from final states', () => {
      expect(OrderStateMachine.canCancel('DELIVERED')).toBe(false);
      expect(OrderStateMachine.canCancel('CANCELLED')).toBe(false);
      expect(OrderStateMachine.canCancel('FAILED')).toBe(false);
    });
  });
});


/**
 * State Machine para transiciones de estado de órdenes
 */

import { OrderStatus } from '../entities/Order';

export class OrderStateMachine {
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    DRAFT: ['PENDING', 'CANCELLED'],
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['ASSIGNED', 'CANCELLED'],
    ASSIGNED: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'FAILED', 'CANCELLED'],
    DELIVERED: [], // Estado final
    CANCELLED: [], // Estado final
    FAILED: [], // Estado final
  };

  /**
   * Verifica si una transición de estado es válida
   */
  static isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    const validTransitions = this.VALID_TRANSITIONS[from];
    return validTransitions.includes(to);
  }

  /**
   * Obtiene los estados válidos desde un estado dado
   */
  static getValidNextStates(from: OrderStatus): OrderStatus[] {
    return this.VALID_TRANSITIONS[from];
  }

  /**
   * Verifica si un estado es final (no puede cambiar)
   */
  static isFinalState(status: OrderStatus): boolean {
    return this.VALID_TRANSITIONS[status].length === 0;
  }

  /**
   * Verifica si un estado permite cancelación
   */
  static canCancel(status: OrderStatus): boolean {
    return ['DRAFT', 'PENDING', 'CONFIRMED', 'ASSIGNED', 'IN_TRANSIT'].includes(status);
  }
}


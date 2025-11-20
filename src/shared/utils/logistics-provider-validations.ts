/**
 * Utilidades para validaciones específicas de logistics provider
 * 
 * Funciones helper para validar que usuarios LOGISTICS_PROVIDER
 * solo accedan a recursos de su propio proveedor.
 */

import { UserRole } from '../constants/permissions';

/**
 * Valida que un usuario LOGISTICS_PROVIDER tenga logistics_provider_id
 */
export function validateLogisticsProviderUser(user: {
  role: string;
  logistics_provider_id: string | null;
}): void {
  if (user.role === UserRole.LOGISTICS_PROVIDER && !user.logistics_provider_id) {
    throw new Error(
      'User with role LOGISTICS_PROVIDER must have logistics_provider_id'
    );
  }
}

/**
 * Valida que un usuario LOGISTICS_PROVIDER solo acceda a su propio proveedor
 */
export function validateLogisticsProviderAccess(
  user: {
    role: string;
    logistics_provider_id: string | null;
  },
  resourceLogisticsProviderId: string | null
): void {
  if (user.role !== UserRole.LOGISTICS_PROVIDER) {
    return; // No es LOGISTICS_PROVIDER, no necesita validación
  }

  if (!user.logistics_provider_id) {
    throw new Error(
      'User with role LOGISTICS_PROVIDER must have logistics_provider_id'
    );
  }

  if (!resourceLogisticsProviderId) {
    throw new Error('Resource does not belong to a logistics provider');
  }

  if (user.logistics_provider_id !== resourceLogisticsProviderId) {
    throw new Error(
      'User can only access resources from their own logistics provider'
    );
  }
}

/**
 * Valida que una orden pertenezca al logistics provider del usuario
 */
export function validateOrderLogisticsProvider(
  user: {
    role: string;
    logistics_provider_id: string | null;
  },
  orderLogisticsProviderId: string | null
): void {
  if (user.role !== UserRole.LOGISTICS_PROVIDER) {
    return; // No es LOGISTICS_PROVIDER, no necesita validación
  }

  validateLogisticsProviderAccess(user, orderLogisticsProviderId);
}

/**
 * Valida que un driver pertenezca al logistics provider del usuario
 */
export function validateDriverLogisticsProvider(
  user: {
    role: string;
    logistics_provider_id: string | null;
  },
  driverLogisticsProviderId: string
): void {
  if (user.role !== UserRole.LOGISTICS_PROVIDER) {
    return; // No es LOGISTICS_PROVIDER, no necesita validación
  }

  validateLogisticsProviderAccess(user, driverLogisticsProviderId);
}

/**
 * Valida que un vehículo pertenezca al logistics provider del usuario
 */
export function validateVehicleLogisticsProvider(
  user: {
    role: string;
    logistics_provider_id: string | null;
  },
  vehicleLogisticsProviderId: string | null
): void {
  if (user.role !== UserRole.LOGISTICS_PROVIDER) {
    return; // No es LOGISTICS_PROVIDER, no necesita validación
  }

  validateLogisticsProviderAccess(user, vehicleLogisticsProviderId);
}


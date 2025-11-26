/**
 * Sistema de Permisos del Sistema
 * 
 * Define la matriz de permisos por rol y recurso.
 * Los permisos se almacenan en código para type safety y performance.
 */

export type Resource =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'categories'
  | 'brands'
  | 'drivers'
  | 'vehicles'
  | 'branches'
  | 'delivery-zones'
  | 'delivery-rates'
  | 'logistics-providers'
  | 'users'
  | 'tenants'
  | 'payments'
  | 'reports'
  | 'subscriptions'
  | 'order-counters'
  | 'storefront'
  | '*'; // Wildcard para acceso total

export type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';

export interface Permission {
  resource: Resource;
  action: Action;
}

export enum UserRole {
  SAAS_ADMIN = 'SAAS_ADMIN',
  SAAS_EDITOR = 'SAAS_EDITOR',
  OWNER = 'OWNER',
  SUPERVISOR = 'SUPERVISOR',
  MERCHANT_USER = 'MERCHANT_USER',
  LOGISTICS_PROVIDER = 'LOGISTICS_PROVIDER',
  CUSTOMER = 'CUSTOMER',
}

/**
 * Matriz de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SAAS_ADMIN]: [
    { resource: '*', action: 'manage' },
  ],
  [UserRole.SAAS_EDITOR]: [
    { resource: '*', action: 'manage' },
  ],
  [UserRole.OWNER]: [
    { resource: '*', action: 'manage' },
  ],
  [UserRole.SUPERVISOR]: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'update' },
    { resource: 'orders', action: 'delete' },
    { resource: 'orders', action: 'manage' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'create' },
    { resource: 'products', action: 'update' },
    { resource: 'products', action: 'delete' },
    { resource: 'categories', action: 'read' },
    { resource: 'categories', action: 'create' },
    { resource: 'categories', action: 'update' },
    { resource: 'categories', action: 'delete' },
    { resource: 'brands', action: 'read' },
    { resource: 'brands', action: 'create' },
    { resource: 'brands', action: 'update' },
    { resource: 'brands', action: 'delete' },
    { resource: 'drivers', action: 'read' },
    { resource: 'drivers', action: 'create' },
    { resource: 'drivers', action: 'update' },
    { resource: 'drivers', action: 'delete' },
    { resource: 'vehicles', action: 'read' },
    { resource: 'vehicles', action: 'create' },
    { resource: 'vehicles', action: 'update' },
    { resource: 'vehicles', action: 'delete' },
    { resource: 'branches', action: 'read' },
    { resource: 'branches', action: 'create' },
    { resource: 'branches', action: 'update' },
    { resource: 'branches', action: 'delete' },
    { resource: 'delivery-zones', action: 'read' },
    { resource: 'delivery-zones', action: 'create' },
    { resource: 'delivery-zones', action: 'update' },
    { resource: 'delivery-zones', action: 'delete' },
    { resource: 'delivery-rates', action: 'read' },
    { resource: 'delivery-rates', action: 'create' },
    { resource: 'delivery-rates', action: 'update' },
    { resource: 'delivery-rates', action: 'delete' },
    { resource: 'logistics-providers', action: 'read' },
    { resource: 'logistics-providers', action: 'create' },
    { resource: 'logistics-providers', action: 'update' },
    { resource: 'logistics-providers', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'payments', action: 'read' },
    { resource: 'payments', action: 'manage' },
    { resource: 'reports', action: 'read' },
    { resource: 'subscriptions', action: 'read' },
    { resource: 'order-counters', action: 'read' },
    { resource: 'storefront', action: 'read' },
    { resource: 'storefront', action: 'update' },
  ],
  [UserRole.MERCHANT_USER]: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'create' },
    { resource: 'orders', action: 'update' },
    { resource: 'products', action: 'read' },
    { resource: 'products', action: 'update' },
    { resource: 'categories', action: 'read' },
    { resource: 'brands', action: 'read' },
    { resource: 'reports', action: 'read' },
    { resource: 'subscriptions', action: 'read' },
  ],
  [UserRole.LOGISTICS_PROVIDER]: [
    { resource: 'dashboard', action: 'read' },
    { resource: 'orders', action: 'read' },
    { resource: 'drivers', action: 'read' },
    { resource: 'drivers', action: 'create' },
    { resource: 'drivers', action: 'update' },
    { resource: 'drivers', action: 'delete' },
    { resource: 'vehicles', action: 'read' },
    { resource: 'vehicles', action: 'create' },
    { resource: 'vehicles', action: 'update' },
    { resource: 'vehicles', action: 'delete' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'reports', action: 'read' },
  ],
  [UserRole.DRIVER]: [
    // DRIVER no tiene permisos en el backoffice - solo acceso al link de rastreo público
  ],
  [UserRole.CUSTOMER]: [
    { resource: 'orders', action: 'read' },
    { resource: 'orders', action: 'update' },
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action
): boolean {
  // SAAS_ADMIN, SAAS_EDITOR y OWNER tienen acceso total
  if (
    role === UserRole.SAAS_ADMIN ||
    role === UserRole.SAAS_EDITOR ||
    role === UserRole.OWNER
  ) {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[role];

  // Verificar permiso específico
  return permissions.some(
    (p) =>
      (p.resource === resource || p.resource === '*') &&
      (p.action === action || p.action === 'manage')
  );
}

/**
 * Verifica si un rol puede acceder a un recurso (cualquier acción)
 */
export function canAccessResource(role: UserRole, resource: Resource): boolean {
  if (
    role === UserRole.SAAS_ADMIN ||
    role === UserRole.SAAS_EDITOR ||
    role === UserRole.OWNER
  ) {
    return true;
  }

  return ROLE_PERMISSIONS[role].some(
    (p) => p.resource === resource || p.resource === '*'
  );
}

/**
 * Obtiene todas las acciones permitidas para un recurso y rol
 */
export function getAllowedActions(
  role: UserRole,
  resource: Resource
): Action[] {
  if (
    role === UserRole.SAAS_ADMIN ||
    role === UserRole.SAAS_EDITOR ||
    role === UserRole.OWNER
  ) {
    return ['read', 'create', 'update', 'delete', 'manage'];
  }

  const permissions = ROLE_PERMISSIONS[role].filter(
    (p) => p.resource === resource || p.resource === '*'
  );
  const actions = new Set<Action>();

  permissions.forEach((p) => {
    if (p.action === 'manage') {
      actions.add('read');
      actions.add('create');
      actions.add('update');
      actions.add('delete');
      actions.add('manage');
    } else {
      actions.add(p.action);
    }
  });

  return Array.from(actions);
}


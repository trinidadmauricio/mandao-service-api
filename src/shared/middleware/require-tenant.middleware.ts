/**
 * Middleware para validar que SAAS_ADMIN tenga tenant seleccionado
 * Se ejecuta DESPUÉS del authMiddleware para validar que el usuario autenticado tenga tenant
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { UserRole } from '../constants/permissions';

// Rutas que NO requieren tenant (disponibles para SAAS_ADMIN sin tenant seleccionado)
const ROUTES_WITHOUT_TENANT = [
  '/api/v1/tenants', // Listar/crear tenants
  '/api/v1/auth', // Autenticación
  '/api/v1/subscription-plans', // Planes de suscripción
  '/health', // Health check
  '/api-docs', // Documentación
  '/redoc', // Documentación
  '/api-docs.json', // Documentación
];

/**
 * Verifica si una ruta requiere tenant
 */
function requiresTenant(path: string): boolean {
  // Si es una ruta que no requiere tenant, retornar false
  if (ROUTES_WITHOUT_TENANT.some((route) => path.startsWith(route))) {
    return false;
  }
  // Todas las demás rutas requieren tenant
  return true;
}

/**
 * Middleware que valida que SAAS_ADMIN tenga tenant seleccionado
 * Debe ejecutarse DESPUÉS del authMiddleware
 */
export const requireTenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si no hay usuario autenticado, continuar (el authMiddleware ya validó)
  if (!req.user) {
    next();
    return;
  }

  // Si el usuario tiene tenant_id (no es SAAS_ADMIN), continuar
  if (req.user.tenant_id) {
    next();
    return;
  }

  // LOGISTICS_PROVIDER y SUPERVISOR actúan independientemente de tenant
  // No requieren tenant_id porque gestionan recursos por logistics_provider_id
  if (req.user.role === UserRole.LOGISTICS_PROVIDER || req.user.role === UserRole.SUPERVISOR) {
    next();
    return;
  }

  // Si el usuario es SAAS_ADMIN o SAAS_EDITOR sin tenant_id
  if (
    (req.user.role === UserRole.SAAS_ADMIN || req.user.role === UserRole.SAAS_EDITOR) &&
    !req.user.tenant_id
  ) {
    // Si la ruta NO requiere tenant, permitir continuar
    if (!requiresTenant(req.path)) {
      next();
      return;
    }

    // Si la ruta SÍ requiere tenant pero no hay tenant en req.tenant, bloquear
    if (!req.tenant) {
      logger.warn('SAAS admin trying to access tenant-required route without tenant', {
        path: req.path,
        userId: req.user.id,
      });
      res.status(400).json({
        status: 'error',
        message:
          'Tenant ID is required. Please specify tenant_id in the X-Tenant-Id header or as a query parameter (e.g., ?tenant_id=xxx).',
      });
      return;
    }
  }

  // Continuar
  next();
};


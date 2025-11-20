/**
 * Middleware para validar permisos basados en roles
 * 
 * Valida que el usuario autenticado tenga el permiso necesario para acceder al recurso.
 * Debe ejecutarse DESPUÉS de authMiddleware y requireTenantMiddleware.
 */

import { Request, Response, NextFunction } from 'express';
import { hasPermission, UserRole, Resource, Action } from '../constants/permissions';
import { logger } from '../utils/logger';

/**
 * Middleware factory para validar permisos
 * 
 * @param resource - Recurso al que se intenta acceder
 * @param action - Acción que se intenta realizar
 * @returns Middleware de Express
 */
export function requirePermission(resource: Resource, action: Action) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si no hay usuario autenticado, el authMiddleware ya debería haber bloqueado
    if (!req.user) {
      logger.warn('requirePermission called without authenticated user', {
        path: req.path,
        resource,
        action,
      });
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
      return;
    }

    const userRole = req.user.role as UserRole;

    // Verificar permiso
    if (!hasPermission(userRole, resource, action)) {
      logger.warn('User does not have required permission', {
        userId: req.user.id,
        role: userRole,
        resource,
        action,
        path: req.path,
      });
      res.status(403).json({
        status: 'error',
        message: `You do not have permission to ${action} ${resource}`,
      });
      return;
    }

    // Permiso válido, continuar
    next();
  };
}


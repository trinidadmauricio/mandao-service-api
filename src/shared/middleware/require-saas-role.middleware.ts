/**
 * Middleware para validar que solo roles SAAS pueden acceder
 * 
 * Valida que el usuario autenticado sea SAAS_ADMIN o SAAS_EDITOR.
 * Debe ejecutarse DESPUÉS de authMiddleware.
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/permissions';
import { logger } from '../utils/logger';

/**
 * Middleware para validar que solo roles SAAS pueden acceder
 */
export function requireSaasRole(req: Request, res: Response, next: NextFunction): void {
  // Si no hay usuario autenticado, el authMiddleware ya debería haber bloqueado
  if (!req.user) {
    logger.warn('requireSaasRole called without authenticated user', {
      path: req.path,
    });
    res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
    return;
  }

  const userRole = req.user.role as UserRole;

  // Solo SAAS_ADMIN y SAAS_EDITOR pueden acceder
  if (userRole !== UserRole.SAAS_ADMIN && userRole !== UserRole.SAAS_EDITOR) {
    logger.warn('Non-SAAS user trying to access SAAS-only resource', {
      userId: req.user.id,
      role: userRole,
      path: req.path,
    });
    res.status(403).json({
      status: 'error',
      message: 'This resource is only accessible by SAAS roles (SAAS_ADMIN or SAAS_EDITOR)',
    });
    return;
  }

  // Usuario es SAAS, continuar
  next();
}


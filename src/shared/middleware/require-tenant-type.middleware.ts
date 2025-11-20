/**
 * Middleware para validar tipo de tenant
 * 
 * Valida que el tenant del usuario tenga el tipo necesario para acceder al recurso.
 * Debe ejecutarse DESPUÉS de authMiddleware y requireTenantMiddleware.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export type TenantType = 'RETAIL' | 'ON_DEMAND' | 'HYBRID';

/**
 * Middleware factory para validar tipo de tenant
 * 
 * @param allowedTypes - Tipos de tenant permitidos
 * @returns Middleware de Express
 */
export function requireTenantType(allowedTypes: TenantType[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si no hay tenant, el requireTenantMiddleware ya debería haber bloqueado
    if (!req.tenant) {
      logger.warn('requireTenantType called without tenant', {
        path: req.path,
        allowedTypes,
      });
      res.status(400).json({
        status: 'error',
        message: 'Tenant is required',
      });
      return;
    }

    const tenantType = req.tenant.type as TenantType;

    // Verificar que el tipo de tenant esté permitido
    if (!allowedTypes.includes(tenantType)) {
      logger.warn('Tenant type not allowed for this operation', {
        tenantId: req.tenant.id,
        tenantType,
        allowedTypes,
        path: req.path,
      });
      res.status(403).json({
        status: 'error',
        message: `This operation requires tenant type: ${allowedTypes.join(' or ')}. Your tenant type is: ${tenantType}`,
      });
      return;
    }

    // Tipo de tenant válido, continuar
    next();
  };
}


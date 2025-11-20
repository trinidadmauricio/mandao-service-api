/**
 * Middleware para tenant isolation
 * Extrae el tenant del header o subdomain y lo agrega a la request
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

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

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener tenant identifier del header X-Tenant-Id, query parameter, o del subdomain
    let tenantIdentifier: string | undefined;
    let tenantIdFromHeader: string | undefined;

    // 1. Intentar desde header X-Tenant-Id (puede ser ID o slug)
    tenantIdFromHeader = req.headers['x-tenant-id'] as string;
    tenantIdentifier = tenantIdFromHeader;

    // 2. Si no hay header, intentar desde query parameter tenant_id
    if (!tenantIdentifier) {
      tenantIdentifier = req.query.tenant_id as string | undefined;
    }

    // 3. Si no hay header ni query, intentar desde subdomain
    if (!tenantIdentifier) {
      const host = req.headers.host || '';
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
        tenantIdentifier = subdomain;
      }
    }

    // 3. Si no hay identifier, verificar si el usuario tiene tenant_id
    if (!tenantIdentifier) {
      // Si el usuario tiene tenant_id, usar ese
      if (req.user && req.user.tenant_id) {
        const tenant = await prisma.tenant.findUnique({
          where: {
            id: req.user.tenant_id,
          },
        });
        if (tenant) {
          req.tenant = tenant;
          if (!req.currency) {
            req.currency = tenant.default_currency;
          }
          if (!req.locale) {
            req.locale = tenant.default_locale;
          }
          next();
          return;
        }
      }

      // Si el usuario es SAAS_ADMIN o SAAS_EDITOR sin tenant_id
      if (
        req.user &&
        (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR') &&
        !req.user.tenant_id
      ) {
        // Si la ruta NO requiere tenant, permitir continuar
        if (!requiresTenant(req.path)) {
          logger.info('SAAS admin accessing route that does not require tenant', {
            path: req.path,
          });
          next();
          return;
        }

        // Si la ruta SÍ requiere tenant, bloquear y pedir que seleccione un tenant
        logger.warn('SAAS admin trying to access tenant-required route without tenant', {
          path: req.path,
        });
        res.status(400).json({
          status: 'error',
          message:
            'Tenant ID is required. Please specify tenant_id in the X-Tenant-Id header or as a query parameter (e.g., ?tenant_id=xxx).',
        });
        return;
      }

      // Permitir continuar sin tenant (para OAuth Client Credentials, endpoints públicos, etc.)
      // Algunos endpoints no requieren tenant
      if (!requiresTenant(req.path)) {
        logger.info('No tenant identifier found in request, but route does not require tenant', {
          path: req.path,
        });
        next();
        return;
      }

      // Si requiere tenant y no hay usuario, permitir continuar (el endpoint validará)
      logger.info('No tenant identifier found in request, continuing without tenant', {
        path: req.path,
      });
      next();
      return;
    }

    // Buscar tenant en la base de datos
    // Intentar primero por ID (si parece un UUID), luego por slug
    let tenant = null;

    // Verificar si es un UUID (formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      tenantIdentifier
    );

    if (isUUID) {
      // Buscar por ID
      tenant = await prisma.tenant.findUnique({
        where: {
          id: tenantIdentifier,
        },
      });
    }

    // Si no se encontró por ID o no es UUID, buscar por slug
    if (!tenant) {
      tenant = await prisma.tenant.findUnique({
        where: {
          slug: tenantIdentifier,
        },
      });
    }

    if (!tenant) {
      // Si el usuario es SAAS_ADMIN y la ruta no requiere tenant, permitir continuar
      if (
        req.user &&
        (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR') &&
        !req.user.tenant_id
      ) {
        if (!requiresTenant(req.path)) {
          logger.warn(
            'Tenant not found, but SAAS admin can continue (route does not require tenant)',
            {
              identifier: tenantIdentifier,
              path: req.path,
            }
          );
          next();
          return;
        }
        // Si requiere tenant, retornar error
        logger.warn('Tenant not found for SAAS admin on tenant-required route', {
          identifier: tenantIdentifier,
          path: req.path,
        });
        res.status(404).json({
          status: 'error',
          message: `Tenant not found with identifier: ${tenantIdentifier}. Please verify the tenant ID or slug.`,
        });
        return;
      }

      // Si no hay usuario autenticado (puede ser OAuth Client Credentials), permitir continuar
      // El endpoint específico validará si requiere tenant o no
      if (!req.user) {
        logger.warn('Tenant not found, but no user authenticated (may be OAuth client)', {
          identifier: tenantIdentifier,
        });
        next();
        return;
      }

      logger.warn('Tenant not found', { identifier: tenantIdentifier });
      res.status(404).json({
        status: 'error',
        message: 'Tenant not found',
      });
      return;
    }

    // Verificar que el tenant esté activo
    if (tenant.subscription_status === 'SUSPENDED') {
      res.status(403).json({
        status: 'error',
        message: 'Tenant is suspended',
      });
      return;
    }

    // Agregar tenant a la request
    req.tenant = tenant;

    // Agregar currency y locale a la request si no están en headers
    if (!req.currency) {
      req.currency = tenant.default_currency;
    }
    if (!req.locale) {
      req.locale = tenant.default_locale;
    }

    next();
  } catch (error) {
    logger.error('Error in tenant middleware', { error });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

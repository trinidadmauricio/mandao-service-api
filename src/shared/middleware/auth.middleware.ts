/**
 * Middleware de autenticación
 * Verifica y valida tokens JWT
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env.config';
import { logger } from '../utils/logger';
import { UserRole } from '../constants/permissions';

const prisma = new PrismaClient();

export interface JWTPayload {
  userId?: string; // Para tokens tradicionales
  tenantId?: string;
  role?: string;
  // Para tokens OAuth
  sub?: string; // user_id o client_id
  client_id?: string;
  scope?: string;
  type?: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}


export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verificar token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      logger.warn('Invalid JWT token', { error });
      res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
      return;
    }

    // Detectar tipo de token: OAuth (tiene client_id y sub) vs JWT tradicional (tiene userId o client_id='internal')
    // Si client_id === 'internal', es un token tradicional generado por el login endpoint
    if (decoded.client_id === 'internal' && decoded.sub) {
      // Token tradicional generado por login endpoint
      // Buscar usuario por sub (que contiene el user_id)
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.sub,
        },
        include: {
          tenant: true,
        },
      });

      if (!user) {
        res.status(401).json({
          status: 'error',
          message: 'User not found',
        });
        return;
      }

      // Verificar que el usuario esté activo
      if (user.status !== 'ACTIVE') {
        res.status(403).json({
          status: 'error',
          message: 'User account is not active',
        });
        return;
      }

      // Verificar tenant isolation si hay tenant en la request
      // Para SAAS_ADMIN y SAAS_EDITOR, permitir acceso aunque el tenant_id no coincida
      // (pueden tener tenant_id null y acceder a cualquier tenant)
      if (req.tenant && user.tenant_id !== req.tenant.id) {
        // Si el usuario NO es SAAS_ADMIN/SAAS_EDITOR, validar tenant
        if (user.role !== UserRole.SAAS_ADMIN && user.role !== UserRole.SAAS_EDITOR) {
          res.status(403).json({
            status: 'error',
            message: 'User does not belong to this tenant',
          });
          return;
        }
        // Si es SAAS_ADMIN/SAAS_EDITOR, permitir acceso aunque el tenant_id no coincida
      }

      // Agregar usuario a la request
      req.user = user;
      if (user.tenant) {
        req.tenant = user.tenant;
      } else if (
      (user.role === UserRole.SAAS_ADMIN || user.role === UserRole.SAAS_EDITOR) &&
      !user.tenant_id
    ) {
        // Si es SAAS_ADMIN sin tenant_id, verificar si hay tenant en header o query
        const tenantIdFromHeader = req.headers['x-tenant-id'] as string | undefined;
        const tenantIdFromQuery = req.query.tenant_id as string | undefined;
        const tenantId = tenantIdFromHeader || tenantIdFromQuery;

        if (tenantId) {
          // Buscar tenant por ID o slug
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId);
          
          let tenant = null;
          if (isUUID) {
            tenant = await prisma.tenant.findUnique({
              where: { id: tenantId },
            });
          }
          
          if (!tenant) {
            tenant = await prisma.tenant.findUnique({
              where: { slug: tenantId },
            });
          }

          if (tenant) {
            req.tenant = tenant;
            if (!req.currency) {
              req.currency = tenant.default_currency;
            }
            if (!req.locale) {
              req.locale = tenant.default_locale;
            }
          }
        }
      }

      next();
      return;
    }

    // Token OAuth (tiene client_id y sub, pero no es 'internal')
    if (decoded.client_id && decoded.sub && !decoded.userId) {
      // Token OAuth (Client Credentials o Authorization Code)
      const oauthClient = await prisma.oAuthClient.findUnique({
        where: {
          client_id: decoded.client_id,
        },
      });

      if (!oauthClient) {
        res.status(401).json({
          status: 'error',
          message: 'OAuth client not found',
        });
        return;
      }

      if (!oauthClient.is_active) {
        res.status(403).json({
          status: 'error',
          message: 'OAuth client is not active',
        });
        return;
      }

      // Verificar que el token no esté revocado en la BD (si existe)
      try {
        const accessToken = await prisma.oAuthAccessToken.findUnique({
          where: { token },
        });

        if (accessToken) {
          if (accessToken.is_revoked || new Date() > accessToken.expires_at) {
            res.status(401).json({
              status: 'error',
              message: 'Token is revoked or expired',
            });
            return;
          }

          // Si el token tiene user_id (Authorization Code flow), buscar el usuario
          if (accessToken.user_id) {
            const user = await prisma.user.findUnique({
              where: { id: accessToken.user_id },
              include: { tenant: true },
            });

            if (user && user.status === 'ACTIVE') {
              req.user = user;
              if (user.tenant) {
                req.tenant = user.tenant;
              }
            }
          }
        }
      } catch (error) {
        // Si hay error al buscar el token en BD, continuar con validación JWT
        // (el token puede ser válido aunque no esté en BD si se regeneró el spec)
        logger.warn('Error checking OAuth token in DB, continuing with JWT validation', { error });
      }

      // Agregar OAuth client a la request
      req.oauthClient = oauthClient;

      // Para clients globales (tenant_id: null) con scope admin, permitir acceso
      // El tenant middleware ya maneja esto, pero aquí lo marcamos
      next();
      return;
    }

    // Token JWT tradicional (tiene userId)
    if (!decoded.userId) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token format',
      });
      return;
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User not found',
      });
      return;
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        status: 'error',
        message: 'User account is not active',
      });
      return;
    }

    // Validación CRÍTICA: SUPERVISOR debe tener logistics_provider_id
    if (user.role === UserRole.SUPERVISOR && !user.logistics_provider_id) {
      res.status(403).json({
        status: 'error',
        message: 'SUPERVISOR user must have logistics_provider_id',
      });
      return;
    }

    // Verificar tenant isolation si hay tenant en la request
    // Para SAAS_ADMIN y SAAS_EDITOR, permitir acceso aunque el tenant_id no coincida
    // (pueden tener tenant_id null y acceder a cualquier tenant)
    if (req.tenant && user.tenant_id !== req.tenant.id) {
      // Si el usuario NO es SAAS_ADMIN/SAAS_EDITOR, validar tenant
      if (user.role !== UserRole.SAAS_ADMIN && user.role !== UserRole.SAAS_EDITOR) {
        res.status(403).json({
          status: 'error',
          message: 'User does not belong to this tenant',
        });
        return;
      }
      // Si es SAAS_ADMIN/SAAS_EDITOR, permitir acceso aunque el tenant_id no coincida
    }

    // Agregar usuario a la request
    req.user = user;
    if (user.tenant) {
      req.tenant = user.tenant;
    } else if (
      (user.role === UserRole.SAAS_ADMIN || user.role === UserRole.SAAS_EDITOR) &&
      !user.tenant_id
    ) {
      // Si es SAAS_ADMIN sin tenant_id, verificar si hay tenant en header o query
      const tenantIdFromHeader = req.headers['x-tenant-id'] as string | undefined;
      const tenantIdFromQuery = req.query.tenant_id as string | undefined;
      const tenantId = tenantIdFromHeader || tenantIdFromQuery;

      if (tenantId) {
        // Buscar tenant por ID o slug
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantId);
        
        let tenant = null;
        if (isUUID) {
          tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
          });
        }
        
        if (!tenant) {
          tenant = await prisma.tenant.findUnique({
            where: { slug: tenantId },
          });
        }

        if (tenant) {
          req.tenant = tenant;
          if (!req.currency) {
            req.currency = tenant.default_currency;
          }
          if (!req.locale) {
            req.locale = tenant.default_locale;
          }
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Error in auth middleware', { error });
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega usuario si existe
 * Si el token es inválido, continúa sin autenticación en lugar de retornar 401
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verificar si el token es válido antes de intentar autenticar
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      // Token inválido o expirado - continuar sin autenticación
      logger.debug('Invalid token in optional auth middleware, continuing without auth', { error });
      next();
      return;
    }

    // Si el token es válido, intentar autenticar
    // Pero si falla, no enviar error, solo continuar sin autenticación
    try {
      // Detectar tipo de token: OAuth (tiene client_id y sub) vs JWT tradicional (tiene userId o client_id='internal')
      if (decoded.client_id === 'internal' && decoded.sub) {
        // Token tradicional generado por login endpoint
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          include: { tenant: true },
        });

        if (user && user.status === 'ACTIVE') {
          // Verificar tenant isolation si hay tenant en la request
          if (req.tenant && user.tenant_id !== req.tenant.id) {
            // Si el usuario NO es SAAS_ADMIN/SAAS_EDITOR, validar tenant
            if (user.role !== UserRole.SAAS_ADMIN && user.role !== UserRole.SAAS_EDITOR) {
              // No pertenece al tenant, continuar sin autenticación
              logger.debug('User does not belong to tenant, continuing without auth');
              next();
              return;
            }
          }

          req.user = user;
          if (user.tenant) {
            req.tenant = user.tenant;
          }
        }
      } else if (decoded.client_id && decoded.sub && !decoded.userId) {
        // Token OAuth
        const oauthClient = await prisma.oAuthClient.findUnique({
          where: { client_id: decoded.client_id },
        });

        if (oauthClient && oauthClient.is_active) {
          req.oauthClient = oauthClient;

          // Si el token tiene user_id (Authorization Code flow), buscar el usuario
          try {
            const accessToken = await prisma.oAuthAccessToken.findUnique({
              where: { token },
            });

            if (accessToken && !accessToken.is_revoked && new Date() < accessToken.expires_at) {
              if (accessToken.user_id) {
                const user = await prisma.user.findUnique({
                  where: { id: accessToken.user_id },
                  include: { tenant: true },
                });

                if (user && user.status === 'ACTIVE') {
                  req.user = user;
                  if (user.tenant) {
                    req.tenant = user.tenant;
                  }
                }
              }
            }
          } catch (error) {
            // Si hay error al buscar el token en BD, continuar sin autenticación
            logger.debug('Error checking OAuth token in DB, continuing without auth', { error });
          }
        }
      } else if (decoded.userId) {
        // Token JWT tradicional (tiene userId)
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { tenant: true },
        });

        if (user && user.status === 'ACTIVE') {
          // Verificar tenant isolation
          if (req.tenant && user.tenant_id !== req.tenant.id) {
            if (user.role !== UserRole.SAAS_ADMIN && user.role !== UserRole.SAAS_EDITOR) {
              // No pertenece al tenant, continuar sin autenticación
              logger.debug('User does not belong to tenant, continuing without auth');
              next();
              return;
            }
          }

          req.user = user;
          if (user.tenant) {
            req.tenant = user.tenant;
          }
        }
      }
    } catch (error) {
      // Si hay error al buscar usuario, continuar sin autenticación
      logger.debug('Error in optional auth middleware, continuing without auth', { error });
    }

    next();
  } catch (error) {
    // Si hay error, continuar sin autenticación
    logger.debug('Error in optional auth middleware, continuing without auth', { error });
    next();
  }
};

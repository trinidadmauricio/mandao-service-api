/**
 * Middleware global para serializar automáticamente respuestas JSON
 * Convierte BigInt, Decimal (Prisma), Date y otros tipos especiales
 */

import { Request, Response, NextFunction } from 'express';
import { serializeForResponse } from '../utils/serializer.util';

/**
 * Middleware que intercepta res.json() para serializar automáticamente
 * las respuestas antes de enviarlas al cliente
 */
export const serializerMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  // Guardar el método original de res.json()
  const originalJson = res.json.bind(res);

  // Sobrescribir res.json() para serializar automáticamente
  res.json = function (body?: any): Response {
    if (body && typeof body === 'object') {
      // Serializar el body antes de enviarlo
      const serializedBody = serializeForResponse(body);
      return originalJson(serializedBody);
    }
    return originalJson(body);
  };

  next();
};


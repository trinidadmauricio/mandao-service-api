/**
 * Middleware de Rate Limiting
 */

import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.config';

/**
 * Rate limiter general para API
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutos
  max: env.RATE_LIMIT_MAX || 100, // 100 requests por ventana
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter estricto para endpoints OAuth
 * Más restrictivo porque son endpoints sensibles
 */
export const oauthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Solo 20 requests por ventana para OAuth
  message: {
    error: 'rate_limit_exceeded',
    error_description: 'Too many requests to OAuth endpoints, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});


/**
 * Utilidades para JWT
 */

import jwt, { SignOptions } from 'jsonwebtoken';

export interface JWTPayload {
  sub: string; // user_id o client_id
  client_id: string;
  scope: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Genera un JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>, expiresIn: string = '1h'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const options: SignOptions = {
    expiresIn,
    issuer: 'mandao-service-api',
  } as SignOptions;

  return jwt.sign(
    {
      ...payload,
      type: 'access',
    },
    secret,
    options
  );
}

/**
 * Genera un JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'type' | 'iat' | 'exp'>, expiresIn: string = '30d'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const options: SignOptions = {
    expiresIn,
    issuer: 'mandao-service-api',
  } as SignOptions;

  return jwt.sign(
    {
      ...payload,
      type: 'refresh',
    },
    secret,
    options
  );
}

/**
 * Verifica y decodifica un JWT token
 */
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'mandao-service-api',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}


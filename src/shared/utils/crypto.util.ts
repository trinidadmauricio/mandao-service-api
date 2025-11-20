/**
 * Utilidades criptográficas
 */

import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Genera un token seguro aleatorio
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Genera un client_id único
 */
export function generateClientId(): string {
  return `client_${generateSecureToken(16)}`;
}

/**
 * Genera un client_secret seguro
 */
export function generateClientSecret(): string {
  return generateSecureToken(32);
}

/**
 * Hashea un client_secret
 */
export async function hashClientSecret(secret: string): Promise<string> {
  return await bcrypt.hash(secret, 12);
}

/**
 * Verifica un client_secret contra un hash
 */
export async function verifyClientSecret(secret: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(secret, hash);
}


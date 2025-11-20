/**
 * Utilidades para manejo de contraseñas
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hashea una contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica una contraseña contra un hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}


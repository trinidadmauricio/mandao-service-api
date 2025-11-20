/**
 * Helpers para testing
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export const prisma = new PrismaClient();

/**
 * Crea un tenant de prueba
 */
export async function createTestTenant(data?: {
  slug?: string;
  name?: string;
  type?: 'RETAIL' | 'ON_DEMAND' | 'HYBRID';
}) {
  return prisma.tenant.create({
    data: {
      slug: data?.slug || faker.string.alphanumeric(10).toLowerCase(),
      name: data?.name || faker.company.name(),
      type: data?.type || 'RETAIL',
      default_locale: 'es',
      default_currency: 'USD',
    },
  });
}

/**
 * Crea un usuario de prueba
 */
export async function createTestUser(data?: {
  tenant_id?: string;
  email?: string;
  password_hash?: string;
  role?: string;
}) {
  return prisma.user.create({
    data: {
      tenant_id: data?.tenant_id,
      email: data?.email || faker.internet.email(),
      password_hash: data?.password_hash || faker.string.alphanumeric(32),
      role: (data?.role as any) || 'MERCHANT_USER',
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
    },
  });
}

/**
 * Limpia la base de datos de prueba
 */
export async function cleanupTestData(): Promise<void> {
  // Limpiar en orden inverso de dependencias
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "delivery"."orders" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "shared"."users" CASCADE');
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "shared"."tenants" CASCADE');
}

/**
 * Mock de Prisma Client para tests unitarios
 */
export function createMockPrismaClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockFn = (() => Promise.resolve(null)) as any;
  return {
    tenant: {
      findUnique: mockFn,
      findMany: mockFn,
      create: mockFn,
      update: mockFn,
      delete: mockFn,
    },
    user: {
      findUnique: mockFn,
      findMany: mockFn,
      create: mockFn,
      update: mockFn,
      delete: mockFn,
    },
    $transaction: mockFn,
  } as unknown as PrismaClient;
}

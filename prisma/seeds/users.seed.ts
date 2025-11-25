/**
 * Seed para Users
 */

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../../src/shared/utils/password.util';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface UserCredential {
  email: string;
  password: string;
  role: UserRole;
  tenant_slug?: string;
  logistics_provider_name?: string;
  first_name: string;
  last_name: string;
}

const credentials: UserCredential[] = [];

function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (x) => charset[x % charset.length]).join('');
}

async function saveCredentials(): Promise<void> {
  const filePath = path.join(__dirname, 'users-credentials.txt');
  let content = '='.repeat(80) + '\n';
  content += 'USER CREDENTIALS - MANDAO SERVICE API\n';
  content += 'Generated: ' + new Date().toISOString() + '\n';
  content += '='.repeat(80) + '\n\n';
  content += '⚠️  WARNING: Keep these credentials secure!\n';
  content += '⚠️  This file is in .gitignore and should NOT be committed.\n\n';

  // Group by tenant
  const byTenant = new Map<string, UserCredential[]>();
  const noTenant: UserCredential[] = [];

  for (const cred of credentials) {
    if (cred.tenant_slug) {
      if (!byTenant.has(cred.tenant_slug)) {
        byTenant.set(cred.tenant_slug, []);
      }
      byTenant.get(cred.tenant_slug)!.push(cred);
    } else {
      noTenant.push(cred);
    }
  }

  // SaaS Admins (no tenant)
  if (noTenant.length > 0) {
    content += 'SAAS ADMINS (No Tenant)\n';
    content += '-'.repeat(80) + '\n';
    for (const cred of noTenant) {
      content += `Email: ${cred.email}\n`;
      content += `Password: ${cred.password}\n`;
      content += `Role: ${cred.role}\n`;
      content += `Name: ${cred.first_name} ${cred.last_name}\n`;
      content += '\n';
    }
  }

  // By Tenant
  for (const [tenantSlug, tenantCreds] of byTenant.entries()) {
    content += `\nTENANT: ${tenantSlug.toUpperCase()}\n`;
    content += '='.repeat(80) + '\n';

    // Group by role
    const byRole = new Map<UserRole, UserCredential[]>();
    for (const cred of tenantCreds) {
      if (!byRole.has(cred.role)) {
        byRole.set(cred.role, []);
      }
      byRole.get(cred.role)!.push(cred);
    }

    for (const [role, roleCreds] of byRole.entries()) {
      content += `\n${role} (${roleCreds.length})\n`;
      content += '-'.repeat(80) + '\n';
      for (const cred of roleCreds) {
        content += `Email: ${cred.email}\n`;
        content += `Password: ${cred.password}\n`;
        content += `Name: ${cred.first_name} ${cred.last_name}\n`;
        if (cred.logistics_provider_name) {
          content += `Logistics Provider: ${cred.logistics_provider_name}\n`;
        }
        content += '\n';
      }
    }
  }

  content += '\n' + '='.repeat(80) + '\n';
  content += `Total users: ${credentials.length}\n`;
  content += '='.repeat(80) + '\n';

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\n📋 Credentials saved to: ${filePath}`);
}

export async function seedUsers(): Promise<void> {
  console.log('🌱 Seeding users...');

  // Obtener tenants
  const tenants = await prisma.tenant.findMany();
  if (tenants.length === 0) {
    throw new Error('No tenants found. Please run tenants seed first.');
  }

  // Obtener logistics providers
  const logisticsProviders = await prisma.logisticsProvider.findMany();

  // Crear usuarios por tenant
  for (const tenant of tenants) {
    const tenantUsers: UserCredential[] = [];

    // OWNER (1 por tenant)
    const ownerPassword = generateSecurePassword();
    const ownerEmail = `owner@${tenant.slug}.com`;
    const existingOwner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!existingOwner) {
      const passwordHash = await hashPassword(ownerPassword);
      await prisma.user.create({
        data: {
          email: ownerEmail,
          password_hash: passwordHash,
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          role: UserRole.OWNER,
          tenant_id: tenant.id,
          phone: faker.phone.number(),
          email_verified_at: new Date(),
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`  ✅ Created OWNER for tenant ${tenant.slug}: ${ownerEmail}`);
      tenantUsers.push({
        email: ownerEmail,
        password: ownerPassword,
        role: UserRole.OWNER,
        tenant_slug: tenant.slug,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
      });
    }

    // SUPERVISOR (2 por tenant)
    for (let i = 0; i < 2; i++) {
      const password = generateSecurePassword();
      const email = `supervisor${i + 1}@${tenant.slug}.com`;
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing) {
        const passwordHash = await hashPassword(password);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: UserRole.SUPERVISOR,
            tenant_id: tenant.id,
            phone: faker.phone.number(),
            email_verified_at: faker.datatype.boolean({ probability: 0.8 }) ? new Date() : null,
            status: UserStatus.ACTIVE,
          },
        });
        console.log(`  ✅ Created SUPERVISOR for tenant ${tenant.slug}: ${email}`);
        tenantUsers.push({
          email,
          password,
          role: UserRole.SUPERVISOR,
          tenant_slug: tenant.slug,
          first_name: firstName,
          last_name: lastName,
        });
      }
    }

    // MERCHANT_USER (3 por tenant)
    for (let i = 0; i < 3; i++) {
      const password = generateSecurePassword();
      const email = `merchant${i + 1}@${tenant.slug}.com`;
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing) {
        const passwordHash = await hashPassword(password);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: UserRole.MERCHANT_USER,
            tenant_id: tenant.id,
            phone: faker.phone.number(),
            email_verified_at: faker.datatype.boolean({ probability: 0.7 }) ? new Date() : null,
            status: UserStatus.ACTIVE,
          },
        });
        console.log(`  ✅ Created MERCHANT_USER for tenant ${tenant.slug}: ${email}`);
        tenantUsers.push({
          email,
          password,
          role: UserRole.MERCHANT_USER,
          tenant_slug: tenant.slug,
          first_name: firstName,
          last_name: lastName,
        });
      }
    }

    // CUSTOMER (4 por tenant)
    for (let i = 0; i < 4; i++) {
      const password = generateSecurePassword();
      const email = `customer${i + 1}@${tenant.slug}.com`;
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing) {
        const passwordHash = await hashPassword(password);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: UserRole.CUSTOMER,
            tenant_id: tenant.id,
            phone: faker.phone.number(),
            email_verified_at: faker.datatype.boolean({ probability: 0.6 }) ? new Date() : null,
            status: UserStatus.ACTIVE,
          },
        });
        console.log(`  ✅ Created CUSTOMER for tenant ${tenant.slug}: ${email}`);
        tenantUsers.push({
          email,
          password,
          role: UserRole.CUSTOMER,
          tenant_slug: tenant.slug,
          first_name: firstName,
          last_name: lastName,
        });
      }
    }

    credentials.push(...tenantUsers);
  }

  // Crear usuarios LOGISTICS_PROVIDER
  for (const provider of logisticsProviders) {
    // 2-3 usuarios por logistics provider
    const count = faker.number.int({ min: 2, max: 3 });
    for (let i = 0; i < count; i++) {
      const password = generateSecurePassword();
      const email = `provider${i + 1}@${provider.company_name.toLowerCase().replace(/\s+/g, '')}.com`;
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (!existing) {
        const passwordHash = await hashPassword(password);
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        await prisma.user.create({
          data: {
            email,
            password_hash: passwordHash,
            first_name: firstName,
            last_name: lastName,
            role: UserRole.LOGISTICS_PROVIDER,
            tenant_id: provider.tenant_id,
            logistics_provider_id: provider.id,
            phone: faker.phone.number(),
            email_verified_at: new Date(),
            status: UserStatus.ACTIVE,
          },
        });
        console.log(`  ✅ Created LOGISTICS_PROVIDER for ${provider.company_name}: ${email}`);
        credentials.push({
          email,
          password,
          role: UserRole.LOGISTICS_PROVIDER,
          tenant_slug: provider.tenant_id ? tenants.find((t) => t.id === provider.tenant_id)?.slug : undefined,
          logistics_provider_name: provider.company_name,
          first_name: firstName,
          last_name: lastName,
        });
      }
    }
  }

  // Guardar credenciales
  await saveCredentials();

  console.log(`✅ Users seeded successfully (${credentials.length} total)\n`);
}


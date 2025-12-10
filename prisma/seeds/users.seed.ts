/**
 * Seed para Users
 */

import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../../src/shared/utils/password.util';
import * as fs from 'fs';
import * as path from 'path';

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

// Contraseña fija para todos los usuarios
const FIXED_PASSWORD = '12345678@a';

async function saveCredentials(): Promise<void> {
  const filePath = path.join(__dirname, 'users-credentials.txt');
  let content = '='.repeat(80) + '\n';
  content += 'USUARIOS - MANDAO SERVICE API\n';
  content += 'Generado: ' + new Date().toISOString() + '\n';
  content += 'Contraseña para todos los usuarios: ' + FIXED_PASSWORD + '\n';
  content += '='.repeat(80) + '\n\n';

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

  // Separar usuarios sin tenant por rol
  const saasAdmins = noTenant.filter(c => c.role === UserRole.SAAS_ADMIN || c.role === UserRole.SAAS_EDITOR);
  const logisticsUsers = noTenant.filter(c => 
    c.role === UserRole.SUPERVISOR || 
    c.role === UserRole.LOGISTICS_PROVIDER || 
    c.role === UserRole.DRIVER
  );

  // SaaS Admins (solo SAAS_ADMIN y SAAS_EDITOR)
  if (saasAdmins.length > 0) {
    content += 'SAAS ADMINS (No Tenant)\n';
    content += '-'.repeat(80) + '\n';
    for (const cred of saasAdmins) {
      content += `Email: ${cred.email}\n`;
      content += `Password: ${cred.password}\n`;
      content += `Role: ${cred.role}\n`;
      content += `Name: ${cred.first_name} ${cred.last_name}\n`;
      content += '\n';
    }
  }

  // Logistics Provider Users (SUPERVISOR, LOGISTICS_PROVIDER, DRIVER)
  if (logisticsUsers.length > 0) {
    // Agrupar por logistics provider
    const byProvider = new Map<string, UserCredential[]>();
    const noProvider: UserCredential[] = [];

    for (const cred of logisticsUsers) {
      if (cred.logistics_provider_name) {
        if (!byProvider.has(cred.logistics_provider_name)) {
          byProvider.set(cred.logistics_provider_name, []);
        }
        byProvider.get(cred.logistics_provider_name)!.push(cred);
      } else {
        noProvider.push(cred);
      }
    }

    // Agrupar por rol dentro de cada provider
    for (const [providerName, providerCreds] of byProvider.entries()) {
      content += `\nLOGISTICS PROVIDER: ${providerName.toUpperCase()}\n`;
      content += '='.repeat(80) + '\n';

      const byRole = new Map<UserRole, UserCredential[]>();
      for (const cred of providerCreds) {
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
          content += '\n';
        }
      }
    }

    // Usuarios sin provider (no debería haber, pero por si acaso)
    if (noProvider.length > 0) {
      content += '\nLOGISTICS USERS (No Provider)\n';
      content += '-'.repeat(80) + '\n';
      for (const cred of noProvider) {
        content += `Email: ${cred.email}\n`;
        content += `Password: ${cred.password}\n`;
        content += `Role: ${cred.role}\n`;
        content += `Name: ${cred.first_name} ${cred.last_name}\n`;
        content += '\n';
      }
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

  // Incluir usuarios SAAS que ya fueron creados
  const saasUsers = await prisma.user.findMany({
    where: {
      role: {
        in: [UserRole.SAAS_ADMIN, UserRole.SAAS_EDITOR],
      },
      tenant_id: null,
    },
  });

  for (const user of saasUsers) {
    credentials.push({
      email: user.email,
      password: FIXED_PASSWORD,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  }

  // Obtener tenants - necesitamos RETAIL y ON_DEMAND
  const allTenants = await prisma.tenant.findMany({
    orderBy: { created_at: 'asc' },
  });
  if (allTenants.length === 0) {
    throw new Error('No tenants found. Please run tenants seed first.');
  }

  // Separar tenants por tipo
  const retailTenants = allTenants.filter(t => t.type === 'RETAIL').slice(0, 1); // 1 RETAIL
  const onDemandTenants = allTenants.filter(t => t.type === 'ON_DEMAND').slice(0, 1); // 1 ON_DEMAND
  const selectedTenants = [...retailTenants, ...onDemandTenants];

  if (selectedTenants.length < 2) {
    throw new Error('Need at least 1 RETAIL and 1 ON_DEMAND tenant. Please run tenants seed first.');
  }

  // Obtener logistics providers
  const logisticsProviders = await prisma.logisticsProvider.findMany();
  if (logisticsProviders.length < 2) {
    throw new Error('At least 2 logistics providers are required. Please run logistics-providers seed first.');
  }

  const passwordHash = await hashPassword(FIXED_PASSWORD);

  // Crear 2 OWNER usuarios (1 para RETAIL, 1 para ON_DEMAND)
  for (let i = 0; i < 2 && i < selectedTenants.length; i++) {
    const tenant = selectedTenants[i];
    const email = `owner${i + 1}@${tenant.slug}.com`;
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role: UserRole.OWNER,
          tenant_id: tenant.id,
          phone: faker.phone.number(),
          email_verified_at: new Date(),
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`  ✅ Created OWNER for tenant ${tenant.slug} (${tenant.type}): ${email}`);
      credentials.push({
        email,
        password: FIXED_PASSWORD,
        role: UserRole.OWNER,
        tenant_slug: tenant.slug,
        first_name: firstName,
        last_name: lastName,
      });
    }
  }

  // Crear 2 SUPERVISOR usuarios (pertenecen a logistics providers, NO a tenants)
  for (let i = 0; i < 2 && i < logisticsProviders.length; i++) {
    const provider = logisticsProviders[i];
    const email = `supervisor${i + 1}@${provider.company_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role: UserRole.SUPERVISOR,
          tenant_id: null, // SUPERVISOR pertenece a logistics provider, NO a tenant
          logistics_provider_id: provider.id,
          phone: faker.phone.number(),
          email_verified_at: new Date(),
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`  ✅ Created SUPERVISOR for logistics provider ${provider.company_name}: ${email}`);
      credentials.push({
        email,
        password: FIXED_PASSWORD,
        role: UserRole.SUPERVISOR,
        logistics_provider_name: provider.company_name,
        first_name: firstName,
        last_name: lastName,
      });
    }
  }

  // Crear 2 MERCHANT_USER usuarios (1 para RETAIL, 1 para ON_DEMAND)
  for (let i = 0; i < 2 && i < selectedTenants.length; i++) {
    const tenant = selectedTenants[i];
    const email = `merchant${i + 1}@${tenant.slug}.com`;
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
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
          email_verified_at: new Date(),
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`  ✅ Created MERCHANT_USER for tenant ${tenant.slug} (${tenant.type}): ${email}`);
      credentials.push({
        email,
        password: FIXED_PASSWORD,
        role: UserRole.MERCHANT_USER,
        tenant_slug: tenant.slug,
        first_name: firstName,
        last_name: lastName,
      });
    }
  }

  // Crear 2 LOGISTICS_PROVIDER usuarios (asociados a los primeros 2 logistics providers, sin tenant_id)
  for (let i = 0; i < 2 && i < logisticsProviders.length; i++) {
    const provider = logisticsProviders[i];
    const email = `provider${i + 1}@${provider.company_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (!existing) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      await prisma.user.create({
        data: {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role: UserRole.LOGISTICS_PROVIDER,
          tenant_id: null, // LOGISTICS_PROVIDER NO tiene tenant_id - funciona separado
          logistics_provider_id: provider.id,
          phone: faker.phone.number(),
          email_verified_at: new Date(),
          status: UserStatus.ACTIVE,
        },
      });
      console.log(`  ✅ Created LOGISTICS_PROVIDER for ${provider.company_name}: ${email}`);
      credentials.push({
        email,
        password: FIXED_PASSWORD,
        role: UserRole.LOGISTICS_PROVIDER,
        logistics_provider_name: provider.company_name,
        first_name: firstName,
        last_name: lastName,
      });
    }
  }

  // Incluir también usuarios existentes que no se crearon en este seed
  // (para asegurar que el archivo tenga todos los usuarios)
  const allCreatedUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: UserRole.SAAS_ADMIN },
        { role: UserRole.SAAS_EDITOR },
        { role: UserRole.OWNER },
        { role: UserRole.SUPERVISOR },
        { role: UserRole.MERCHANT_USER },
        { role: UserRole.LOGISTICS_PROVIDER },
        { role: UserRole.DRIVER },
      ],
    },
    select: {
      email: true,
      role: true,
      first_name: true,
      last_name: true,
      tenant_id: true,
      logistics_provider_id: true,
    },
  });

  // Obtener todos los tenants y providers para poder asociarlos
  const allTenantsForCreds = await prisma.tenant.findMany();
  const allProvidersForCreds = await prisma.logisticsProvider.findMany();

  // Agregar usuarios que no están ya en credentials
  const existingEmails = new Set(credentials.map(c => c.email));
  for (const user of allCreatedUsers) {
    if (!existingEmails.has(user.email)) {
      const tenant = user.tenant_id ? allTenantsForCreds.find(t => t.id === user.tenant_id) : null;
      const provider = user.logistics_provider_id 
        ? allProvidersForCreds.find(p => p.id === user.logistics_provider_id)
        : null;
      
      credentials.push({
        email: user.email,
        password: FIXED_PASSWORD,
        role: user.role,
        tenant_slug: tenant?.slug,
        logistics_provider_name: provider?.company_name,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    }
  }

  // Guardar credenciales (ahora con todos los usuarios incluidos)
  await saveCredentials();

  console.log(`✅ Users seeded successfully (${credentials.length} total)\n`);
}


/**
 * Seed para usuarios administradores del SaaS
 */

import { PrismaClient, UserRole } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword } from '../../src/shared/utils/password.util';

const prisma = new PrismaClient();

export async function seedSaaSAdmins(): Promise<void> {
  console.log('🌱 Seeding SaaS admin users...');

  // Generar contraseñas seguras
  const adminPassword1 = generateSecurePassword();
  const adminPassword2 = generateSecurePassword();

  const admins = [
    {
      email: 'admin@mandao.com',
      password: adminPassword1,
      first_name: 'Admin',
      last_name: 'Mandao',
      role: UserRole.SAAS_ADMIN,
      email_verified_at: new Date(),
    },
    {
      email: 'superadmin@mandao.com',
      password: adminPassword2,
      first_name: 'Super',
      last_name: 'Admin',
      role: UserRole.SAAS_ADMIN,
      email_verified_at: new Date(),
    },
  ];

  const createdAdmins: Array<{ email: string; password: string }> = [];

  for (const admin of admins) {
    const existing = await prisma.user.findUnique({
      where: { email: admin.email },
    });

    if (!existing) {
      const passwordHash = await hashPassword(admin.password);
      await prisma.user.create({
        data: {
          email: admin.email,
          password_hash: passwordHash,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: admin.role,
          email_verified_at: admin.email_verified_at,
          tenant_id: null, // Usuarios globales del SaaS
        },
      });
      console.log(`  ✅ Created admin: ${admin.email}`);
      createdAdmins.push({ email: admin.email, password: admin.password });
    } else {
      console.log(`  ⏭️  Admin already exists: ${admin.email}`);
    }
  }

  if (createdAdmins.length > 0) {
    console.log('\n📋 Admin credentials (SAVE THESE SECURELY):');
    console.log('='.repeat(60));
    createdAdmins.forEach((admin) => {
      console.log(`Email: ${admin.email}`);
      console.log(`Password: ${admin.password}`);
      console.log('-'.repeat(60));
    });
    console.log('='.repeat(60));
    console.log('⚠️  These passwords will NOT be shown again!\n');
  }

  console.log('✅ SaaS admin users seeded successfully\n');
}

/**
 * Genera una contraseña segura
 */
function generateSecurePassword(): string {
  const length = 20;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (x) => charset[x % charset.length]).join('');
}


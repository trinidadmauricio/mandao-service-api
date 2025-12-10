/**
 * Seed para usuarios administradores del SaaS
 */

import { PrismaClient, UserRole } from '@prisma/client';
import { hashPassword } from '../../src/shared/utils/password.util';

const prisma = new PrismaClient();

export async function seedSaaSAdmins(): Promise<void> {
  console.log('🌱 Seeding SaaS admin users...');

  // Contraseña fija para todos los usuarios
  const fixedPassword = '12345678@a';

  const admins = [
    {
      email: 'admin@mandao.com',
      password: fixedPassword,
      first_name: 'Admin',
      last_name: 'Mandao',
      role: UserRole.SAAS_ADMIN,
      email_verified_at: new Date(),
    },
    {
      email: 'editor@mandao.com',
      password: fixedPassword,
      first_name: 'Editor',
      last_name: 'Mandao',
      role: UserRole.SAAS_EDITOR,
      email_verified_at: new Date(),
    },
  ];

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
    } else {
      console.log(`  ⏭️  Admin already exists: ${admin.email}`);
    }
  }

  console.log('✅ SaaS admin users seeded successfully\n');
}

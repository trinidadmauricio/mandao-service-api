/**
 * Seed para Branches
 */

import { PrismaClient, BranchStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedBranches(): Promise<void> {
  console.log('🌱 Seeding branches...');

  const tenants = await prisma.tenant.findMany();
  if (tenants.length === 0) {
    throw new Error('No tenants found. Please run tenants seed first.');
  }

  let createdCount = 0;

  for (const tenant of tenants) {
    // 2-3 branches por tenant
    const branchCount = faker.number.int({ min: 2, max: 3 });

    for (let i = 0; i < branchCount; i++) {
      const isMain = i === 0; // Primera branch es la principal
      const lat = parseFloat(faker.location.latitude().toString());
      const lng = parseFloat(faker.location.longitude().toString());

      const operatingHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: null, close: null, closed: true },
      };

      await prisma.branch.create({
        data: {
          tenant_id: tenant.id,
          name: isMain ? `${tenant.name} - Main Branch` : `${tenant.name} - Branch ${i + 1}`,
          address: faker.location.streetAddress({ useFullAddress: true }),
          gps_lat: lat,
          gps_lng: lng,
          contact_phone: faker.phone.number(),
          is_main: isMain,
          operating_hours: operatingHours,
          status: BranchStatus.ACTIVE,
        },
      });

      createdCount++;
      console.log(`  ✅ Created branch for tenant ${tenant.slug}: ${isMain ? 'Main' : `Branch ${i + 1}`}`);
    }
  }

  console.log(`✅ Branches seeded successfully (${createdCount} created)\n`);
}


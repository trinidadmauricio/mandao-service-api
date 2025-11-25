/**
 * Seed para Order Counters
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedOrderCounters(): Promise<void> {
  console.log('🌱 Seeding order counters...');

  const tenants = await prisma.tenant.findMany();
  if (tenants.length === 0) {
    throw new Error('No tenants found. Please run tenants seed first.');
  }

  const prefixes = ['ORD', 'DEL', 'SHIP', 'TRK', 'MND'];
  const paddingLengths = [4, 5, 6, 7, 8];

  for (const tenant of tenants) {
    const existing = await prisma.orderCounter.findUnique({
      where: { tenant_id: tenant.id },
    });

    if (!existing) {
      const prefix = faker.helpers.arrayElement(prefixes);
      const paddingLength = faker.helpers.arrayElement(paddingLengths);
      const currentValue = BigInt(faker.number.int({ min: 0, max: 1000 }));

      await prisma.orderCounter.create({
        data: {
          tenant_id: tenant.id,
          current_value: currentValue,
          prefix,
          padding_length: paddingLength,
          last_reset_at: null,
        },
      });

      console.log(`  ✅ Created order counter for tenant ${tenant.slug}: ${prefix}-${String(currentValue).padStart(paddingLength, '0')}`);
    } else {
      console.log(`  ⏭️  Order counter already exists for tenant ${tenant.slug}`);
    }
  }

  console.log('✅ Order counters seeded successfully\n');
}


/**
 * Seed para Brands
 */

import { PrismaClient, TenantType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedBrands(): Promise<void> {
  console.log('🌱 Seeding brands...');

  const tenants = await prisma.tenant.findMany({
    where: {
      type: {
        in: [TenantType.RETAIL, TenantType.HYBRID],
      },
    },
  });

  if (tenants.length === 0) {
    console.log('  ⏭️  No RETAIL or HYBRID tenants found, skipping brands');
    return;
  }

  const popularBrands = [
    'Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Puma', 'Coca-Cola', 'Pepsi',
    'Microsoft', 'Google', 'Amazon', 'LG', 'HP', 'Dell', 'Canon', 'Nikon',
  ];

  let createdCount = 0;

  for (const tenant of tenants) {
    // 10-15 brands por tenant
    const brandCount = faker.number.int({ min: 10, max: 15 });
    const usedSlugs = new Set<string>();

    for (let i = 0; i < brandCount; i++) {
      const brandName = i < popularBrands.length
        ? popularBrands[i]
        : faker.company.name();
      const slug = `${tenant.slug}-${brandName.toLowerCase().replace(/\s+/g, '-')}`;

      if (!usedSlugs.has(slug)) {
        await prisma.brand.create({
          data: {
            tenant_id: tenant.id,
            name: brandName,
            slug,
            logo_url: faker.image.url(),
            description: faker.lorem.sentence(),
            is_active: faker.datatype.boolean({ probability: 0.9 }),
          },
        });

        usedSlugs.add(slug);
        createdCount++;
        console.log(`  ✅ Created brand for tenant ${tenant.slug}: ${brandName}`);
      }
    }
  }

  console.log(`✅ Brands seeded successfully (${createdCount} created)\n`);
}


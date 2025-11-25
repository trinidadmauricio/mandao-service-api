/**
 * Seed para Categories
 */

import { PrismaClient, TenantType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedCategories(): Promise<void> {
  console.log('🌱 Seeding categories...');

  const tenants = await prisma.tenant.findMany({
    where: {
      type: {
        in: [TenantType.RETAIL, TenantType.HYBRID],
      },
    },
  });

  if (tenants.length === 0) {
    console.log('  ⏭️  No RETAIL or HYBRID tenants found, skipping categories');
    return;
  }

  const topLevelCategories = [
    'Electronics',
    'Clothing',
    'Food & Beverages',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Pet Supplies',
  ];

  const subCategories = {
    Electronics: ['Smartphones', 'Laptops', 'Tablets', 'Accessories'],
    Clothing: ['Men', 'Women', 'Kids', 'Accessories'],
    'Food & Beverages': ['Groceries', 'Beverages', 'Snacks', 'Frozen'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Garden Tools'],
    'Sports & Outdoors': ['Fitness', 'Outdoor Gear', 'Team Sports', 'Water Sports'],
  };

  let createdCount = 0;

  for (const tenant of tenants) {
    // 15-20 categories por tenant
    const categoryCount = faker.number.int({ min: 15, max: 20 });
    const usedSlugs = new Set<string>();
    const parentCategories: string[] = [];

    // Crear categorías de nivel superior
    const topLevelCount = Math.min(categoryCount, topLevelCategories.length);
    for (let i = 0; i < topLevelCount; i++) {
      const categoryName = topLevelCategories[i];
      const slug = `${tenant.slug}-${categoryName.toLowerCase().replace(/\s+/g, '-')}`;

      if (!usedSlugs.has(slug)) {
        const category = await prisma.category.create({
          data: {
            tenant_id: tenant.id,
            parent_id: null,
            name: categoryName,
            slug,
            description: faker.lorem.sentence(),
            image_url: faker.image.url(),
            display_order: i,
            is_active: true,
          },
        });

        parentCategories.push(category.id);
        usedSlugs.add(slug);
        createdCount++;
        console.log(`  ✅ Created top-level category for tenant ${tenant.slug}: ${categoryName}`);
      }
    }

    // Crear subcategorías
    for (const parentId of parentCategories.slice(0, Math.min(5, parentCategories.length))) {
      const parent = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent) continue;

      const subCategoryNames = subCategories[parent.name as keyof typeof subCategories] || [];
      if (subCategoryNames.length === 0) continue;

      const subCount = faker.number.int({ min: 2, max: Math.min(4, subCategoryNames.length) });
      for (let i = 0; i < subCount; i++) {
        const subName = subCategoryNames[i];
        const slug = `${tenant.slug}-${parent.slug}-${subName.toLowerCase().replace(/\s+/g, '-')}`;

        if (!usedSlugs.has(slug)) {
          await prisma.category.create({
            data: {
              tenant_id: tenant.id,
              parent_id: parentId,
              name: subName,
              slug,
              description: faker.lorem.sentence(),
              image_url: faker.image.url(),
              display_order: i,
              is_active: true,
            },
          });

          usedSlugs.add(slug);
          createdCount++;
          console.log(`  ✅ Created subcategory for tenant ${tenant.slug}: ${parent.name} > ${subName}`);
        }
      }
    }

    // Crear categorías adicionales sin parent
    const remaining = categoryCount - createdCount;
    for (let i = 0; i < remaining; i++) {
      const categoryName = faker.commerce.department();
      const slug = `${tenant.slug}-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${i}`;

      if (!usedSlugs.has(slug)) {
        await prisma.category.create({
          data: {
            tenant_id: tenant.id,
            parent_id: null,
            name: categoryName,
            slug,
            description: faker.lorem.sentence(),
            image_url: faker.image.url(),
            display_order: createdCount + i,
            is_active: faker.datatype.boolean({ probability: 0.9 }),
          },
        });

        usedSlugs.add(slug);
        createdCount++;
        console.log(`  ✅ Created additional category for tenant ${tenant.slug}: ${categoryName}`);
      }
    }
  }

  console.log(`✅ Categories seeded successfully (${createdCount} created)\n`);
}


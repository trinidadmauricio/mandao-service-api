/**
 * Seed para Storefronts
 */

import { PrismaClient, TenantType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedStorefronts(): Promise<void> {
  console.log('🌱 Seeding storefronts...');

  // Solo trabajar con los primeros 2 tenants (donde tenemos usuarios)
  const tenants = await prisma.tenant.findMany({
    where: {
      type: {
        in: [TenantType.RETAIL, TenantType.HYBRID],
      },
    },
    take: 2,
    orderBy: { created_at: 'asc' },
  });

  if (tenants.length === 0) {
    console.log('  ⏭️  No RETAIL or HYBRID tenants found, skipping storefronts');
    return;
  }

  const usedSubdomains = new Set<string>();

  for (const tenant of tenants) {
    const existing = await prisma.storefront.findUnique({
      where: { tenant_id: tenant.id },
    });

    if (!existing) {
      // Generar subdomain único
      let subdomain: string;
      do {
        subdomain = `${tenant.slug}-store`;
      } while (usedSubdomains.has(subdomain));
      usedSubdomains.add(subdomain);

      const themeConfig = {
        primary_color: faker.color.rgb(),
        secondary_color: faker.color.rgb(),
        font_family: faker.helpers.arrayElement(['Arial', 'Roboto', 'Open Sans', 'Lato']),
        logo_url: faker.image.url(),
        favicon_url: faker.image.url(),
      };

      const seoConfig = {
        meta_title: `${tenant.name} - Online Store`,
        meta_description: faker.lorem.sentence(),
        meta_keywords: faker.lorem.words(5).split(' '),
        og_image: faker.image.url(),
      };

      const businessHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: null, close: null, closed: true },
      };

      await prisma.storefront.create({
        data: {
          tenant_id: tenant.id,
          subdomain,
          custom_domain: faker.datatype.boolean({ probability: 0.3 })
            ? `store.${tenant.slug}.com`
            : null,
          is_active: true,
          theme_config: themeConfig,
          seo_config: seoConfig,
          business_hours: businessHours,
          about_us: faker.lorem.paragraphs(2),
          terms: faker.lorem.paragraphs(3),
          privacy_policy: faker.lorem.paragraphs(4),
        },
      });

      console.log(`  ✅ Created storefront for tenant ${tenant.slug}: ${subdomain}`);
    } else {
      console.log(`  ⏭️  Storefront already exists for tenant ${tenant.slug}`);
    }
  }

  console.log('✅ Storefronts seeded successfully\n');
}


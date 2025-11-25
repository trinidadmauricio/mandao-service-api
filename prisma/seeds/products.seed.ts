/**
 * Seed para Products
 */

import { PrismaClient, TenantType, UnitOfMeasure } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedProducts(): Promise<void> {
  console.log('🌱 Seeding products...');

  const tenants = await prisma.tenant.findMany({
    where: {
      type: {
        in: [TenantType.RETAIL, TenantType.HYBRID],
      },
    },
  });

  if (tenants.length === 0) {
    console.log('  ⏭️  No RETAIL or HYBRID tenants found, skipping products');
    return;
  }

  const unitOfMeasures: UnitOfMeasure[] = [
    UnitOfMeasure.UNIT,
    UnitOfMeasure.KG,
    UnitOfMeasure.G,
    UnitOfMeasure.LITER,
    UnitOfMeasure.ML,
    UnitOfMeasure.BOX,
    UnitOfMeasure.PACK,
  ];

  let createdCount = 0;

  for (const tenant of tenants) {
    const categories = await prisma.category.findMany({
      where: { tenant_id: tenant.id },
    });
    const brands = await prisma.brand.findMany({
      where: { tenant_id: tenant.id },
    });

    if (categories.length === 0 || brands.length === 0) {
      console.log(`  ⚠️  No categories or brands found for tenant ${tenant.slug}, skipping products`);
      continue;
    }

    // 30-50 products por tenant
    const productCount = faker.number.int({ min: 30, max: 50 });
    const usedSkus = new Set<string>();

    for (let i = 0; i < productCount; i++) {
      const category = faker.helpers.arrayElement(categories);
      const brand = faker.datatype.boolean({ probability: 0.7 })
        ? faker.helpers.arrayElement(brands)
        : null;

      // Generar SKU único
      let sku: string;
      do {
        sku = `SKU-${faker.string.alphanumeric(8).toUpperCase()}`;
      } while (usedSkus.has(sku));
      usedSkus.add(sku);

      const productName = faker.commerce.productName();
      const hasVariants = faker.datatype.boolean({ probability: 0.3 });
      const uom = faker.helpers.arrayElement(unitOfMeasures);
      const costPrice = parseFloat(faker.commerce.price({ min: 5, max: 100, dec: 2 }));
      const sellingPrice = parseFloat(faker.commerce.price({ min: costPrice * 1.2, max: costPrice * 3, dec: 2 }));
      const compareAtPrice = faker.datatype.boolean({ probability: 0.4 })
        ? parseFloat(faker.commerce.price({ min: sellingPrice * 1.1, max: sellingPrice * 1.5, dec: 2 }))
        : null;

      // Multi-language translations
      const nameTranslations = {
        es: productName,
        en: faker.commerce.productName(),
      };

      const descriptionTranslations = {
        es: faker.lorem.paragraph(),
        en: faker.lorem.paragraph(),
      };

      // Images
      const images = Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        url: faker.image.url(),
        alt: productName,
      }));

      const featuredImageUrl = images[0]?.url || null;

      // Dimensions
      const dimensions = {
        length_cm: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
        width_cm: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
        height_cm: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
      };

      const weightKg = uom === UnitOfMeasure.KG || uom === UnitOfMeasure.G
        ? parseFloat(faker.number.float({ min: 0.1, max: 10, fractionDigits: 3 }).toFixed(3))
        : null;

      const currentStock = hasVariants ? 0 : faker.number.int({ min: 0, max: 1000 });
      const minStockAlert = faker.number.int({ min: 5, max: 50 });

      await prisma.product.create({
        data: {
          tenant_id: tenant.id,
          sku,
          barcode: faker.datatype.boolean({ probability: 0.7 })
            ? faker.string.numeric(13)
            : null,
          name: productName,
          description: faker.lorem.paragraph(),
          name_translations: nameTranslations,
          description_translations: descriptionTranslations,
          category_id: category.id,
          brand_id: brand?.id || null,
          cost_price: costPrice,
          selling_price: sellingPrice,
          compare_at_price: compareAtPrice,
          currency: tenant.default_currency,
          track_inventory: true,
          current_stock: currentStock,
          min_stock_alert: minStockAlert,
          uom,
          weight_kg: weightKg,
          dimensions,
          images,
          featured_image_url: featuredImageUrl,
          has_variants: hasVariants,
          is_active: faker.datatype.boolean({ probability: 0.9 }),
          is_featured: faker.datatype.boolean({ probability: 0.2 }),
          meta_title: `${productName} - ${tenant.name}`,
          meta_description: faker.lorem.sentence(),
        },
      });

      createdCount++;
      console.log(`  ✅ Created product for tenant ${tenant.slug}: ${productName} (${hasVariants ? 'with variants' : 'no variants'})`);
    }
  }

  console.log(`✅ Products seeded successfully (${createdCount} created)\n`);
}


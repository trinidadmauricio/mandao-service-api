/**
 * Seed para Product Variants
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedProductVariants(): Promise<void> {
  console.log('🌱 Seeding product variants...');

  const products = await prisma.product.findMany({
    where: { has_variants: true },
  });

  if (products.length === 0) {
    console.log('  ⏭️  No products with variants found, skipping product variants');
    return;
  }

  const variantOptions = {
    Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    Color: ['Red', 'Blue', 'Green', 'Black', 'White', 'Gray'],
    Material: ['Cotton', 'Polyester', 'Leather', 'Silk', 'Wool'],
    Capacity: ['32GB', '64GB', '128GB', '256GB', '512GB'],
    Style: ['Classic', 'Modern', 'Vintage', 'Sport'],
  };

  let createdCount = 0;

  for (const product of products) {
    // 2-4 variantes por producto
    const variantCount = faker.number.int({ min: 2, max: 4 });
    const usedSkus = new Set<string>();

    // Seleccionar opciones para este producto
    const optionNames = faker.helpers.arrayElements(Object.keys(variantOptions), { min: 1, max: 3 });

    for (let i = 0; i < variantCount; i++) {
      // Generar SKU único para variante
      let sku: string;
      do {
        sku = `${product.sku}-V${i + 1}`;
      } while (usedSkus.has(sku));
      usedSkus.add(sku);

      const option1Name = optionNames[0] || null;
      const option1Value = option1Name
        ? faker.helpers.arrayElement(variantOptions[option1Name as keyof typeof variantOptions])
        : null;

      const option2Name = optionNames[1] || null;
      const option2Value = option2Name
        ? faker.helpers.arrayElement(variantOptions[option2Name as keyof typeof variantOptions])
        : null;

      const option3Name = optionNames[2] || null;
      const option3Value = option3Name
        ? faker.helpers.arrayElement(variantOptions[option3Name as keyof typeof variantOptions])
        : null;

      const priceAdjustment = parseFloat(
        faker.number.float({ min: -10, max: 20, fractionDigits: 2 }).toFixed(2)
      );
      const costPrice = product.cost_price
        ? parseFloat((parseFloat(product.cost_price.toString()) + priceAdjustment * 0.5).toFixed(2))
        : null;

      const currentStock = faker.number.int({ min: 0, max: 500 });
      const weightKg = product.weight_kg
        ? parseFloat((parseFloat(product.weight_kg.toString()) * faker.number.float({ min: 0.8, max: 1.2, fractionDigits: 3 })).toFixed(3))
        : null;

      await prisma.productVariant.create({
        data: {
          product_id: product.id,
          tenant_id: product.tenant_id,
          sku,
          barcode: faker.datatype.boolean({ probability: 0.6 })
            ? faker.string.numeric(13)
            : null,
          option1_name: option1Name,
          option1_value: option1Value,
          option2_name: option2Name,
          option2_value: option2Value,
          option3_name: option3Name,
          option3_value: option3Value,
          price_adjustment: priceAdjustment,
          cost_price: costPrice,
          currency: product.currency,
          track_inventory: true,
          current_stock: currentStock,
          weight_kg: weightKg,
          image_url: faker.datatype.boolean({ probability: 0.5 })
            ? faker.image.url()
            : null,
          is_active: true,
        },
      });

      createdCount++;
      console.log(`  ✅ Created variant for product ${product.sku}: ${option1Value || 'Variant'} ${option2Value || ''} ${option3Value || ''}`);
    }
  }

  console.log(`✅ Product variants seeded successfully (${createdCount} created)\n`);
}


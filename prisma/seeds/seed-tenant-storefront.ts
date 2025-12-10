/**
 * Seed específico para un tenant - Crea datos completos para el storefront
 * Uso: npx ts-node prisma/seeds/seed-tenant-storefront.ts <tenant-id>
 */

import { PrismaClient, TenantType, UnitOfMeasure, BranchStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TARGET_TENANT_ID = '354f979d-8eea-40e3-ab6e-0026fc726900';

async function seedTenantStorefront(tenantId: string) {
  console.log(`🌱 Seeding storefront data for tenant: ${tenantId}\n`);

  try {
    // 1. Verificar que el tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      console.log('❌ Tenant no encontrado');
      return;
    }

    if (tenant.type !== TenantType.RETAIL && tenant.type !== TenantType.HYBRID) {
      console.log('❌ El tenant no es de tipo RETAIL o HYBRID');
      return;
    }

    console.log(`✅ Tenant encontrado: ${tenant.name} (${tenant.slug})\n`);

    // 2. Verificar/Crear storefront
    let storefront = await prisma.storefront.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!storefront) {
      console.log('⚠️  Storefront no encontrado, creando uno...');
      storefront = await prisma.storefront.create({
        data: {
          tenant_id: tenant.id,
          subdomain: 'default',
          custom_domain: null,
          is_active: true,
          theme_config: {
            template: 'classic',
            primary_color: '#000000',
            secondary_color: '#f5f5f5',
          },
          seo_config: {
            meta_title: `${tenant.name} - Online Store`,
            meta_description: 'Tu tienda en línea',
          },
          business_hours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: null, close: null, closed: true },
          },
        },
      });
      console.log('✅ Storefront creado\n');
    } else {
      console.log('✅ Storefront ya existe\n');
    }

    // 3. Crear categorías
    console.log('📁 Creando categorías...');
    const categoryNames = [
      'Electrónica',
      'Ropa y Accesorios',
      'Hogar y Cocina',
      'Deportes y Fitness',
      'Libros y Música',
      'Juguetes y Juegos',
      'Salud y Belleza',
      'Automotriz',
    ];

    const categories: { id: string; name: string }[] = [];
    const usedSlugs = new Set<string>();

    for (let i = 0; i < categoryNames.length; i++) {
      const categoryName = categoryNames[i];
      const slug = `${tenant.slug}-${categoryName.toLowerCase().replace(/\s+/g, '-')}`;

      if (!usedSlugs.has(slug)) {
        const category = await prisma.category.create({
          data: {
            tenant_id: tenant.id,
            parent_id: null,
            name: categoryName,
            slug,
            description: `Categoría de ${categoryName.toLowerCase()}`,
            image_url: faker.image.url(),
            display_order: i,
            is_active: true,
          },
        });

        categories.push({ id: category.id, name: category.name });
        usedSlugs.add(slug);
        console.log(`  ✅ Categoría creada: ${categoryName}`);
      }
    }
    console.log(`✅ ${categories.length} categorías creadas\n`);

    // 4. Crear marcas
    console.log('🏷️  Creando marcas...');
    const brandNames = [
      'TechBrand',
      'StyleCo',
      'HomePro',
      'SportMax',
      'BookWorld',
      'ToyLand',
      'BeautyPlus',
      'AutoTech',
    ];

    const brands: { id: string; name: string }[] = [];
    const usedBrandSlugs = new Set<string>();

    for (const brandName of brandNames) {
      const slug = `${tenant.slug}-${brandName.toLowerCase().replace(/\s+/g, '-')}`;

      if (!usedBrandSlugs.has(slug)) {
        const brand = await prisma.brand.create({
          data: {
            tenant_id: tenant.id,
            name: brandName,
            slug,
            logo_url: faker.image.url(),
            description: `Marca ${brandName}`,
            is_active: true,
          },
        });

        brands.push({ id: brand.id, name: brand.name });
        usedBrandSlugs.add(slug);
        console.log(`  ✅ Marca creada: ${brandName}`);
      }
    }
    console.log(`✅ ${brands.length} marcas creadas\n`);

    // 5. Crear productos
    console.log('📦 Creando productos...');
    const productTemplates = [
      { name: 'Smartphone', category: 'Electrónica', price: { min: 200, max: 800 } },
      { name: 'Laptop', category: 'Electrónica', price: { min: 500, max: 2000 } },
      { name: 'Camiseta', category: 'Ropa y Accesorios', price: { min: 15, max: 50 } },
      { name: 'Pantalón', category: 'Ropa y Accesorios', price: { min: 30, max: 100 } },
      { name: 'Sofá', category: 'Hogar y Cocina', price: { min: 300, max: 1000 } },
      { name: 'Mesa', category: 'Hogar y Cocina', price: { min: 100, max: 500 } },
      { name: 'Pelota de Fútbol', category: 'Deportes y Fitness', price: { min: 20, max: 80 } },
      { name: 'Raqueta de Tenis', category: 'Deportes y Fitness', price: { min: 50, max: 200 } },
      { name: 'Novela', category: 'Libros y Música', price: { min: 10, max: 30 } },
      { name: 'Libro Técnico', category: 'Libros y Música', price: { min: 25, max: 80 } },
      { name: 'Juego de Mesa', category: 'Juguetes y Juegos', price: { min: 20, max: 100 } },
      { name: 'Puzzle', category: 'Juguetes y Juegos', price: { min: 15, max: 50 } },
      { name: 'Crema Facial', category: 'Salud y Belleza', price: { min: 15, max: 60 } },
      { name: 'Shampoo', category: 'Salud y Belleza', price: { min: 8, max: 25 } },
      { name: 'Aceite de Motor', category: 'Automotriz', price: { min: 20, max: 80 } },
      { name: 'Batería de Auto', category: 'Automotriz', price: { min: 80, max: 200 } },
    ];

    const products: { id: string; name: string; has_variants: boolean }[] = [];
    const usedSkus = new Set<string>();

    for (let i = 0; i < 25; i++) {
      const template = faker.helpers.arrayElement(productTemplates);
      const category = categories.find((c) => c.name === template.category) || categories[0];
      const brand = faker.helpers.arrayElement(brands);

      // Generar SKU único
      let sku: string;
      do {
        sku = `SKU-${faker.string.alphanumeric(8).toUpperCase()}`;
      } while (usedSkus.has(sku));
      usedSkus.add(sku);

      const productName = `${template.name} ${faker.commerce.productAdjective()}`;
      const hasVariants = faker.datatype.boolean({ probability: 0.3 });
      const costPrice = parseFloat(faker.commerce.price({ min: template.price.min * 0.6, max: template.price.min * 0.9, dec: 2 }));
      const sellingPrice = parseFloat(faker.commerce.price({ min: template.price.min, max: template.price.max, dec: 2 }));
      const compareAtPrice = faker.datatype.boolean({ probability: 0.4 })
        ? parseFloat(faker.commerce.price({ min: sellingPrice * 1.1, max: sellingPrice * 1.5, dec: 2 }))
        : null;

      const nameTranslations = {
        es: productName,
        en: `${template.name} ${faker.commerce.productAdjective()}`,
      };

      const descriptionTranslations = {
        es: faker.lorem.paragraph(2),
        en: faker.lorem.paragraph(2),
      };

      const images = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
        url: `https://picsum.photos/800/800?random=${i}`,
        alt: productName,
      }));

      const featuredImageUrl = images[0]?.url || null;

      const product = await prisma.product.create({
        data: {
          tenant_id: tenant.id,
          sku,
          barcode: faker.string.numeric(13),
          name: productName,
          description: faker.lorem.paragraph(),
          name_translations: nameTranslations,
          description_translations: descriptionTranslations,
          category_id: category.id,
          brand_id: brand.id,
          cost_price: costPrice,
          selling_price: sellingPrice,
          compare_at_price: compareAtPrice,
          currency: tenant.default_currency,
          track_inventory: true,
          current_stock: hasVariants ? 0 : faker.number.int({ min: 10, max: 500 }),
          min_stock_alert: 10,
          uom: UnitOfMeasure.UNIT,
          weight_kg: parseFloat(faker.number.float({ min: 0.1, max: 5, fractionDigits: 2 }).toFixed(2)),
          dimensions: {
            length_cm: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
            width_cm: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
            height_cm: faker.number.float({ min: 5, max: 50, fractionDigits: 2 }),
          },
          images,
          featured_image_url: featuredImageUrl,
          has_variants: hasVariants,
          is_active: true,
          is_featured: faker.datatype.boolean({ probability: 0.3 }),
          meta_title: `${productName} - ${tenant.name}`,
          meta_description: faker.lorem.sentence(),
        },
      });

      products.push({ id: product.id, name: product.name, has_variants: hasVariants });
      console.log(`  ✅ Producto creado: ${productName}${hasVariants ? ' (con variantes)' : ''}`);
    }
    console.log(`✅ ${products.length} productos creados\n`);

    // 6. Crear variantes para productos que las tienen
    console.log('🔄 Creando variantes de productos...');
    const productsWithVariants = products.filter((p) => p.has_variants);
    let variantsCount = 0;

    const variantOptions = {
      Size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      Color: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco', 'Gris'],
      Capacity: ['32GB', '64GB', '128GB', '256GB'],
    };

    for (const productInfo of productsWithVariants) {
      const product = await prisma.product.findUnique({
        where: { id: productInfo.id },
      });

      if (!product) continue;

      const variantCount = faker.number.int({ min: 2, max: 4 });
      const optionNames = faker.helpers.arrayElements(Object.keys(variantOptions), { min: 1, max: 2 });

      for (let i = 0; i < variantCount; i++) {
        const option1Name = optionNames[0] || null;
        const option1Value = option1Name
          ? faker.helpers.arrayElement(variantOptions[option1Name as keyof typeof variantOptions])
          : null;

        const option2Name = optionNames[1] || null;
        const option2Value = option2Name
          ? faker.helpers.arrayElement(variantOptions[option2Name as keyof typeof variantOptions])
          : null;

        const priceAdjustment = parseFloat(
          faker.number.float({ min: -10, max: 20, fractionDigits: 2 }).toFixed(2)
        );

        await prisma.productVariant.create({
          data: {
            product_id: product.id,
            tenant_id: tenant.id,
            sku: `${product.sku}-V${i + 1}`,
            option1_name: option1Name,
            option1_value: option1Value,
            option2_name: option2Name,
            option2_value: option2Value,
            price_adjustment: priceAdjustment,
            currency: product.currency,
            track_inventory: true,
            current_stock: faker.number.int({ min: 5, max: 200 }),
            is_active: true,
          },
        });

        variantsCount++;
      }
      console.log(`  ✅ Variantes creadas para: ${productInfo.name}`);
    }
    console.log(`✅ ${variantsCount} variantes creadas\n`);

    // 7. Verificar/Crear branch para inventario
    console.log('🏪 Verificando branches...');
    let branch = await prisma.branch.findFirst({
      where: { tenant_id: tenant.id },
    });

    if (!branch) {
      console.log('⚠️  No hay branch, creando uno...');
      branch = await prisma.branch.create({
        data: {
          tenant_id: tenant.id,
          name: `${tenant.name} - Sucursal Principal`,
          address: 'Dirección Principal, Ciudad, Estado',
          gps_lat: 19.432608,
          gps_lng: -99.133209,
          contact_phone: '+1234567890',
          is_main: true,
          operating_hours: {
            monday: { open: '09:00', close: '18:00', closed: false },
            tuesday: { open: '09:00', close: '18:00', closed: false },
            wednesday: { open: '09:00', close: '18:00', closed: false },
            thursday: { open: '09:00', close: '18:00', closed: false },
            friday: { open: '09:00', close: '18:00', closed: false },
            saturday: { open: '10:00', close: '16:00', closed: false },
            sunday: { open: null, close: null, closed: true },
          },
          status: BranchStatus.ACTIVE,
        },
      });
      console.log('✅ Branch creado\n');
    } else {
      console.log('✅ Branch encontrado\n');
    }

    // 8. Crear stock básico
    console.log('📊 Creando inventario...');
    let stockCount = 0;

    for (const productInfo of products) {
      const product = await prisma.product.findUnique({
        where: { id: productInfo.id },
        include: { variants: true },
      });

      if (!product) continue;

      if (!product.has_variants) {
        // Stock para producto sin variantes
        const currentStock = faker.number.int({ min: 20, max: 300 });
        await prisma.stockByBranch.create({
          data: {
            tenant_id: tenant.id,
            product_id: product.id,
            variant_id: null,
            branch_id: branch.id,
            current_stock: currentStock,
            reserved_stock: 0,
            available_stock: currentStock,
          },
        });
        stockCount++;
      } else {
        // Stock para variantes
        for (const variant of product.variants) {
          const currentStock = faker.number.int({ min: 5, max: 100 });
          await prisma.stockByBranch.create({
            data: {
              tenant_id: tenant.id,
              product_id: product.id,
              variant_id: variant.id,
              branch_id: branch.id,
              current_stock: currentStock,
              reserved_stock: 0,
              available_stock: currentStock,
            },
          });
          stockCount++;
        }
      }
    }
    console.log(`✅ ${stockCount} registros de inventario creados\n`);

    // Resumen final
    console.log('📊 Resumen:');
    console.log(`   ✅ Categorías: ${categories.length}`);
    console.log(`   ✅ Marcas: ${brands.length}`);
    console.log(`   ✅ Productos: ${products.length}`);
    console.log(`   ✅ Variantes: ${variantsCount}`);
    console.log(`   ✅ Inventario: ${stockCount} registros`);
    console.log(`\n🎉 Storefront seeded successfully for tenant ${tenant.name}!`);
    console.log(`💡 Tenant ID: ${tenant.id}`);
    console.log(`💡 Usa este ID en Railway: NEXT_PUBLIC_DEFAULT_TENANT_ID=${tenant.id}\n`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function main() {
  const tenantId = process.argv[2] || TARGET_TENANT_ID;

  if (!tenantId) {
    console.error('❌ Por favor proporciona un tenant ID');
    console.log('Uso: npx ts-node prisma/seeds/seed-tenant-storefront.ts <tenant-id>');
    process.exit(1);
  }

  try {
    await seedTenantStorefront(tenantId);
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


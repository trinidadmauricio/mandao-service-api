/**
 * Script para verificar datos de un tenant
 * Uso: npx ts-node scripts/check-tenant-data.ts <tenant-id>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTenantData(tenantId: string) {
  console.log(`🔍 Verificando datos para tenant: ${tenantId}\n`);

  try {
    // 1. Verificar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: {
          select: {
            users: true,
            branches: true,
          },
        },
      },
    });

    if (!tenant) {
      console.log('❌ Tenant no encontrado');
      return;
    }

    console.log('✅ Tenant encontrado:');
    console.log(`   - Nombre: ${tenant.name}`);
    console.log(`   - Slug: ${tenant.slug}`);
    console.log(`   - Tipo: ${tenant.type}`);
    console.log(`   - Locale: ${tenant.default_locale}`);
    console.log(`   - Currency: ${tenant.default_currency}`);
    console.log(`   - Usuarios: ${tenant._count.users}`);
    console.log(`   - Branches: ${tenant._count.branches}\n`);

    // 2. Verificar storefront
    const storefront = await prisma.storefront.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!storefront) {
      console.log('❌ Storefront no encontrado para este tenant');
    } else {
      console.log('✅ Storefront encontrado:');
      console.log(`   - ID: ${storefront.id}`);
      console.log(`   - Subdomain: ${storefront.subdomain}`);
      console.log(`   - Activo: ${storefront.is_active}`);
      console.log(`   - Custom Domain: ${storefront.custom_domain || 'N/A'}\n`);
    }

    // 3. Verificar productos
    const productsCount = await prisma.product.count({
      where: { tenant_id: tenantId },
    });

    const activeProductsCount = await prisma.product.count({
      where: { tenant_id: tenantId, is_active: true },
    });

    console.log('📦 Productos:');
    console.log(`   - Total: ${productsCount}`);
    console.log(`   - Activos: ${activeProductsCount}\n`);

    // 4. Verificar categorías
    const categoriesCount = await prisma.category.count({
      where: { tenant_id: tenantId },
    });

    const activeCategoriesCount = await prisma.category.count({
      where: { tenant_id: tenantId, is_active: true },
    });

    console.log('📁 Categorías:');
    console.log(`   - Total: ${categoriesCount}`);
    console.log(`   - Activas: ${activeCategoriesCount}\n`);

    // 5. Verificar marcas
    const brandsCount = await prisma.brand.count({
      where: { tenant_id: tenantId },
    });

    const activeBrandsCount = await prisma.brand.count({
      where: { tenant_id: tenantId, is_active: true },
    });

    console.log('🏷️  Marcas:');
    console.log(`   - Total: ${brandsCount}`);
    console.log(`   - Activas: ${activeBrandsCount}\n`);

    // Resumen
    console.log('📊 Resumen:');
    if (activeProductsCount === 0) {
      console.log('   ⚠️  No hay productos activos - el storefront estará vacío');
    }
    if (activeCategoriesCount === 0) {
      console.log('   ⚠️  No hay categorías activas - no se mostrarán categorías');
    }
    if (activeBrandsCount === 0) {
      console.log('   ⚠️  No hay marcas activas - no se mostrarán marcas');
    }

    if (activeProductsCount > 0 && activeCategoriesCount > 0) {
      console.log('   ✅ El tenant tiene datos suficientes para mostrar en el storefront');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const tenantId = process.argv[2];

if (!tenantId) {
  console.error('❌ Por favor proporciona un tenant ID');
  console.log('Uso: npx ts-node scripts/check-tenant-data.ts <tenant-id>');
  process.exit(1);
}

checkTenantData(tenantId);


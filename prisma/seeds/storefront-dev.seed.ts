/**
 * Seed rápido para desarrollo - Crea un tenant con storefront para testing
 * Este seed asegura que siempre haya al menos un storefront disponible
 */

import { PrismaClient, TenantType, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDevStorefront(): Promise<void> {
  console.log('🌱 Seeding dev storefront...');

  // Primero verificar si ya existe un storefront con subdomain 'dev'
  const existingDevStorefront = await prisma.storefront.findUnique({
    where: { subdomain: 'dev' },
  });

  if (existingDevStorefront) {
    console.log(`  ⏭️  Storefront with subdomain 'dev' already exists`);
    console.log(`  📝 Tenant ID: ${existingDevStorefront.tenant_id}`);
    console.log(`  📝 Subdomain: ${existingDevStorefront.subdomain}`);
    return;
  }

  // Buscar o crear tenant de desarrollo
  let tenant = await prisma.tenant.findFirst({
    where: {
      type: {
        in: [TenantType.RETAIL, TenantType.HYBRID],
      },
    },
    orderBy: { created_at: 'asc' },
  });

  if (!tenant) {
    // Crear tenant de desarrollo si no existe
    const plans = await prisma.subscriptionPlan.findMany({ take: 1 });
    
    tenant = await prisma.tenant.create({
      data: {
        slug: 'dev-store',
        name: 'Development Store',
        type: TenantType.RETAIL,
        subscription_plan_id: plans[0]?.id || null,
        subscription_status: SubscriptionStatus.ACTIVE,
        default_locale: 'es',
        default_currency: 'USD',
        settings: {
          theme: 'light',
        },
      },
    });
    console.log(`  ✅ Created dev tenant: ${tenant.slug}`);
  }

  // Verificar si ya existe storefront para este tenant
  const existing = await prisma.storefront.findUnique({
    where: { tenant_id: tenant.id },
  });

  if (existing) {
    // Si existe pero no tiene subdomain 'dev', actualizarlo
    if (existing.subdomain !== 'dev') {
      await prisma.storefront.update({
        where: { id: existing.id },
        data: { subdomain: 'dev' },
      });
      console.log(`  ✅ Updated storefront subdomain to 'dev' for tenant ${tenant.slug}`);
      console.log(`  📝 Tenant ID: ${tenant.id}`);
      console.log(`  📝 Subdomain: dev`);
      return;
    }
    console.log(`  ⏭️  Storefront already exists for tenant ${tenant.slug}`);
    return;
  }

  // Crear storefront con configuración por defecto
  const themeConfig = {
    template: 'classic',
    primary_color: '#000000',
    secondary_color: '#f5f5f5',
    font_family: 'Inter, sans-serif',
    logo_url: null,
    favicon_url: null,
  };

  const seoConfig = {
    meta_title: `${tenant.name} - Online Store`,
    meta_description: 'Tienda en línea de desarrollo',
    meta_keywords: ['tienda', 'online', 'ecommerce'],
    og_image: null,
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

  const storefront = await prisma.storefront.create({
    data: {
      tenant_id: tenant.id,
      subdomain: 'dev',
      custom_domain: null,
      is_active: true,
      theme_config: themeConfig,
      seo_config: seoConfig,
      business_hours: businessHours,
      about_us: 'Esta es una tienda de desarrollo para testing.',
      terms: 'Términos y condiciones de la tienda de desarrollo.',
      privacy_policy: 'Política de privacidad de la tienda de desarrollo.',
    },
  });

  console.log(`  ✅ Created dev storefront: ${storefront.subdomain} for tenant ${tenant.slug}`);
  console.log(`  📝 Tenant ID: ${tenant.id}`);
  console.log(`  📝 Subdomain: ${storefront.subdomain}`);
  console.log('✅ Dev storefront seeded successfully\n');
}

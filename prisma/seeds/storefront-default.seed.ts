/**
 * Seed para Tenant y Storefront por defecto (Producción/Railway)
 * Crea un tenant y storefront que puede ser usado como default cuando no hay subdomain
 * Útil para dominios auto-generados de Railway o acceso directo sin subdomain
 */

import { PrismaClient, TenantType, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDefaultStorefront(): Promise<void> {
  console.log('🌱 Seeding default storefront for production...');

  // Verificar si ya existe un tenant con slug 'default-store'
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: 'default-store' },
  });

  let tenant;
  if (existingTenant) {
    tenant = existingTenant;
    console.log(`  ⏭️  Default tenant already exists: ${tenant.slug}`);
    console.log(`  📝 Tenant ID: ${tenant.id}`);
  } else {
    // Obtener un plan de suscripción
    const plans = await prisma.subscriptionPlan.findMany({ take: 1 });
    
    if (plans.length === 0) {
      throw new Error('No subscription plans found. Please run subscription-plans seed first.');
    }

    // Crear tenant por defecto
    tenant = await prisma.tenant.create({
      data: {
        slug: 'default-store',
        name: 'Default Store',
        type: TenantType.RETAIL,
        subscription_plan_id: plans[0]?.id || null,
        subscription_status: SubscriptionStatus.ACTIVE,
        default_locale: 'es',
        default_currency: 'USD',
        settings: {
          theme: 'light',
          notifications: true,
        },
      },
    });
    console.log(`  ✅ Created default tenant: ${tenant.slug}`);
    console.log(`  📝 Tenant ID: ${tenant.id}`);
  }

  // Verificar si ya existe storefront para este tenant
  const existingStorefront = await prisma.storefront.findUnique({
    where: { tenant_id: tenant.id },
  });

  if (existingStorefront) {
    console.log(`  ⏭️  Storefront already exists for tenant ${tenant.slug}`);
    console.log(`  📝 Storefront ID: ${existingStorefront.id}`);
    console.log(`  📝 Subdomain: ${existingStorefront.subdomain}`);
    console.log(`\n  💡 Use this Tenant ID in Railway: ${tenant.id}`);
    console.log(`  💡 Set NEXT_PUBLIC_DEFAULT_TENANT_ID=${tenant.id}\n`);
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
    meta_title: 'Default Store - Online Shopping',
    meta_description: 'Tu tienda en línea de confianza. Encuentra los mejores productos aquí.',
    meta_keywords: ['tienda', 'online', 'ecommerce', 'shopping'],
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
      subdomain: 'default', // Subdomain para referencia, aunque no se use en Railway
      custom_domain: null,
      is_active: true,
      theme_config: themeConfig,
      seo_config: seoConfig,
      business_hours: businessHours,
      about_us: 'Bienvenido a nuestra tienda en línea. Ofrecemos productos de calidad con el mejor servicio al cliente.',
      terms: 'Términos y condiciones de uso de la tienda.',
      privacy_policy: 'Política de privacidad. Respetamos tu privacidad y protegemos tus datos personales.',
    },
  });

  console.log(`  ✅ Created default storefront for tenant ${tenant.slug}`);
  console.log(`  📝 Storefront ID: ${storefront.id}`);
  console.log(`  📝 Subdomain: ${storefront.subdomain}`);
  console.log(`\n  💡 Use this Tenant ID in Railway: ${tenant.id}`);
  console.log(`  💡 Set NEXT_PUBLIC_DEFAULT_TENANT_ID=${tenant.id}`);
  console.log('✅ Default storefront seeded successfully\n');
}


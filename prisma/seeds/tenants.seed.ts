/**
 * Seed para Tenants
 */

import { PrismaClient, TenantType, SubscriptionStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedTenants(): Promise<void> {
  console.log('🌱 Seeding tenants...');

  // Obtener subscription plans existentes
  const plans = await prisma.subscriptionPlan.findMany();
  if (plans.length === 0) {
    throw new Error('No subscription plans found. Please run subscription-plans seed first.');
  }

  const tenants = [
    {
      slug: 'retail-store-1',
      name: 'Retail Store One',
      type: TenantType.RETAIL,
      subscription_plan_id: plans[0]?.id || null,
      subscription_status: SubscriptionStatus.ACTIVE,
      subscription_expires_at: faker.date.future({ years: 1 }),
      default_locale: 'es',
      default_currency: 'USD',
      settings: {
        theme: 'light',
        notifications: true,
      },
    },
    {
      slug: 'retail-store-2',
      name: 'Retail Store Two',
      type: TenantType.RETAIL,
      subscription_plan_id: plans[1]?.id || null,
      subscription_status: SubscriptionStatus.ACTIVE,
      subscription_expires_at: faker.date.future({ years: 1 }),
      default_locale: 'en',
      default_currency: 'EUR',
      settings: {
        theme: 'dark',
        notifications: true,
      },
    },
    {
      slug: 'on-demand-delivery',
      name: 'On Demand Delivery Co',
      type: TenantType.ON_DEMAND,
      subscription_plan_id: plans[1]?.id || null,
      subscription_status: SubscriptionStatus.ACTIVE,
      subscription_expires_at: faker.date.future({ years: 1 }),
      default_locale: 'es',
      default_currency: 'MXN',
      settings: {
        auto_assign: true,
        tracking_enabled: true,
      },
    },
    {
      slug: 'express-delivery',
      name: 'Express Delivery Services',
      type: TenantType.ON_DEMAND,
      subscription_plan_id: plans[0]?.id || null,
      subscription_status: SubscriptionStatus.TRIAL,
      subscription_expires_at: faker.date.future({ years: 0.08 }), // ~1 month
      default_locale: 'en',
      default_currency: 'USD',
      settings: {
        auto_assign: false,
        tracking_enabled: true,
      },
    },
    {
      slug: 'hybrid-marketplace',
      name: 'Hybrid Marketplace',
      type: TenantType.HYBRID,
      subscription_plan_id: plans[2]?.id || null,
      subscription_status: SubscriptionStatus.ACTIVE,
      subscription_expires_at: faker.date.future({ years: 2 }),
      default_locale: 'es',
      default_currency: 'USD',
      settings: {
        theme: 'light',
        notifications: true,
        auto_assign: true,
        tracking_enabled: true,
      },
    },
  ];

  const createdTenants: string[] = [];

  for (const tenantData of tenants) {
    const existing = await prisma.tenant.findUnique({
      where: { slug: tenantData.slug },
    });

    if (!existing) {
      await prisma.tenant.create({
        data: tenantData,
      });
      console.log(`  ✅ Created tenant: ${tenantData.name} (${tenantData.slug})`);
      createdTenants.push(tenantData.slug);
    } else {
      console.log(`  ⏭️  Tenant already exists: ${tenantData.slug}`);
    }
  }

  console.log(`✅ Tenants seeded successfully (${createdTenants.length} created)\n`);
}


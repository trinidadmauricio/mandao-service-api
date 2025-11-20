/**
 * Seed para Subscription Plans base
 */

import { PrismaClient, PlanType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSubscriptionPlans(): Promise<void> {
  console.log('🌱 Seeding subscription plans...');

  const plans = [
    {
      name: 'Plan Básico',
      type: PlanType.BASIC,
      price_monthly: 29.99,
      price_yearly: 299.99,
      currency: 'USD',
      features: {
        max_products: 100,
        max_orders_month: 500,
        max_branches: 2,
        support: 'email',
        api_access: true,
        custom_domain: false,
      },
      max_products: 100,
      max_orders_month: 500,
      max_branches: 2,
    },
    {
      name: 'Plan Profesional',
      type: PlanType.PRO,
      price_monthly: 79.99,
      price_yearly: 799.99,
      currency: 'USD',
      features: {
        max_products: 1000,
        max_orders_month: 5000,
        max_branches: 10,
        support: 'priority',
        api_access: true,
        custom_domain: true,
        advanced_analytics: true,
      },
      max_products: 1000,
      max_orders_month: 5000,
      max_branches: 10,
    },
    {
      name: 'Plan Empresarial',
      type: PlanType.ENTERPRISE,
      price_monthly: 199.99,
      price_yearly: 1999.99,
      currency: 'USD',
      features: {
        max_products: 10000,
        max_orders_month: 50000,
        max_branches: 100,
        support: 'dedicated',
        api_access: true,
        custom_domain: true,
        advanced_analytics: true,
        white_label: true,
        sso: true,
      },
      max_products: 10000,
      max_orders_month: 50000,
      max_branches: 100,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: {
        name: plan.name,
        type: plan.type as PlanType,
      },
    });

    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
      console.log(`  ✅ Created plan: ${plan.name}`);
    } else {
      console.log(`  ⏭️  Plan already exists: ${plan.name}`);
    }
  }

  console.log('✅ Subscription plans seeded successfully\n');
}


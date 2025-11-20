/**
 * Seed principal - Ejecuta todos los seeds en orden
 */

import { seedSubscriptionPlans } from './subscription-plans.seed';
import { seedSaaSAdmins } from './saas-admins.seed';
import { seedOAuthClients } from './oauth-clients.seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // 1. Seed Subscription Plans (catálogo base)
    await seedSubscriptionPlans();

    // 2. Seed SaaS Admin Users
    await seedSaaSAdmins();

    // 3. Seed OAuth Clients para admins
    await seedOAuthClients();

    console.log('✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


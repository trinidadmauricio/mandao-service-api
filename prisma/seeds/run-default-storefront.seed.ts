/**
 * Script standalone para ejecutar solo el seed de storefront por defecto
 * Útil para producción o cuando solo necesitas crear el tenant/storefront default
 * 
 * Uso: npx ts-node prisma/seeds/run-default-storefront.seed.ts
 */

import { seedDefaultStorefront } from './storefront-default.seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Running default storefront seed...\n');
  
  try {
    await seedDefaultStorefront();
    console.log('✅ Default storefront seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding default storefront:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


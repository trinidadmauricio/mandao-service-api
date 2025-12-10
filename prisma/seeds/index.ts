/**
 * Seed principal - Ejecuta todos los seeds en orden
 */

import { seedSubscriptionPlans } from './subscription-plans.seed';
import { seedSaaSAdmins } from './saas-admins.seed';
import { seedOAuthClients } from './oauth-clients.seed';
import { seedTenants } from './tenants.seed';
import { seedLogisticsProviders } from './logistics-providers.seed';
import { seedUsers } from './users.seed';
import { seedBranches } from './branches.seed';
import { seedOrderCounters } from './order-counters.seed';
import { seedVehicles } from './vehicles.seed';
import { seedDrivers } from './drivers.seed';
import { seedDeliveryZones } from './delivery-zones.seed';
import { seedDeliveryRates } from './delivery-rates.seed';
import { seedStorefronts } from './storefronts.seed';
import { seedDefaultStorefront } from './storefront-default.seed';
import { seedCategories } from './categories.seed';
import { seedBrands } from './brands.seed';
import { seedProducts } from './products.seed';
import { seedProductVariants } from './product-variants.seed';
import { seedOrders } from './orders.seed';
import { seedOrderRelations } from './order-relations.seed';
import { seedInventory } from './inventory.seed';
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

    // 4. Seed Tenants
    await seedTenants();

    // 5. Seed Logistics Providers (antes de users para poder asociar LOGISTICS_PROVIDER users)
    await seedLogisticsProviders();

    // 6. Seed Users (depende de Tenants y Logistics Providers)
    await seedUsers();

    // 7. Seed Branches (depende de Tenants)
    await seedBranches();

    // 8. Seed Order Counters (depende de Tenants)
    await seedOrderCounters();

    // 9. Seed Vehicles (depende de Logistics Providers)
    await seedVehicles();

    // 10. Seed Drivers (depende de Logistics Providers y Vehicles)
    await seedDrivers();

    // 11. Seed Delivery Zones (depende de Tenants)
    await seedDeliveryZones();

    // 12. Seed Delivery Rates (depende de Delivery Zones)
    await seedDeliveryRates();

    // 13. Seed Storefronts (depende de Tenants)
    await seedStorefronts();

    // 13.1. Seed Default Storefront (para producción/Railway)
    await seedDefaultStorefront();

    // 14. Seed Categories (depende de Tenants)
    await seedCategories();

    // 15. Seed Brands (depende de Tenants)
    await seedBrands();

    // 16. Seed Products (depende de Categories y Brands)
    await seedProducts();

    // 17. Seed Product Variants (depende de Products)
    await seedProductVariants();

    // 18. Seed Orders (depende de Tenants)
    await seedOrders();

    // 19. Seed Order Relations (depende de Orders, Branches, Drivers)
    await seedOrderRelations();

    // 20. Seed Inventory (depende de Products, Variants, Branches)
    await seedInventory();

    console.log('✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();


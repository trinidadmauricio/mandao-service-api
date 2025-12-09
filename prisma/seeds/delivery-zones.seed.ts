/**
 * Seed para Delivery Zones
 */

import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedDeliveryZones(): Promise<void> {
  console.log('🌱 Seeding delivery zones...');

  // Trabajar con tenants RETAIL y ON_DEMAND (donde tenemos usuarios)
  const allTenants = await prisma.tenant.findMany({
    orderBy: { created_at: 'asc' },
  });
  const tenants = allTenants.filter(t => {
    const retailTenants = allTenants.filter(tt => tt.type === 'RETAIL').slice(0, 1);
    const onDemandTenants = allTenants.filter(tt => tt.type === 'ON_DEMAND').slice(0, 1);
    return retailTenants.some(rt => rt.id === t.id) || onDemandTenants.some(od => od.id === t.id);
  });
  
  if (tenants.length === 0) {
    throw new Error('No tenants found. Please run tenants seed first.');
  }

  let createdCount = 0;

  for (const tenant of tenants) {
    // 3-5 zones por tenant
    const zoneCount = faker.number.int({ min: 3, max: 5 });

    for (let i = 0; i < zoneCount; i++) {
      const baseRate = parseFloat(faker.number.float({ min: 2.0, max: 10.0, fractionDigits: 2 }).toFixed(2));
      const ratePerKm = parseFloat(faker.number.float({ min: 0.5, max: 3.0, fractionDigits: 2 }).toFixed(2));
      const surgeMultiplier = parseFloat(faker.number.float({ min: 1.0, max: 2.5, fractionDigits: 2 }).toFixed(2));

      // Boundary simplificado en formato WKT (POLYGON)
      // En producción usar PostGIS geography
      const centerLat = parseFloat(faker.location.latitude().toString());
      const centerLng = parseFloat(faker.location.longitude().toString());
      const radius = 0.05; // ~5km

      const boundary = `POLYGON((
        ${centerLng - radius} ${centerLat - radius},
        ${centerLng + radius} ${centerLat - radius},
        ${centerLng + radius} ${centerLat + radius},
        ${centerLng - radius} ${centerLat + radius},
        ${centerLng - radius} ${centerLat - radius}
      ))`;

      await prisma.deliveryZone.create({
        data: {
          tenant_id: tenant.id,
          name: `Zone ${i + 1} - ${faker.location.city()}`,
          boundary,
          base_rate: baseRate,
          rate_per_km: ratePerKm,
          surge_multiplier: surgeMultiplier,
          currency: tenant.default_currency,
          is_active: faker.datatype.boolean({ probability: 0.9 }),
        },
      });

      createdCount++;
      console.log(`  ✅ Created delivery zone for tenant ${tenant.slug}: Zone ${i + 1}`);
    }
  }

  console.log(`✅ Delivery zones seeded successfully (${createdCount} created)\n`);
}


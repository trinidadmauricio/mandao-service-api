/**
 * Seed para Delivery Rates
 */

import { PrismaClient, VehicleType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedDeliveryRates(): Promise<void> {
  console.log('🌱 Seeding delivery rates...');

  const zones = await prisma.deliveryZone.findMany();
  if (zones.length === 0) {
    throw new Error('No delivery zones found. Please run delivery-zones seed first.');
  }

  const vehicleTypes: VehicleType[] = [
    VehicleType.MOTORCYCLE,
    VehicleType.SEDAN,
    VehicleType.MINI_VAN,
    VehicleType.PANEL,
    VehicleType.TRUCK,
    VehicleType.PICKUP,
  ];

  let createdCount = 0;

  for (const zone of zones) {
    // Crear rates para cada vehicle type
    for (const vehicleType of vehicleTypes) {
      // 2-3 rangos de distancia por vehicle type
      const rangeCount = faker.number.int({ min: 2, max: 3 });
      let lastMax = 0;

      for (let i = 0; i < rangeCount; i++) {
        const distanceMin = lastMax;
        const distanceMax = lastMax + faker.number.float({ min: 5.0, max: 20.0, fractionDigits: 2 });
        lastMax = distanceMax;

        // Base price y price per km varían según vehicle type
        const basePriceMultiplier = {
          [VehicleType.MOTORCYCLE]: 1.0,
          [VehicleType.SEDAN]: 1.2,
          [VehicleType.MINI_VAN]: 1.5,
          [VehicleType.PANEL]: 1.8,
          [VehicleType.TRUCK]: 2.0,
          [VehicleType.PICKUP]: 1.6,
        };

        const basePrice = parseFloat(
          (parseFloat(zone.base_rate.toString()) * basePriceMultiplier[vehicleType]).toFixed(2)
        );
        const pricePerKm = parseFloat(
          (parseFloat(zone.rate_per_km.toString()) * basePriceMultiplier[vehicleType]).toFixed(2)
        );

        const priorityMultiplier = {
          NORMAL: 1.0,
          URGENT: 1.5,
        };

        await prisma.deliveryRate.create({
          data: {
            tenant_id: zone.tenant_id,
            zone_id: zone.id,
            vehicle_type: vehicleType,
            distance_km_min: distanceMin,
            distance_km_max: distanceMax,
            base_price: basePrice,
            price_per_km: pricePerKm,
            currency: zone.currency,
            priority_multiplier: priorityMultiplier,
          },
        });

        createdCount++;
      }
    }
  }

  console.log(`✅ Delivery rates seeded successfully (${createdCount} created)\n`);
}


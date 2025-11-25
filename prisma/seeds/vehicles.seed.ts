/**
 * Seed para Vehicles
 */

import { PrismaClient, VehicleType, VehicleStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedVehicles(): Promise<void> {
  console.log('🌱 Seeding vehicles...');

  const logisticsProviders = await prisma.logisticsProvider.findMany();
  if (logisticsProviders.length === 0) {
    throw new Error('No logistics providers found. Please run logistics-providers seed first.');
  }

  const vehicleTypes: VehicleType[] = [
    VehicleType.MOTORCYCLE,
    VehicleType.SEDAN,
    VehicleType.MINI_VAN,
    VehicleType.PANEL,
    VehicleType.TRUCK,
    VehicleType.PICKUP,
  ];

  const vehicleStatuses: VehicleStatus[] = [
    VehicleStatus.AVAILABLE,
    VehicleStatus.AVAILABLE,
    VehicleStatus.IN_SERVICE,
    VehicleStatus.MAINTENANCE,
    VehicleStatus.OUT_OF_SERVICE,
  ];

  const brands = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Suzuki', 'Yamaha', 'Kawasaki'];
  const models = {
    [VehicleType.MOTORCYCLE]: ['CBR', 'YZF', 'Ninja', 'GSX', 'Duke'],
    [VehicleType.SEDAN]: ['Camry', 'Accord', 'Civic', 'Corolla', 'Altima'],
    [VehicleType.MINI_VAN]: ['Sienna', 'Odyssey', 'Caravan', 'Quest'],
    [VehicleType.PANEL]: ['Transit', 'Sprinter', 'Promaster', 'NV200'],
    [VehicleType.TRUCK]: ['F-150', 'Silverado', 'Ram', 'Tundra'],
    [VehicleType.PICKUP]: ['Ranger', 'Tacoma', 'Frontier', 'Colorado'],
  };

  const colors = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green'];

  // 15-20 vehicles total
  const vehicleCount = faker.number.int({ min: 15, max: 20 });
  const usedLicensePlates = new Set<string>();

  for (let i = 0; i < vehicleCount; i++) {
    const provider = faker.helpers.arrayElement(logisticsProviders);
    const vehicleType = faker.helpers.arrayElement(vehicleTypes);
    const status = faker.helpers.arrayElement(vehicleStatuses);
    const brand = faker.helpers.arrayElement(brands);
    const model = faker.helpers.arrayElement(models[vehicleType]);
    const color = faker.helpers.arrayElement(colors);

    // Generar license plate único
    let licensePlate: string;
    do {
      licensePlate = faker.string.alphanumeric(6).toUpperCase();
    } while (usedLicensePlates.has(licensePlate));
    usedLicensePlates.add(licensePlate);

    const year = faker.number.int({ min: 2015, max: 2024 });
    const insuranceExpiresAt = faker.date.future({ years: 1 });
    const lastMaintenanceAt = faker.date.past({ years: 1 });

    const specifications = {
      engine: `${faker.number.int({ min: 1.0, max: 3.5 })}L`,
      transmission: faker.helpers.arrayElement(['Manual', 'Automatic', 'CVT']),
      fuel_type: faker.helpers.arrayElement(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
      capacity_kg: vehicleType === VehicleType.MOTORCYCLE
        ? faker.number.int({ min: 50, max: 150 })
        : faker.number.int({ min: 500, max: 2000 }),
    };

    await prisma.vehicle.create({
      data: {
        logistics_provider_id: provider.id,
        vehicle_type: vehicleType,
        license_plate: licensePlate,
        brand,
        model,
        year,
        color,
        insurance_policy: `POL-${faker.string.alphanumeric(10).toUpperCase()}`,
        insurance_expires_at: insuranceExpiresAt,
        last_maintenance_at: lastMaintenanceAt,
        status,
        specifications,
      },
    });

    console.log(`  ✅ Created vehicle: ${brand} ${model} (${licensePlate}) - ${vehicleType}`);
  }

  console.log('✅ Vehicles seeded successfully\n');
}


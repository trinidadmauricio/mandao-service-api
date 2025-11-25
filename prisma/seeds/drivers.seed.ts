/**
 * Seed para Drivers
 */

import { PrismaClient, WorkType, DriverStatus, UserRole, UserStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../../src/shared/utils/password.util';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateSecurePassword(): string {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (x) => charset[x % charset.length]).join('');
}

export async function seedDrivers(): Promise<void> {
  console.log('🌱 Seeding drivers...');

  const logisticsProviders = await prisma.logisticsProvider.findMany();
  if (logisticsProviders.length === 0) {
    throw new Error('No logistics providers found. Please run logistics-providers seed first.');
  }

  const vehicles = await prisma.vehicle.findMany();
  const workTypes: WorkType[] = [WorkType.FULL_TIME, WorkType.PART_TIME, WorkType.FREELANCE];
  const driverStatuses: DriverStatus[] = [
    DriverStatus.AVAILABLE,
    DriverStatus.AVAILABLE,
    DriverStatus.BUSY,
    DriverStatus.OFFLINE,
    DriverStatus.SUSPENDED,
  ];

  // 15-20 drivers total
  const driverCount = faker.number.int({ min: 15, max: 20 });
  const usedIdentityDocs = new Set<string>();
  const usedDrivingLicenses = new Set<string>();

  for (let i = 0; i < driverCount; i++) {
    const provider = faker.helpers.arrayElement(logisticsProviders);
    const workType = faker.helpers.arrayElement(workTypes);
    const status = faker.helpers.arrayElement(driverStatuses);
      const hasOwnVehicle = faker.datatype.boolean({ probability: 0.4 });
      const providerVehicles = vehicles.filter((v) => v.logistics_provider_id === provider.id);
      const vehicle = hasOwnVehicle && providerVehicles.length > 0
        ? faker.helpers.arrayElement(providerVehicles)
        : null;

    // Generar documentos únicos
    let identityDocument: string;
    do {
      identityDocument = faker.string.alphanumeric(10).toUpperCase();
    } while (usedIdentityDocs.has(identityDocument));
    usedIdentityDocs.add(identityDocument);

    let drivingLicense: string;
    do {
      drivingLicense = faker.string.alphanumeric(12).toUpperCase();
    } while (usedDrivingLicenses.has(drivingLicense));
    usedDrivingLicenses.add(drivingLicense);

    const dateOfBirth = faker.date.birthdate({ min: 25, max: 55, mode: 'age' });
    const emergencyContact = {
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      relationship: faker.helpers.arrayElement(['Spouse', 'Parent', 'Sibling', 'Friend']),
    };

    const documents = {
      identity_front: faker.internet.url(),
      identity_back: faker.internet.url(),
      license_front: faker.internet.url(),
      license_back: faker.internet.url(),
      photo: faker.internet.url(),
    };

    const ratingAvg = status !== DriverStatus.SUSPENDED
      ? parseFloat(faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 2 }).toFixed(2))
      : null;

    const totalDeliveries = status !== DriverStatus.SUSPENDED
      ? faker.number.int({ min: 0, max: 500 })
      : 0;

      // Work zone (simplificado - en producción usar PostGIS)
      const workZone = status === DriverStatus.AVAILABLE
        ? `POLYGON((${faker.location.longitude().toString()} ${faker.location.latitude().toString()}, ${faker.location.longitude().toString()} ${faker.location.latitude().toString()}, ${faker.location.longitude().toString()} ${faker.location.latitude().toString()}, ${faker.location.longitude().toString()} ${faker.location.latitude().toString()}, ${faker.location.longitude().toString()} ${faker.location.latitude().toString()}))`
        : null;

    // Crear un usuario único para este driver
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = `driver.${faker.string.alphanumeric(8).toLowerCase()}@${provider.company_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`;
    
    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`  ⚠️  User with email ${email} already exists, skipping driver`);
      continue;
    }

    // Crear el usuario para el driver
    const password = generateSecurePassword();
    const passwordHash = await hashPassword(password);
    const driverUser = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: UserRole.LOGISTICS_PROVIDER, // Usar LOGISTICS_PROVIDER para drivers
        tenant_id: provider.tenant_id,
        logistics_provider_id: provider.id,
        phone: faker.phone.number(),
        email_verified_at: new Date(),
        status: UserStatus.ACTIVE,
      },
    });

    // Crear el driver con el usuario único
    await prisma.driver.create({
      data: {
        logistics_provider_id: provider.id,
        user_id: driverUser.id,
        identity_document: identityDocument,
        driving_license: drivingLicense,
        date_of_birth: dateOfBirth,
        emergency_contact: emergencyContact,
        has_own_vehicle: hasOwnVehicle,
        vehicle_id: vehicle?.id || null,
        work_type: workType,
        work_zone: workZone,
        availability_status: status,
        rating_avg: ratingAvg,
        total_deliveries: totalDeliveries,
        documents,
      },
    });

    console.log(`  ✅ Created driver: ${firstName} ${lastName} (${workType}, ${status}) for ${provider.company_name}`);
  }

  console.log('✅ Drivers seeded successfully\n');
}


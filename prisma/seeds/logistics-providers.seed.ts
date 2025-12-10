/**
 * Seed para Logistics Providers
 */

import { PrismaClient, VerificationStatus, ProviderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedLogisticsProviders(): Promise<void> {
  console.log('🌱 Seeding logistics providers...');

  // Crear exactamente 2 logistics providers (sin tenant_id - funcionan separados)
  const providerCount = 2;
  const verificationStatuses: VerificationStatus[] = [
    VerificationStatus.VERIFIED,
    VerificationStatus.VERIFIED,
  ];
  const providerStatuses: ProviderStatus[] = [
    ProviderStatus.ACTIVE,
    ProviderStatus.ACTIVE,
  ];

  for (let i = 0; i < providerCount; i++) {
    const companyName = faker.company.name() + ' Logistics';
    const taxId = faker.string.alphanumeric(10).toUpperCase();
    const verificationStatus = verificationStatuses[i] || VerificationStatus.VERIFIED;
    const status = providerStatuses[i] || ProviderStatus.ACTIVE;
    // Logistics providers NO tienen tenant_id - funcionan separados
    const tenantId = null;

    const ratingAvg = verificationStatus === VerificationStatus.VERIFIED
      ? parseFloat(faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 2 }).toFixed(2))
      : null;

    const totalDeliveries = verificationStatus === VerificationStatus.VERIFIED
      ? faker.number.int({ min: 10, max: 1000 })
      : 0;

    const verificationDocuments = verificationStatus === VerificationStatus.VERIFIED
      ? {
          business_license: faker.internet.url(),
          tax_certificate: faker.internet.url(),
          insurance: faker.internet.url(),
        }
      : undefined;

    await prisma.logisticsProvider.create({
      data: {
        tenant_id: tenantId,
        company_name: companyName,
        tax_id: taxId,
        representative_name: faker.person.fullName(),
        representative_phone: faker.phone.number(),
        representative_document: faker.string.alphanumeric(10).toUpperCase(),
        verification_status: verificationStatus,
        verification_documents: verificationDocuments,
        rating_avg: ratingAvg,
        total_deliveries: totalDeliveries,
        status,
      },
    });

    console.log(`  ✅ Created logistics provider: ${companyName} (${verificationStatus}, ${status})`);
  }

  console.log('✅ Logistics providers seeded successfully\n');
}


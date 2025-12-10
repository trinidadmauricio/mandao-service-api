/**
 * Seed para Orders
 */

import { PrismaClient, OrderType, OrderStatus, OrderPriority } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { generateSecureToken } from '../../src/shared/utils/crypto.util';

const prisma = new PrismaClient();

export async function seedOrders(): Promise<void> {
  console.log('🌱 Seeding orders...');

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

  const orderStatuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.ASSIGNED,
    OrderStatus.IN_TRANSIT,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  const orderTypes: OrderType[] = [OrderType.RETAIL, OrderType.ON_DEMAND];
  const priorities: OrderPriority[] = [OrderPriority.NORMAL, OrderPriority.URGENT];

  let createdCount = 0;
  const usedTrackingCodes = new Set<string>();

  for (const tenant of tenants) {
    // 15-20 orders por tenant
    const orderCount = faker.number.int({ min: 15, max: 20 });

    // Obtener order counter para generar order numbers
    const orderCounter = await prisma.orderCounter.findUnique({
      where: { tenant_id: tenant.id },
    });

    if (!orderCounter) {
      console.log(`  ⚠️  No order counter found for tenant ${tenant.slug}, skipping orders`);
      continue;
    }

    for (let i = 0; i < orderCount; i++) {
      const orderType = tenant.type === 'RETAIL'
        ? OrderType.RETAIL
        : tenant.type === 'ON_DEMAND'
        ? OrderType.ON_DEMAND
        : faker.helpers.arrayElement(orderTypes);

      const status = faker.helpers.arrayElement(orderStatuses);
      const priority = faker.helpers.arrayElement(priorities);

      // Generar tracking code único
      let trackingCode: string;
      do {
        trackingCode = `TRK-${generateSecureToken(12).toUpperCase()}`;
      } while (usedTrackingCodes.has(trackingCode));
      usedTrackingCodes.add(trackingCode);

      // Order number
      const currentValue = orderCounter.current_value + BigInt(i + 1);
      const orderDisplayNumber = `${orderCounter.prefix}-${String(currentValue).padStart(orderCounter.padding_length, '0')}`;
      const orderNumber = currentValue;

      // Customer snapshot
      const customerSnapshot = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        customer_id: faker.datatype.boolean({ probability: 0.6 })
          ? faker.string.uuid()
          : null,
      };

      // Delivery address
      const deliveryLat = parseFloat(faker.location.latitude().toString());
      const deliveryLng = parseFloat(faker.location.longitude().toString());
      const deliveryAddress = {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zip_code: faker.location.zipCode(),
        country: faker.location.country(),
        lat: deliveryLat,
        lng: deliveryLng,
      };

      // Pickup address (solo para ON_DEMAND)
      let pickupAddress: any = undefined;
      let pickupLat: number | null = null;
      let pickupLng: number | null = null;
      if (orderType === OrderType.ON_DEMAND) {
        pickupLat = parseFloat(faker.location.latitude().toString());
        pickupLng = parseFloat(faker.location.longitude().toString());
        pickupAddress = {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zip_code: faker.location.zipCode(),
          country: faker.location.country(),
          lat: pickupLat,
          lng: pickupLng,
        };
      }

      const estimatedDeliveryAt = faker.date.future({ years: 0.02 }); // ~7 days
      const scheduledPickupAt = orderType === OrderType.ON_DEMAND
        ? faker.date.future({ years: 0.005 }) // ~2 days
        : null;

      const cancellationReason = status === OrderStatus.CANCELLED
        ? faker.helpers.arrayElement([
            'Customer cancelled',
            'Out of stock',
            'Delivery address invalid',
            'Payment failed',
          ])
        : null;

      await prisma.order.create({
        data: {
          tenant_id: tenant.id,
          order_number: orderNumber,
          order_display_number: orderDisplayNumber,
          order_type: orderType,
          customer_id: customerSnapshot.customer_id,
          customer_snapshot: customerSnapshot,
          delivery_address: deliveryAddress,
          delivery_lat: deliveryLat,
          delivery_lng: deliveryLng,
          pickup_address: pickupAddress,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          status,
          cancellation_reason: cancellationReason,
          scheduled_pickup_at: scheduledPickupAt,
          estimated_delivery_at: estimatedDeliveryAt,
          special_instructions: faker.datatype.boolean({ probability: 0.3 })
            ? faker.lorem.sentence()
            : null,
          priority,
          cargo_description: orderType === OrderType.ON_DEMAND
            ? faker.lorem.sentence()
            : null,
          tracking_code: trackingCode,
        },
      });

      createdCount++;
      console.log(`  ✅ Created order for tenant ${tenant.slug}: ${orderDisplayNumber} (${status})`);
    }
  }

  console.log(`✅ Orders seeded successfully (${createdCount} created)\n`);
}


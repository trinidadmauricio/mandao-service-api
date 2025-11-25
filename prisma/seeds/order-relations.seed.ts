/**
 * Seed para Order Relations (OrderBranches, OrderDrivers, OrderItems, OrderSummaryTotals, etc.)
 */

import { PrismaClient, OrderStatus, DeliveryProofType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedOrderRelations(): Promise<void> {
  console.log('🌱 Seeding order relations...');

  const orders = await prisma.order.findMany();
  if (orders.length === 0) {
    console.log('  ⏭️  No orders found, skipping order relations');
    return;
  }

  let branchesCount = 0;
  let driversCount = 0;
  let itemsCount = 0;
  let totalsCount = 0;
  let historyCount = 0;
  let proofsCount = 0;
  let ratingsCount = 0;

  for (const order of orders) {
    // OrderBranches
    const branches = await prisma.branch.findMany({
      where: { tenant_id: order.tenant_id },
    });

    if (branches.length > 0) {
      const branch = faker.helpers.arrayElement(branches);
      await prisma.orderBranch.create({
        data: {
          order_id: order.id,
          branch_id: branch.id,
          branch_snapshot: {
            name: branch.name,
            address: branch.address,
            contact_phone: branch.contact_phone,
          },
          is_current: true,
        },
      });
      branchesCount++;
    }

    // OrderDrivers (solo para orders asignados o en tránsito)
    if (order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_TRANSIT || order.status === OrderStatus.DELIVERED) {
      const logisticsProviders = await prisma.logisticsProvider.findMany({
        where: {
          OR: [
            { tenant_id: order.tenant_id },
            { tenant_id: null }, // Providers globales
          ],
        },
      });

      if (logisticsProviders.length > 0) {
        const logisticsProvider = faker.helpers.arrayElement(logisticsProviders);
        const drivers = await prisma.driver.findMany({
          where: { logistics_provider_id: logisticsProvider.id },
        });

        if (drivers.length > 0) {
          const driver = faker.helpers.arrayElement(drivers);
          // Obtener user y vehicle del driver
          const driverUser = await prisma.user.findUnique({
            where: { id: driver.user_id },
          });
          const driverVehicle = driver.vehicle_id
            ? await prisma.vehicle.findUnique({
                where: { id: driver.vehicle_id },
              })
            : null;

          await prisma.orderDriver.create({
            data: {
              order_id: order.id,
              driver_id: driver.id,
              logistics_provider_id: logisticsProvider.id,
              driver_snapshot: {
                name: driverUser
                  ? `${driverUser.first_name} ${driverUser.last_name}`
                  : 'Unknown Driver',
                phone: driverUser?.phone || null,
                vehicle: driverVehicle
                  ? {
                      type: driverVehicle.vehicle_type,
                      license_plate: driverVehicle.license_plate,
                    }
                  : null,
              },
              is_current: true,
            },
          });
          driversCount++;
        } else {
          // Si no hay drivers, crear order driver solo con logistics provider
          await prisma.orderDriver.create({
            data: {
              order_id: order.id,
              driver_id: null,
              logistics_provider_id: logisticsProvider.id,
              driver_snapshot: {
                provider_name: logisticsProvider.company_name,
              },
              is_current: true,
            },
          });
          driversCount++;
        }
      }
    }

    // OrderItems (2-5 items por order)
    const products = await prisma.product.findMany({
      where: { tenant_id: order.tenant_id },
      include: { variants: true },
    });

    if (products.length > 0) {
      const itemCount = faker.number.int({ min: 2, max: 5 });
      let orderSubtotal = 0;

      for (let i = 0; i < itemCount; i++) {
        const product = faker.helpers.arrayElement(products);
        const variant = product.has_variants && product.variants.length > 0
          ? faker.helpers.arrayElement(product.variants)
          : null;

        const quantity = parseFloat(faker.number.float({ min: 1, max: 10, fractionDigits: 3 }).toFixed(3));
        const unitPrice = variant
          ? parseFloat((parseFloat(product.selling_price.toString()) + parseFloat(variant.price_adjustment.toString())).toFixed(2))
          : parseFloat(product.selling_price.toString());
        const subtotal = parseFloat((quantity * unitPrice).toFixed(2));
        orderSubtotal += subtotal;

        await prisma.orderItem.create({
          data: {
            order_id: order.id,
            product_id: product.id,
            variant_id: variant?.id || null,
            product_snapshot: {
              name: product.name,
              sku: product.sku,
              variant: variant
                ? {
                    option1: variant.option1_value,
                    option2: variant.option2_value,
                    option3: variant.option3_value,
                  }
                : null,
            },
            quantity,
            unit_price: unitPrice,
            subtotal,
          },
        });
        itemsCount++;
      }

      // OrderSummaryTotals
      const taxRate = parseFloat(faker.number.float({ min: 0, max: 0.15, fractionDigits: 4 }).toFixed(4));
      const taxAmount = parseFloat((orderSubtotal * taxRate).toFixed(2));
      const deliveryFee = parseFloat(faker.number.float({ min: 5, max: 25, fractionDigits: 2 }).toFixed(2));
      const discountAmount = faker.datatype.boolean({ probability: 0.2 })
        ? parseFloat(faker.number.float({ min: 5, max: 50, fractionDigits: 2 }).toFixed(2))
        : 0;
      const totalAmount = parseFloat((orderSubtotal + taxAmount + deliveryFee - discountAmount).toFixed(2));

      // Obtener tenant para currency
      const tenant = await prisma.tenant.findUnique({
        where: { id: order.tenant_id },
      });

      await prisma.orderSummaryTotal.create({
        data: {
          order_id: order.id,
          version: 1,
          subtotal: orderSubtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          delivery_fee: deliveryFee,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          currency: tenant?.default_currency || 'USD',
          is_current: true,
          calculation_metadata: {
            items_count: itemCount,
            calculated_at: new Date().toISOString(),
          },
        },
      });
      totalsCount++;
    }

    // OrderStatusHistory
    const statusHistory: Array<{ status: OrderStatus; timestamp: Date }> = [
      { status: OrderStatus.PENDING, timestamp: order.created_at },
    ];

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.DRAFT) {
      statusHistory.push({
        status: OrderStatus.CONFIRMED,
        timestamp: faker.date.between({ from: order.created_at, to: new Date() }),
      });
    }

    if (order.status === OrderStatus.ASSIGNED || order.status === OrderStatus.IN_TRANSIT || order.status === OrderStatus.DELIVERED) {
      statusHistory.push({
        status: OrderStatus.ASSIGNED,
        timestamp: faker.date.between({ from: statusHistory[statusHistory.length - 1].timestamp, to: new Date() }),
      });
    }

    if (order.status === OrderStatus.IN_TRANSIT || order.status === OrderStatus.DELIVERED) {
      statusHistory.push({
        status: OrderStatus.IN_TRANSIT,
        timestamp: faker.date.between({ from: statusHistory[statusHistory.length - 1].timestamp, to: new Date() }),
      });
    }

    if (order.status === OrderStatus.DELIVERED) {
      statusHistory.push({
        status: OrderStatus.DELIVERED,
        timestamp: faker.date.between({ from: statusHistory[statusHistory.length - 1].timestamp, to: new Date() }),
      });
    }

    for (let i = 0; i < statusHistory.length; i++) {
      const history = statusHistory[i];
      const fromStatus = i > 0 ? statusHistory[i - 1].status : null;

      await prisma.orderStatusHistory.create({
        data: {
          order_id: order.id,
          from_status: fromStatus,
          to_status: history.status,
          notes: faker.datatype.boolean({ probability: 0.3 })
            ? faker.lorem.sentence()
            : null,
          created_at: history.timestamp,
        },
      });
      historyCount++;
    }

    // OrderDeliveryProofs (solo para orders entregados)
    if (order.status === OrderStatus.DELIVERED) {
      const proofType = faker.helpers.arrayElement([
        DeliveryProofType.SIGNATURE,
        DeliveryProofType.PHOTO,
        DeliveryProofType.CODE,
      ]);

      const proofData = {
        type: proofType,
        delivered_at: faker.date.between({ from: order.created_at, to: new Date() }),
        ...(proofType === DeliveryProofType.SIGNATURE && {
          signature_url: faker.image.url(),
        }),
        ...(proofType === DeliveryProofType.PHOTO && {
          photo_url: faker.image.url(),
        }),
        ...(proofType === DeliveryProofType.CODE && {
          code: faker.string.alphanumeric(6).toUpperCase(),
        }),
      };

      await prisma.orderDeliveryProof.create({
        data: {
          order_id: order.id,
          proof_type: proofType,
          proof_data: proofData,
          delivered_to_name: faker.person.fullName(),
          delivered_at: proofData.delivered_at,
          driver_notes: faker.datatype.boolean({ probability: 0.4 })
            ? faker.lorem.sentence()
            : null,
        },
      });
      proofsCount++;

      // DeliveryRatings (solo para orders entregados)
      if (faker.datatype.boolean({ probability: 0.7 })) {
        const orderDriver = await prisma.orderDriver.findFirst({
          where: { order_id: order.id, is_current: true },
        });

        if (orderDriver && orderDriver.driver_id) {
          await prisma.deliveryRating.create({
            data: {
              order_id: order.id,
              driver_id: orderDriver.driver_id,
              customer_rating: faker.number.int({ min: 3, max: 5 }),
              driver_rating: faker.datatype.boolean({ probability: 0.5 })
                ? faker.number.int({ min: 3, max: 5 })
                : null,
              customer_comment: faker.datatype.boolean({ probability: 0.4 })
                ? faker.lorem.sentence()
                : null,
              driver_comment: faker.datatype.boolean({ probability: 0.3 })
                ? faker.lorem.sentence()
                : null,
            },
          });
          ratingsCount++;
        }
      }
    }
  }

  console.log(`  ✅ Created ${branchesCount} order branches`);
  console.log(`  ✅ Created ${driversCount} order drivers`);
  console.log(`  ✅ Created ${itemsCount} order items`);
  console.log(`  ✅ Created ${totalsCount} order summary totals`);
  console.log(`  ✅ Created ${historyCount} order status history entries`);
  console.log(`  ✅ Created ${proofsCount} delivery proofs`);
  console.log(`  ✅ Created ${ratingsCount} delivery ratings`);
  console.log('✅ Order relations seeded successfully\n');
}


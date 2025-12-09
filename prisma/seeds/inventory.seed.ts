/**
 * Seed para Inventory (StockByBranch e InventoryMovements)
 */

import { PrismaClient, MovementType, ReferenceType, TenantType } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedInventory(): Promise<void> {
  console.log('🌱 Seeding inventory...');

  // Solo trabajar con los primeros 2 tenants (donde tenemos usuarios)
  const tenants = await prisma.tenant.findMany({
    where: {
      type: {
        in: [TenantType.RETAIL, TenantType.HYBRID],
      },
    },
    take: 2,
    orderBy: { created_at: 'asc' },
  });

  if (tenants.length === 0) {
    console.log('  ⏭️  No RETAIL or HYBRID tenants found, skipping inventory');
    return;
  }

  let stockByBranchCount = 0;
  let movementsCount = 0;

  for (const tenant of tenants) {
    const products = await prisma.product.findMany({
      where: { tenant_id: tenant.id },
      include: { variants: true },
    });

    const branches = await prisma.branch.findMany({
      where: { tenant_id: tenant.id },
    });

    if (products.length === 0 || branches.length === 0) {
      console.log(`  ⚠️  No products or branches found for tenant ${tenant.slug}, skipping inventory`);
      continue;
    }

    // Obtener usuarios para created_by_user_id (SUPERVISOR ya no pertenece a tenants, solo OWNER y MERCHANT_USER)
    const users = await prisma.user.findMany({
      where: {
        tenant_id: tenant.id,
        role: {
          in: ['OWNER', 'MERCHANT_USER'],
        },
      },
    });

    if (users.length === 0) {
      console.log(`  ⚠️  No users found for tenant ${tenant.slug}, skipping inventory`);
      continue;
    }

    for (const product of products) {
      // StockByBranch para productos sin variantes
      if (!product.has_variants) {
        for (const branch of branches) {
          const currentStock = faker.number.int({ min: 0, max: 500 });
          const reservedStock = faker.number.int({ min: 0, max: Math.floor(currentStock * 0.3) });
          const availableStock = currentStock - reservedStock;

          await prisma.stockByBranch.create({
            data: {
              tenant_id: tenant.id,
              product_id: product.id,
              variant_id: null,
              branch_id: branch.id,
              current_stock: currentStock,
              reserved_stock: reservedStock,
              available_stock: availableStock,
            },
          });
          stockByBranchCount++;

          // InventoryMovements históricos
          const movementCount = faker.number.int({ min: 2, max: 5 });
          let runningStock = currentStock;

          for (let i = 0; i < movementCount; i++) {
            const movementType = faker.helpers.arrayElement([
              MovementType.PURCHASE,
              MovementType.ADJUSTMENT,
              MovementType.TRANSFER,
            ]);

            let quantity = 0;
            if (movementType === MovementType.PURCHASE) {
              quantity = faker.number.int({ min: 10, max: 100 });
              runningStock += quantity;
            } else if (movementType === MovementType.ADJUSTMENT) {
              quantity = faker.number.int({ min: -20, max: 20 });
              runningStock += quantity;
            } else if (movementType === MovementType.TRANSFER) {
              quantity = faker.number.int({ min: 5, max: 50 });
              runningStock -= quantity;
            }

            const stockBefore = runningStock - quantity;
            const stockAfter = runningStock;

            await prisma.inventoryMovement.create({
              data: {
                tenant_id: tenant.id,
                product_id: product.id,
                variant_id: null,
                branch_id: branch.id,
                movement_type: movementType,
                quantity,
                stock_before: stockBefore,
                stock_after: stockAfter,
                reference_type: movementType === MovementType.TRANSFER
                  ? ReferenceType.TRANSFER
                  : movementType === MovementType.ADJUSTMENT
                  ? ReferenceType.ADJUSTMENT
                  : null,
                reference_id: faker.string.uuid(),
                notes: faker.lorem.sentence(),
                created_by_user_id: faker.helpers.arrayElement(users).id,
                created_at: faker.date.past({ years: 1 }),
              },
            });
            movementsCount++;
          }
        }
      } else {
        // StockByBranch para variantes
        for (const variant of product.variants) {
          for (const branch of branches) {
            const currentStock = faker.number.int({ min: 0, max: 200 });
            const reservedStock = faker.number.int({ min: 0, max: Math.floor(currentStock * 0.3) });
            const availableStock = currentStock - reservedStock;

            await prisma.stockByBranch.create({
              data: {
                tenant_id: tenant.id,
                product_id: product.id,
                variant_id: variant.id,
                branch_id: branch.id,
                current_stock: currentStock,
                reserved_stock: reservedStock,
                available_stock: availableStock,
              },
            });
            stockByBranchCount++;

            // InventoryMovements históricos para variantes
            const movementCount = faker.number.int({ min: 1, max: 3 });
            let runningStock = currentStock;

            for (let i = 0; i < movementCount; i++) {
              const movementType = faker.helpers.arrayElement([
                MovementType.PURCHASE,
                MovementType.ADJUSTMENT,
              ]);

              const quantity = movementType === MovementType.PURCHASE
                ? faker.number.int({ min: 5, max: 50 })
                : faker.number.int({ min: -10, max: 10 });

              runningStock += quantity;
              const stockBefore = runningStock - quantity;
              const stockAfter = runningStock;

              await prisma.inventoryMovement.create({
                data: {
                  tenant_id: tenant.id,
                  product_id: product.id,
                  variant_id: variant.id,
                  branch_id: branch.id,
                  movement_type: movementType,
                  quantity,
                  stock_before: stockBefore,
                  stock_after: stockAfter,
                  reference_type: movementType === MovementType.ADJUSTMENT
                    ? ReferenceType.ADJUSTMENT
                    : null,
                  reference_id: faker.string.uuid(),
                  notes: faker.lorem.sentence(),
                  created_by_user_id: faker.helpers.arrayElement(users).id,
                  created_at: faker.date.past({ years: 1 }),
                },
              });
              movementsCount++;
            }
          }
        }
      }
    }
  }

  console.log(`  ✅ Created ${stockByBranchCount} stock by branch records`);
  console.log(`  ✅ Created ${movementsCount} inventory movements`);
  console.log('✅ Inventory seeded successfully\n');
}


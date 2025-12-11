/**
 * Tests de Integración E2E - Flujo de Asignación de Driver
 * 
 * Prueba el flujo completo desde el endpoint HTTP hasta la base de datos
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../../../../app';
import { createTestTenant, createTestUser, cleanupTestData, prisma } from '../../../../../tests/helpers/test-helpers';
import { generateAccessToken } from '../../../../../shared/utils/jwt.util';
import { faker } from '@faker-js/faker';
import { UserRole } from '../../../../../shared/constants/permissions';

describe('Assign Driver E2E Tests', () => {
  let testTenant: { id: string; slug: string };
  let saasAdminUser: { id: string; email: string; role: string };
  let logisticsProvider: { id: string };
  let driverUser: { id: string; email: string };
  let driver: { id: string; user_id: string; logistics_provider_id: string };
  let vehicle: { id: string; logistics_provider_id: string; vehicle_type: string };
  let order: { id: string; tenant_id: string; order_number: bigint; order_display_number: string; status: string };
  let saasAdminToken: string;
  let orderCounter: { id: string; tenant_id: string };

  beforeAll(async () => {
    // Crear tenant de prueba
    testTenant = await createTestTenant({
      slug: 'test-tenant-e2e',
      name: 'Test Tenant E2E',
      type: 'ON_DEMAND',
    });

    // Crear order counter para el tenant
    orderCounter = await prisma.orderCounter.create({
      data: {
        tenant_id: testTenant.id,
        prefix: 'ORD',
        current_number: 0,
      },
    });

    // Crear usuario SAAS_ADMIN
    saasAdminUser = await createTestUser({
      tenant_id: testTenant.id,
      email: 'saas-admin@test.com',
      role: UserRole.SAAS_ADMIN,
    });

    // Generar token JWT para SAAS_ADMIN
    saasAdminToken = generateAccessToken({
      sub: saasAdminUser.id,
      client_id: 'internal',
      scope: 'read write',
    });

    // Crear logistics provider
    logisticsProvider = await prisma.logisticsProvider.create({
      data: {
        tenant_id: testTenant.id,
        name: 'Test Logistics Provider',
        tax_id: 'TAX123',
        representative_name: 'Test Rep',
        representative_phone: '+1234567890',
        representative_document: 'DOC123',
        verification_status: 'VERIFIED',
        status: 'ACTIVE',
      },
    });

    // Crear vehículo
    vehicle = await prisma.vehicle.create({
      data: {
        logistics_provider_id: logisticsProvider.id,
        vehicle_type: 'SEDAN',
        license_plate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'White',
        status: 'ACTIVE',
      },
    });

    // Crear usuario driver
    driverUser = await createTestUser({
      tenant_id: null, // Drivers no tienen tenant_id
      email: 'driver@test.com',
      role: UserRole.DRIVER,
    });

    // Actualizar usuario driver con logistics_provider_id
    await prisma.user.update({
      where: { id: driverUser.id },
      data: { logistics_provider_id: logisticsProvider.id },
    });

    // Crear driver
    driver = await prisma.driver.create({
      data: {
        logistics_provider_id: logisticsProvider.id,
        user_id: driverUser.id,
        identity_document: 'DOC123',
        driving_license: 'LIC123',
        date_of_birth: new Date('1990-01-01'),
        availability_status: 'AVAILABLE',
        work_type: 'FULL_TIME',
        vehicle_id: vehicle.id,
      },
    });

    // Crear orden
    const orderNumber = await prisma.orderCounter.update({
      where: { id: orderCounter.id },
      data: { current_number: { increment: 1 } },
      select: { current_number: true },
    });

    order = await prisma.order.create({
      data: {
        tenant_id: testTenant.id,
        order_number: BigInt(orderNumber.current_number),
        order_display_number: `ORD-${String(orderNumber.current_number).padStart(4, '0')}`,
        order_type: 'ON_DEMAND',
        customer_snapshot: {
          name: 'Test Customer',
          email: 'customer@test.com',
        },
        delivery_address: {
          street: '123 Test St',
          city: 'Test City',
        },
        delivery_lat: 10.0,
        delivery_lng: 20.0,
        estimated_delivery_at: new Date(),
        status: 'PENDING',
        priority: 'NORMAL',
        cargo_size: 'MEDIUM',
      },
    });

    // Asignar logistics provider a la orden (requisito previo)
    await prisma.orderDriver.create({
      data: {
        order_id: order.id,
        logistics_provider_id: logisticsProvider.id,
        assigned_at: new Date(),
        is_current: true,
        driver_snapshot: {},
      },
    });
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/orders/:id/assign-driver', () => {
    it('should successfully assign driver to order as SAAS_ADMIN', async () => {
      const response = await request(app)
        .post(`/api/v1/orders/${order.id}/assign-driver`)
        .set('Authorization', `Bearer ${saasAdminToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Driver assigned successfully',
      });

      // Verificar en la base de datos que se creó el order_drivers
      const orderDriver = await prisma.orderDriver.findFirst({
        where: {
          order_id: order.id,
          driver_id: driver.id,
          is_current: true,
        },
      });

      expect(orderDriver).toBeDefined();
      expect(orderDriver?.driver_id).toBe(driver.id);
      expect(orderDriver?.logistics_provider_id).toBe(logisticsProvider.id);
      expect(orderDriver?.is_current).toBe(true);

      // Verificar que la orden cambió a ASSIGNED
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });

      expect(updatedOrder?.status).toBe('ASSIGNED');

      // Verificar que se creó OrderStatusHistory
      const statusHistory = await prisma.orderStatusHistory.findFirst({
        where: {
          order_id: order.id,
          to_status: 'ASSIGNED',
        },
      });

      expect(statusHistory).toBeDefined();
      expect(statusHistory?.from_status).toBe('PENDING');
      expect(statusHistory?.to_status).toBe('ASSIGNED');
    });

    it('should return 404 if order does not exist', async () => {
      const nonExistentOrderId = faker.string.uuid();

      const response = await request(app)
        .post(`/api/v1/orders/${nonExistentOrderId}/assign-driver`)
        .set('Authorization', `Bearer ${saasAdminToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Order not found',
      });
    });

    it('should return 404 if driver does not exist', async () => {
      const nonExistentDriverId = faker.string.uuid();

      const response = await request(app)
        .post(`/api/v1/orders/${order.id}/assign-driver`)
        .set('Authorization', `Bearer ${saasAdminToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: nonExistentDriverId,
        })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Driver not found',
      });
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post(`/api/v1/orders/${order.id}/assign-driver`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 if driver is not available', async () => {
      // Marcar driver como BUSY
      await prisma.driver.update({
        where: { id: driver.id },
        data: { availability_status: 'BUSY' },
      });

      const response = await request(app)
        .post(`/api/v1/orders/${order.id}/assign-driver`)
        .set('Authorization', `Bearer ${saasAdminToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Driver is not available',
      });

      // Restaurar driver a AVAILABLE para otros tests
      await prisma.driver.update({
        where: { id: driver.id },
        data: { availability_status: 'AVAILABLE' },
      });
    });

    it('should return 400 if order is not assigned to LOGISTICS_PROVIDER first', async () => {
      // Crear una nueva orden sin logistics provider asignado
      const orderNumber2 = await prisma.orderCounter.update({
        where: { id: orderCounter.id },
        data: { current_number: { increment: 1 } },
        select: { current_number: true },
      });

      const orderWithoutProvider = await prisma.order.create({
        data: {
          tenant_id: testTenant.id,
          order_number: BigInt(orderNumber2.current_number),
          order_display_number: `ORD-${String(orderNumber2.current_number).padStart(4, '0')}`,
          order_type: 'ON_DEMAND',
          customer_snapshot: {},
          delivery_address: {},
          delivery_lat: 10.0,
          delivery_lng: 20.0,
          estimated_delivery_at: new Date(),
          status: 'PENDING',
          priority: 'NORMAL',
          cargo_size: 'MEDIUM',
        },
      });

      const response = await request(app)
        .post(`/api/v1/orders/${orderWithoutProvider.id}/assign-driver`)
        .set('Authorization', `Bearer ${saasAdminToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Order must be assigned to a LOGISTICS_PROVIDER before assigning a driver',
      });

      // Limpiar orden de prueba
      await prisma.order.delete({
        where: { id: orderWithoutProvider.id },
      });
    });

    it('should follow immutable pattern - create new order_drivers record', async () => {
      // Primero asignar el driver (ya está asignado en beforeAll, pero vamos a crear otro registro)
      // Primero desasignar el driver actual
      await prisma.orderDriver.updateMany({
        where: {
          order_id: order.id,
          is_current: true,
        },
        data: {
          is_current: false,
          unassigned_at: new Date(),
        },
      });

      // Crear nueva asignación
      const response = await request(app)
        .post(`/api/v1/orders/${order.id}/assign-driver`)
        .set('Authorization', `Bearer ${saasAdminToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(200);

      expect(response.body.status).toBe('success');

      // Verificar que hay múltiples registros de order_drivers (historial)
      const allOrderDrivers = await prisma.orderDriver.findMany({
        where: {
          order_id: order.id,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      expect(allOrderDrivers.length).toBeGreaterThan(1);
      
      // Solo uno debe estar marcado como is_current = true
      const currentDrivers = allOrderDrivers.filter((od) => od.is_current === true);
      expect(currentDrivers).toHaveLength(1);
    });

    it('should return 400 if user role cannot assign drivers', async () => {
      // Crear usuario con rol que no puede asignar drivers
      const merchantUser = await createTestUser({
        tenant_id: testTenant.id,
        email: 'merchant@test.com',
        role: UserRole.MERCHANT_USER,
      });

      const merchantToken = generateAccessToken({
        sub: merchantUser.id,
        client_id: 'internal',
        scope: 'read write',
      });

      const response = await request(app)
        .post(`/api/v1/orders/${order.id}/assign-driver`)
        .set('Authorization', `Bearer ${merchantToken}`)
        .set('X-Tenant-Id', testTenant.id)
        .send({
          driver_id: driver.id,
        })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: expect.stringContaining('cannot assign drivers'),
      });

      // Limpiar usuario de prueba
      await prisma.user.delete({
        where: { id: merchantUser.id },
      });
    });
  });
});


/**
 * Routes para Vehicles
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { VehicleController } from '../controllers/VehicleController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<VehicleController>(TYPES.VehicleController);

/**
 * @swagger
 * /api/v1/vehicles:
 *   get:
 *     summary: Listar vehículos
 *     description: Obtiene la lista de vehículos del tenant actual
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('vehicles', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/vehicles/{id}:
 *   get:
 *     summary: Obtener vehículo por ID
 *     description: Obtiene los detalles de un vehículo específico
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehículo encontrado
 *       404:
 *         description: Vehículo no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('vehicles', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/vehicles:
 *   post:
 *     summary: Crear nuevo vehículo
 *     description: Crea un nuevo vehículo en el sistema
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_type
 *               - license_plate
 *               - brand
 *               - model
 *               - year
 *               - color
 *               - insurance_policy
 *               - insurance_expires_at
 *             properties:
 *               logistics_provider_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del proveedor logístico (opcional)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               driver_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del conductor asignado (opcional)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               vehicle_type:
 *                 type: string
 *                 enum: [MOTORCYCLE, SEDAN, MINI_VAN, PANEL, TRUCK, PICKUP]
 *                 description: Tipo de vehículo
 *                 example: SEDAN
 *               license_plate:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 description: Placa del vehículo
 *                 example: "ABC-123"
 *               brand:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Marca del vehículo
 *                 example: Toyota
 *               model:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Modelo del vehículo
 *                 example: Corolla
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2100
 *                 description: Año del vehículo
 *                 example: 2020
 *               color:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Color del vehículo
 *                 example: "Blanco"
 *               insurance_policy:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Número de póliza de seguro
 *                 example: "POL-123456"
 *               insurance_expires_at:
 *                 type: string
 *                 format: date
 *                 description: Fecha de expiración del seguro
 *                 example: "2025-12-31"
 *               last_maintenance_at:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha del último mantenimiento (opcional)
 *                 example: "2024-01-15"
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, IN_SERVICE, MAINTENANCE, OUT_OF_SERVICE]
 *                 default: AVAILABLE
 *                 description: Estado del vehículo (opcional)
 *                 example: AVAILABLE
 *               specifications:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *                 description: Especificaciones adicionales del vehículo (opcional)
 *                 example:
 *                   fuel_type: "Gasolina"
 *                   capacity_kg: 500
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('vehicles', 'create'),
  requireTenantType(['ON_DEMAND', 'HYBRID']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/vehicles/{id}:
 *   patch:
 *     summary: Actualizar vehículo
 *     description: Actualiza completamente un vehículo existente
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plate_number:
 *                 type: string
 *               vehicle_type:
 *                 type: string
 *                 enum: [MOTORCYCLE, CAR, VAN, TRUCK]
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Vehículo no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('vehicles', 'update'),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/vehicles/{id}:
 *   delete:
 *     summary: Eliminar vehículo
 *     description: Elimina un vehículo del sistema
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente
 *       404:
 *         description: Vehículo no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('vehicles', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;

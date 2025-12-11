/**
 * Routes para Drivers
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { DriverController } from '../controllers/DriverController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<DriverController>(TYPES.DriverController);

/**
 * @swagger
 * /api/v1/drivers:
 *   get:
 *     summary: Listar conductores
 *     description: Obtiene la lista de conductores del tenant actual
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conductores
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('drivers', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/drivers/me:
 *   get:
 *     summary: Obtener perfil del conductor actual
 *     description: Obtiene el perfil completo del conductor autenticado, incluyendo datos del usuario y vehículo
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del conductor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     logistics_provider_id:
 *                       type: string
 *                       format: uuid
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                     vehicle:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         vehicle_type:
 *                           type: string
 *                         license_plate:
 *                           type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo conductores pueden acceder
 *       404:
 *         description: Perfil de conductor no encontrado
 */
router.get(
  '/me',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.getMe(req, res)
);

/**
 * @swagger
 * /api/v1/drivers/{id}:
 *   get:
 *     summary: Obtener conductor por ID
 *     description: Obtiene los detalles de un conductor específico
 *     tags: [Drivers]
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
 *         description: Conductor encontrado
 *       404:
 *         description: Conductor no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('drivers', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/drivers:
 *   post:
 *     summary: Crear nuevo conductor
 *     description: Crea un nuevo conductor en el sistema. Requiere un usuario existente y un proveedor logístico.
 *     tags: [Drivers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - logistics_provider_id
 *               - user_id
 *               - identity_document
 *               - driving_license
 *               - date_of_birth
 *               - emergency_contact
 *               - has_own_vehicle
 *               - work_type
 *               - documents
 *             properties:
 *               logistics_provider_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del proveedor logístico
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del usuario asociado al conductor
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               identity_document:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Número de documento de identidad
 *                 example: "12345678"
 *               driving_license:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Número de licencia de conducir
 *                 example: "LICENSE123"
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Fecha de nacimiento del conductor
 *                 example: "1990-01-15"
 *               emergency_contact:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Información de contacto de emergencia (objeto flexible)
 *                 example:
 *                   name: "María Pérez"
 *                   phone: "+1234567890"
 *                   relationship: "Esposa"
 *               has_own_vehicle:
 *                 type: boolean
 *                 description: Indica si el conductor tiene su propio vehículo
 *                 example: true
 *               vehicle_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del vehículo asignado (opcional, requerido si has_own_vehicle es false)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               work_type:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, FREELANCE]
 *                 description: Tipo de trabajo del conductor
 *                 example: FULL_TIME
 *               work_zone:
 *                 type: string
 *                 nullable: true
 *                 description: Zona de trabajo del conductor (opcional)
 *                 example: "Zona Centro"
 *               availability_status:
 *                 type: string
 *                 enum: [AVAILABLE, BUSY, OFFLINE, SUSPENDED]
 *                 default: AVAILABLE
 *                 description: Estado de disponibilidad del conductor (opcional)
 *                 example: AVAILABLE
 *               documents:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Documentos del conductor (objeto flexible con metadata)
 *                 example:
 *                   insurance: "POLICY123"
 *                   registration: "REG456"
 *     responses:
 *       201:
 *         description: Conductor creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('drivers', 'create'),
  requireTenantType(['ON_DEMAND', 'HYBRID']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/drivers/{id}:
 *   patch:
 *     summary: Actualizar conductor
 *     description: Actualiza completamente un conductor existente
 *     tags: [Drivers]
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               license_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conductor actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Conductor no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('drivers', 'update'),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/drivers/{id}:
 *   delete:
 *     summary: Eliminar conductor
 *     description: Elimina un conductor del sistema
 *     tags: [Drivers]
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
 *         description: Conductor eliminado exitosamente
 *       404:
 *         description: Conductor no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('drivers', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;

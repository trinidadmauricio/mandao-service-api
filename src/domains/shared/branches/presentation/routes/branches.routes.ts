/**
 * Routes para Branches
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { BranchController } from '../controllers/BranchController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';

const router = Router();

// Obtener controller del container
const branchController = container.get<BranchController>(TYPES.BranchController);

/**
 * @swagger
 * /api/v1/branches:
 *   get:
 *     summary: Listar sucursales
 *     description: Obtiene la lista de sucursales del tenant actual
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       address:
 *                         type: string
 *                       phone:
 *                         type: string
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('branches', 'read'),
  (req, res) => branchController.list(req, res)
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   get:
 *     summary: Obtener sucursal por ID
 *     description: Obtiene los detalles de una sucursal específica
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal encontrada
 *       404:
 *         description: Sucursal no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('branches', 'read'),
  (req, res) => branchController.getById(req, res)
);

/**
 * @swagger
 * /api/v1/branches:
 *   post:
 *     summary: Crear nueva sucursal
 *     description: Crea una nueva sucursal en el tenant actual. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenant_id
 *               - name
 *               - address
 *               - gps_lat
 *               - gps_lng
 *               - contact_phone
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre de la sucursal
 *                 example: Sucursal Centro
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Dirección completa de la sucursal
 *                 example: Calle Principal 123, Ciudad, País
 *               gps_lat:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitud GPS de la sucursal
 *                 example: 19.432608
 *               gps_lng:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitud GPS de la sucursal
 *                 example: -99.133209
 *               contact_phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 description: Teléfono de contacto de la sucursal
 *                 example: "+1234567890"
 *               is_main:
 *                 type: boolean
 *                 default: false
 *                 description: Indica si es la sucursal principal (opcional)
 *                 example: false
 *               operating_hours:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *                 description: Horarios de operación de la sucursal (opcional, formato flexible)
 *                 example:
 *                   monday:
 *                     open: "09:00"
 *                     close: "18:00"
 *                   tuesday:
 *                     open: "09:00"
 *                     close: "18:00"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *                 description: Estado de la sucursal (opcional, por defecto ACTIVE)
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
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
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     gps_lat:
 *                       type: number
 *                     gps_lng:
 *                       type: number
 *                     contact_phone:
 *                       type: string
 *                     is_main:
 *                       type: boolean
 *                     status:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('branches', 'create'),
  (req, res) => branchController.create(req, res)
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   patch:
 *     summary: Actualizar sucursal
 *     description: Actualiza los datos de una sucursal existente. Todos los campos son opcionales.
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre de la sucursal
 *                 example: Sucursal Centro Actualizada
 *               address:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Dirección completa de la sucursal
 *                 example: Nueva Calle 456, Ciudad, País
 *               gps_lat:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Latitud GPS de la sucursal
 *                 example: 19.432608
 *               gps_lng:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Longitud GPS de la sucursal
 *                 example: -99.133209
 *               contact_phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 description: Teléfono de contacto de la sucursal
 *                 example: "+1234567890"
 *               is_main:
 *                 type: boolean
 *                 description: Indica si es la sucursal principal
 *                 example: false
 *               operating_hours:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *                 description: Horarios de operación de la sucursal
 *                 example:
 *                   monday:
 *                     open: "09:00"
 *                     close: "18:00"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 description: Estado de la sucursal
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
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
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     gps_lat:
 *                       type: number
 *                     gps_lng:
 *                       type: number
 *                     contact_phone:
 *                       type: string
 *                     is_main:
 *                       type: boolean
 *                     status:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Sucursal no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('branches', 'update'),
  (req, res) => branchController.update(req, res)
);

/**
 * @swagger
 * /api/v1/branches/{id}:
 *   delete:
 *     summary: Eliminar sucursal
 *     description: Elimina una sucursal del tenant actual
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
 *       404:
 *         description: Sucursal no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('branches', 'delete'),
  (req, res) => branchController.delete(req, res)
);

export default router;

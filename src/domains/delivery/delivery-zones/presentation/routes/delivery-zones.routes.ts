/**
 * Routes para DeliveryZones
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { DeliveryZoneController } from '../controllers/DeliveryZoneController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<DeliveryZoneController>(TYPES.DeliveryZoneController);

/**
 * @swagger
 * /api/v1/delivery-zones:
 *   get:
 *     summary: Listar zonas de entrega
 *     description: Obtiene la lista de zonas de entrega del tenant actual
 *     tags: [Delivery Zones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de zonas de entrega
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-zones', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-zones/{id}:
 *   get:
 *     summary: Obtener zona de entrega por ID
 *     description: Obtiene los detalles de una zona de entrega específica
 *     tags: [Delivery Zones]
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
 *         description: Zona de entrega encontrada
 *       404:
 *         description: Zona de entrega no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-zones', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-zones:
 *   post:
 *     summary: Crear nueva zona de entrega
 *     description: Crea una nueva zona de entrega. El tenant_id se obtiene automáticamente del tenant de la sesión. El boundary debe ser un string WKT (Well-Known Text) de PostGIS.
 *     tags: [Delivery Zones]
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
 *               - boundary
 *               - base_rate
 *               - rate_per_km
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
 *                 description: Nombre de la zona de entrega
 *                 example: Zona Centro
 *               boundary:
 *                 type: string
 *                 minLength: 1
 *                 description: Límite geográfico de la zona en formato WKT (Well-Known Text) de PostGIS
 *                 example: "POLYGON((-58.3816 -34.6037, -58.3826 -34.6047, -58.3836 -34.6057, -58.3816 -34.6037))"
 *               base_rate:
 *                 type: number
 *                 minimum: 0
 *                 description: Tarifa base de entrega en la zona
 *                 example: 5.00
 *               rate_per_km:
 *                 type: number
 *                 minimum: 0
 *                 description: Tarifa por kilómetro adicional
 *                 example: 1.50
 *               surge_multiplier:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Multiplicador de tarifa dinámica (surge pricing) (opcional)
 *                 example: 1.5
 *               currency:
 *                 type: string
 *                 length: 3
 *                 description: Código de moneda (ISO 4217, 3 caracteres) (opcional, usa la del tenant por defecto)
 *                 example: USD
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si la zona está activa (opcional)
 *                 example: true
 *     responses:
 *       201:
 *         description: Zona de entrega creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-zones', 'create'),
  requireTenantType(['ON_DEMAND', 'HYBRID']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-zones/{id}:
 *   patch:
 *     summary: Actualizar zona de entrega
 *     description: Actualiza completamente una zona de entrega existente
 *     tags: [Delivery Zones]
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
 *               name:
 *                 type: string
 *               polygon:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Zona de entrega actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Zona de entrega no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-zones', 'update'),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-zones/{id}:
 *   delete:
 *     summary: Eliminar zona de entrega
 *     description: Elimina una zona de entrega del sistema
 *     tags: [Delivery Zones]
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
 *         description: Zona de entrega eliminada exitosamente
 *       404:
 *         description: Zona de entrega no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-zones', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;

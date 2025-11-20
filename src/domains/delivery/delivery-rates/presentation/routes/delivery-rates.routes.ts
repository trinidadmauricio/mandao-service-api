/**
 * Routes para DeliveryRates
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { DeliveryRateController } from '../controllers/DeliveryRateController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<DeliveryRateController>(TYPES.DeliveryRateController);

/**
 * @swagger
 * /api/v1/delivery-rates:
 *   get:
 *     summary: Listar tarifas de entrega
 *     description: Obtiene la lista de tarifas de entrega del tenant actual
 *     tags: [Delivery Rates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: zone_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por zona de entrega
 *     responses:
 *       200:
 *         description: Lista de tarifas de entrega
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-rates', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-rates/{id}:
 *   get:
 *     summary: Obtener tarifa de entrega por ID
 *     description: Obtiene los detalles de una tarifa de entrega específica
 *     tags: [Delivery Rates]
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
 *         description: Tarifa de entrega encontrada
 *       404:
 *         description: Tarifa de entrega no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-rates', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-rates:
 *   post:
 *     summary: Crear nueva tarifa de entrega
 *     description: Crea una nueva tarifa de entrega. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Delivery Rates]
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
 *               - vehicle_type
 *               - distance_km_min
 *               - distance_km_max
 *               - base_price
 *               - price_per_km
 *               - priority_multiplier
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               zone_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID de la zona de entrega (opcional, si no se especifica aplica a todas las zonas)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               vehicle_type:
 *                 type: string
 *                 enum: [MOTORCYCLE, SEDAN, MINI_VAN, PANEL, TRUCK, PICKUP]
 *                 description: Tipo de vehículo para esta tarifa
 *                 example: MOTORCYCLE
 *               distance_km_min:
 *                 type: number
 *                 minimum: 0
 *                 description: Distancia mínima en kilómetros para aplicar esta tarifa
 *                 example: 0
 *               distance_km_max:
 *                 type: number
 *                 minimum: 0
 *                 description: Distancia máxima en kilómetros para aplicar esta tarifa
 *                 example: 5
 *               base_price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio base de la tarifa
 *                 example: 5.00
 *               price_per_km:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio por kilómetro adicional
 *                 example: 1.50
 *               currency:
 *                 type: string
 *                 length: 3
 *                 description: Código de moneda (ISO 4217, 3 caracteres) (opcional, usa la del tenant por defecto)
 *                 example: USD
 *               priority_multiplier:
 *                 type: object
 *                 additionalProperties:
 *                   type: number
 *                 description: Multiplicadores de precio por nivel de prioridad (objeto con claves como "NORMAL", "EXPRESS", etc.)
 *                 example:
 *                   NORMAL: 1.0
 *                   EXPRESS: 1.5
 *                   URGENT: 2.0
 *     responses:
 *       201:
 *         description: Tarifa de entrega creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-rates', 'create'),
  requireTenantType(['ON_DEMAND', 'HYBRID']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-rates/{id}:
 *   patch:
 *     summary: Actualizar tarifa de entrega
 *     description: Actualiza completamente una tarifa de entrega existente
 *     tags: [Delivery Rates]
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
 *               base_price:
 *                 type: number
 *               currency:
 *                 type: string
 *               price_per_km:
 *                 type: number
 *               min_order_value:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tarifa de entrega actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Tarifa de entrega no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-rates', 'update'),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/delivery-rates/{id}:
 *   delete:
 *     summary: Eliminar tarifa de entrega
 *     description: Elimina una tarifa de entrega del sistema
 *     tags: [Delivery Rates]
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
 *         description: Tarifa de entrega eliminada exitosamente
 *       404:
 *         description: Tarifa de entrega no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('delivery-rates', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;

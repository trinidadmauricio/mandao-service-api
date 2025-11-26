/**
 * Routes para Orders
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { OrderController } from '../controllers/OrderController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<OrderController>(TYPES.OrderController);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Listar órdenes
 *     description: Obtiene la lista de órdenes del tenant actual con filtros opcionales y paginación
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por número de orden, tracking code o order number
 *         example: SHIP-00284
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PENDING, CONFIRMED, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED, FAILED]
 *         description: Filtrar por estado de orden
 *         example: PENDING
 *       - in: query
 *         name: order_type
 *         schema:
 *           type: string
 *           enum: [RETAIL, ON_DEMAND]
 *         description: Filtrar por tipo de orden
 *         example: RETAIL
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID del driver asignado
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de la sucursal
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar por rango de fechas
 *         example: 2025-01-01
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar por rango de fechas
 *         example: 2025-12-31
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Número de página (default: 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Cantidad de resultados por página (default: 10, max: 100)
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de órdenes con paginación
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
 *                 total:
 *                   type: integer
 *                   description: Total de órdenes que coinciden con los filtros
 *                   example: 100
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   description: Cantidad de resultados por página
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 *                   example: 10
 *       400:
 *         description: Parámetros de filtro inválidos
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     description: Obtiene los detalles de una orden específica
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada
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
 *                     order_number:
 *                       type: string
 *                     order_display_number:
 *                       type: string
 *                     tracking_code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     order_type:
 *                       type: string
 *                       enum: [RETAIL, ON_DEMAND]
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Crear orden on-demand
 *     description: Crea una nueva orden de tipo ON_DEMAND (last-mile delivery sin catálogo)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customer_snapshot
 *               - delivery_address
 *               - items
 *               - estimated_delivery_at
 *             properties:
 *               customer_snapshot:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phone
 *                 properties:
 *                   name:
 *                     type: string
 *                     minLength: 1
 *                   email:
 *                     type: string
 *                     format: email
 *                   phone:
 *                     type: string
 *                     minLength: 1
 *               delivery_address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - country
 *                   - lat
 *                   - lng
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *                   country:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               pickup_address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *                   country:
 *                     type: string
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_snapshot
 *                     - quantity
 *                     - unit_price
 *                   properties:
 *                     product_snapshot:
 *                       type: object
 *                       required:
 *                         - name
 *                         - price
 *                         - currency
 *                     quantity:
 *                       type: number
 *                       minimum: 0.001
 *                     unit_price:
 *                       type: number
 *                       minimum: 0
 *                     notes:
 *                       type: string
 *               special_instructions:
 *                 type: string
 *               scheduled_pickup_at:
 *                 type: string
 *                 format: date-time
 *               estimated_delivery_at:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [NORMAL, URGENT]
 *                 default: NORMAL
 *               cargo_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
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
 *                     order:
 *                       type: object
 *                     order_number:
 *                       type: string
 *                     order_display_number:
 *                       type: string
 *                     tracking_code:
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
  requirePermission('orders', 'create'),
  requireTenantType(['ON_DEMAND', 'HYBRID']),
  (req, res) => controller.createOnDemand(req, res)
);

/**
 * @swagger
 * /api/v1/orders/retail:
 *   post:
 *     summary: Crear orden retail
 *     description: Crea una nueva orden de tipo RETAIL (con productos del catálogo)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - customer_snapshot
 *               - delivery_address
 *               - branch_id
 *               - estimated_delivery_at
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                     variant_id:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               customer_snapshot:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phone
 *               delivery_address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - country
 *                   - lat
 *                   - lng
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *               estimated_delivery_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Orden retail creada exitosamente
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
 *                     order_id:
 *                       type: string
 *                       format: uuid
 *                     order_number:
 *                       type: string
 *                     order_display_number:
 *                       type: string
 *                     tracking_code:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/retail',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'create'),
  requireTenantType(['RETAIL', 'HYBRID']),
  (req, res) => controller.createRetail(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   patch:
 *     summary: Actualizar estado de orden
 *     description: Actualiza el estado de una orden. Valida transiciones de estado usando OrderStateMachine.
 *     tags: [Orders]
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
 *             required:
 *               - to_status
 *             properties:
 *               to_status:
 *                 type: string
 *                 enum: [DRAFT, PENDING, CONFIRMED, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED, FAILED]
 *               notes:
 *                 type: string
 *               cancellation_reason:
 *                 type: string
 *                 description: Requerido si to_status es CANCELLED
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *       400:
 *         description: Error de validación o transición inválida
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'update'),
  (req, res) => controller.updateStatus(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/assign-driver:
 *   post:
 *     summary: Asignar driver a orden
 *     description: Asigna un driver a una orden. Sigue patrón inmutable (INSERT nuevo order_drivers).
 *     tags: [Orders]
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
 *             required:
 *               - driver_id
 *             properties:
 *               driver_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Driver asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Driver assigned successfully
 *       400:
 *         description: Error de validación o driver no disponible
 *       404:
 *         description: Orden o driver no encontrado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/assign-driver',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.assignDriver(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/assign-logistics-provider:
 *   post:
 *     summary: Asignar LOGISTICS_PROVIDER a orden
 *     description: Asigna un LOGISTICS_PROVIDER a una orden. Solo SAAS roles pueden realizar esta acción.
 *     tags: [Orders]
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
 *             required:
 *               - logistics_provider_id
 *             properties:
 *               logistics_provider_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: LOGISTICS_PROVIDER asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logistics provider assigned successfully
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado (solo SAAS roles)
 *       404:
 *         description: Orden o LOGISTICS_PROVIDER no encontrado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/assign-logistics-provider',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.assignLogisticsProvider(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/mark-as-automatic:
 *   post:
 *     summary: Marcar orden como automática
 *     description: Marca una orden para asignación automática de driver. Solo LOGISTICS_PROVIDER o SUPERVISOR pueden realizar esta acción.
 *     tags: [Orders]
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
 *         description: Orden marcada como automática exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Order marked as automatic successfully
 *       400:
 *         description: Error de validación
 *       403:
 *         description: No autorizado (solo LOGISTICS_PROVIDER o SUPERVISOR)
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/mark-as-automatic',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.markAsAutomatic(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/change-branch:
 *   post:
 *     summary: Cambiar branch de orden
 *     description: Cambia el branch asignado a una orden. Sigue patrón inmutable (INSERT nuevo order_branches).
 *     tags: [Orders]
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
 *             required:
 *               - branch_id
 *             properties:
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Branch cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Branch changed successfully
 *       400:
 *         description: Error de validación o branch inactivo
 *       404:
 *         description: Orden o branch no encontrado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/change-branch',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.changeBranch(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/modify-items:
 *   post:
 *     summary: Modificar items de orden
 *     description: Modifica los items de una orden. Sigue patrón inmutable (INSERT todos los items de nueva versión).
 *     tags: [Orders]
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
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_snapshot
 *                     - quantity
 *                     - unit_price
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     variant_id:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     product_snapshot:
 *                       type: object
 *                     quantity:
 *                       type: number
 *                       minimum: 0.001
 *                     unit_price:
 *                       type: number
 *                       minimum: 0
 *                     notes:
 *                       type: string
 *     responses:
 *       200:
 *         description: Items modificados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Items modified successfully
 *       400:
 *         description: Error de validación o orden completada
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/modify-items',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.modifyItems(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     summary: Cancelar orden
 *     description: Cancela una orden. Valida que la orden puede ser cancelada según OrderStateMachine.
 *     tags: [Orders]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellation_reason:
 *                 type: string
 *                 description: Razón de cancelación (opcional)
 *     responses:
 *       200:
 *         description: Orden cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Order cancelled successfully
 *       400:
 *         description: Error de validación o orden no puede ser cancelada
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/cancel',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'delete'),
  (req, res) => controller.cancel(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/recalculate-totals:
 *   post:
 *     summary: Recalcular totales de orden
 *     description: Recalcula los totales de una orden. Sigue patrón inmutable (INSERT nuevo order_summary_totals).
 *     tags: [Orders]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tax_rate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               discount_amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Totales recalculados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Totals recalculated successfully
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/recalculate-totals',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.recalculateTotals(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/delivery-proof:
 *   post:
 *     summary: Agregar prueba de entrega
 *     description: Agrega prueba de entrega (fotos, firmas, códigos) a una orden entregada o en tránsito.
 *     tags: [Orders]
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
 *             required:
 *               - proof_type
 *               - proof_data
 *               - delivered_to_name
 *               - delivered_at
 *             properties:
 *               proof_type:
 *                 type: string
 *                 enum: [SIGNATURE, PHOTO, CODE, NONE]
 *               proof_data:
 *                 type: object
 *                 additionalProperties: true
 *               delivered_to_name:
 *                 type: string
 *                 minLength: 1
 *               delivered_at:
 *                 type: string
 *                 format: date-time
 *               driver_notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prueba de entrega agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Delivery proof added successfully
 *       400:
 *         description: Error de validación o orden no en estado válido
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/delivery-proof',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'manage'),
  (req, res) => controller.addDeliveryProof(req, res)
);

/**
 * @swagger
 * /api/v1/orders/{id}/rating:
 *   post:
 *     summary: Agregar rating de entrega
 *     description: Agrega calificación de la entrega por parte del cliente. Solo disponible para órdenes entregadas.
 *     tags: [Orders]
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
 *             required:
 *               - customer_rating
 *             properties:
 *               customer_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               driver_rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               customer_comment:
 *                 type: string
 *               driver_comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Delivery rating added successfully
 *       400:
 *         description: Error de validación o orden no entregada
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/:id/rating',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('orders', 'update'),
  (req, res) => controller.addDeliveryRating(req, res)
);

export default router;


/**
 * Routes para OrderCounters
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { OrderCounterController } from '../controllers/OrderCounterController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';

const router = Router();

// Obtener controller del container
const orderCounterController = container.get<OrderCounterController>(TYPES.OrderCounterController);

/**
 * @swagger
 * /api/v1/order-counters/tenant/{tenant_id}:
 *   get:
 *     summary: Obtener contador de órdenes por tenant
 *     description: Obtiene el contador de órdenes para un tenant específico
 *     tags: [Order Counters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenant_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Contador de órdenes encontrado
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
 *                     tenant_id:
 *                       type: string
 *                       format: uuid
 *                     current_value:
 *                       type: integer
 *                     prefix:
 *                       type: string
 *                     padding_length:
 *                       type: integer
 *       404:
 *         description: Contador no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/tenant/:tenant_id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('order-counters', 'read'),
  (req, res) => orderCounterController.getByTenant(req, res)
);

/**
 * @swagger
 * /api/v1/order-counters:
 *   post:
 *     summary: Crear contador de órdenes
 *     description: Crea un nuevo contador de órdenes para un tenant. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Order Counters]
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
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               prefix:
 *                 type: string
 *                 maxLength: 10
 *                 nullable: true
 *                 description: 'Prefijo para los números de orden (opcional, ej: ORD, PO)'
 *                 example: "ORD"
 *               padding_length:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 6
 *                 description: 'Longitud del padding numérico (opcional, por defecto 6, ej: 000001)'
 *                 example: 6
 *     responses:
 *       201:
 *         description: Contador de órdenes creado exitosamente
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
 *                     tenant_id:
 *                       type: string
 *                       format: uuid
 *                     current_value:
 *                       type: integer
 *                     prefix:
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
  requirePermission('order-counters', 'create'),
  (req, res) => orderCounterController.create(req, res)
);

/**
 * @swagger
 * /api/v1/order-counters/tenant/{tenant_id}/increment:
 *   post:
 *     summary: Incrementar contador de órdenes
 *     description: Incrementa el contador de órdenes de un tenant y retorna el nuevo valor. Este endpoint se usa internamente al crear órdenes.
 *     tags: [Order Counters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenant_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Contador incrementado exitosamente
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
 *                     new_value:
 *                       type: integer
 *                       description: Nuevo valor del contador después del incremento
 *                       example: 1001
 *                     order_number:
 *                       type: string
 *                       description: Número de orden formateado (con prefijo y padding)
 *                       example: "ORD-0001001"
 *       404:
 *         description: Contador no encontrado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/tenant/:tenant_id/increment',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('order-counters', 'manage'),
  (req, res) => orderCounterController.increment(req, res)
);

/**
 * @swagger
 * /api/v1/order-counters/tenant/{tenant_id}:
 *   patch:
 *     summary: Actualizar contador de órdenes
 *     description: Actualiza el contador de órdenes de un tenant. Todos los campos son opcionales.
 *     tags: [Order Counters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenant_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               current_value:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nuevo valor del contador (opcional)
 *                 example: 1000
 *               prefix:
 *                 type: string
 *                 maxLength: 10
 *                 nullable: true
 *                 description: Prefijo para los números de orden (opcional)
 *                 example: "ORD"
 *               padding_length:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: Longitud del padding numérico (opcional)
 *                 example: 6
 *               reset:
 *                 type: boolean
 *                 description: Si es true, resetea el contador a 0 (opcional)
 *                 example: false
 *     responses:
 *       200:
 *         description: Contador actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Contador no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/tenant/:tenant_id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('order-counters', 'update'),
  (req, res) => orderCounterController.update(req, res)
);

export default router;

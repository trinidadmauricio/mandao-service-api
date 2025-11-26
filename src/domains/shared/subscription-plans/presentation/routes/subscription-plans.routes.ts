/**
 * Routes para SubscriptionPlans
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { SubscriptionPlanController } from '../controllers/SubscriptionPlanController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireSaasRole } from '../../../../../shared/middleware/require-saas-role.middleware';

const router = Router();

// Obtener controller del container
const subscriptionPlanController = container.get<SubscriptionPlanController>(
  TYPES.SubscriptionPlanController
);

/**
 * @swagger
 * /api/v1/subscription-plans:
 *   get:
 *     summary: Listar planes de suscripción
 *     description: Obtiene la lista de planes de suscripción disponibles
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planes de suscripción
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionPlanController.list(req, res)
);

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   get:
 *     summary: Obtener plan de suscripción por ID
 *     description: Obtiene los detalles de un plan de suscripción específico
 *     tags: [Subscription Plans]
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
 *         description: Plan de suscripción encontrado
 *       404:
 *         description: Plan no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionPlanController.getById(req, res)
);

/**
 * @swagger
 * /api/v1/subscription-plans:
 *   post:
 *     summary: Crear nuevo plan de suscripción
 *     description: Crea un nuevo plan de suscripción en el sistema
 *     tags: [Subscription Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - price_monthly
 *               - price_yearly
 *               - features
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del plan
 *                 example: Plan Básico
 *               type:
 *                 type: string
 *                 enum: [BASIC, PRO, ENTERPRISE, CUSTOM]
 *                 description: Tipo de plan
 *                 example: BASIC
 *               price_monthly:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio mensual del plan
 *                 example: 29.99
 *               price_yearly:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio anual del plan
 *                 example: 299.99
 *               features:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Características del plan (objeto flexible con metadata)
 *                 example:
 *                   max_products: 100
 *                   max_orders: 1000
 *                   support_level: "basic"
 *               max_products:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 description: Límite máximo de productos (opcional, null = ilimitado)
 *                 example: 100
 *               max_orders_month:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 description: Límite máximo de órdenes por mes (opcional, null = ilimitado)
 *                 example: 1000
 *               max_branches:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 description: Límite máximo de sucursales (opcional, null = ilimitado)
 *                 example: 5
 *     responses:
 *       201:
 *         description: Plan de suscripción creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionPlanController.create(req, res)
);

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   patch:
 *     summary: Actualizar plan de suscripción
 *     description: Actualiza parcialmente un plan de suscripción existente
 *     tags: [Subscription Plans]
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
 *               price_monthly:
 *                 type: number
 *               price_yearly:
 *                 type: number
 *               features:
 *                 type: object
 *               max_products:
 *                 type: integer
 *               max_orders_month:
 *                 type: integer
 *               max_branches:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Plan de suscripción actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Plan no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionPlanController.update(req, res)
);

/**
 * @swagger
 * /api/v1/subscription-plans/{id}:
 *   delete:
 *     summary: Eliminar plan de suscripción
 *     description: Elimina un plan de suscripción del sistema
 *     tags: [Subscription Plans]
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
 *         description: Plan de suscripción eliminado exitosamente
 *       404:
 *         description: Plan no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionPlanController.delete(req, res)
);

export default router;

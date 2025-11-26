/**
 * Routes para Suscripciones
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireSaasRole } from '../../../../../shared/middleware/require-saas-role.middleware';

const router = Router();

// Obtener controller del container
const subscriptionController = container.get<SubscriptionController>(TYPES.SubscriptionController);

/**
 * @swagger
 * /api/v1/subscriptions/change-plan:
 *   post:
 *     summary: Cambiar plan de suscripción
 *     description: Cambia el plan de suscripción del tenant actual
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_id
 *             properties:
 *               plan_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *     responses:
 *       200:
 *         description: Plan cambiado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Plan no encontrado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/change-plan',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionController.changePlan(req, res)
);

/**
 * @swagger
 * /api/v1/subscriptions/start-trial:
 *   post:
 *     summary: Iniciar período de prueba
 *     description: Inicia un período de prueba para el tenant actual
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan_id
 *               - trial_days
 *             properties:
 *               plan_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               trial_days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 30
 *                 example: 14
 *     responses:
 *       200:
 *         description: Período de prueba iniciado exitosamente
 *       400:
 *         description: Error de validación o trial ya iniciado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/start-trial',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionController.startTrial(req, res)
);

/**
 * @swagger
 * /api/v1/subscriptions/convert-trial:
 *   post:
 *     summary: Convertir trial a plan de pago
 *     description: Convierte un período de prueba activo a un plan de pago
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method_id
 *             properties:
 *               payment_method_id:
 *                 type: string
 *                 description: ID del método de pago en Stripe
 *                 example: pm_1234567890
 *     responses:
 *       200:
 *         description: Trial convertido a plan de pago exitosamente
 *       400:
 *         description: Error de validación o trial no activo
 *       401:
 *         description: No autenticado
 */
router.post(
  '/convert-trial',
  authMiddleware,
  requireSaasRole,
  (req, res) => subscriptionController.convertTrialToPaid(req, res)
);

/**
 * @swagger
 * /api/v1/subscriptions/limits:
 *   get:
 *     summary: Obtener límites de suscripción
 *     description: Obtiene los límites actuales del plan de suscripción del tenant
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Límites de suscripción
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
 *                     max_products:
 *                       type: integer
 *                     max_orders_month:
 *                       type: integer
 *                     max_branches:
 *                       type: integer
 *                     current_products:
 *                       type: integer
 *                     current_orders_month:
 *                       type: integer
 *                     current_branches:
 *                       type: integer
 *       401:
 *         description: No autenticado
 */
// GET /limits puede ser usado por OWNER para ver límites de su suscripción
// No requiere SAAS role, pero requiere tenant (validado en controller)
router.get(
  '/limits',
  authMiddleware,
  (req, res) => subscriptionController.getLimits(req, res)
);

export default router;

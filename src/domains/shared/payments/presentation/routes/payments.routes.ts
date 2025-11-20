/**
 * Routes para Payments
 */

import { Router } from 'express';
import express from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { PaymentController } from '../controllers/PaymentController';
import { StripeWebhookController } from '../controllers/StripeWebhookController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';

const router = Router();

// Obtener controllers del container
const paymentController = container.get<PaymentController>(TYPES.PaymentController);
const webhookController = container.get<StripeWebhookController>(TYPES.StripeWebhookController);

/**
 * @swagger
 * /api/v1/payments/webhooks/stripe:
 *   post:
 *     summary: Webhook de Stripe
 *     description: Endpoint para recibir eventos de webhook de Stripe. No requiere autenticación, pero valida la firma de Stripe.
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Evento de Stripe (estructura definida por Stripe)
 *     responses:
 *       200:
 *         description: Webhook procesado exitosamente
 *       400:
 *         description: Firma inválida o evento no reconocido
 */
router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  (req, res) => webhookController.handleWebhook(req, res)
);

/**
 * @swagger
 * /api/v1/payments/orders/{orderId}/payments:
 *   get:
 *     summary: Obtener pagos de una orden
 *     description: Obtiene todos los pagos asociados a una orden específica
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Lista de pagos de la orden
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
 *                       amount:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       status:
 *                         type: string
 *                       payment_method:
 *                         type: string
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.get('/orders/:orderId/payments', authMiddleware, (req, res) => paymentController.getByOrderId(req, res));

/**
 * @swagger
 * /api/v1/payments/transactions:
 *   post:
 *     summary: Crear transacción de pago
 *     description: Crea una nueva transacción de pago para una orden. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - transaction_type
 *               - payment_method
 *               - amount
 *               - currency
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la orden a la que se asocia el pago
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               transaction_type:
 *                 type: string
 *                 enum: [CHARGE, REFUND, AUTHORIZATION, CAPTURE]
 *                 description: Tipo de transacción
 *                 example: CHARGE
 *               payment_method:
 *                 type: string
 *                 enum: [CARD, CASH, TRANSFER, WALLET]
 *                 description: Método de pago utilizado
 *                 example: CARD
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto de la transacción
 *                 example: 100.50
 *               currency:
 *                 type: string
 *                 length: 3
 *                 description: Código de moneda (ISO 4217, 3 caracteres)
 *                 example: USD
 *               payment_intent_id:
 *                 type: string
 *                 nullable: true
 *                 description: ID del payment intent de Stripe (opcional, para pagos con Stripe)
 *                 example: "pi_1234567890"
 *               charge_id:
 *                 type: string
 *                 nullable: true
 *                 description: ID del cargo de Stripe (opcional, para pagos con Stripe)
 *                 example: "ch_1234567890"
 *               refund_id:
 *                 type: string
 *                 nullable: true
 *                 description: ID del reembolso de Stripe (opcional, para reembolsos)
 *                 example: "re_1234567890"
 *               card_last4:
 *                 type: string
 *                 nullable: true
 *                 description: Últimos 4 dígitos de la tarjeta (opcional, para pagos con tarjeta)
 *                 example: "4242"
 *               card_brand:
 *                 type: string
 *                 nullable: true
 *                 description: 'Marca de la tarjeta (opcional, ej: visa, mastercard)'
 *                 example: "visa"
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *                 description: Metadatos adicionales del pago (opcional)
 *                 example:
 *                   customer_id: "cust_123"
 *                   order_reference: "ORD-001"
 *     responses:
 *       201:
 *         description: Transacción de pago creada exitosamente
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         status:
 *                           type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post('/transactions', authMiddleware, (req, res) => paymentController.createPaymentTransaction(req, res));

/**
 * @swagger
 * /api/v1/payments/checkout:
 *   post:
 *     summary: Crear sesión de checkout
 *     description: Crea una sesión de checkout con Stripe para procesar un pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - success_url
 *               - cancel_url
 *             properties:
 *               order_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               success_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/success
 *               cancel_url:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/cancel
 *     responses:
 *       200:
 *         description: Sesión de checkout creada exitosamente
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
 *                     checkout_url:
 *                       type: string
 *                       format: uri
 *                       example: https://checkout.stripe.com/pay/cs_test_...
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post('/checkout', authMiddleware, (req, res) => paymentController.createCheckout(req, res));

/**
 * @swagger
 * /api/v1/payments/refunds:
 *   post:
 *     summary: Crear reembolso
 *     description: Crea un reembolso para una transacción de pago existente
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_transaction_id
 *               - amount
 *             properties:
 *               payment_transaction_id:
 *                 type: string
 *                 format: uuid
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Monto a reembolsar (opcional, si no se proporciona se reembolsa el total)
 *                 example: 50.25
 *               reason:
 *                 type: string
 *                 enum: [duplicate, fraudulent, requested_by_customer]
 *                 example: requested_by_customer
 *     responses:
 *       201:
 *         description: Reembolso creado exitosamente
 *       400:
 *         description: Error de validación o transacción no reembolsable
 *       404:
 *         description: Transacción de pago no encontrada
 *       401:
 *         description: No autenticado
 */
router.post('/refunds', authMiddleware, (req, res) => paymentController.createRefund(req, res));

export default router;

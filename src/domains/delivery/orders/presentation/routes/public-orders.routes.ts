/**
 * Routes públicas para tracking de órdenes
 * No requieren autenticación
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { PublicOrderController } from '../controllers/PublicOrderController';

const router = Router();

// Obtener controller del container
const controller = container.get<PublicOrderController>(TYPES.PublicOrderController);

/**
 * @swagger
 * /api/public/orders/{trackingCode}:
 *   get:
 *     summary: Obtener orden por código de tracking (público)
 *     description: Endpoint público para consultar el estado de una orden usando su código de tracking. No requiere autenticación.
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: trackingCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de tracking de la orden
 *         example: TRACK123456
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
 *                     tracking_code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     customer_name:
 *                       type: string
 *                     delivery_address:
 *                       type: string
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:trackingCode', (req, res) => controller.getByTrackingCode(req, res));

export default router;

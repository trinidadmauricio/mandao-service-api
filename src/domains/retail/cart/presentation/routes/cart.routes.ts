/**
 * Routes para Cart API
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { CartController } from '../controllers/CartController';
import { optionalAuthMiddleware } from '../../../../../shared/middleware/auth.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<CartController>(TYPES.CartController);

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Obtener carrito del usuario
 *     description: Obtiene el carrito del usuario autenticado o del guest (usando session_id). La autenticación es opcional.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Session-Id
 *         schema:
 *           type: string
 *         description: ID de sesión para guests (opcional si está autenticado)
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *       401:
 *         description: No autenticado (si se requiere autenticación)
 */
router.get('/', optionalAuthMiddleware, (req, res) => controller.getCart(req, res));

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Agregar item al carrito
 *     description: Agrega un producto al carrito. La autenticación es opcional.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Session-Id
 *         schema:
 *           type: string
 *         description: ID de sesión para guests (opcional si está autenticado)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               variant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item agregado exitosamente
 *       400:
 *         description: Error de validación o stock insuficiente
 */
router.post('/items', optionalAuthMiddleware, (req, res) => controller.addItem(req, res));

/**
 * @swagger
 * /api/v1/cart/items/{item_id}:
 *   put:
 *     summary: Actualizar item del carrito
 *     description: Actualiza la cantidad de un item en el carrito.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: item_id
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *       404:
 *         description: Item no encontrado
 *       400:
 *         description: Error de validación o stock insuficiente
 */
router.put('/items/:item_id', optionalAuthMiddleware, (req, res) => controller.updateItem(req, res));

/**
 * @swagger
 * /api/v1/cart/items/{item_id}:
 *   delete:
 *     summary: Remover item del carrito
 *     description: Remueve un item del carrito.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removido exitosamente
 *       404:
 *         description: Item no encontrado
 */
router.delete('/items/:item_id', optionalAuthMiddleware, (req, res) => controller.removeItem(req, res));

/**
 * @swagger
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Limpiar carrito
 *     description: Remueve todos los items del carrito.
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Session-Id
 *         schema:
 *           type: string
 *         description: ID de sesión para guests (opcional si está autenticado)
 *     responses:
 *       200:
 *         description: Carrito limpiado exitosamente
 *       404:
 *         description: Carrito no encontrado
 */
router.delete('/clear', optionalAuthMiddleware, (req, res) => controller.clearCart(req, res));

export default router;


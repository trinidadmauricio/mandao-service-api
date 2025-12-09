/**
 * Routes para Wishlist
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { WishlistController } from '../controllers/WishlistController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<WishlistController>(TYPES.WishlistController);

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Listar wishlist del customer actual
 *     description: Obtiene todos los items de la wishlist del usuario autenticado
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items de wishlist
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
 *                       product_id:
 *                         type: string
 *                         format: uuid
 *                       variant_id:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       product:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/wishlist:
 *   post:
 *     summary: Agregar producto a wishlist
 *     description: Agrega un producto a la wishlist del usuario autenticado
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *               variant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Producto agregado a wishlist exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.add(req, res)
);

/**
 * @swagger
 * /api/v1/wishlist/{product_id}:
 *   delete:
 *     summary: Remover producto de wishlist
 *     description: Remueve un producto de la wishlist del usuario autenticado
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: variant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la variante (opcional)
 *     responses:
 *       204:
 *         description: Producto removido de wishlist exitosamente
 *       404:
 *         description: Item de wishlist no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:product_id',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.remove(req, res)
);

export default router;


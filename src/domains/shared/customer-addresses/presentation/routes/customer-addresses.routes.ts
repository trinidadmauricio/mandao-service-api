/**
 * Routes para CustomerAddress
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { CustomerAddressController } from '../controllers/CustomerAddressController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<CustomerAddressController>(TYPES.CustomerAddressController);

/**
 * @swagger
 * /api/v1/customer/addresses:
 *   get:
 *     summary: Listar direcciones del customer actual
 *     description: Obtiene todas las direcciones del usuario autenticado
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de direcciones
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
 *                       label:
 *                         type: string
 *                       recipient_name:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zip_code:
 *                         type: string
 *                       country:
 *                         type: string
 *                       is_default:
 *                         type: boolean
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
 * /api/v1/customer/addresses:
 *   post:
 *     summary: Crear nueva dirección
 *     description: Crea una nueva dirección para el usuario autenticado
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - label
 *               - recipient_name
 *               - phone
 *               - street
 *               - city
 *               - state
 *               - zip_code
 *               - country
 *             properties:
 *               label:
 *                 type: string
 *                 example: Casa
 *               recipient_name:
 *                 type: string
 *                 example: Juan Pérez
 *               phone:
 *                 type: string
 *                 example: +503 1234 5678
 *               street:
 *                 type: string
 *                 example: Calle Principal 123
 *               street_line_2:
 *                 type: string
 *                 nullable: true
 *               city:
 *                 type: string
 *                 example: San Salvador
 *               state:
 *                 type: string
 *                 example: San Salvador
 *               zip_code:
 *                 type: string
 *                 example: 1101
 *               country:
 *                 type: string
 *                 example: El Salvador
 *               lat:
 *                 type: number
 *                 nullable: true
 *               lng:
 *                 type: number
 *                 nullable: true
 *               instructions:
 *                 type: string
 *                 nullable: true
 *               is_default:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Dirección creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/customer/addresses/{id}:
 *   get:
 *     summary: Obtener dirección por ID
 *     description: Obtiene los detalles de una dirección específica
 *     tags: [Customer]
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
 *         description: Dirección encontrada
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/customer/addresses/{id}:
 *   patch:
 *     summary: Actualizar dirección
 *     description: Actualiza una dirección existente
 *     tags: [Customer]
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
 *               label:
 *                 type: string
 *               recipient_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip_code:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Dirección actualizada exitosamente
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/customer/addresses/{id}:
 *   delete:
 *     summary: Eliminar dirección
 *     description: Elimina una dirección
 *     tags: [Customer]
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
 *       204:
 *         description: Dirección eliminada exitosamente
 *       404:
 *         description: Dirección no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => controller.delete(req, res)
);

export default router;


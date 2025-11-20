/**
 * Routes para Categories
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { CategoryController } from '../controllers/CategoryController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<CategoryController>(TYPES.CategoryController);

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Listar categorías
 *     description: Obtiene la lista de categorías de productos del tenant actual
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('categories', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     description: Obtiene los detalles de una categoría específica
 *     tags: [Categories]
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
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('categories', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Crear nueva categoría
 *     description: Crea una nueva categoría de productos. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Categories]
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
 *               - name
 *               - slug
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID de la categoría padre para crear subcategorías (opcional)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre de la categoría
 *                 example: Electrónica
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Slug único de la categoría (usado en URLs)
 *                 example: electronica
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción de la categoría (opcional)
 *                 example: Categoría de productos electrónicos
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: URL de la imagen de la categoría (opcional)
 *                 example: "https://example.com/category-image.jpg"
 *               display_order:
 *                 type: integer
 *                 minimum: 0
 *                 description: Orden de visualización (opcional, menor número = aparece primero)
 *                 example: 0
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si la categoría está activa (opcional)
 *                 example: true
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('categories', 'create'),
  requireTenantType(['RETAIL', 'HYBRID']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   patch:
 *     summary: Actualizar categoría
 *     description: Actualiza una categoría existente. Todos los campos son opcionales.
 *     tags: [Categories]
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
 *               parent_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 nullable: true
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               display_order:
 *                 type: integer
 *                 minimum: 0
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('categories', 'update'),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     description: Elimina una categoría del catálogo
 *     tags: [Categories]
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
 *         description: Categoría eliminada exitosamente
 *       404:
 *         description: Categoría no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('categories', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;

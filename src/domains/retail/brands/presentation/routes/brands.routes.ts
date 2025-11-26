/**
 * Routes para Brands
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { BrandController } from '../controllers/BrandController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<BrandController>(TYPES.BrandController);

/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Listar marcas
 *     description: Obtiene la lista de marcas del tenant actual
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marcas
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('brands', 'read'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Obtener marca por ID
 *     description: Obtiene los detalles de una marca específica
 *     tags: [Brands]
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
 *         description: Marca encontrada
 *       404:
 *         description: Marca no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('brands', 'read'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/brands:
 *   post:
 *     summary: Crear nueva marca
 *     description: Crea una nueva marca en el catálogo. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Brands]
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
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre de la marca
 *                 example: Nike
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Slug único de la marca (usado en URLs)
 *                 example: nike
 *               logo_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: URL del logo de la marca (opcional)
 *                 example: "https://example.com/nike-logo.png"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción de la marca (opcional)
 *                 example: Marca de ropa y calzado deportivo
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si la marca está activa (opcional)
 *                 example: true
 *     responses:
 *       201:
 *         description: Marca creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('brands', 'create'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   patch:
 *     summary: Actualizar marca
 *     description: Actualiza una marca existente. Todos los campos son opcionales.
 *     tags: [Brands]
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
 *                 minLength: 1
 *                 maxLength: 255
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               logo_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Marca actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Marca no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('brands', 'update'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   delete:
 *     summary: Eliminar marca
 *     description: Elimina una marca del catálogo
 *     tags: [Brands]
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
 *         description: Marca eliminada exitosamente
 *       404:
 *         description: Marca no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('brands', 'delete'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.delete(req, res)
);

export default router;

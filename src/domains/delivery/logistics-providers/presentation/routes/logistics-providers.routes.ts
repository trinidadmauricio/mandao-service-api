/**
 * Routes para LogisticsProviders
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { LogisticsProviderController } from '../controllers/LogisticsProviderController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<LogisticsProviderController>(TYPES.LogisticsProviderController);

/**
 * @swagger
 * /api/v1/logistics-providers:
 *   get:
 *     summary: Listar proveedores logísticos
 *     description: Obtiene la lista de proveedores logísticos del tenant actual
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores logísticos
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('logistics-providers', 'read'),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/logistics-providers/{id}:
 *   get:
 *     summary: Obtener proveedor logístico por ID
 *     description: Obtiene los detalles de un proveedor logístico específico
 *     tags: [Orders]
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
 *         description: Proveedor logístico encontrado
 *       404:
 *         description: Proveedor logístico no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('logistics-providers', 'read'),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/logistics-providers:
 *   post:
 *     summary: Crear nuevo proveedor logístico
 *     description: Crea un nuevo proveedor logístico. El tenant_id se obtiene automáticamente del tenant de la sesión, pero puede especificarse como null para proveedores globales.
 *     tags: [Logistics Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - tax_id
 *               - representative_name
 *               - representative_phone
 *               - representative_document
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del tenant (opcional, se usa el del tenant de la sesión si no se proporciona, null para proveedores globales)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               company_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre de la empresa proveedora
 *                 example: Delivery Express S.A.
 *               tax_id:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Número de identificación fiscal (RUC, NIT, etc.)
 *                 example: "12345678901"
 *               representative_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del representante legal
 *                 example: "Juan Pérez"
 *               representative_phone:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Teléfono del representante legal
 *                 example: "+1234567890"
 *               representative_document:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Número de documento del representante legal
 *                 example: "12345678"
 *               verification_status:
 *                 type: string
 *                 enum: [PENDING, VERIFIED, REJECTED]
 *                 default: PENDING
 *                 description: Estado de verificación del proveedor (opcional)
 *                 example: PENDING
 *               verification_documents:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *                 description: Documentos de verificación (opcional, objeto flexible)
 *                 example:
 *                   business_license: "LIC-123"
 *                   tax_certificate: "TAX-456"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SUSPENDED, INACTIVE]
 *                 default: ACTIVE
 *                 description: Estado del proveedor (opcional)
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Proveedor logístico creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('logistics-providers', 'create'),
  requireTenantType(['ON_DEMAND', 'HYBRID']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/logistics-providers/{id}:
 *   patch:
 *     summary: Actualizar proveedor logístico
 *     description: Actualiza parcialmente un proveedor logístico existente
 *     tags: [Orders]
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
 *               provider_type:
 *                 type: string
 *                 enum: [INTERNAL, EXTERNAL]
 *               api_key:
 *                 type: string
 *               api_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Proveedor logístico actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Proveedor logístico no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('logistics-providers', 'update'),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/logistics-providers/{id}:
 *   delete:
 *     summary: Eliminar proveedor logístico
 *     description: Elimina un proveedor logístico del sistema
 *     tags: [Orders]
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
 *         description: Proveedor logístico eliminado exitosamente
 *       404:
 *         description: Proveedor logístico no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('logistics-providers', 'delete'),
  (req, res) => controller.delete(req, res)
);

export default router;

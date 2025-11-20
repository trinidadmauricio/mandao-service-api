/**
 * Routes para Tenants
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { TenantController } from '../controllers/TenantController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';

const router = Router();

// Obtener controller del container
const tenantController = container.get<TenantController>(TYPES.TenantController);

/**
 * @swagger
 * /api/v1/tenants:
 *   get:
 *     summary: Listar tenants
 *     description: Obtiene la lista de tenants (solo para usuarios con permisos de administrador)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de tenants
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
 *                       name:
 *                         type: string
 *                       domain:
 *                         type: string
 *                       default_currency:
 *                         type: string
 *                       default_locale:
 *                         type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos suficientes
 */
router.get('/', authMiddleware, (req, res) => tenantController.list(req, res));

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   get:
 *     summary: Obtener tenant por ID
 *     description: Obtiene los detalles de un tenant específico
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Tenant encontrado
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
 *                     name:
 *                       type: string
 *                     domain:
 *                       type: string
 *                     default_currency:
 *                       type: string
 *                     default_locale:
 *                       type: string
 *       404:
 *         description: Tenant no encontrado
 *       401:
 *         description: No autenticado
 */
router.get('/:id', authMiddleware, (req, res) => tenantController.getById(req, res));

/**
 * @swagger
 * /api/v1/tenants:
 *   post:
 *     summary: Crear nuevo tenant
 *     description: Crea un nuevo tenant en el sistema. El slug debe ser único y contener solo letras minúsculas, números y guiones.
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - name
 *               - type
 *             properties:
 *               slug:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 pattern: '^[a-z0-9-]+$'
 *                 description: Identificador único del tenant (solo letras minúsculas, números y guiones)
 *                 example: acme-corp
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del tenant
 *                 example: Acme Corporation
 *               type:
 *                 type: string
 *                 enum: [RETAIL, ON_DEMAND, HYBRID]
 *                 description: Tipo de tenant (RETAIL para e-commerce, ON_DEMAND para delivery, HYBRID para ambos)
 *                 example: HYBRID
 *               subscription_plan_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del plan de suscripción (opcional)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               default_currency:
 *                 type: string
 *                 length: 3
 *                 default: USD
 *                 description: Código de moneda por defecto (ISO 4217, 3 caracteres)
 *                 example: USD
 *               default_locale:
 *                 type: string
 *                 length: 2
 *                 default: es
 *                 description: Código de idioma por defecto (ISO 639-1, 2 caracteres)
 *                 example: es
 *               settings:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Configuraciones adicionales del tenant (opcional)
 *                 example:
 *                   feature_flags:
 *                     enable_notifications: true
 *     responses:
 *       201:
 *         description: Tenant creado exitosamente
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
 *                     slug:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                     default_currency:
 *                       type: string
 *                     default_locale:
 *                       type: string
 *       400:
 *         description: Error de validación o slug ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Tenant with this slug already exists
 *       401:
 *         description: No autenticado
 */
router.post('/', authMiddleware, (req, res) => tenantController.create(req, res));

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   patch:
 *     summary: Actualizar tenant
 *     description: Actualiza los datos de un tenant existente
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Company Name
 *               default_currency:
 *                 type: string
 *                 example: EUR
 *               default_locale:
 *                 type: string
 *                 example: es
 *     responses:
 *       200:
 *         description: Tenant actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Tenant no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch('/:id', authMiddleware, (req, res) => tenantController.update(req, res));

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   delete:
 *     summary: Eliminar tenant
 *     description: Elimina un tenant del sistema (operación irreversible)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Tenant eliminado exitosamente
 *       404:
 *         description: Tenant no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete('/:id', authMiddleware, (req, res) => tenantController.delete(req, res));

export default router;

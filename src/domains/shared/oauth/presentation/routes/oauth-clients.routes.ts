/**
 * Routes para OAuth Clients CRUD
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { OAuthClientController } from '../controllers/OAuthClientController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';

const router = Router();

// Obtener controller del container
const oauthClientController = container.get<OAuthClientController>(TYPES.OAuthClientController);

/**
 * @swagger
 * /api/v1/oauth-clients:
 *   get:
 *     summary: Listar clientes OAuth
 *     description: Obtiene la lista de clientes OAuth del tenant actual
 *     tags: [OAuth Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes OAuth
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
 *                       client_id:
 *                         type: string
 *                       redirect_uris:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: No autenticado
 */
router.get('/', authMiddleware, (req, res) => oauthClientController.list(req, res));

/**
 * @swagger
 * /api/v1/oauth-clients/{id}:
 *   get:
 *     summary: Obtener cliente OAuth por ID
 *     description: Obtiene los detalles de un cliente OAuth específico
 *     tags: [OAuth Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente OAuth
 *     responses:
 *       200:
 *         description: Cliente OAuth encontrado
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
 *                     client_id:
 *                       type: string
 *                     client_secret:
 *                       type: string
 *                     redirect_uris:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autenticado
 */
router.get('/:id', authMiddleware, (req, res) => oauthClientController.getById(req, res));

/**
 * @swagger
 * /api/v1/oauth-clients:
 *   post:
 *     summary: Crear nuevo cliente OAuth
 *     description: Crea un nuevo cliente OAuth. El tenant_id se obtiene automáticamente del tenant de la sesión, pero puede especificarse como null para clientes globales (SAAS_ADMIN).
 *     tags: [OAuth Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - redirect_uris
 *               - grant_types
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del tenant (opcional, se usa el del tenant de la sesión si no se proporciona, null para clientes globales)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del cliente OAuth
 *                 example: My OAuth Client
 *               redirect_uris:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URIs de redirección permitidas (mínimo 1)
 *                 example: ["https://example.com/callback", "https://example.com/callback2"]
 *               grant_types:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   enum: [authorization_code, client_credentials, refresh_token]
 *                 description: Tipos de grant permitidos (mínimo 1)
 *                 example: ["authorization_code", "refresh_token"]
 *               scope:
 *                 type: string
 *                 default: "read write"
 *                 description: Scopes del cliente (opcional, por defecto "read write")
 *                 example: "read write admin"
 *               is_confidential:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si el cliente es confidencial (requiere client_secret) (opcional, por defecto true)
 *                 example: true
 *     responses:
 *       201:
 *         description: Cliente OAuth creado exitosamente
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
 *                     client_id:
 *                       type: string
 *                     client_secret:
 *                       type: string
 *                       description: Solo se muestra una vez al crear
 *                     redirect_uris:
 *                       type: array
 *                       items:
 *                         type: string
 *                     grant_types:
 *                       type: array
 *                       items:
 *                         type: string
 *                     scope:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post('/', authMiddleware, (req, res) => oauthClientController.create(req, res));

/**
 * @swagger
 * /api/v1/oauth-clients/{id}:
 *   patch:
 *     summary: Actualizar cliente OAuth
 *     description: Actualiza los datos de un cliente OAuth existente. Todos los campos son opcionales.
 *     tags: [OAuth Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente OAuth
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
 *                 description: Nombre del cliente
 *                 example: Updated Client Name
 *               redirect_uris:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: URIs de redirección permitidas
 *                 example: ["https://example.com/callback"]
 *               grant_types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [authorization_code, client_credentials, refresh_token]
 *                 description: Tipos de grant permitidos
 *                 example: ["authorization_code", "refresh_token"]
 *               scope:
 *                 type: string
 *                 description: Scopes del cliente
 *                 example: "read write admin"
 *               is_active:
 *                 type: boolean
 *                 description: Indica si el cliente está activo
 *                 example: true
 *     responses:
 *       200:
 *         description: Cliente OAuth actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch('/:id', authMiddleware, (req, res) => oauthClientController.update(req, res));

/**
 * @swagger
 * /api/v1/oauth-clients/{id}:
 *   delete:
 *     summary: Eliminar cliente OAuth
 *     description: Elimina un cliente OAuth del tenant actual
 *     tags: [OAuth Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente OAuth
 *     responses:
 *       200:
 *         description: Cliente OAuth eliminado exitosamente
 *       404:
 *         description: Cliente no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete('/:id', authMiddleware, (req, res) => oauthClientController.delete(req, res));

export default router;

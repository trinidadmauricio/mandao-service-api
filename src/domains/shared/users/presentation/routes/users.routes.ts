/**
 * Routes para Users
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';

const router = Router();

// Obtener controller del container
const userController = container.get<UserController>(TYPES.UserController);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Listar usuarios
 *     description: Obtiene la lista de usuarios del tenant actual con paginación y filtros
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda de texto en nombre, apellido, email o teléfono
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SAAS_ADMIN, SAAS_EDITOR, OWNER, SUPERVISOR, MERCHANT_USER, LOGISTICS_PROVIDER, CUSTOMER]
 *         description: Filtrar por rol
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filtrar por estado
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
 *           maximum: 100
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Lista de usuarios
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
 *                       email:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 total:
 *                   type: integer
 *                   description: Total de registros (solo cuando se usan filtros)
 *                 page:
 *                   type: integer
 *                   description: Página actual (solo cuando se usan filtros)
 *                 limit:
 *                   type: integer
 *                   description: Límite de resultados por página (solo cuando se usan filtros)
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas (solo cuando se usan filtros)
 *       400:
 *         description: Parámetros de filtro inválidos
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('users', 'read'),
  (req, res) => userController.list(req, res)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Obtiene los detalles de un usuario específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
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
 *                     email:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     email_verified:
 *                       type: boolean
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('users', 'read'),
  (req, res) => userController.getById(req, res)
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario en el tenant actual. El tenant_id se obtiene automáticamente del tenant de la sesión, pero puede especificarse para usuarios globales (SAAS_ADMIN/SAAS_EDITOR).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - role
 *               - first_name
 *               - last_name
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del tenant (opcional, se usa el del tenant de la sesión si no se proporciona)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email del usuario (debe ser único)
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 255
 *                 description: Contraseña del usuario (mínimo 8 caracteres)
 *                 example: securePassword123
 *               role:
 *                 type: string
 *                 enum: [SAAS_ADMIN, SAAS_EDITOR, OWNER, SUPERVISOR, MERCHANT_USER, CUSTOMER]
 *                 description: Rol del usuario
 *                 example: MERCHANT_USER
 *               first_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del usuario
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Apellido del usuario
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 description: Teléfono del usuario (opcional)
 *                 example: "+1234567890"
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 default: ACTIVE
 *                 description: Estado del usuario (opcional, por defecto ACTIVE)
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Error de validación o email ya existe
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
 *                   example: Email already exists
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('users', 'create'),
  (req, res) => userController.create(req, res)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   patch:
 *     summary: Actualizar usuario
 *     description: Actualiza los datos de un usuario existente. Todos los campos son opcionales.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del usuario
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Apellido del usuario
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 description: Teléfono del usuario
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [SAAS_ADMIN, SAAS_EDITOR, OWNER, SUPERVISOR, MERCHANT_USER, CUSTOMER]
 *                 description: Rol del usuario
 *                 example: MERCHANT_USER
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 description: Estado del usuario
 *                 example: ACTIVE
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 255
 *                 description: Nueva contraseña (opcional)
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     first_name:
 *                       type: string
 *                     last_name:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('users', 'update'),
  (req, res) => userController.update(req, res)
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del tenant actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('users', 'delete'),
  (req, res) => userController.delete(req, res)
);

export default router;

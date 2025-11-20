/**
 * Routes para Autenticación Tradicional
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { AuthController } from '../controllers/AuthController';

const router = Router();

// Obtener controller del container
const authController = container.get<AuthController>(TYPES.AuthController);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     description: Autentica un usuario y retorna un token de acceso JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *                     access_token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     token_type:
 *                       type: string
 *                       example: Bearer
 *                     expires_in:
 *                       type: number
 *                       example: 3600
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                         email_verified:
 *                           type: boolean
 *       401:
 *         description: Credenciales inválidas
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
 *                   example: Invalid credentials
 *       500:
 *         description: Error interno del servidor
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Crea una nueva cuenta de usuario. Requiere verificación de email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID del tenant (opcional, se usa el del header si no se proporciona)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newuser@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 255
 *                 example: securePassword123
 *               first_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 example: "+1234567890"
 *               role:
 *                 type: string
 *                 enum: [OWNER, SUPERVISOR, MERCHANT_USER, CUSTOMER]
 *                 example: CUSTOMER
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         first_name:
 *                           type: string
 *                         last_name:
 *                           type: string
 *                         role:
 *                           type: string
 *                     verification_token:
 *                       type: string
 *                       description: Solo disponible en desarrollo
 *                     message:
 *                       type: string
 *                       example: User registered successfully. Please verify your email.
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
 *       500:
 *         description: Error interno del servidor
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   get:
 *     summary: Verificar email del usuario
 *     description: Verifica el email del usuario usando el token de verificación enviado por correo
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de verificación recibido por email
 *         example: abc123def456...
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Token inválido o faltante
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
 *                   example: Verification token is required
 *       500:
 *         description: Error interno del servidor
 */
router.get('/verify-email', (req, res) => authController.verifyEmail(req, res));

/**
 * @swagger
 * /api/v1/auth/password/reset-request:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Envía un email con un enlace para restablecer la contraseña. Por seguridad, siempre retorna éxito.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Si el email existe, se envió un enlace de restablecimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: If the email exists, a password reset link has been sent
 */
router.post('/password/reset-request', (req, res) => authController.requestPasswordReset(req, res));

/**
 * @swagger
 * /api/v1/auth/password/reset:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Restablece la contraseña usando el token recibido por email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de restablecimiento recibido por email
 *                 example: reset_token_abc123...
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 255
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Token inválido o expirado
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
 *                   example: Invalid or expired token
 *       500:
 *         description: Error interno del servidor
 */
router.post('/password/reset', (req, res) => authController.resetPassword(req, res));

export default router;

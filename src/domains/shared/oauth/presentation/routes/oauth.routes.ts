/**
 * Routes para OAuth2
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { OAuthController } from '../controllers/OAuthController';
import { optionalAuthMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { oauthRateLimiter } from '../../../../../shared/middleware/rate-limit.middleware';

const router = Router();

// Obtener controller del container
const oauthController = container.get<OAuthController>(TYPES.OAuthController);

/**
 * @swagger
 * /oauth/authorize:
 *   get:
 *     summary: Endpoint de autorización OAuth2
 *     description: Inicia el flujo de autorización OAuth2 (Authorization Code o Implicit)
 *     tags: [OAuth]
 *     parameters:
 *       - in: query
 *         name: response_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [code, token]
 *         description: Tipo de respuesta (code para Authorization Code, token para Implicit)
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente OAuth
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *           format: uri
 *         description: URI de redirección después de la autorización
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         description: Scopes solicitados (separados por espacios)
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Valor de estado para prevenir CSRF
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       302:
 *         description: Redirección a redirect_uri con código o token
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autenticado (requerido para algunos flows)
 */
router.get('/authorize', oauthRateLimiter, optionalAuthMiddleware, (req, res) => oauthController.authorize(req, res));

/**
 * @swagger
 * /oauth/token:
 *   post:
 *     summary: Endpoint de token OAuth2
 *     description: Intercambia un código de autorización por un token de acceso o genera token con Client Credentials
 *     tags: [OAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - client_id
 *               - client_secret
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [authorization_code, client_credentials, refresh_token]
 *                 example: authorization_code
 *               code:
 *                 type: string
 *                 description: Código de autorización (requerido para authorization_code)
 *               redirect_uri:
 *                 type: string
 *                 format: uri
 *                 description: URI de redirección (debe coincidir con la del authorize)
 *               client_id:
 *                 type: string
 *                 example: client_123
 *               client_secret:
 *                 type: string
 *                 example: secret_456
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token (requerido para refresh_token grant)
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: number
 *                   example: 3600
 *                 refresh_token:
 *                   type: string
 *                   description: Solo para authorization_code grant
 *                 scope:
 *                   type: string
 *       400:
 *         description: Parámetros inválidos o código expirado
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/token', oauthRateLimiter, (req, res) => oauthController.token(req, res));

export default router;

/**
 * Routes para Device Tokens
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { DeviceTokenController } from '../controllers/DeviceTokenController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<DeviceTokenController>(TYPES.DeviceTokenController);

/**
 * @swagger
 * /api/v1/device-tokens:
 *   post:
 *     summary: Registrar token de dispositivo
 *     description: Registra un token FCM para recibir push notifications
 *     tags: [Device Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - platform
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM token del dispositivo
 *               platform:
 *                 type: string
 *                 enum: [ios, android, web]
 *                 description: Plataforma del dispositivo
 *               device_info:
 *                 type: object
 *                 description: Información adicional del dispositivo (opcional)
 *     responses:
 *       201:
 *         description: Token registrado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  (req, res) => controller.register(req, res)
);

/**
 * @swagger
 * /api/v1/device-tokens:
 *   get:
 *     summary: Listar tokens de dispositivo
 *     description: Obtiene todos los tokens activos del usuario autenticado
 *     tags: [Device Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tokens
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/device-tokens:
 *   delete:
 *     summary: Desactivar un token de dispositivo
 *     description: Desactiva un token específico (por ejemplo, al hacer logout)
 *     tags: [Device Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM token a desactivar
 *     responses:
 *       200:
 *         description: Token desactivado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permiso para desactivar este token
 *       404:
 *         description: Token no encontrado
 */
router.delete(
  '/',
  authMiddleware,
  (req, res) => controller.deactivate(req, res)
);

/**
 * @swagger
 * /api/v1/device-tokens/all:
 *   delete:
 *     summary: Desactivar todos los tokens
 *     description: Desactiva todos los tokens del usuario (logout de todos los dispositivos)
 *     tags: [Device Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todos los tokens desactivados
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/all',
  authMiddleware,
  (req, res) => controller.deactivateAll(req, res)
);

export default router;


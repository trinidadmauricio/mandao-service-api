/**
 * Routes para Geocoding
 * Servicio transversal para búsqueda y reverse geocoding
 */

import { Router } from 'express';
import { geocodingController } from '../controllers/GeocodingController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';

const router = Router();

/**
 * @swagger
 * /api/v1/geocoding/search:
 *   get:
 *     summary: Buscar direcciones
 *     description: Busca direcciones usando geocoding, limitado a Centro América y Caribe
 *     tags: [Geocoding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Query de búsqueda (dirección, lugar, etc.)
 *         example: "San Salvador, El Salvador"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de resultados
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *           enum: [es, en]
 *         description: Idioma de los resultados
 *     responses:
 *       200:
 *         description: Lista de direcciones encontradas
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
 *                       name:
 *                         type: string
 *                         example: "San Salvador"
 *                       display_name:
 *                         type: string
 *                         example: "San Salvador, El Salvador"
 *                       lat:
 *                         type: number
 *                         example: 13.6929
 *                       lng:
 *                         type: number
 *                         example: -89.2182
 *                       address:
 *                         type: object
 *                         properties:
 *                           street:
 *                             type: string
 *                           city:
 *                             type: string
 *                           state:
 *                             type: string
 *                           zip_code:
 *                             type: string
 *                           country:
 *                             type: string
 *                 count:
 *                   type: integer
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/search',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => geocodingController.search(req, res)
);

/**
 * @swagger
 * /api/v1/geocoding/reverse:
 *   get:
 *     summary: Reverse geocoding
 *     description: Obtiene la dirección desde coordenadas (lat/lng), limitado a Centro América y Caribe
 *     tags: [Geocoding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitud
 *         example: 13.6929
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitud
 *         example: -89.2182
 *       - in: query
 *         name: lang
 *         required: false
 *         schema:
 *           type: string
 *           enum: [es, en]
 *         description: Idioma de los resultados
 *     responses:
 *       200:
 *         description: Dirección encontrada
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
 *                     name:
 *                       type: string
 *                     display_name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                     address:
 *                       type: object
 *       400:
 *         description: Error de validación o coordenadas fuera de la región
 *       401:
 *         description: No autenticado
 *       404:
 *         description: No se encontró dirección para las coordenadas
 *       500:
 *         description: Error del servidor
 */
router.get(
  '/reverse',
  authMiddleware,
  requireTenantMiddleware,
  (req, res) => geocodingController.reverse(req, res)
);

export default router;


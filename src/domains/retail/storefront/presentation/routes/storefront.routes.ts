/**
 * Routes para Storefront API
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { StorefrontController } from '../controllers/StorefrontController';
import { optionalAuthMiddleware, authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<StorefrontController>(TYPES.StorefrontController);

/**
 * @swagger
 * /api/v1/storefront/config:
 *   get:
 *     summary: Obtener configuración pública del storefront
 *     description: Obtiene la configuración del storefront incluyendo theme_config, seo_config, business_hours y datos del tenant. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     responses:
 *       200:
 *         description: Configuración del storefront
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
 *                     storefront:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         subdomain:
 *                           type: string
 *                         theme_config:
 *                           type: object
 *                         seo_config:
 *                           type: object
 *                         business_hours:
 *                           type: object
 *                     tenant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         default_currency:
 *                           type: string
 *                         default_locale:
 *                           type: string
 *       404:
 *         description: Storefront o Tenant no encontrado
 */
router.get('/config', (req, res) => controller.getConfig(req, res));

/**
 * @swagger
 * /api/v1/storefront:
 *   patch:
 *     summary: Actualizar configuración del storefront
 *     description: Actualiza la configuración del storefront, específicamente el template. Requiere autenticación y permisos de OWNER.
 *     tags: [Storefront]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - theme_config
 *             properties:
 *               theme_config:
 *                 type: object
 *                 required:
 *                   - template
 *                 properties:
 *                   template:
 *                     type: string
 *                     enum: [classic, modern, minimal, fashion]
 *                     description: Template a usar en el storefront
 *                     example: modern
 *     responses:
 *       200:
 *         description: Storefront actualizado exitosamente
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
 *                     tenant_id:
 *                       type: string
 *                     theme_config:
 *                       type: object
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos (requiere OWNER)
 *       404:
 *         description: Storefront no encontrado
 */
router.patch(
  '/',
  authMiddleware,
  requirePermission('tenants', 'update'),
  (req, res) => controller.updateStorefront(req, res)
);

/**
 * @swagger
 * /api/v1/storefront/categories:
 *   get:
 *     summary: Listar categorías públicas del storefront
 *     description: Obtiene la lista de categorías activas con jerarquía parent/child. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     parameters:
 *       - in: query
 *         name: include_children
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir categorías hijas en la respuesta
 *       - in: query
 *         name: include_product_count
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir conteo de productos por categoría
 *     responses:
 *       200:
 *         description: Lista de categorías del storefront
 */
router.get('/categories', (req, res) => controller.listCategories(req, res));

/**
 * @swagger
 * /api/v1/storefront/categories/{slug}:
 *   get:
 *     summary: Obtener categoría pública por slug
 *     description: Obtiene los detalles de una categoría específica con breadcrumbs. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada o inactiva
 */
router.get('/categories/:slug', (req, res) => controller.getCategoryBySlug(req, res));

/**
 * @swagger
 * /api/v1/storefront/brands:
 *   get:
 *     summary: Listar marcas públicas del storefront
 *     description: Obtiene la lista de marcas activas. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     responses:
 *       200:
 *         description: Lista de marcas del storefront
 */
router.get('/brands', (req, res) => controller.listBrands(req, res));

/**
 * @swagger
 * /api/v1/storefront/products:
 *   get:
 *     summary: Listar productos del storefront (público)
 *     description: Obtiene la lista de productos disponibles en el storefront. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por categoría
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por marca
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
 *         description: Lista de productos del storefront
 */
router.get('/products', optionalAuthMiddleware, (req, res) => controller.listProducts(req, res));

/**
 * @swagger
 * /api/v1/storefront/products/{id}:
 *   get:
 *     summary: Obtener producto del storefront por ID (público)
 *     description: Obtiene los detalles de un producto específico del storefront. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/products/:id', optionalAuthMiddleware, (req, res) => controller.getProduct(req, res));

/**
 * @swagger
 * /api/v1/storefront/search:
 *   get:
 *     summary: Buscar en storefront
 *     description: Busca productos, categorías y marcas en el storefront. Endpoint público, no requiere autenticación.
 *     tags: [Storefront]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Cantidad máxima de resultados por tipo
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
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
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     brands:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/search', (req, res) => controller.search(req, res));

/**
 * @swagger
 * /api/v1/storefront/checkout:
 *   post:
 *     summary: Procesar checkout (público con auth opcional)
 *     description: Procesa un checkout y crea una orden. La autenticación es opcional pero recomendada. El tenant_id se obtiene automáticamente del tenant de la sesión o del header X-Tenant-Id.
 *     tags: [Storefront]
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
 *               - items
 *               - customer
 *               - delivery_address
 *               - branch_id
 *               - estimated_delivery_at
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión o del header)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID del producto (opcional si se proporciona variant_id)
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     variant_id:
 *                       type: string
 *                       format: uuid
 *                       description: ID de la variante del producto (opcional si se proporciona product_id)
 *                       example: 123e4567-e89b-12d3-a456-426614174000
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Cantidad del producto/variante
 *                       example: 2
 *               customer:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phone
 *                 properties:
 *                   name:
 *                     type: string
 *                     minLength: 1
 *                     description: Nombre del cliente
 *                     example: Juan Pérez
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Email del cliente (opcional)
 *                     example: customer@example.com
 *                   phone:
 *                     type: string
 *                     minLength: 1
 *                     description: Teléfono del cliente
 *                     example: "+1234567890"
 *               delivery_address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - country
 *                   - lat
 *                   - lng
 *                 properties:
 *                   street:
 *                     type: string
 *                     minLength: 1
 *                     description: Calle y número
 *                     example: Calle Principal 123
 *                   city:
 *                     type: string
 *                     minLength: 1
 *                     description: Ciudad
 *                     example: Ciudad
 *                   state:
 *                     type: string
 *                     description: Estado/Provincia (opcional)
 *                     example: Estado
 *                   zip_code:
 *                     type: string
 *                     description: Código postal (opcional)
 *                     example: "12345"
 *                   country:
 *                     type: string
 *                     minLength: 1
 *                     description: País
 *                     example: País
 *                   lat:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                     description: Latitud GPS de la dirección de entrega
 *                     example: 19.432608
 *                   lng:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *                     description: Longitud GPS de la dirección de entrega
 *                     example: -99.133209
 *               pickup_address:
 *                 type: object
 *                 description: Dirección de recogida (opcional, para órdenes que requieren recogida)
 *                 properties:
 *                   street:
 *                     type: string
 *                     minLength: 1
 *                   city:
 *                     type: string
 *                     minLength: 1
 *                   state:
 *                     type: string
 *                   zip_code:
 *                     type: string
 *                   country:
 *                     type: string
 *                     minLength: 1
 *                   lat:
 *                     type: number
 *                     minimum: -90
 *                     maximum: 90
 *                   lng:
 *                     type: number
 *                     minimum: -180
 *                     maximum: 180
 *               branch_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la sucursal que procesará la orden
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               currency:
 *                 type: string
 *                 length: 3
 *                 description: Código de moneda (ISO 4217, 3 caracteres) (opcional, usa la del tenant por defecto)
 *                 example: USD
 *               locale:
 *                 type: string
 *                 description: Código de idioma (opcional, usa la del tenant por defecto)
 *                 example: es
 *               special_instructions:
 *                 type: string
 *                 description: Instrucciones especiales para la entrega (opcional)
 *                 example: "Dejar en la puerta"
 *               scheduled_pickup_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora programada para recogida (opcional)
 *                 example: "2024-12-25T10:00:00Z"
 *               estimated_delivery_at:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora estimada de entrega
 *                 example: "2024-12-25T14:00:00Z"
 *               priority:
 *                 type: string
 *                 enum: [NORMAL, URGENT]
 *                 default: NORMAL
 *                 description: Prioridad de la orden (opcional)
 *                 example: NORMAL
 *     responses:
 *       201:
 *         description: Checkout procesado exitosamente, orden creada
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
 *                     order_id:
 *                       type: string
 *                       format: uuid
 *                     order_number:
 *                       type: string
 *                     order_display_number:
 *                       type: string
 *                     tracking_code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Error de validación o stock insuficiente
 *       401:
 *         description: No autenticado (si se requiere autenticación)
 */
router.post('/checkout', optionalAuthMiddleware, (req, res) => controller.checkout(req, res));

export default router;

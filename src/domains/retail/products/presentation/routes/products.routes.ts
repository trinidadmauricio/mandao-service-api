/**
 * Routes para Products
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';
import { requireTenantType } from '../../../../../shared/middleware/require-tenant-type.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<ProductController>(TYPES.ProductController);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Listar productos
 *     description: Obtiene la lista de productos del tenant actual con paginación y filtros
 *     tags: [Products]
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
 *     responses:
 *       200:
 *         description: Lista de productos
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
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('products', 'read'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.list(req, res)
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Obtiene los detalles completos de un producto específico, incluyendo variantes
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('products', 'read'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.getById(req, res)
);

/**
 * @swagger
 * /api/v1/products:
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un nuevo producto en el catálogo del tenant actual. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Products]
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
 *               - sku
 *               - name
 *               - category_id
 *               - cost_price
 *               - selling_price
 *               - images
 *             properties:
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               sku:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: SKU único del producto
 *                 example: PROD-001
 *               barcode:
 *                 type: string
 *                 nullable: true
 *                 description: Código de barras del producto (opcional)
 *                 example: "1234567890123"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Nombre del producto
 *                 example: Producto Ejemplo
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción del producto (opcional)
 *                 example: Descripción detallada del producto
 *               name_translations:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 nullable: true
 *                 description: 'Traducciones del nombre (opcional, formato: objeto con locale como clave)'
 *                 example:
 *                   en: "Example Product"
 *                   es: "Producto Ejemplo"
 *               description_translations:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 nullable: true
 *                 description: Traducciones de la descripción (opcional)
 *               category_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la categoría del producto
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               brand_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *                 description: ID de la marca del producto (opcional)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               cost_price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio de costo del producto
 *                 example: 50.00
 *               selling_price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio de venta del producto
 *                 example: 99.99
 *               compare_at_price:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Precio de comparación (precio anterior, para mostrar descuentos) (opcional)
 *                 example: 129.99
 *               currency:
 *                 type: string
 *                 length: 3
 *                 description: Código de moneda (ISO 4217, 3 caracteres) (opcional, usa la del tenant por defecto)
 *                 example: USD
 *               track_inventory:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si se debe rastrear inventario (opcional)
 *                 example: true
 *               current_stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock actual del producto (opcional)
 *                 example: 100
 *               min_stock_alert:
 *                 type: integer
 *                 minimum: 0
 *                 description: Cantidad mínima para alerta de stock bajo (opcional)
 *                 example: 10
 *               uom:
 *                 type: string
 *                 enum: [UNIT, KG, G, LITER, ML, BOX, PACK]
 *                 description: Unidad de medida (opcional)
 *                 example: UNIT
 *               weight_kg:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Peso en kilogramos (opcional)
 *                 example: 0.5
 *               dimensions:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *                 description: Dimensiones del producto (opcional, formato flexible)
 *                 example:
 *                   length: 10
 *                   width: 5
 *                   height: 3
 *                   unit: "cm"
 *               images:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Imágenes del producto (formato flexible, puede ser array de URLs u objeto con metadata)
 *                 example:
 *                   primary: "https://example.com/image1.jpg"
 *                   gallery: ["https://example.com/image2.jpg", "https://example.com/image3.jpg"]
 *               featured_image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: URL de la imagen destacada (opcional)
 *                 example: "https://example.com/featured.jpg"
 *               has_variants:
 *                 type: boolean
 *                 default: false
 *                 description: Indica si el producto tiene variantes (opcional)
 *                 example: false
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si el producto está activo (opcional)
 *                 example: true
 *               is_featured:
 *                 type: boolean
 *                 default: false
 *                 description: Indica si el producto es destacado (opcional)
 *                 example: false
 *               meta_title:
 *                 type: string
 *                 nullable: true
 *                 description: Título SEO (opcional)
 *                 example: "Producto Ejemplo - Tienda Online"
 *               meta_description:
 *                 type: string
 *                 nullable: true
 *                 description: Descripción SEO (opcional)
 *                 example: "Descripción para motores de búsqueda"
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
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
 *                     sku:
 *                       type: string
 *                     name:
 *                       type: string
 *                     selling_price:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('products', 'create'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.create(req, res)
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   patch:
 *     summary: Actualizar producto
 *     description: Actualiza un producto existente. Todos los campos son opcionales, solo se actualizan los campos proporcionados.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sku:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               barcode:
 *                 type: string
 *                 nullable: true
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 nullable: true
 *               name_translations:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 nullable: true
 *               description_translations:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *                 nullable: true
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               brand_id:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               cost_price:
 *                 type: number
 *                 minimum: 0
 *               selling_price:
 *                 type: number
 *                 minimum: 0
 *               compare_at_price:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               currency:
 *                 type: string
 *                 length: 3
 *               track_inventory:
 *                 type: boolean
 *               current_stock:
 *                 type: integer
 *                 minimum: 0
 *               min_stock_alert:
 *                 type: integer
 *                 minimum: 0
 *               uom:
 *                 type: string
 *                 enum: [UNIT, KG, G, LITER, ML, BOX, PACK]
 *               weight_kg:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               dimensions:
 *                 type: object
 *                 additionalProperties: true
 *                 nullable: true
 *               images:
 *                 type: object
 *                 additionalProperties: true
 *               featured_image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               has_variants:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *               is_featured:
 *                 type: boolean
 *               meta_title:
 *                 type: string
 *                 nullable: true
 *               meta_description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('products', 'update'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.update(req, res)
);

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     description: Elimina un producto del catálogo (soft delete si está implementado)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
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
 *         description: Producto eliminado exitosamente
 *       404:
 *         description: Producto no encontrado
 *       401:
 *         description: No autenticado
 */
router.delete(
  '/:id',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('products', 'delete'),
  requireTenantType(['RETAIL']),
  (req, res) => controller.delete(req, res)
);

export default router;

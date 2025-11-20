/**
 * Routes para ProductVariants
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { ProductVariantController } from '../controllers/ProductVariantController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';

const router = Router();

// Obtener controller del container
const controller = container.get<ProductVariantController>(TYPES.ProductVariantController);

/**
 * @swagger
 * /api/v1/product-variants:
 *   get:
 *     summary: Listar variantes de productos
 *     description: Obtiene la lista de variantes de productos del tenant actual
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por producto
 *     responses:
 *       200:
 *         description: Lista de variantes
 *       401:
 *         description: No autenticado
 */
router.get('/', authMiddleware, (req, res) => controller.list(req, res));

/**
 * @swagger
 * /api/v1/product-variants/{id}:
 *   get:
 *     summary: Obtener variante por ID
 *     description: Obtiene los detalles de una variante de producto específica
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
 *     responses:
 *       200:
 *         description: Variante encontrada
 *       404:
 *         description: Variante no encontrada
 *       401:
 *         description: No autenticado
 */
router.get('/:id', authMiddleware, (req, res) => controller.getById(req, res));

/**
 * @swagger
 * /api/v1/product-variants:
 *   post:
 *     summary: Crear nueva variante de producto
 *     description: Crea una nueva variante para un producto existente. El tenant_id se obtiene automáticamente del tenant de la sesión.
 *     tags: [Product Variants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - tenant_id
 *               - sku
 *             properties:
 *               product_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del producto al que pertenece la variante
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               tenant_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID del tenant (se obtiene automáticamente del tenant de la sesión)
 *                 example: 123e4567-e89b-12d3-a456-426614174000
 *               sku:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: SKU único de la variante
 *                 example: PROD-001-RED-L
 *               barcode:
 *                 type: string
 *                 nullable: true
 *                 description: Código de barras de la variante (opcional)
 *                 example: "1234567890123"
 *               option1_name:
 *                 type: string
 *                 nullable: true
 *                 description: 'Nombre de la primera opción (ej: Color) (opcional)'
 *                 example: "Color"
 *               option1_value:
 *                 type: string
 *                 nullable: true
 *                 description: 'Valor de la primera opción (ej: Rojo) (opcional)'
 *                 example: "Rojo"
 *               option2_name:
 *                 type: string
 *                 nullable: true
 *                 description: 'Nombre de la segunda opción (ej: Talla) (opcional)'
 *                 example: "Talla"
 *               option2_value:
 *                 type: string
 *                 nullable: true
 *                 description: 'Valor de la segunda opción (ej: L) (opcional)'
 *                 example: "L"
 *               option3_name:
 *                 type: string
 *                 nullable: true
 *                 description: Nombre de la tercera opción (opcional)
 *               option3_value:
 *                 type: string
 *                 nullable: true
 *                 description: Valor de la tercera opción (opcional)
 *               price_adjustment:
 *                 type: number
 *                 description: Ajuste de precio respecto al producto base (opcional, puede ser negativo)
 *                 example: 10.00
 *               cost_price:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Precio de costo de la variante (opcional)
 *                 example: 50.00
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
 *                 description: Stock actual de la variante (opcional)
 *                 example: 100
 *               weight_kg:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *                 description: Peso en kilogramos (opcional)
 *                 example: 0.5
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *                 description: URL de la imagen de la variante (opcional)
 *                 example: "https://example.com/variant-image.jpg"
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Indica si la variante está activa (opcional)
 *                 example: true
 *     responses:
 *       201:
 *         description: Variante creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
router.post('/', authMiddleware, (req, res) => controller.create(req, res));

/**
 * @swagger
 * /api/v1/product-variants/{id}:
 *   patch:
 *     summary: Actualizar variante de producto
 *     description: Actualiza una variante existente. Todos los campos son opcionales.
 *     tags: [Product Variants]
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
 *               sku:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               barcode:
 *                 type: string
 *                 nullable: true
 *               option1_name:
 *                 type: string
 *                 nullable: true
 *               option1_value:
 *                 type: string
 *                 nullable: true
 *               option2_name:
 *                 type: string
 *                 nullable: true
 *               option2_value:
 *                 type: string
 *                 nullable: true
 *               option3_name:
 *                 type: string
 *                 nullable: true
 *               option3_value:
 *                 type: string
 *                 nullable: true
 *               price_adjustment:
 *                 type: number
 *               cost_price:
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
 *               weight_kg:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               image_url:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Variante actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Variante no encontrada
 *       401:
 *         description: No autenticado
 */
router.patch('/:id', authMiddleware, (req, res) => controller.update(req, res));

/**
 * @swagger
 * /api/v1/product-variants/{id}:
 *   delete:
 *     summary: Eliminar variante de producto
 *     description: Elimina una variante de producto
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
 *     responses:
 *       200:
 *         description: Variante eliminada exitosamente
 *       404:
 *         description: Variante no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete('/:id', authMiddleware, (req, res) => controller.delete(req, res));

export default router;

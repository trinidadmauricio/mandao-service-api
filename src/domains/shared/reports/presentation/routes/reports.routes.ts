/**
 * Routes para Reports
 */

import { Router } from 'express';
import { container } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../config/types';
import { ReportsController } from '../controllers/ReportsController';
import { authMiddleware } from '../../../../../shared/middleware/auth.middleware';
import { requireTenantMiddleware } from '../../../../../shared/middleware/require-tenant.middleware';
import { requirePermission } from '../../../../../shared/middleware/require-permission.middleware';

const router = Router();

// Obtener controller del container
const reportsController = container.get<ReportsController>(TYPES.ReportsController);

/**
 * @swagger
 * /api/v1/reports/orders:
 *   get:
 *     summary: Reporte de órdenes
 *     description: Obtiene un reporte de órdenes con filtros y agregaciones. Para usuarios SAAS_ADMIN, se puede especificar tenant_id como query parameter.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant (requerido para SAAS_ADMIN, opcional para otros usuarios)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del reporte
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del reporte
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado de orden
 *     responses:
 *       200:
 *         description: Reporte de órdenes generado exitosamente
 *       400:
 *         description: Tenant not found (para SAAS_ADMIN, especificar tenant_id)
 *       401:
 *         description: No autenticado
 */
router.get(
  '/orders',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('reports', 'read'),
  (req, res) => reportsController.getOrdersReport(req, res)
);

/**
 * @swagger
 * /api/v1/reports/orders/export:
 *   get:
 *     summary: Exportar órdenes a CSV
 *     description: Exporta el reporte de órdenes a formato CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archivo CSV generado exitosamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: No autenticado
 */
router.get(
  '/orders/export',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('reports', 'read'),
  (req, res) => reportsController.exportOrdersToCsv(req, res)
);

/**
 * @swagger
 * /api/v1/reports/inventory:
 *   get:
 *     summary: Reporte de inventario
 *     description: Obtiene un reporte del estado del inventario
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por categoría
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Solo productos con stock bajo
 *     responses:
 *       200:
 *         description: Reporte de inventario generado exitosamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/inventory',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('reports', 'read'),
  (req, res) => reportsController.getInventoryReport(req, res)
);

/**
 * @swagger
 * /api/v1/reports/drivers:
 *   get:
 *     summary: Reporte de conductores
 *     description: Obtiene un reporte de rendimiento de conductores
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: driver_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por conductor específico
 *     responses:
 *       200:
 *         description: Reporte de conductores generado exitosamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/drivers',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('reports', 'read'),
  (req, res) => reportsController.getDriversReport(req, res)
);

/**
 * @swagger
 * /api/v1/reports/dashboard/kpis:
 *   get:
 *     summary: KPIs del dashboard
 *     description: Obtiene los KPIs principales para el dashboard. Para usuarios SAAS_ADMIN, se puede especificar tenant_id como query parameter.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tenant_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tenant (requerido para SAAS_ADMIN, opcional para otros usuarios)
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, year]
 *           default: month
 *         description: Período de tiempo para los KPIs
 *     responses:
 *       200:
 *         description: KPIs del dashboard
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
 *                     total_orders:
 *                       type: integer
 *                     total_revenue:
 *                       type: number
 *                     average_order_value:
 *                       type: number
 *                     active_drivers:
 *                       type: integer
 *       400:
 *         description: Tenant not found (para SAAS_ADMIN, especificar tenant_id)
 *       401:
 *         description: No autenticado
 */
router.get(
  '/dashboard/kpis',
  authMiddleware,
  requireTenantMiddleware,
  requirePermission('reports', 'read'),
  (req, res) => reportsController.getDashboardKpis(req, res)
);

export default router;

/**
 * Controller para Reports
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GetOrdersReportUseCase } from '../../application/use-cases/GetOrdersReportUseCase';
import { ExportOrdersToCsvUseCase } from '../../application/use-cases/ExportOrdersToCsvUseCase';
import { GetInventoryReportUseCase } from '../../application/use-cases/GetInventoryReportUseCase';
import { GetDriversReportUseCase } from '../../application/use-cases/GetDriversReportUseCase';
import { GetDashboardKpisUseCase } from '../../application/use-cases/GetDashboardKpisUseCase';
import { orderReportFiltersSchema } from '../../application/dto/OrderReportFiltersDto';
import { logger } from '../../../../../shared/utils/logger';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';

const prisma = new PrismaClient();

@injectable()
export class ReportsController {
  constructor(
    @inject(TYPES.GetOrdersReportUseCase) private getOrdersReportUseCase: GetOrdersReportUseCase,
    @inject(TYPES.ExportOrdersToCsvUseCase) private exportOrdersToCsvUseCase: ExportOrdersToCsvUseCase,
    @inject(TYPES.GetInventoryReportUseCase) private getInventoryReportUseCase: GetInventoryReportUseCase,
    @inject(TYPES.GetDriversReportUseCase) private getDriversReportUseCase: GetDriversReportUseCase,
    @inject(TYPES.GetDashboardKpisUseCase) private getDashboardKpisUseCase: GetDashboardKpisUseCase
  ) {}

  /**
   * Obtiene el tenant_id de la request, considerando:
   * 1. Si hay tenant en req.tenant, usarlo
   * 2. Si el usuario es SAAS_ADMIN o SAAS_EDITOR, permitir tenant_id como query parameter o header
   * 3. Si no hay tenant y el usuario no es SAAS_ADMIN, retornar null
   */
  private async getTenantId(req: Request): Promise<string | null> {
    // Si hay tenant en la request, usarlo
    if (req.tenant?.id) {
      return req.tenant.id;
    }

    // Si el usuario es SAAS_ADMIN o SAAS_EDITOR, permitir tenant_id como query parameter o header
    if (req.user && (req.user.role === UserRole.SAAS_ADMIN || req.user.role === UserRole.SAAS_EDITOR)) {
      // Intentar obtener tenant_id del query parameter primero
      let tenant_id = req.query.tenant_id as string | undefined;
      
      // Si no está en query, intentar desde el header X-Tenant-Id
      if (!tenant_id) {
        tenant_id = req.headers['x-tenant-id'] as string | undefined;
      }
      
      if (tenant_id) {
        // Verificar que el tenant existe
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenant_id },
        });
        if (tenant) {
          return tenant_id;
        }
        throw new Error('Tenant not found');
      }
      // Si no se especifica tenant_id, retornar null (el use case deberá manejar esto)
      return null;
    }

    // Para otros usuarios, si no hay tenant, retornar null
    return null;
  }

  async getOrdersReport(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = await this.getTenantId(req);
      if (!tenant_id) {
        const isSAASAdmin = req.user && (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR');
        res.status(400).json({
          status: 'error',
          message: isSAASAdmin
            ? 'Tenant ID is required. Please specify tenant_id as a query parameter (e.g., ?tenant_id=xxx) or in the X-Tenant-Id header.'
            : 'Tenant not found',
        });
        return;
      }

      const filters = orderReportFiltersSchema.parse(req.query);
      const result = await this.getOrdersReportUseCase.execute(tenant_id, filters);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting orders report', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async exportOrdersToCsv(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = await this.getTenantId(req);
      if (!tenant_id) {
        const isSAASAdmin = req.user && (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR');
        res.status(400).json({
          status: 'error',
          message: isSAASAdmin
            ? 'Tenant ID is required. Please specify tenant_id as a query parameter (e.g., ?tenant_id=xxx) or in the X-Tenant-Id header.'
            : 'Tenant not found',
        });
        return;
      }

      const filters = orderReportFiltersSchema.parse(req.query);
      const locale = req.locale || 'es';

      const csvStream = await this.exportOrdersToCsvUseCase.execute(tenant_id, filters, locale);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="orders-${Date.now()}.csv"`);

      csvStream.pipe(res);
    } catch (error) {
      logger.error('Error exporting orders to CSV', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getInventoryReport(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = await this.getTenantId(req);
      if (!tenant_id) {
        const isSAASAdmin = req.user && (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR');
        res.status(400).json({
          status: 'error',
          message: isSAASAdmin
            ? 'Tenant ID is required. Please specify tenant_id as a query parameter (e.g., ?tenant_id=xxx) or in the X-Tenant-Id header.'
            : 'Tenant not found',
        });
        return;
      }

      const branch_id = req.query.branch_id as string | undefined;
      const result = await this.getInventoryReportUseCase.execute(tenant_id, branch_id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting inventory report', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getDriversReport(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = await this.getTenantId(req);
      if (!tenant_id) {
        const isSAASAdmin = req.user && (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR');
        res.status(400).json({
          status: 'error',
          message: isSAASAdmin
            ? 'Tenant ID is required. Please specify tenant_id as a query parameter (e.g., ?tenant_id=xxx) or in the X-Tenant-Id header.'
            : 'Tenant not found',
        });
        return;
      }

      const logistics_provider_id = req.query.logistics_provider_id as string | undefined;
      const result = await this.getDriversReportUseCase.execute(tenant_id, logistics_provider_id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting drivers report', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getDashboardKpis(req: Request, res: Response): Promise<void> {
    try {
      const tenant_id = await this.getTenantId(req);
      if (!tenant_id) {
        const isSAASAdmin = req.user && (req.user.role === 'SAAS_ADMIN' || req.user.role === 'SAAS_EDITOR');
        res.status(400).json({
          status: 'error',
          message: isSAASAdmin
            ? 'Tenant ID is required. Please specify tenant_id as a query parameter (e.g., ?tenant_id=xxx) or in the X-Tenant-Id header.'
            : 'Tenant not found',
        });
        return;
      }

      const result = await this.getDashboardKpisUseCase.execute(tenant_id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error getting dashboard KPIs', { error });
      if (error instanceof Error) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


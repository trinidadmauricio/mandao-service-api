/**
 * Controller para DeliveryRates
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateDeliveryRateUseCase } from '../../application/use-cases/CreateDeliveryRateUseCase';
import { GetDeliveryRateUseCase } from '../../application/use-cases/GetDeliveryRateUseCase';
import { ListDeliveryRatesUseCase } from '../../application/use-cases/ListDeliveryRatesUseCase';
import { UpdateDeliveryRateUseCase } from '../../application/use-cases/UpdateDeliveryRateUseCase';
import { DeleteDeliveryRateUseCase } from '../../application/use-cases/DeleteDeliveryRateUseCase';
import {
  createDeliveryRateSchema,
  updateDeliveryRateSchema,
} from '../../application/dto/CreateDeliveryRateDto';
import { logger } from '../../../../../shared/utils/logger';
import { serializeForResponse } from '../../../../../shared/utils/serializer.util';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeliveryRateController {
  constructor(
    @inject(TYPES.CreateDeliveryRateUseCase) private createUseCase: CreateDeliveryRateUseCase,
    @inject(TYPES.GetDeliveryRateUseCase) private getUseCase: GetDeliveryRateUseCase,
    @inject(TYPES.ListDeliveryRatesUseCase) private listUseCase: ListDeliveryRatesUseCase,
    @inject(TYPES.UpdateDeliveryRateUseCase) private updateUseCase: UpdateDeliveryRateUseCase,
    @inject(TYPES.DeleteDeliveryRateUseCase) private deleteUseCase: DeleteDeliveryRateUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createDeliveryRateSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
            currentUserTenantId: req.user.tenant_id || req.tenant?.id || null,
          }
        : undefined;
      const rate = await this.createUseCase.execute(dto, context);

      res.status(201).json({
        status: 'success',
        data: serializeForResponse(rate),
      });
    } catch (error) {
      logger.error('Error creating delivery rate', { error });
      if (error instanceof Error) {
        const isPermissionError = error.message.includes('permission') || error.message.includes('can only') || error.message.includes('cannot');
        const statusCode = isPermissionError ? 403 : 400;
        res.status(statusCode).json({
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rate = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(rate),
      });
    } catch (error) {
      logger.error('Error getting delivery rate', { error });
      if (error instanceof Error && error.message === 'Delivery rate not found') {
        res.status(404).json({
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

  async list(req: Request, res: Response): Promise<void> {
    try {
      // Filtrar automáticamente según el rol del usuario
      let tenant_id: string | null = null;
      let logistics_provider_id: string | null = null;
      const zone_id = req.query.zone_id as string | undefined;

      if (req.user) {
        const userRole = req.user.role as string;
        // LOGISTICS_PROVIDER y SUPERVISOR filtran por logistics_provider_id
        if (userRole === 'LOGISTICS_PROVIDER' || userRole === 'SUPERVISOR') {
          logistics_provider_id = req.user.logistics_provider_id || null;
        }
        // OWNER filtra por tenant_id
        else if (userRole === 'OWNER') {
          tenant_id = req.user.tenant_id || req.tenant?.id || null;
        }
        // SAAS_ADMIN y SAAS_EDITOR pueden ver todos (sin filtro automático)
        // Pero si hay tenant_id o logistics_provider_id en query, usarlo
        else if (userRole === 'SAAS_ADMIN' || userRole === 'SAAS_EDITOR') {
          tenant_id = req.query.tenant_id as string | undefined || req.tenant?.id || null;
          logistics_provider_id = req.query.logistics_provider_id as string | undefined || null;
        }
      } else {
        // Si no hay usuario, usar tenant del request
        tenant_id = req.tenant?.id || null;
      }

      const rates = await this.listUseCase.execute(tenant_id, logistics_provider_id, zone_id);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(rates),
      });
    } catch (error) {
      logger.error('Error listing delivery rates', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateDeliveryRateSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
            currentUserTenantId: req.user.tenant_id || req.tenant?.id || null,
          }
        : undefined;
      const rate = await this.updateUseCase.execute(id, dto, context);

      res.status(200).json({
        status: 'success',
        data: serializeForResponse(rate),
      });
    } catch (error) {
      logger.error('Error updating delivery rate', { error });
      if (error instanceof Error) {
        if (error.message === 'Delivery rate not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        const isPermissionError = error.message.includes('permission') || error.message.includes('can only') || error.message.includes('cannot');
        const statusCode = isPermissionError ? 403 : 400;
        res.status(statusCode).json({
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting delivery rate', { error });
      if (error instanceof Error && error.message === 'Delivery rate not found') {
        res.status(404).json({
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

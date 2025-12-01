/**
 * Controller para DeliveryZones
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateDeliveryZoneUseCase } from '../../application/use-cases/CreateDeliveryZoneUseCase';
import { GetDeliveryZoneUseCase } from '../../application/use-cases/GetDeliveryZoneUseCase';
import { ListDeliveryZonesUseCase } from '../../application/use-cases/ListDeliveryZonesUseCase';
import { UpdateDeliveryZoneUseCase } from '../../application/use-cases/UpdateDeliveryZoneUseCase';
import { DeleteDeliveryZoneUseCase } from '../../application/use-cases/DeleteDeliveryZoneUseCase';
import {
  createDeliveryZoneSchema,
  updateDeliveryZoneSchema,
} from '../../application/dto/CreateDeliveryZoneDto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class DeliveryZoneController {
  constructor(
    @inject(TYPES.CreateDeliveryZoneUseCase) private createUseCase: CreateDeliveryZoneUseCase,
    @inject(TYPES.GetDeliveryZoneUseCase) private getUseCase: GetDeliveryZoneUseCase,
    @inject(TYPES.ListDeliveryZonesUseCase) private listUseCase: ListDeliveryZonesUseCase,
    @inject(TYPES.UpdateDeliveryZoneUseCase) private updateUseCase: UpdateDeliveryZoneUseCase,
    @inject(TYPES.DeleteDeliveryZoneUseCase) private deleteUseCase: DeleteDeliveryZoneUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createDeliveryZoneSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
            currentUserTenantId: req.user.tenant_id || req.tenant?.id || null,
          }
        : undefined;
      const zone = await this.createUseCase.execute(dto, context);

      res.status(201).json({
        status: 'success',
        data: zone,
      });
    } catch (error) {
      logger.error('Error creating delivery zone', { error });
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
      const zone = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: zone,
      });
    } catch (error) {
      logger.error('Error getting delivery zone', { error });
      if (error instanceof Error && error.message === 'Delivery zone not found') {
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
        // Pero si hay tenant_id en query, usarlo
        else if (userRole === 'SAAS_ADMIN' || userRole === 'SAAS_EDITOR') {
          tenant_id = req.query.tenant_id as string | undefined || req.tenant?.id || null;
          logistics_provider_id = req.query.logistics_provider_id as string | undefined || null;
        }
      } else {
        // Si no hay usuario, usar tenant del request
        tenant_id = req.tenant?.id || null;
      }

      const zones = await this.listUseCase.execute(tenant_id, logistics_provider_id);

      res.status(200).json({
        status: 'success',
        data: zones,
      });
    } catch (error) {
      logger.error('Error listing delivery zones', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateDeliveryZoneSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
            currentUserTenantId: req.user.tenant_id || req.tenant?.id || null,
          }
        : undefined;
      const zone = await this.updateUseCase.execute(id, dto, context);

      res.status(200).json({
        status: 'success',
        data: zone,
      });
    } catch (error) {
      logger.error('Error updating delivery zone', { error });
      if (error instanceof Error) {
        if (error.message === 'Delivery zone not found') {
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
      logger.error('Error deleting delivery zone', { error });
      if (error instanceof Error && error.message === 'Delivery zone not found') {
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

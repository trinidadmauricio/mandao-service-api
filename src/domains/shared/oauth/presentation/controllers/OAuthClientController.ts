/**
 * Controller para OAuth Clients CRUD
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateOAuthClientUseCase } from '../../application/use-cases/CreateOAuthClientUseCase';
import { GetOAuthClientUseCase } from '../../application/use-cases/GetOAuthClientUseCase';
import { ListOAuthClientsUseCase } from '../../application/use-cases/ListOAuthClientsUseCase';
import { UpdateOAuthClientUseCase } from '../../application/use-cases/UpdateOAuthClientUseCase';
import { DeleteOAuthClientUseCase } from '../../application/use-cases/DeleteOAuthClientUseCase';
import { createOAuthClientSchema, updateOAuthClientSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class OAuthClientController {
  constructor(
    @inject(TYPES.CreateOAuthClientUseCase) private createOAuthClientUseCase: CreateOAuthClientUseCase,
    @inject(TYPES.GetOAuthClientUseCase) private getOAuthClientUseCase: GetOAuthClientUseCase,
    @inject(TYPES.ListOAuthClientsUseCase) private listOAuthClientsUseCase: ListOAuthClientsUseCase,
    @inject(TYPES.UpdateOAuthClientUseCase) private updateOAuthClientUseCase: UpdateOAuthClientUseCase,
    @inject(TYPES.DeleteOAuthClientUseCase) private deleteOAuthClientUseCase: DeleteOAuthClientUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createOAuthClientSchema.parse({
        ...req.body,
        tenant_id: req.body.tenant_id || req.tenant?.id,
      });
      const { client, client_secret } = await this.createOAuthClientUseCase.execute(dto);

      // No retornar client_secret_hash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { client_secret_hash, ...clientResponse } = client as any;

      res.status(201).json({
        status: 'success',
        data: {
          ...clientResponse,
          client_secret, // Solo se muestra una vez
        },
        warning: 'Store the client_secret securely. It will not be shown again.',
      });
    } catch (error) {
      logger.error('Error creating OAuth client', { error });
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await this.getOAuthClientUseCase.execute(id);

      // No retornar client_secret_hash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { client_secret_hash, ...clientResponse } = client as any;

      res.status(200).json({
        status: 'success',
        data: clientResponse,
      });
    } catch (error) {
      logger.error('Error getting OAuth client', { error });
      if (error instanceof Error && error.message === 'OAuth client not found') {
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
      const tenant_id = req.tenant?.id;
      const clients = await this.listOAuthClientsUseCase.execute(tenant_id);

      // No retornar client_secret_hash
      const clientsResponse = clients.map((client) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { client_secret_hash, ...clientResponse } = client as any;
        return clientResponse;
      });

      res.status(200).json({
        status: 'success',
        data: clientsResponse,
      });
    } catch (error) {
      logger.error('Error listing OAuth clients', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateOAuthClientSchema.parse(req.body);
      const client = await this.updateOAuthClientUseCase.execute(id, dto);

      // No retornar client_secret_hash
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { client_secret_hash, ...clientResponse } = client as any;

      res.status(200).json({
        status: 'success',
        data: clientResponse,
      });
    } catch (error) {
      logger.error('Error updating OAuth client', { error });
      if (error instanceof Error && error.message === 'OAuth client not found') {
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

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.deleteOAuthClientUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting OAuth client', { error });
      if (error instanceof Error && error.message === 'OAuth client not found') {
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


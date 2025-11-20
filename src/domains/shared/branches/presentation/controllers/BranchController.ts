/**
 * Controller para Branches
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateBranchUseCase } from '../../application/use-cases/CreateBranchUseCase';
import { GetBranchUseCase } from '../../application/use-cases/GetBranchUseCase';
import { ListBranchesUseCase } from '../../application/use-cases/ListBranchesUseCase';
import { UpdateBranchUseCase } from '../../application/use-cases/UpdateBranchUseCase';
import { DeleteBranchUseCase } from '../../application/use-cases/DeleteBranchUseCase';
import { createBranchSchema, updateBranchSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class BranchController {
  constructor(
    @inject(TYPES.CreateBranchUseCase) private createBranchUseCase: CreateBranchUseCase,
    @inject(TYPES.GetBranchUseCase) private getBranchUseCase: GetBranchUseCase,
    @inject(TYPES.ListBranchesUseCase) private listBranchesUseCase: ListBranchesUseCase,
    @inject(TYPES.UpdateBranchUseCase) private updateBranchUseCase: UpdateBranchUseCase,
    @inject(TYPES.DeleteBranchUseCase) private deleteBranchUseCase: DeleteBranchUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createBranchSchema.parse({
        ...req.body,
        tenant_id: req.body.tenant_id || req.tenant?.id,
      });
      const branch = await this.createBranchUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: branch,
      });
    } catch (error) {
      logger.error('Error creating branch', { error });
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
      const branch = await this.getBranchUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: branch,
      });
    } catch (error) {
      logger.error('Error getting branch', { error });
      if (error instanceof Error && error.message === 'Branch not found') {
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
      const branches = await this.listBranchesUseCase.execute(tenant_id);

      res.status(200).json({
        status: 'success',
        data: branches,
      });
    } catch (error) {
      logger.error('Error listing branches', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateBranchSchema.parse(req.body);
      const branch = await this.updateBranchUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: branch,
      });
    } catch (error) {
      logger.error('Error updating branch', { error });
      if (error instanceof Error && error.message === 'Branch not found') {
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
      await this.deleteBranchUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting branch', { error });
      if (error instanceof Error && error.message === 'Branch not found') {
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


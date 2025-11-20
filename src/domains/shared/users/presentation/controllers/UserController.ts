/**
 * Controller para Users
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase';
import { GetUserUseCase } from '../../application/use-cases/GetUserUseCase';
import { ListUsersUseCase } from '../../application/use-cases/ListUsersUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase';
import { createUserSchema, updateUserSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUserUseCase,
    @inject(TYPES.ListUsersUseCase) private listUsersUseCase: ListUsersUseCase,
    @inject(TYPES.UpdateUserUseCase) private updateUserUseCase: UpdateUserUseCase,
    @inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createUserSchema.parse(req.body);
      const user = await this.createUserUseCase.execute(dto);

      // No retornar password_hash en la respuesta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { password_hash, ...userResponse } = user as any;

      res.status(201).json({
        status: 'success',
        data: userResponse,
      });
    } catch (error) {
      logger.error('Error creating user', { error });
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
      const user = await this.getUserUseCase.execute(id);

      // No retornar password_hash en la respuesta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { password_hash, ...userResponse } = user as any;

      res.status(200).json({
        status: 'success',
        data: userResponse,
      });
    } catch (error) {
      logger.error('Error getting user', { error });
      if (error instanceof Error && error.message === 'User not found') {
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
      const users = await this.listUsersUseCase.execute(tenant_id);

      // No retornar password_hash en la respuesta
      const usersResponse = users.map((user) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { password_hash, ...userResponse } = user as any;
        return userResponse;
      });

      res.status(200).json({
        status: 'success',
        data: usersResponse,
      });
    } catch (error) {
      logger.error('Error listing users', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dto = updateUserSchema.parse(req.body);
      const user = await this.updateUserUseCase.execute(id, dto);

      // No retornar password_hash en la respuesta
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { password_hash, ...userResponse } = user as any;

      res.status(200).json({
        status: 'success',
        data: userResponse,
      });
    } catch (error) {
      logger.error('Error updating user', { error });
      if (error instanceof Error && error.message === 'User not found') {
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
      await this.deleteUserUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting user', { error });
      if (error instanceof Error && error.message === 'User not found') {
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


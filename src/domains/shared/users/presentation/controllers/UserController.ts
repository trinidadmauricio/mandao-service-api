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
import { listUsersFiltersSchema } from '../../application/dto/ListUsersFiltersDto';
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
      
      // Pasar contexto del usuario actual para validaciones de creación
      const context = req.user
        ? {
            currentUserRole: req.user.role,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;

      const user = await this.createUserUseCase.execute(dto, context);

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
        // Errores de restricciones de permisos deben retornar 403
        const isPermissionError = 
          error.message.includes('cannot create') ||
          error.message.includes('can only create') ||
          error.message.includes('cannot be created from backoffice') ||
          error.message.includes('requires authentication context');
        
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

      // Extraer y validar filtros de query params
      const filtersInput: Record<string, unknown> = {};
      if (req.query.search) {
        filtersInput.search = req.query.search as string;
      }
      if (req.query.role) {
        filtersInput.role = req.query.role as string;
      }
      if (req.query.status) {
        filtersInput.status = req.query.status as string;
      }
      if (req.query.page) {
        filtersInput.page = req.query.page;
      }
      if (req.query.limit) {
        filtersInput.limit = req.query.limit;
      }

      // Validar con schema Zod (solo si hay filtros)
      const filters =
        Object.keys(filtersInput).length > 0
          ? listUsersFiltersSchema.parse(filtersInput)
          : undefined;

      // Ejecutar UseCase
      const result = await this.listUsersUseCase.execute(tenant_id, filters);

      // Verificar si el resultado es UsersListResult (con paginación) o User[] (sin paginación)
      const isPaginatedResult = result && typeof result === 'object' && 'data' in result && 'total' in result;
      const usersList = isPaginatedResult ? (result as { data: any[]; total: number; page?: number; limit?: number; totalPages?: number }).data : (result as any[]);
      const total = isPaginatedResult ? (result as { data: any[]; total: number }).total : usersList.length;
      const page = isPaginatedResult ? (result as { page?: number }).page : undefined;
      const limit = isPaginatedResult ? (result as { limit?: number }).limit : undefined;
      const totalPages = isPaginatedResult ? (result as { totalPages?: number }).totalPages : undefined;

      // No retornar password_hash en la respuesta
      const usersResponse = usersList.map((user) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { password_hash, ...userResponse } = user as any;
        return userResponse;
      });

      // Construir respuesta
      const response: any = {
        status: 'success',
        data: usersResponse,
      };

      // Agregar metadatos de paginación si están presentes
      if (isPaginatedResult) {
        if (total !== undefined) response.total = total;
        if (page !== undefined) response.page = page;
        if (limit !== undefined) response.limit = limit;
        if (totalPages !== undefined) response.totalPages = totalPages;
      }

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error listing users', { error });
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid filter parameters',
          errors: error,
        });
        return;
      }
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


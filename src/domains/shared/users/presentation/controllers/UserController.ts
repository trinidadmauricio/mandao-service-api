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
import { UserRole } from '../../../../../shared/constants/permissions';
import { User } from '../../domain/entities/User';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUserUseCase,
    @inject(TYPES.ListUsersUseCase) private listUsersUseCase: ListUsersUseCase,
    @inject(TYPES.UpdateUserUseCase) private updateUserUseCase: UpdateUserUseCase,
    @inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase
  ) {}

  /**
   * Valida si el usuario autenticado puede acceder a un usuario específico
   * según las reglas de permisos:
   * - OWNER: solo puede acceder a MERCHANT_USER de su tenant_id
   * - LOGISTICS_PROVIDER: puede acceder a SUPERVISOR y DRIVER de su logistics_provider_id
   * - SAAS_EDITOR: puede acceder a todos excepto SAAS_ADMIN y SAAS_EDITOR
   * - SAAS_ADMIN: puede acceder a todos sin restricciones
   */
  private canAccessUser(req: Request, targetUser: User): boolean {
    const currentUser = req.user;
    if (!currentUser) {
      return false;
    }

    const currentRole = currentUser.role as UserRole;

    // SAAS_ADMIN tiene acceso completo
    if (currentRole === UserRole.SAAS_ADMIN) {
      return true;
    }

    // OWNER solo puede acceder a MERCHANT_USER de su tenant_id
    if (currentRole === UserRole.OWNER) {
      return targetUser.role === UserRole.MERCHANT_USER && targetUser.tenant_id === req.tenant?.id;
    }

    // LOGISTICS_PROVIDER puede acceder a SUPERVISOR y DRIVER de su logistics_provider_id
    if (currentRole === UserRole.LOGISTICS_PROVIDER) {
      return (
        (targetUser.role === UserRole.SUPERVISOR || targetUser.role === UserRole.DRIVER) &&
        targetUser.logistics_provider_id === currentUser.logistics_provider_id
      );
    }

    // SAAS_EDITOR puede acceder a todos excepto SAAS_ADMIN y SAAS_EDITOR
    if (currentRole === UserRole.SAAS_EDITOR) {
      return targetUser.role !== UserRole.SAAS_ADMIN && targetUser.role !== UserRole.SAAS_EDITOR;
    }

    // Por defecto, no permitir acceso
    return false;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createUserSchema.parse(req.body);

      // Asignar tenant_id automáticamente según el rol del usuario a crear
      // LOGISTICS_PROVIDER, SUPERVISOR y DRIVER NO deben tener tenant_id (null)
      // Los demás roles SÍ deben tener tenant_id del usuario actual o del request
      const newUserRole = dto.role as UserRole;
      if (
        newUserRole === UserRole.LOGISTICS_PROVIDER ||
        newUserRole === UserRole.SUPERVISOR ||
        newUserRole === UserRole.DRIVER
      ) {
        // Estos roles no tienen tenant_id
        dto.tenant_id = null;
      } else {
        // Los demás roles deben tener tenant_id
        // Prioridad: 1) tenant_id del body (si viene), 2) req.tenant?.id, 3) req.user?.tenant_id
        if (!dto.tenant_id) {
          dto.tenant_id = req.tenant?.id || req.user?.tenant_id || null;
        }
      }

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

      // Validar permisos de acceso
      if (!this.canAccessUser(req, user)) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied',
        });
        return;
      }

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

      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, filtrar automáticamente por su logistics_provider_id
      const currentUserRole = req.user?.role as UserRole | undefined;
      const autoLogisticsProviderId =
        (currentUserRole === UserRole.LOGISTICS_PROVIDER ||
          currentUserRole === UserRole.SUPERVISOR) &&
        req.user
          ? req.user.logistics_provider_id || undefined
          : undefined;

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
      if (req.query.logistics_provider_id) {
        filtersInput.logistics_provider_id = req.query.logistics_provider_id as string;
      }
      if (req.query.page) {
        filtersInput.page = req.query.page;
      }
      if (req.query.limit) {
        filtersInput.limit = req.query.limit;
      }

      // Filtrado automático por rol según el usuario actual
      // OWNER siempre debe ver solo MERCHANT_USER, incluso si hay filtro manual
      if (currentUserRole === UserRole.OWNER) {
        filtersInput.role = UserRole.MERCHANT_USER;
      }

      // LOGISTICS_PROVIDER solo puede ver usuarios SUPERVISOR y DRIVER de su logistics_provider_id
      // Si no hay filtro de rol específico, no aplicar restricción aquí (se filtrará después)
      // Pero si se especifica un rol, validar que sea SUPERVISOR o DRIVER
      if (currentUserRole === UserRole.LOGISTICS_PROVIDER) {
        if (filtersInput.role && filtersInput.role !== UserRole.SUPERVISOR && filtersInput.role !== UserRole.DRIVER) {
          res.status(403).json({
            status: 'error',
            message: 'LOGISTICS_PROVIDER can only view SUPERVISOR and DRIVER users',
          });
          return;
        }
        // Si no hay filtro de rol, no forzarlo aquí - se filtrará después de obtener resultados
      }

      // SUPERVISOR solo puede ver usuarios DRIVER de su logistics_provider_id
      if (currentUserRole === UserRole.SUPERVISOR) {
        // Si no se especificó un rol en los filtros, forzar DRIVER
        if (!filtersInput.role) {
          filtersInput.role = UserRole.DRIVER;
        } else if (filtersInput.role !== UserRole.DRIVER) {
          // Si se especificó un rol diferente, rechazar
          res.status(403).json({
            status: 'error',
            message: 'SUPERVISOR can only view DRIVER users',
          });
          return;
        }
      }

      // SAAS_ADMIN ven todos (no aplicar filtro automático)
      // SAAS_EDITOR: se filtrará después de obtener resultados

      // Si hay autoLogisticsProviderId y no está en los filtros, agregarlo
      if (autoLogisticsProviderId && !filtersInput.logistics_provider_id) {
        filtersInput.logistics_provider_id = autoLogisticsProviderId;
      }

      // Validar con schema Zod
      // Siempre crear objeto de filtros si hay algún filtro aplicado (incluyendo roles forzados)
      // o si hay query params, para asegurar que se use findAllWithFilters
      const filters =
        Object.keys(filtersInput).length > 0
          ? listUsersFiltersSchema.parse(filtersInput)
          : undefined;

      // Ejecutar UseCase
      const result = await this.listUsersUseCase.execute(tenant_id, filters);

      // Verificar si el resultado es UsersListResult (con paginación) o User[] (sin paginación)
      const isPaginatedResult =
        result && typeof result === 'object' && 'data' in result && 'total' in result;
      const usersList = isPaginatedResult
        ? (
            result as {
              data: any[];
              total: number;
              page?: number;
              limit?: number;
              totalPages?: number;
            }
          ).data
        : (result as any[]);
      let total = isPaginatedResult
        ? (result as { data: any[]; total: number }).total
        : usersList.length;
      const page = isPaginatedResult ? (result as { page?: number }).page : undefined;
      const limit = isPaginatedResult ? (result as { limit?: number }).limit : undefined;
      let totalPages = isPaginatedResult
        ? (result as { totalPages?: number }).totalPages
        : undefined;

      // No retornar password_hash en la respuesta
      let usersResponse = usersList.map((user) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { password_hash, ...userResponse } = user as any;
        return userResponse;
      });

      // Filtrar resultados para SAAS_EDITOR (excluir SAAS_ADMIN y SAAS_EDITOR)
      if (currentUserRole === UserRole.SAAS_EDITOR) {
        usersResponse = usersResponse.filter(
          (user) => user.role !== UserRole.SAAS_ADMIN && user.role !== UserRole.SAAS_EDITOR
        );
        // Ajustar total si es necesario
        if (isPaginatedResult) {
          total = usersResponse.length;
          totalPages = Math.ceil(total / (limit || 10));
        }
      }

      // Filtrar resultados para LOGISTICS_PROVIDER (solo SUPERVISOR y DRIVER)
      // Esto se aplica cuando no hay filtro de rol específico en la query
      if (currentUserRole === UserRole.LOGISTICS_PROVIDER && !req.query.role) {
        usersResponse = usersResponse.filter(
          (user) => user.role === UserRole.SUPERVISOR || user.role === UserRole.DRIVER
        );
        // Ajustar total si es necesario
        if (isPaginatedResult) {
          total = usersResponse.length;
          totalPages = Math.ceil(total / (limit || 10));
        }
      }

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

      // Obtener el usuario existente para validar permisos
      const existingUser = await this.getUserUseCase.execute(id);

      // Validar permisos de acceso
      if (!this.canAccessUser(req, existingUser)) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied',
        });
        return;
      }

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

      // Obtener el usuario existente para validar permisos
      const existingUser = await this.getUserUseCase.execute(id);

      // Validar permisos de acceso
      if (!this.canAccessUser(req, existingUser)) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied',
        });
        return;
      }

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

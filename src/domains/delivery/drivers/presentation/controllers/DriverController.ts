/**
 * Controller para Drivers
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { CreateDriverUseCase } from '../../application/use-cases/CreateDriverUseCase';
import { GetDriverUseCase } from '../../application/use-cases/GetDriverUseCase';
import { ListDriversUseCase } from '../../application/use-cases/ListDriversUseCase';
import { UpdateDriverUseCase } from '../../application/use-cases/UpdateDriverUseCase';
import { DeleteDriverUseCase } from '../../application/use-cases/DeleteDriverUseCase';
import { createDriverSchema, updateDriverSchema } from '../../application/dto/CreateDriverDto';
import { listDriversFiltersSchema } from '../../application/dto/ListDriversFiltersDto';
import { logger } from '../../../../../shared/utils/logger';
import { UserRole } from '../../../../../shared/constants/permissions';
import { TYPES } from '../../../../../config/types';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { IVehicleRepository } from '../../../vehicles/domain/repositories/IVehicleRepository';

@injectable()
export class DriverController {
  constructor(
    @inject(TYPES.CreateDriverUseCase) private createUseCase: CreateDriverUseCase,
    @inject(TYPES.GetDriverUseCase) private getUseCase: GetDriverUseCase,
    @inject(TYPES.ListDriversUseCase) private listUseCase: ListDriversUseCase,
    @inject(TYPES.UpdateDriverUseCase) private updateUseCase: UpdateDriverUseCase,
    @inject(TYPES.DeleteDriverUseCase) private deleteUseCase: DeleteDriverUseCase,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IDriverRepository) private driverRepository: IDriverRepository,
    @inject(TYPES.IVehicleRepository) private vehicleRepository: IVehicleRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createDriverSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      const driver = await this.createUseCase.execute(dto, context);

      res.status(201).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      logger.error('Error creating driver', { error });
      if (error instanceof Error) {
        const isPermissionError = error.message.includes('permission') || error.message.includes('can only');
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
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      const driver = await this.getUseCase.execute(id, context);

      res.status(200).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      logger.error('Error getting driver', { error });
      if (error instanceof Error) {
        if (error.message === 'Driver not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('permission')) {
          res.status(403).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      // Si el usuario es LOGISTICS_PROVIDER o SUPERVISOR, filtrar automáticamente por su logistics_provider_id
      // Si no es LOGISTICS_PROVIDER/SUPERVISOR, usar el query parameter si se proporciona
      const autoLogisticsProviderId =
        req.user?.role === UserRole.LOGISTICS_PROVIDER || req.user?.role === UserRole.SUPERVISOR
          ? req.user.logistics_provider_id || undefined
          : undefined;

      // Extraer y validar filtros de query params
      const filtersInput: Record<string, unknown> = {};
      if (req.query.search) {
        filtersInput.search = req.query.search as string;
      }
      if (req.query.availability_status) {
        filtersInput.availability_status = req.query.availability_status as string;
      }
      if (req.query.work_type) {
        filtersInput.work_type = req.query.work_type as string;
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

      // Si hay autoLogisticsProviderId y no está en los filtros, agregarlo
      if (autoLogisticsProviderId && !filtersInput.logistics_provider_id) {
        filtersInput.logistics_provider_id = autoLogisticsProviderId;
      }

      // Validar con schema Zod (solo si hay filtros)
      const filters =
        Object.keys(filtersInput).length > 0
          ? listDriversFiltersSchema.parse(filtersInput)
          : undefined;

      // Determinar logistics_provider_id para pasar al UseCase
      const logistics_provider_id = filters?.logistics_provider_id || autoLogisticsProviderId;

      // Ejecutar UseCase
      const result = await this.listUseCase.execute(logistics_provider_id, filters);

      // Verificar si el resultado es DriversListResult (con paginación) o Driver[] (sin paginación)
      const isPaginatedResult = result && typeof result === 'object' && 'data' in result && 'total' in result;
      const driversList = isPaginatedResult ? (result as { data: any[]; total: number }).data : (result as any[]);
      const total = isPaginatedResult ? (result as { data: any[]; total: number }).total : driversList.length;

      // Obtener los usuarios únicos para todos los drivers
      const uniqueUserIds = [...new Set(driversList.map((driver) => driver.user_id))];
      const users = await Promise.all(
        uniqueUserIds.map((userId) => this.userRepository.findById(userId))
      );

      // Crear un mapa de user_id -> user para acceso rápido
      const userMap = new Map();
      users.forEach((user) => {
        if (user) {
          userMap.set(user.id, user);
        }
      });

      // Agregar el usuario a cada driver en la respuesta
      const driversWithUsers = driversList.map((driver) => {
        const user = userMap.get(driver.user_id);
        return {
          id: driver.id,
          logistics_provider_id: driver.logistics_provider_id,
          user_id: driver.user_id,
          identity_document: driver.identity_document,
          driving_license: driver.driving_license,
          date_of_birth: driver.date_of_birth.toISOString(),
          emergency_contact: driver.emergency_contact,
          has_own_vehicle: driver.has_own_vehicle,
          vehicle_id: driver.vehicle_id,
          work_type: driver.work_type,
          work_zone: driver.work_zone,
          availability_status: driver.availability_status,
          rating_avg: driver.rating_avg,
          total_deliveries: driver.total_deliveries,
          documents: driver.documents,
          created_at: driver.created_at.toISOString(),
          updated_at: driver.updated_at.toISOString(),
          user: user
            ? {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                role: user.role,
              }
            : undefined,
        };
      });

      // Calcular paginación
      const page = filters?.page || 1;
      const limit = filters?.limit || driversList.length || 10;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        status: 'success',
        data: driversWithUsers,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      logger.error('Error listing drivers', { error });
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
      const dto = updateDriverSchema.parse(req.body);
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      const driver = await this.updateUseCase.execute(id, dto, context);

      res.status(200).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      logger.error('Error updating driver', { error });
      if (error instanceof Error) {
        if (error.message === 'Driver not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('permission')) {
          res.status(403).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
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
      const context = req.user
        ? {
            currentUserRole: req.user.role as string,
            currentUserLogisticsProviderId: req.user.logistics_provider_id || null,
          }
        : undefined;
      await this.deleteUseCase.execute(id, context);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting driver', { error });
      if (error instanceof Error) {
        if (error.message === 'Driver not found') {
          res.status(404).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
        if (error.message.includes('permission')) {
          res.status(403).json({
            status: 'error',
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  /**
   * GET /api/v1/drivers/me
   * Obtiene el perfil del driver actual basado en el usuario autenticado
   */
  async getMe(req: Request, res: Response): Promise<void> {
    try {
      // Verificar que el usuario está autenticado
      if (!req.user || !req.user.id) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      // Verificar que el usuario tiene rol de DRIVER
      if (req.user.role !== UserRole.DRIVER) {
        res.status(403).json({
          status: 'error',
          message: 'Only drivers can access this endpoint',
        });
        return;
      }

      // Buscar driver por user_id
      const driver = await this.driverRepository.findByUserId(req.user.id);

      if (!driver) {
        res.status(404).json({
          status: 'error',
          message: 'Driver profile not found',
        });
        return;
      }

      // Obtener información del usuario
      const user = await this.userRepository.findById(driver.user_id);

      // Obtener información del vehículo si tiene uno asignado
      let vehicle = null;
      if (driver.vehicle_id) {
        vehicle = await this.vehicleRepository.findById(driver.vehicle_id);
      }

      // Construir respuesta completa
      const driverProfile = {
        id: driver.id,
        logistics_provider_id: driver.logistics_provider_id,
        user_id: driver.user_id,
        identity_document: driver.identity_document,
        driving_license: driver.driving_license,
        date_of_birth: driver.date_of_birth.toISOString(),
        emergency_contact: driver.emergency_contact,
        has_own_vehicle: driver.has_own_vehicle,
        vehicle_id: driver.vehicle_id,
        work_type: driver.work_type,
        work_zone: driver.work_zone,
        availability_status: driver.availability_status,
        rating_avg: driver.rating_avg,
        total_deliveries: driver.total_deliveries,
        documents: driver.documents,
        created_at: driver.created_at.toISOString(),
        updated_at: driver.updated_at.toISOString(),
        user: user
          ? {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone: user.phone,
              role: user.role,
            }
          : undefined,
        vehicle: vehicle
          ? {
              id: vehicle.id,
              vehicle_type: vehicle.vehicle_type,
              license_plate: vehicle.license_plate,
              brand: vehicle.brand,
              model: vehicle.model,
              year: vehicle.year,
              color: vehicle.color,
            }
          : undefined,
      };

      res.status(200).json({
        status: 'success',
        data: driverProfile,
      });
    } catch (error) {
      logger.error('Error getting driver profile', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


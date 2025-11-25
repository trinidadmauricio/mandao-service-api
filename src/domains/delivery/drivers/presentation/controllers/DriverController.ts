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
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';
import { IUserRepository } from '../../../../shared/users/domain/repositories/IUserRepository';

@injectable()
export class DriverController {
  constructor(
    @inject(TYPES.CreateDriverUseCase) private createUseCase: CreateDriverUseCase,
    @inject(TYPES.GetDriverUseCase) private getUseCase: GetDriverUseCase,
    @inject(TYPES.ListDriversUseCase) private listUseCase: ListDriversUseCase,
    @inject(TYPES.UpdateDriverUseCase) private updateUseCase: UpdateDriverUseCase,
    @inject(TYPES.DeleteDriverUseCase) private deleteUseCase: DeleteDriverUseCase,
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const dto = createDriverSchema.parse(req.body);
      const driver = await this.createUseCase.execute(dto);

      res.status(201).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      logger.error('Error creating driver', { error });
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
      const driver = await this.getUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      logger.error('Error getting driver', { error });
      if (error instanceof Error && error.message === 'Driver not found') {
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
      // Si el usuario es LOGISTICS_PROVIDER, filtrar automáticamente por su logistics_provider_id
      // Si no es LOGISTICS_PROVIDER, usar el query parameter si se proporciona
      const logistics_provider_id = req.user?.role === 'LOGISTICS_PROVIDER'
        ? req.user.logistics_provider_id || undefined
        : (req.query.logistics_provider_id as string | undefined);
      
      // Filtrar por availability_status si se proporciona en el query
      const availability_status = req.query.availability_status as 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'SUSPENDED' | undefined;
      
      const drivers = await this.listUseCase.execute(logistics_provider_id, availability_status);

      // Obtener los usuarios únicos para todos los drivers
      const uniqueUserIds = [...new Set(drivers.map((driver) => driver.user_id))];
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
      const driversWithUsers = drivers.map((driver) => {
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

      res.status(200).json({
        status: 'success',
        data: driversWithUsers,
      });
    } catch (error) {
      logger.error('Error listing drivers', { error });
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
      const driver = await this.updateUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: driver,
      });
    } catch (error) {
      logger.error('Error updating driver', { error });
      if (error instanceof Error && error.message === 'Driver not found') {
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
      await this.deleteUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting driver', { error });
      if (error instanceof Error && error.message === 'Driver not found') {
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


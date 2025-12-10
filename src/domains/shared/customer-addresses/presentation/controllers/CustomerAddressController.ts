/**
 * Controller para CustomerAddress
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { GetCustomerAddressesUseCase } from '../../application/use-cases/GetCustomerAddressesUseCase';
import { GetCustomerAddressUseCase } from '../../application/use-cases/GetCustomerAddressUseCase';
import { CreateCustomerAddressUseCase } from '../../application/use-cases/CreateCustomerAddressUseCase';
import { UpdateCustomerAddressUseCase } from '../../application/use-cases/UpdateCustomerAddressUseCase';
import { DeleteCustomerAddressUseCase } from '../../application/use-cases/DeleteCustomerAddressUseCase';
import { createCustomerAddressSchema, updateCustomerAddressSchema } from '../../application/dto';
import { logger } from '../../../../../shared/utils/logger';
import { TYPES } from '../../../../../config/types';

@injectable()
export class CustomerAddressController {
  constructor(
    @inject(TYPES.GetCustomerAddressesUseCase)
    private getAddressesUseCase: GetCustomerAddressesUseCase,
    @inject(TYPES.GetCustomerAddressUseCase)
    private getAddressUseCase: GetCustomerAddressUseCase,
    @inject(TYPES.CreateCustomerAddressUseCase)
    private createAddressUseCase: CreateCustomerAddressUseCase,
    @inject(TYPES.UpdateCustomerAddressUseCase)
    private updateAddressUseCase: UpdateCustomerAddressUseCase,
    @inject(TYPES.DeleteCustomerAddressUseCase)
    private deleteAddressUseCase: DeleteCustomerAddressUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const addresses = await this.getAddressesUseCase.execute(
        req.tenant.id,
        req.user.id
      );

      res.status(200).json({
        status: 'success',
        data: addresses.map(this.mapToResponse),
      });
    } catch (error) {
      logger.error('Error listing customer addresses', { error });
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const address = await this.getAddressUseCase.execute(id);

      // Verificar que la dirección pertenece al usuario
      if (address.tenant_id !== req.tenant.id || address.customer_id !== req.user.id) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: this.mapToResponse(address),
      });
    } catch (error) {
      logger.error('Error getting customer address', { error });
      if (error instanceof Error && error.message === 'Address not found') {
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const dto = createCustomerAddressSchema.parse(req.body);
      const address = await this.createAddressUseCase.execute(
        req.tenant.id,
        req.user.id,
        dto
      );

      res.status(201).json({
        status: 'success',
        data: this.mapToResponse(address),
      });
    } catch (error) {
      logger.error('Error creating customer address', { error });
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: (error as any).errors,
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
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const existingAddress = await this.getAddressUseCase.execute(id);

      // Verificar que la dirección pertenece al usuario
      if (existingAddress.tenant_id !== req.tenant.id || existingAddress.customer_id !== req.user.id) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied',
        });
        return;
      }

      const dto = updateCustomerAddressSchema.parse(req.body);
      const address = await this.updateAddressUseCase.execute(id, dto);

      res.status(200).json({
        status: 'success',
        data: this.mapToResponse(address),
      });
    } catch (error) {
      logger.error('Error updating customer address', { error });
      if (error instanceof Error && error.message === 'Address not found') {
        res.status(404).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: (error as any).errors,
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
      if (!req.user || !req.tenant) {
        res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
        return;
      }

      const { id } = req.params;
      const existingAddress = await this.getAddressUseCase.execute(id);

      // Verificar que la dirección pertenece al usuario
      if (existingAddress.tenant_id !== req.tenant.id || existingAddress.customer_id !== req.user.id) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied',
        });
        return;
      }

      await this.deleteAddressUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting customer address', { error });
      if (error instanceof Error && error.message === 'Address not found') {
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

  private mapToResponse(address: any) {
    return {
      id: address.id,
      tenant_id: address.tenant_id,
      customer_id: address.customer_id,
      label: address.label,
      recipient_name: address.recipient_name,
      phone: address.phone,
      street: address.street,
      street_line_2: address.street_line_2,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      country: address.country,
      lat: address.lat,
      lng: address.lng,
      instructions: address.instructions,
      is_default: address.is_default,
      created_at: address.created_at,
      updated_at: address.updated_at,
    };
  }
}


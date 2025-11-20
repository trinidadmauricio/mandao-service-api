/**
 * Use Case: Cambiar Branch de Orden
 * 
 * Patrón inmutable: INSERT nuevo order_branches, marca anteriores como is_current = false
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { IBranchRepository } from '../../../../shared/branches/domain/repositories/IBranchRepository';
import { PrismaClient, Prisma } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface ChangeBranchDto {
  order_id: string;
  branch_id: string;
  assigned_by_user_id?: string;
}

@injectable()
export class ChangeBranchUseCase {
  constructor(
    @inject(TYPES.IOrderRepository) private orderRepository: IOrderRepository,
    @inject(TYPES.IBranchRepository) private branchRepository: IBranchRepository,
    @inject(TYPES.PrismaClient) private prisma: PrismaClient
  ) {}

  async execute(dto: ChangeBranchDto): Promise<void> {
    // Verificar que la orden existe
    const order = await this.orderRepository.findById(dto.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Verificar que el branch existe
    const branch = await this.branchRepository.findById(dto.branch_id);
    if (!branch) {
      throw new Error('Branch not found');
    }

    if (!branch.isActive()) {
      throw new Error('Branch is not active');
    }

    // Crear snapshot del branch
    const branchSnapshot = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      contact_phone: branch.contact_phone,
      gps_lat: branch.gps_lat,
      gps_lng: branch.gps_lng,
      is_main: branch.is_main,
    };

    // Usar transacción para atomicidad
    await this.prisma.$transaction(async (tx) => {
      // Marcar todos los order_branches anteriores como is_current = false
      await tx.orderBranch.updateMany({
        where: {
          order_id: dto.order_id,
          is_current: true,
        },
        data: {
          is_current: false,
        },
      });

      // INSERT nuevo order_branches
      await tx.orderBranch.create({
        data: {
          order_id: dto.order_id,
          branch_id: dto.branch_id,
          branch_snapshot: branchSnapshot as Prisma.InputJsonValue,
          assigned_at: new Date(),
          is_current: true,
          assigned_by_user_id: dto.assigned_by_user_id ?? null,
        },
      });
    });
  }
}


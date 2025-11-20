/**
 * Implementación de InventoryMovement Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import type { MovementType as PrismaMovementType, ReferenceType as PrismaReferenceType } from '@prisma/client';
import {
  IInventoryMovementRepository,
  CreateInventoryMovementData,
} from '../../domain/repositories/IInventoryMovementRepository';
import { InventoryMovement, MovementType, ReferenceType } from '../../domain/entities/InventoryMovement';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaInventoryMovementRepository implements IInventoryMovementRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<InventoryMovement | null> {
    const data = await this.prisma.inventoryMovement.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(
    tenant_id?: string,
    product_id?: string,
    branch_id?: string,
    movement_type?: MovementType
  ): Promise<InventoryMovement[]> {
    const where: Prisma.InventoryMovementWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (product_id) where.product_id = product_id;
    if (branch_id) where.branch_id = branch_id;
    if (movement_type) where.movement_type = movement_type as PrismaMovementType;

    const data = await this.prisma.inventoryMovement.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateInventoryMovementData): Promise<InventoryMovement> {
    const created = await this.prisma.inventoryMovement.create({
      data: {
        tenant_id: data.tenant_id,
        product_id: data.product_id,
        variant_id: data.variant_id ?? null,
        branch_id: data.branch_id,
        movement_type: data.movement_type as PrismaMovementType,
        quantity: data.quantity,
        stock_before: data.stock_before,
        stock_after: data.stock_after,
        reference_type: data.reference_type ? (data.reference_type as PrismaReferenceType) : null,
        reference_id: data.reference_id ?? null,
        notes: data.notes ?? null,
        created_by_user_id: data.created_by_user_id,
      },
    });

    return this.toDomain(created);
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    product_id: string;
    variant_id: string | null;
    branch_id: string;
    movement_type: string;
    quantity: number;
    stock_before: number;
    stock_after: number;
    reference_type: string | null;
    reference_id: string | null;
    notes: string | null;
    created_by_user_id: string;
    created_at: Date;
  }): InventoryMovement {
    return new InventoryMovement(
      data.id,
      data.tenant_id,
      data.product_id,
      data.variant_id,
      data.branch_id,
      data.movement_type as MovementType,
      data.quantity,
      data.stock_before,
      data.stock_after,
      data.reference_type as ReferenceType | null,
      data.reference_id,
      data.notes,
      data.created_by_user_id,
      data.created_at
    );
  }
}


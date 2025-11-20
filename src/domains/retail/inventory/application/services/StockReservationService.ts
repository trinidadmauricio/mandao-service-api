/**
 * Service para reservar y liberar stock
 * Maneja concurrencia usando transacciones
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import type { MovementType as PrismaMovementType, ReferenceType as PrismaReferenceType } from '@prisma/client';
import { StockByBranch } from '../../domain/entities/StockByBranch';
import { InventoryMovement, MovementType, ReferenceType } from '../../domain/entities/InventoryMovement';
import { TYPES } from '../../../../../config/types';

export interface ReserveStockRequest {
  tenant_id: string;
  product_id: string;
  variant_id: string | null;
  branch_id: string;
  quantity: number;
  reference_type: 'ORDER' | 'RESERVATION';
  reference_id: string;
  created_by_user_id: string;
  notes?: string;
}

export interface ReleaseStockRequest {
  tenant_id: string;
  product_id: string;
  variant_id: string | null;
  branch_id: string;
  quantity: number;
  reference_type: 'ORDER' | 'RESERVATION';
  reference_id: string;
  created_by_user_id: string;
  notes?: string;
}

@injectable()
export class StockReservationService {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  /**
   * Reserva stock para una orden o reservación
   * Usa transacción para garantizar atomicidad
   */
  async reserveStock(request: ReserveStockRequest): Promise<{ stock: StockByBranch; movement: InventoryMovement }> {
    return await this.prisma.$transaction(async (tx) => {
      // Obtener stock actual con lock (SELECT FOR UPDATE)
      const stock = await tx.stockByBranch.findFirst({
        where: {
          product_id: request.product_id,
          variant_id: request.variant_id ?? null,
          branch_id: request.branch_id,
          tenant_id: request.tenant_id,
        },
      });

      if (!stock) {
        throw new Error('Stock not found');
      }

      if (stock.tenant_id !== request.tenant_id) {
        throw new Error('Stock belongs to different tenant');
      }

      const available = stock.current_stock - stock.reserved_stock;
      if (available < request.quantity) {
        throw new Error('Insufficient available stock');
      }

      // Actualizar stock reservado
      const updatedStock = await tx.stockByBranch.update({
        where: { id: stock.id },
        data: {
          reserved_stock: stock.reserved_stock + request.quantity,
          available_stock: stock.current_stock - (stock.reserved_stock + request.quantity),
        },
      });

      // Crear movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          tenant_id: request.tenant_id,
          product_id: request.product_id,
          variant_id: request.variant_id || null,
          branch_id: request.branch_id,
          movement_type: 'PURCHASE' as PrismaMovementType, // Usar PURCHASE como equivalente a RESERVATION en Prisma
          quantity: request.quantity,
          stock_before: stock.current_stock - stock.reserved_stock,
          stock_after: updatedStock.current_stock - updatedStock.reserved_stock,
          reference_type: (request.reference_type === 'ORDER' ? 'ORDER' : 'ADJUSTMENT') as PrismaReferenceType,
          reference_id: request.reference_id,
          notes: request.notes || null,
          created_by_user_id: request.created_by_user_id,
        },
      });

      return {
        stock: this.toStockDomain(updatedStock),
        movement: this.toMovementDomain(movement),
      };
    });
  }

  /**
   * Libera stock reservado
   */
  async releaseStock(request: ReleaseStockRequest): Promise<{ stock: StockByBranch; movement: InventoryMovement }> {
    return await this.prisma.$transaction(async (tx) => {
      const stock = await tx.stockByBranch.findFirst({
        where: {
          product_id: request.product_id,
          variant_id: request.variant_id ?? null,
          branch_id: request.branch_id,
          tenant_id: request.tenant_id,
        },
      });

      if (!stock) {
        throw new Error('Stock not found');
      }

      if (stock.tenant_id !== request.tenant_id) {
        throw new Error('Stock belongs to different tenant');
      }

      if (stock.reserved_stock < request.quantity) {
        throw new Error('Cannot release more stock than reserved');
      }

      // Actualizar stock reservado
      const updatedStock = await tx.stockByBranch.update({
        where: { id: stock.id },
        data: {
          reserved_stock: stock.reserved_stock - request.quantity,
          available_stock: stock.current_stock - (stock.reserved_stock - request.quantity),
        },
      });

      // Crear movimiento
      const movement = await tx.inventoryMovement.create({
        data: {
          tenant_id: request.tenant_id,
          product_id: request.product_id,
          variant_id: request.variant_id || null,
          branch_id: request.branch_id,
          movement_type: 'SALE' as PrismaMovementType, // Usar SALE como equivalente a RELEASE en Prisma
          quantity: request.quantity,
          stock_before: stock.current_stock - stock.reserved_stock,
          stock_after: updatedStock.current_stock - updatedStock.reserved_stock,
          reference_type: (request.reference_type === 'ORDER' ? 'ORDER' : 'ADJUSTMENT') as PrismaReferenceType,
          reference_id: request.reference_id,
          notes: request.notes || null,
          created_by_user_id: request.created_by_user_id,
        },
      });

      return {
        stock: this.toStockDomain(updatedStock),
        movement: this.toMovementDomain(movement),
      };
    });
  }

  private toStockDomain(data: any): StockByBranch {
    return new StockByBranch(
      data.id,
      data.tenant_id,
      data.product_id,
      data.variant_id,
      data.branch_id,
      data.current_stock,
      data.reserved_stock,
      data.available_stock,
      data.last_updated_at,
      data.created_at,
      data.updated_at
    );
  }

  private toMovementDomain(data: {
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
      data.reference_type ? (data.reference_type as ReferenceType) : null,
      data.reference_id,
      data.notes,
      data.created_by_user_id,
      data.created_at
    );
  }
}


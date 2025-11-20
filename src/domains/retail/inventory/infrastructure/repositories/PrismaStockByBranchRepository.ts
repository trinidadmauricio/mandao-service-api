/**
 * Implementación de StockByBranch Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IStockByBranchRepository,
  CreateStockByBranchData,
  UpdateStockByBranchData,
} from '../../domain/repositories/IStockByBranchRepository';
import { StockByBranch } from '../../domain/entities/StockByBranch';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaStockByBranchRepository implements IStockByBranchRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<StockByBranch | null> {
    const data = await this.prisma.stockByBranch.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByProductAndBranch(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string
  ): Promise<StockByBranch | null> {
    const data = await this.prisma.stockByBranch.findFirst({
      where: {
        product_id,
        variant_id: variant_id ?? null,
        branch_id,
        tenant_id,
      },
    });

    if (!data || data.tenant_id !== tenant_id) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string, branch_id?: string, product_id?: string): Promise<StockByBranch[]> {
    const where: Prisma.StockByBranchWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (branch_id) where.branch_id = branch_id;
    if (product_id) where.product_id = product_id;

    const data = await this.prisma.stockByBranch.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateStockByBranchData): Promise<StockByBranch> {
    const available_stock = data.available_stock ?? (data.current_stock ?? 0) - (data.reserved_stock ?? 0);

    const created = await this.prisma.stockByBranch.create({
      data: {
        tenant_id: data.tenant_id,
        product_id: data.product_id,
        variant_id: data.variant_id ?? null,
        branch_id: data.branch_id,
        current_stock: data.current_stock ?? 0,
        reserved_stock: data.reserved_stock ?? 0,
        available_stock,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateStockByBranchData): Promise<StockByBranch> {
    const updateData: Prisma.StockByBranchUpdateInput = {};
    if (data.current_stock !== undefined) updateData.current_stock = data.current_stock;
    if (data.reserved_stock !== undefined) updateData.reserved_stock = data.reserved_stock;
    if (data.available_stock !== undefined) {
      updateData.available_stock = data.available_stock;
    } else if (data.current_stock !== undefined || data.reserved_stock !== undefined) {
      // Recalcular available_stock si cambió current o reserved
      const existing = await this.findById(id);
      if (existing) {
        const newCurrent = data.current_stock ?? existing.current_stock;
        const newReserved = data.reserved_stock ?? existing.reserved_stock;
        updateData.available_stock = Math.max(0, newCurrent - newReserved);
      }
    }

    const updated = await this.prisma.stockByBranch.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async incrementStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch> {
    // Usar upsert para crear si no existe
    const stock = await this.findByProductAndBranch(tenant_id, product_id, variant_id, branch_id);

    if (stock) {
      return await this.update(stock.id, {
        current_stock: stock.current_stock + quantity,
      });
    } else {
      return await this.create({
        tenant_id,
        product_id,
        variant_id,
        branch_id,
        current_stock: quantity,
        reserved_stock: 0,
        available_stock: quantity,
      });
    }
  }

  async decrementStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch> {
    const stock = await this.findByProductAndBranch(tenant_id, product_id, variant_id, branch_id);
    if (!stock) {
      throw new Error('Stock not found');
    }

    if (stock.current_stock < quantity) {
      throw new Error('Insufficient stock');
    }

    return await this.update(stock.id, {
      current_stock: stock.current_stock - quantity,
    });
  }

  async reserveStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch> {
    const stock = await this.findByProductAndBranch(tenant_id, product_id, variant_id, branch_id);
    if (!stock) {
      throw new Error('Stock not found');
    }

    const available = stock.calculateAvailableStock();
    if (available < quantity) {
      throw new Error('Insufficient available stock');
    }

    return await this.update(stock.id, {
      reserved_stock: stock.reserved_stock + quantity,
    });
  }

  async releaseStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch> {
    const stock = await this.findByProductAndBranch(tenant_id, product_id, variant_id, branch_id);
    if (!stock) {
      throw new Error('Stock not found');
    }

    if (stock.reserved_stock < quantity) {
      throw new Error('Cannot release more stock than reserved');
    }

    return await this.update(stock.id, {
      reserved_stock: stock.reserved_stock - quantity,
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    product_id: string;
    variant_id: string | null;
    branch_id: string;
    current_stock: number;
    reserved_stock: number;
    available_stock: number;
    last_updated_at: Date;
    created_at: Date;
    updated_at: Date;
  }): StockByBranch {
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
}


/**
 * Interface para StockByBranch Repository
 */

import { StockByBranch } from '../entities/StockByBranch';

export interface IStockByBranchRepository {
  findById(id: string): Promise<StockByBranch | null>;
  findByProductAndBranch(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string
  ): Promise<StockByBranch | null>;
  findAll(tenant_id?: string, branch_id?: string, product_id?: string): Promise<StockByBranch[]>;
  create(data: CreateStockByBranchData): Promise<StockByBranch>;
  update(id: string, data: UpdateStockByBranchData): Promise<StockByBranch>;
  incrementStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch>;
  decrementStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch>;
  reserveStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch>;
  releaseStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<StockByBranch>;
}

export interface CreateStockByBranchData {
  tenant_id: string;
  product_id: string;
  variant_id?: string | null;
  branch_id: string;
  current_stock?: number;
  reserved_stock?: number;
  available_stock?: number;
}

export interface UpdateStockByBranchData {
  current_stock?: number;
  reserved_stock?: number;
  available_stock?: number;
}


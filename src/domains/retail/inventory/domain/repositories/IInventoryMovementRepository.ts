/**
 * Interface para InventoryMovement Repository
 */

import { InventoryMovement, MovementType, ReferenceType } from '../entities/InventoryMovement';

export interface IInventoryMovementRepository {
  findById(id: string): Promise<InventoryMovement | null>;
  findAll(
    tenant_id?: string,
    product_id?: string,
    branch_id?: string,
    movement_type?: MovementType
  ): Promise<InventoryMovement[]>;
  create(data: CreateInventoryMovementData): Promise<InventoryMovement>;
}

export interface CreateInventoryMovementData {
  tenant_id: string;
  product_id: string;
  variant_id?: string | null;
  branch_id: string;
  movement_type: MovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_type?: ReferenceType | null;
  reference_id?: string | null;
  notes?: string | null;
  created_by_user_id: string;
}


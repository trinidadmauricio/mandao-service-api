/**
 * Service para calcular stock disponible
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IStockByBranchRepository } from '../../domain/repositories/IStockByBranchRepository';
import { TYPES } from '../../../../../config/types';

export interface StockAvailability {
  product_id: string;
  variant_id: string | null;
  branch_id: string;
  available_stock: number;
  current_stock: number;
  reserved_stock: number;
}

@injectable()
export class StockCalculator {
  constructor(@inject(TYPES.IStockByBranchRepository) private stockRepository: IStockByBranchRepository) {}

  /**
   * Obtiene el stock disponible para un producto/variant en una branch
   */
  async getAvailableStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string
  ): Promise<StockAvailability | null> {
    const stock = await this.stockRepository.findByProductAndBranch(
      tenant_id,
      product_id,
      variant_id,
      branch_id
    );

    if (!stock) {
      return null;
    }

    return {
      product_id: stock.product_id,
      variant_id: stock.variant_id,
      branch_id: stock.branch_id,
      available_stock: stock.calculateAvailableStock(),
      current_stock: stock.current_stock,
      reserved_stock: stock.reserved_stock,
    };
  }

  /**
   * Verifica si hay stock suficiente disponible
   */
  async hasAvailableStock(
    tenant_id: string,
    product_id: string,
    variant_id: string | null,
    branch_id: string,
    quantity: number
  ): Promise<boolean> {
    const availability = await this.getAvailableStock(tenant_id, product_id, variant_id, branch_id);
    if (!availability) {
      return false;
    }
    return availability.available_stock >= quantity;
  }

  /**
   * Obtiene el stock disponible para múltiples productos
   */
  async getMultipleStockAvailability(
    tenant_id: string,
    items: Array<{ product_id: string; variant_id: string | null; branch_id: string; quantity: number }>
  ): Promise<Array<StockAvailability & { requested_quantity: number; has_stock: boolean }>> {
    const results = await Promise.all(
      items.map(async (item) => {
        const availability = await this.getAvailableStock(
          tenant_id,
          item.product_id,
          item.variant_id,
          item.branch_id
        );

        if (!availability) {
          return {
            product_id: item.product_id,
            variant_id: item.variant_id,
            branch_id: item.branch_id,
            available_stock: 0,
            current_stock: 0,
            reserved_stock: 0,
            requested_quantity: item.quantity,
            has_stock: false,
          };
        }

        return {
          ...availability,
          requested_quantity: item.quantity,
          has_stock: availability.available_stock >= item.quantity,
        };
      })
    );

    return results;
  }
}


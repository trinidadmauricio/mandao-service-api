/**
 * Use Case: Obtener reporte de inventario
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { currencyService } from '../../../currency/CurrencyService';
import { ITenantRepository } from '../../../tenants/domain/repositories/ITenantRepository';
import { TYPES } from '../../../../../config/types';
import { CurrencyCode } from '../../../currency/CurrencyService';

export interface InventoryReportItem {
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  branch_id: string;
  branch_name: string;
  available_stock: number;
  reserved_stock: number;
  total_stock: number;
  unit_price: number;
  currency: string;
  total_value: number;
  formatted_value: string;
}

export interface InventoryReportResult {
  items: InventoryReportItem[];
  summary: {
    total_products: number;
    total_value: number;
    currency: string;
    formatted_total: string;
    by_branch: Record<string, { products: number; value: number }>;
  };
}

@injectable()
export class GetInventoryReportUseCase {
  constructor(
    @inject(TYPES.PrismaClient) private prisma: PrismaClient,
    @inject(TYPES.ITenantRepository) private tenantRepository: ITenantRepository
  ) {}

  async execute(tenant_id: string, branch_id?: string): Promise<InventoryReportResult> {
    const tenant = await this.tenantRepository.findById(tenant_id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const currency = tenant.default_currency;

    // Construir where clause
    const where: Prisma.StockByBranchWhereInput = {
      tenant_id,
    };

    if (branch_id) {
      where.branch_id = branch_id;
    }

    // Obtener stock por branch
    const stockByBranch = await this.prisma.stockByBranch.findMany({
      where,
    });

    // Obtener productos, variants y branches por separado
    const productIds = [...new Set(stockByBranch.map((s) => s.product_id))];
    const variantIds = stockByBranch.map((s) => s.variant_id).filter((id) => id !== null) as string[];
    const branchIds = [...new Set(stockByBranch.map((s) => s.branch_id))];

    const [products, variants, branches] = await Promise.all([
      this.prisma.product.findMany({ where: { id: { in: productIds } } }),
      variantIds.length > 0
        ? this.prisma.productVariant.findMany({ where: { id: { in: variantIds } } })
        : [],
      this.prisma.branch.findMany({ where: { id: { in: branchIds } } }),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));
    const branchMap = new Map(branches.map((b) => [b.id, b]));

    // Transformar a formato de reporte
    const items: InventoryReportItem[] = stockByBranch.map((stock) => {
      const product = productMap.get(stock.product_id);
      const variant = stock.variant_id ? variantMap.get(stock.variant_id) : null;
      const branch = branchMap.get(stock.branch_id);

      const availableStock = Number(stock.available_stock);
      const reservedStock = Number(stock.reserved_stock);
      const totalStock = availableStock + reservedStock;

      // Obtener precio del producto o variant
      let unitPrice = 0;
      if (variant && product) {
        // Precio del variant = precio del producto + ajuste
        unitPrice = Number(product.selling_price) + Number(variant.price_adjustment);
      } else if (product) {
        unitPrice = Number(product.selling_price);
      }

      const totalValue = totalStock * unitPrice;

      // Construir nombre del variant desde opciones
      const variantName = variant
        ? [variant.option1_value, variant.option2_value, variant.option3_value]
            .filter((v) => v)
            .join(' / ') || null
        : null;

      return {
        product_id: stock.product_id,
        product_name: product?.name || 'N/A',
        variant_id: stock.variant_id || null,
        variant_name: variantName,
        branch_id: stock.branch_id,
        branch_name: branch?.name || 'N/A',
        available_stock: availableStock,
        reserved_stock: reservedStock,
        total_stock: totalStock,
        unit_price: unitPrice,
        currency,
        total_value: totalValue,
        formatted_value: currencyService.format(totalValue, currency as CurrencyCode),
      };
    });

    // Calcular summary
    const summary = {
      total_products: items.length,
      total_value: items.reduce((sum, item) => sum + item.total_value, 0),
      currency,
      formatted_total: '',
      by_branch: {} as Record<string, { products: number; value: number }>,
    };

    // Agrupar por branch
    for (const item of items) {
      if (!summary.by_branch[item.branch_id]) {
        summary.by_branch[item.branch_id] = { products: 0, value: 0 };
      }
      summary.by_branch[item.branch_id].products += 1;
      summary.by_branch[item.branch_id].value += item.total_value;
    }

    summary.formatted_total = currencyService.format(summary.total_value, currency as CurrencyCode);

    return {
      items,
      summary,
    };
  }
}


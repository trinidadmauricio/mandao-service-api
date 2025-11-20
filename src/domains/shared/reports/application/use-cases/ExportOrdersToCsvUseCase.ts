/**
 * Use Case: Exportar órdenes a CSV
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { stringify } from 'csv-stringify';
import { Readable } from 'stream';
import { OrderReportFiltersDto } from '../dto/OrderReportFiltersDto';
import { GetOrdersReportUseCase } from './GetOrdersReportUseCase';
import { i18nService } from '../../../i18n/I18nService';
import { TYPES } from '../../../../../config/types';

@injectable()
export class ExportOrdersToCsvUseCase {
  constructor(
    @inject(TYPES.GetOrdersReportUseCase) private getOrdersReportUseCase: GetOrdersReportUseCase
  ) {}

  async execute(tenant_id: string, filters: OrderReportFiltersDto, locale: string = 'es'): Promise<Readable> {
    // Obtener todas las órdenes (sin paginación para export)
    const exportFilters = {
      ...filters,
      page: 1,
      limit: 10000, // Máximo 10k órdenes
    };

    const report = await this.getOrdersReportUseCase.execute(tenant_id, exportFilters);

    // Configurar i18n
    i18nService.changeLanguage(locale);
    const t = (key: string, defaultValue?: string) => {
      const translated = i18nService.t(key);
      return translated !== key ? translated : (defaultValue || key);
    };

    // Headers traducidos
    const headers = [
      t('reports.orderNumber', 'Order Number'),
      t('reports.trackingCode', 'Tracking Code'),
      t('reports.type', 'Type'),
      t('reports.status', 'Status'),
      t('reports.customerName', 'Customer Name'),
      t('reports.deliveryAddress', 'Delivery Address'),
      t('reports.totalAmount', 'Total Amount'),
      t('reports.currency', 'Currency'),
      t('reports.createdAt', 'Created At'),
      t('reports.estimatedDelivery', 'Estimated Delivery'),
      t('reports.driver', 'Driver'),
      t('reports.branch', 'Branch'),
    ];

    // Transformar datos
    const rows = report.items.map((item) => [
      item.order_display_number,
      item.tracking_code,
      item.order_type,
      t(`order.status.${item.status.toLowerCase()}`, item.status),
      item.customer_name,
      item.delivery_address,
      item.total_amount.toString(),
      item.currency,
      item.created_at.toISOString(),
      item.estimated_delivery_at?.toISOString() || '',
      item.driver_name || '',
      item.branch_name || '',
    ]);

    // Crear stream de CSV
    const csvStream = stringify({
      header: true,
      columns: headers,
    });

    // Escribir headers y rows
    for (const row of rows) {
      csvStream.write(row);
    }

    csvStream.end();

    return Readable.from(csvStream);
  }
}


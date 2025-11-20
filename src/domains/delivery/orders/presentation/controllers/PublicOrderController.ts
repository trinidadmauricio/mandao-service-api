/**
 * Controller público para tracking de órdenes
 * No requiere autenticación
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { GetOrderByTrackingCodeUseCase } from '../../application/use-cases/GetOrderByTrackingCodeUseCase';
import { logger } from '../../../../../shared/utils/logger';
import { i18nService } from '../../../../shared/i18n/I18nService';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PublicOrderController {
  constructor(@inject(TYPES.GetOrderByTrackingCodeUseCase) private getOrderByTrackingCodeUseCase: GetOrderByTrackingCodeUseCase) {}

  async getByTrackingCode(req: Request, res: Response): Promise<void> {
    try {
      const { trackingCode } = req.params;
      const order = await this.getOrderByTrackingCodeUseCase.execute(trackingCode);

      // Obtener mensajes traducidos
      const locale = req.locale || 'es';
      i18nService.changeLanguage(locale);
      const t = (key: string, defaultValue?: string) => {
        const translated = i18nService.t(key);
        return translated !== key ? translated : (defaultValue || key);
      };

      // Obtener información adicional de la orden
      const orderInfo = {
        id: order.id,
        order_display_number: order.order_display_number,
        tracking_code: order.tracking_code,
        status: order.status,
        status_label: t(`order.status.${order.status.toLowerCase()}`, order.status),
        estimated_delivery_at: order.estimated_delivery_at,
        created_at: order.created_at,
        customer_name: (order.customer_snapshot && typeof order.customer_snapshot === 'object' && 'name' in order.customer_snapshot && typeof order.customer_snapshot.name === 'string') ? order.customer_snapshot.name : '',
        delivery_address: order.delivery_address,
      };

      res.status(200).json({
        status: 'success',
        data: orderInfo,
      });
    } catch (error) {
      logger.error('Error getting order by tracking code', { error });
      if (error instanceof Error && error.message === 'Order not found') {
        res.status(404).json({
          status: 'error',
          message: 'Order not found',
        });
        return;
      }
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }
}


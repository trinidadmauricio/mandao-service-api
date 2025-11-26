/**
 * Controller para Geocoding
 * Servicio transversal para búsqueda y reverse geocoding
 */

import { Request, Response } from 'express';
import { geocodingService } from '../../application/services/GeocodingService';
import {
  searchGeocodingSchema,
  reverseGeocodingSchema,
} from '../../application/dto/GeocodingDto';
import { logger } from '../../../../../shared/utils/logger';

export class GeocodingController {
  /**
   * Busca direcciones
   * GET /api/v1/geocoding/search?q={query}&limit={limit}&lang={lang}
   */
  async search(req: Request, res: Response): Promise<void> {
    try {
      const dto = searchGeocodingSchema.parse({
        q: req.query.q,
        limit: req.query.limit,
        lang: req.query.lang,
      });

      const results = await geocodingService.search(dto);

      res.status(200).json({
        status: 'success',
        data: results,
        count: results.length,
      });
    } catch (error) {
      logger.error('Error in geocoding search', {
        error: error instanceof Error ? error.message : error,
        query: req.query.q,
      });

      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid request parameters',
          errors: error,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * Reverse geocoding - Obtiene dirección desde coordenadas
   * GET /api/v1/geocoding/reverse?lat={lat}&lng={lng}&lang={lang}
   */
  async reverse(req: Request, res: Response): Promise<void> {
    try {
      const dto = reverseGeocodingSchema.parse({
        lat: req.query.lat,
        lng: req.query.lng,
        lang: req.query.lang,
      });

      const result = await geocodingService.reverse(dto);

      if (!result) {
        res.status(404).json({
          status: 'error',
          message: 'No address found for the given coordinates',
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      logger.error('Error in reverse geocoding', {
        error: error instanceof Error ? error.message : error,
        lat: req.query.lat,
        lng: req.query.lng,
      });

      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid request parameters',
          errors: error,
        });
        return;
      }

      // Error específico para coordenadas fuera de la región
      if (
        error instanceof Error &&
        error.message.includes('outside Central America')
      ) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}

export const geocodingController = new GeocodingController();


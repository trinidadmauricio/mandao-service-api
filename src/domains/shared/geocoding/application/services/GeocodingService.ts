/**
 * Geocoding Service - Integración con Photon
 * Servicio transversal para búsqueda y reverse geocoding
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../../../../shared/utils/logger';
import {
  SearchGeocodingDto,
  ReverseGeocodingDto,
  PhotonSearchResponse,
  PhotonFeature,
  GeocodingResult,
  CENTRAL_AMERICA_CARIBBEAN_BBOX,
  isWithinCentralAmericaCaribbean,
} from '../dto/GeocodingDto';

export class GeocodingService {
  private photonClient: AxiosInstance;
  private readonly photonUrl: string;
  private readonly boundingBox: string;

  constructor() {
    this.photonUrl = process.env.PHOTON_URL || 'http://photon:2322';
    this.boundingBox = CENTRAL_AMERICA_CARIBBEAN_BBOX;

    this.photonClient = axios.create({
      baseURL: this.photonUrl,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Busca direcciones usando Photon
   * Filtra automáticamente por Centro América y Caribe
   */
  async search(dto: SearchGeocodingDto): Promise<GeocodingResult[]> {
    try {
      // Validar que la query no esté vacía
      if (!dto.q || dto.q.trim().length === 0) {
        return [];
      }

      const params: Record<string, string | number> = {
        q: dto.q,
        limit: dto.limit || 10,
        bbox: this.boundingBox, // Filtrar por Centro América y Caribe
      };

      if (dto.lang) {
        params.lang = dto.lang;
      }

      const response = await this.photonClient.get<PhotonSearchResponse>('/api', {
        params,
      });

      // Transformar resultados de Photon a formato estándar
      const results = this.transformPhotonFeatures(response.data.features);

      // Filtrar resultados que estén fuera de la región (validación adicional)
      return results.filter((result) =>
        isWithinCentralAmericaCaribbean(result.lat, result.lng)
      );
    } catch (error) {
      logger.error('Error searching geocoding', {
        error: error instanceof Error ? error.message : error,
        query: dto.q,
      });
      throw new Error('Failed to search addresses');
    }
  }

  /**
   * Reverse geocoding - Obtiene dirección desde coordenadas
   */
  async reverse(dto: ReverseGeocodingDto): Promise<GeocodingResult | null> {
    try {
      // Validar que las coordenadas estén dentro de la región
      if (!isWithinCentralAmericaCaribbean(dto.lat, dto.lng)) {
        throw new Error(
          'Coordinates are outside Central America and Caribbean region'
        );
      }

      const params: Record<string, string | number> = {
        lat: dto.lat,
        lon: dto.lng,
      };

      if (dto.lang) {
        params.lang = dto.lang;
      }

      const response = await this.photonClient.get<PhotonSearchResponse>('/reverse', {
        params,
      });

      if (!response.data.features || response.data.features.length === 0) {
        return null;
      }

      // Transformar el primer resultado
      const results = this.transformPhotonFeatures(response.data.features);
      return results[0] || null;
    } catch (error) {
      logger.error('Error reverse geocoding', {
        error: error instanceof Error ? error.message : error,
        lat: dto.lat,
        lng: dto.lng,
      });
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  /**
   * Transforma features de Photon a formato estándar
   */
  private transformPhotonFeatures(features: PhotonFeature[]): GeocodingResult[] {
    return features.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      // Construir display_name
      const parts: string[] = [];
      if (props.housenumber) parts.push(props.housenumber);
      if (props.street) parts.push(props.street);
      if (props.city) parts.push(props.city);
      if (props.state) parts.push(props.state);
      if (props.country) parts.push(props.country);
      if (props.postcode) parts.push(props.postcode);

      const displayName = parts.length > 0 ? parts.join(', ') : props.name || '';

      return {
        name: props.name || displayName,
        display_name: displayName,
        lat,
        lng,
        address: {
          street: props.street || props.name,
          city: props.city,
          state: props.state,
          zip_code: props.postcode,
          country: props.country,
        },
        osm_id: props.osm_id,
        osm_type: props.osm_type,
      };
    });
  }
}

export const geocodingService = new GeocodingService();


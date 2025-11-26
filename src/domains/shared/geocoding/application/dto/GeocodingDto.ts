/**
 * DTOs para Geocoding Service
 */

import { z } from 'zod';

// Bounding box para Centro América y Caribe
// lon_min, lat_min, lon_max, lat_max
export const CENTRAL_AMERICA_CARIBBEAN_BBOX = '-90.0,7.0,-60.0,25.0';

/**
 * Schema para búsqueda de direcciones
 */
export const searchGeocodingSchema = z.object({
  q: z.string().min(1, 'Query is required'),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  lang: z.enum(['es', 'en']).optional(),
});

export type SearchGeocodingDto = z.infer<typeof searchGeocodingSchema>;

/**
 * Schema para reverse geocoding
 */
export const reverseGeocodingSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  lang: z.enum(['es', 'en']).optional(),
});

export type ReverseGeocodingDto = z.infer<typeof reverseGeocodingSchema>;

/**
 * Respuesta de Photon para un resultado de búsqueda
 */
export interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lng, lat]
    type: string;
  };
  properties: {
    osm_id: number;
    osm_type: string;
    name?: string;
    country?: string;
    state?: string;
    city?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    osm_key?: string;
    osm_value?: string;
    extent?: [number, number, number, number];
  };
  type: string;
}

export interface PhotonSearchResponse {
  type: string;
  features: PhotonFeature[];
}

/**
 * Respuesta estandarizada de geocoding
 */
export interface GeocodingResult {
  name: string;
  display_name: string;
  lat: number;
  lng: number;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
  osm_id?: number;
  osm_type?: string;
}

/**
 * Valida que las coordenadas estén dentro de Centro América y Caribe
 */
export function isWithinCentralAmericaCaribbean(lat: number, lng: number): boolean {
  const [lonMin, latMin, lonMax, latMax] = CENTRAL_AMERICA_CARIBBEAN_BBOX.split(',').map(Number);
  return lng >= lonMin && lng <= lonMax && lat >= latMin && lat <= latMax;
}


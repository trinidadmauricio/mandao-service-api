/**
 * Haversine Distance Calculator
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * 
 * La fórmula de Haversine calcula la distancia del gran círculo entre dos puntos
 * en una esfera dadas sus longitudes y latitudes.
 */

/**
 * Radio de la Tierra en kilómetros
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Radio de la Tierra en millas
 */
const EARTH_RADIUS_MILES = 3959;

/**
 * Convierte grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Interfaz para coordenadas geográficas
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Opciones para el cálculo de distancia
 */
export interface HaversineOptions {
  unit?: 'km' | 'miles' | 'meters';
}

/**
 * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine
 * 
 * @param point1 - Primer punto con lat y lng
 * @param point2 - Segundo punto con lat y lng
 * @param options - Opciones de cálculo (unidad)
 * @returns Distancia en la unidad especificada (default: km)
 * 
 * @example
 * // Distancia en km
 * const distanceKm = haversineDistance(
 *   { lat: -12.0464, lng: -77.0428 }, // Lima
 *   { lat: -13.5320, lng: -71.9675 }  // Cusco
 * );
 * // ~580 km
 */
export function haversineDistance(
  point1: Coordinates,
  point2: Coordinates,
  options: HaversineOptions = {}
): number {
  const { unit = 'km' } = options;

  // Validar coordenadas
  validateCoordinates(point1);
  validateCoordinates(point2);

  // Si los puntos son iguales, la distancia es 0
  if (point1.lat === point2.lat && point1.lng === point2.lng) {
    return 0;
  }

  const lat1 = toRadians(point1.lat);
  const lat2 = toRadians(point2.lat);
  const deltaLat = toRadians(point2.lat - point1.lat);
  const deltaLng = toRadians(point2.lng - point1.lng);

  // Fórmula de Haversine
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calcular distancia según la unidad
  let radius: number;
  switch (unit) {
    case 'miles':
      radius = EARTH_RADIUS_MILES;
      break;
    case 'meters':
      radius = EARTH_RADIUS_KM * 1000;
      break;
    case 'km':
    default:
      radius = EARTH_RADIUS_KM;
  }

  return radius * c;
}

/**
 * Valida que las coordenadas estén en rangos válidos
 */
function validateCoordinates(point: Coordinates): void {
  if (typeof point.lat !== 'number' || typeof point.lng !== 'number') {
    throw new Error('Coordinates must be numbers');
  }

  if (point.lat < -90 || point.lat > 90) {
    throw new Error(`Invalid latitude: ${point.lat}. Must be between -90 and 90`);
  }

  if (point.lng < -180 || point.lng > 180) {
    throw new Error(`Invalid longitude: ${point.lng}. Must be between -180 and 180`);
  }

  if (isNaN(point.lat) || isNaN(point.lng)) {
    throw new Error('Coordinates cannot be NaN');
  }
}

/**
 * Ordena un array de elementos por distancia a un punto de referencia
 * 
 * @param items - Array de elementos con coordenadas
 * @param reference - Punto de referencia
 * @param getCoordinates - Función para extraer coordenadas de cada elemento
 * @returns Array ordenado por distancia (más cercano primero)
 */
export function sortByDistance<T>(
  items: T[],
  reference: Coordinates,
  getCoordinates: (item: T) => Coordinates | null
): T[] {
  return [...items].sort((a, b) => {
    const coordsA = getCoordinates(a);
    const coordsB = getCoordinates(b);

    // Si alguno no tiene coordenadas, va al final
    if (!coordsA && !coordsB) return 0;
    if (!coordsA) return 1;
    if (!coordsB) return -1;

    const distanceA = haversineDistance(reference, coordsA);
    const distanceB = haversineDistance(reference, coordsB);

    return distanceA - distanceB;
  });
}

/**
 * Filtra elementos dentro de un radio de un punto de referencia
 * 
 * @param items - Array de elementos con coordenadas
 * @param reference - Punto de referencia
 * @param radiusKm - Radio máximo en kilómetros
 * @param getCoordinates - Función para extraer coordenadas de cada elemento
 * @returns Array de elementos dentro del radio
 */
export function filterByRadius<T>(
  items: T[],
  reference: Coordinates,
  radiusKm: number,
  getCoordinates: (item: T) => Coordinates | null
): T[] {
  return items.filter((item) => {
    const coords = getCoordinates(item);
    if (!coords) return false;
    
    const distance = haversineDistance(reference, coords);
    return distance <= radiusKm;
  });
}

/**
 * Calcula la distancia y la agrega a cada elemento
 * 
 * @param items - Array de elementos con coordenadas
 * @param reference - Punto de referencia
 * @param getCoordinates - Función para extraer coordenadas de cada elemento
 * @returns Array de elementos con distancia agregada
 */
export function addDistanceToItems<T>(
  items: T[],
  reference: Coordinates,
  getCoordinates: (item: T) => Coordinates | null
): (T & { distance_km: number | null })[] {
  return items.map((item) => {
    const coords = getCoordinates(item);
    const distance = coords ? haversineDistance(reference, coords) : null;
    return { ...item, distance_km: distance };
  });
}


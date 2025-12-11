/**
 * Navigation Links Generator
 * Genera URLs para abrir navegación en Google Maps, Waze y Apple Maps
 * 
 * Estos links permiten a los drivers abrir la navegación directamente
 * en su app de navegación preferida.
 */

/**
 * Coordenadas de un punto
 */
export interface NavigationCoordinates {
  lat: number;
  lng: number;
}

/**
 * Dirección para navegación
 */
export interface NavigationAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  fullAddress?: string;
}

/**
 * Destino de navegación (puede ser coordenadas, dirección o ambos)
 */
export interface NavigationDestination {
  coordinates?: NavigationCoordinates;
  address?: NavigationAddress;
  label?: string; // Nombre del lugar (ej: "Cliente: Juan Pérez")
}

/**
 * Aplicaciones de navegación soportadas
 */
export type NavigationApp = 'google_maps' | 'waze' | 'apple_maps';

/**
 * URLs generadas para cada aplicación
 */
export interface NavigationLinks {
  google_maps: string;
  waze: string;
  apple_maps: string;
  universal: string; // URL que funciona en cualquier plataforma
}

/**
 * Opciones para generar links de navegación
 */
export interface NavigationLinkOptions {
  origin?: NavigationCoordinates; // Punto de origen (opcional)
  travelMode?: 'driving' | 'walking' | 'transit' | 'bicycling';
}

/**
 * Genera una URL para Google Maps
 * Documentación: https://developers.google.com/maps/documentation/urls/get-started
 */
export function generateGoogleMapsUrl(
  destination: NavigationDestination,
  options: NavigationLinkOptions = {}
): string {
  const baseUrl = 'https://www.google.com/maps/dir/?api=1';
  const params = new URLSearchParams();

  // Destino
  if (destination.coordinates) {
    params.set('destination', `${destination.coordinates.lat},${destination.coordinates.lng}`);
  } else if (destination.address?.fullAddress) {
    params.set('destination', destination.address.fullAddress);
  } else if (destination.address) {
    const addr = formatAddress(destination.address);
    params.set('destination', addr);
  }

  // Origen (opcional)
  if (options.origin) {
    params.set('origin', `${options.origin.lat},${options.origin.lng}`);
  }

  // Modo de viaje
  if (options.travelMode) {
    params.set('travelmode', options.travelMode);
  }

  return `${baseUrl}&${params.toString()}`;
}

/**
 * Genera una URL para Waze
 * Documentación: https://developers.google.com/waze/deeplinks
 */
export function generateWazeUrl(
  destination: NavigationDestination,
  _options: NavigationLinkOptions = {}
): string {
  // Waze solo soporta coordenadas para navegación directa
  if (!destination.coordinates) {
    // Si no hay coordenadas, usar búsqueda
    const baseUrl = 'https://www.waze.com/ul';
    const params = new URLSearchParams();
    
    if (destination.address?.fullAddress) {
      params.set('q', destination.address.fullAddress);
    } else if (destination.address) {
      params.set('q', formatAddress(destination.address));
    }
    
    params.set('navigate', 'yes');
    return `${baseUrl}?${params.toString()}`;
  }

  const baseUrl = 'https://www.waze.com/ul';
  const params = new URLSearchParams();
  
  params.set('ll', `${destination.coordinates.lat},${destination.coordinates.lng}`);
  params.set('navigate', 'yes');

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Genera una URL para Apple Maps
 * Documentación: https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
 */
export function generateAppleMapsUrl(
  destination: NavigationDestination,
  options: NavigationLinkOptions = {}
): string {
  const baseUrl = 'https://maps.apple.com/';
  const params = new URLSearchParams();

  // Destino
  if (destination.coordinates) {
    params.set('daddr', `${destination.coordinates.lat},${destination.coordinates.lng}`);
  } else if (destination.address?.fullAddress) {
    params.set('daddr', destination.address.fullAddress);
  } else if (destination.address) {
    params.set('daddr', formatAddress(destination.address));
  }

  // Origen (opcional)
  if (options.origin) {
    params.set('saddr', `${options.origin.lat},${options.origin.lng}`);
  }

  // Modo de viaje
  if (options.travelMode) {
    const modeMap: Record<string, string> = {
      driving: 'd',
      walking: 'w',
      transit: 'r',
    };
    params.set('dirflg', modeMap[options.travelMode] || 'd');
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Genera una URL universal (geo:) que funciona en múltiples plataformas
 * Android abrirá un selector de apps, iOS abrirá Apple Maps
 */
export function generateUniversalUrl(
  destination: NavigationDestination
): string {
  if (destination.coordinates) {
    const { lat, lng } = destination.coordinates;
    const label = destination.label ? `(${encodeURIComponent(destination.label)})` : '';
    return `geo:${lat},${lng}?q=${lat},${lng}${label}`;
  }

  if (destination.address) {
    const addr = destination.address.fullAddress || formatAddress(destination.address);
    return `geo:0,0?q=${encodeURIComponent(addr)}`;
  }

  throw new Error('Destination must have coordinates or address');
}

/**
 * Genera URLs de navegación para todas las aplicaciones soportadas
 */
export function generateNavigationLinks(
  destination: NavigationDestination,
  options: NavigationLinkOptions = {}
): NavigationLinks {
  validateDestination(destination);

  return {
    google_maps: generateGoogleMapsUrl(destination, options),
    waze: generateWazeUrl(destination, options),
    apple_maps: generateAppleMapsUrl(destination, options),
    universal: generateUniversalUrl(destination),
  };
}

/**
 * Genera un link para una aplicación específica
 */
export function generateNavigationLink(
  app: NavigationApp,
  destination: NavigationDestination,
  options: NavigationLinkOptions = {}
): string {
  validateDestination(destination);

  switch (app) {
    case 'google_maps':
      return generateGoogleMapsUrl(destination, options);
    case 'waze':
      return generateWazeUrl(destination, options);
    case 'apple_maps':
      return generateAppleMapsUrl(destination, options);
    default:
      throw new Error(`Unsupported navigation app: ${app}`);
  }
}

/**
 * Valida que el destino tenga información suficiente
 */
function validateDestination(destination: NavigationDestination): void {
  if (!destination.coordinates && !destination.address) {
    throw new Error('Destination must have coordinates or address');
  }

  if (destination.coordinates) {
    const { lat, lng } = destination.coordinates;
    
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      throw new Error('Coordinates must be numbers');
    }

    if (lat < -90 || lat > 90) {
      throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90`);
    }

    if (lng < -180 || lng > 180) {
      throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180`);
    }
  }
}

/**
 * Formatea una dirección como string
 */
function formatAddress(address: NavigationAddress): string {
  const parts: string[] = [];

  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.country) parts.push(address.country);

  return parts.join(', ');
}

/**
 * Crea un destino a partir de coordenadas simples
 */
export function createDestinationFromCoords(
  lat: number,
  lng: number,
  label?: string
): NavigationDestination {
  return {
    coordinates: { lat, lng },
    label,
  };
}

/**
 * Crea un destino a partir de una dirección completa
 */
export function createDestinationFromAddress(
  fullAddress: string,
  label?: string
): NavigationDestination {
  return {
    address: { fullAddress },
    label,
  };
}


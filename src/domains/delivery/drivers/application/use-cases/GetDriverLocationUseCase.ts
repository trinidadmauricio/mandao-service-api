/**
 * Use Case: Obtener última ubicación de un driver
 * 
 * Obtiene la última ubicación conocida de un driver desde Redis cache.
 * Valida permisos según rol del usuario.
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { IDriverRepository } from '../../domain/repositories/IDriverRepository';
import { LocationCache } from '../../../../../shared/infrastructure/redis/LocationCache';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

export interface GetDriverLocationDto {
  driverId: string;
}

export interface GetDriverLocationContext {
  currentUserRole: string;
  currentUserLogisticsProviderId: string | null;
  currentUserId: string;
}

export interface GetDriverLocationResult {
  driver_id: string;
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  order_id?: string;
  recorded_at: string;
  is_online: boolean;
}

@injectable()
export class GetDriverLocationUseCase {
  constructor(
    @inject(TYPES.IDriverRepository) private driverRepository: IDriverRepository,
    @inject(TYPES.LocationCache) private locationCache: LocationCache
  ) {}

  async execute(
    dto: GetDriverLocationDto,
    context?: GetDriverLocationContext
  ): Promise<GetDriverLocationResult | null> {
    // 1. Verificar que el driver existe
    const driver = await this.driverRepository.findById(dto.driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    // 2. Validar permisos
    if (context) {
      const currentRole = context.currentUserRole as UserRole;
      
      // SAAS_ADMIN y SAAS_EDITOR pueden ver cualquier driver
      if (currentRole === UserRole.SAAS_ADMIN || currentRole === UserRole.SAAS_EDITOR) {
        // OK - acceso permitido
      }
      // LOGISTICS_PROVIDER y SUPERVISOR solo pueden ver drivers de su proveedor
      else if (currentRole === UserRole.LOGISTICS_PROVIDER || currentRole === UserRole.SUPERVISOR) {
        if (driver.logistics_provider_id !== context.currentUserLogisticsProviderId) {
          throw new Error('You do not have permission to view this driver location');
        }
      }
      // DRIVER solo puede ver su propia ubicación
      else if (currentRole === UserRole.DRIVER) {
        if (driver.user_id !== context.currentUserId) {
          throw new Error('You do not have permission to view this driver location');
        }
      }
      // Otros roles no tienen acceso
      else {
        throw new Error('You do not have permission to view driver locations');
      }
    }

    // 3. Obtener ubicación desde cache
    const location = await this.locationCache.getDriverLocation(dto.driverId);

    if (!location) {
      // Driver no tiene ubicación en cache (probablemente offline)
      return null;
    }

    // 4. Retornar ubicación con flag de online
    return {
      driver_id: location.driver_id,
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      speed: location.speed,
      heading: location.heading,
      order_id: location.order_id,
      recorded_at: location.recorded_at,
      is_online: true, // Si está en cache, está online (TTL 5min)
    };
  }
}


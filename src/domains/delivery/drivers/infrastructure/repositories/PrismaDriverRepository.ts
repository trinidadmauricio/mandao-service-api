/**
 * Implementación de Driver Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IDriverRepository,
  CreateDriverData,
  UpdateDriverData,
  DriversListResult,
} from '../../domain/repositories/IDriverRepository';
import { Driver, WorkType, DriverStatus } from '../../domain/entities/Driver';
import { ListDriversFiltersDto } from '../../application/dto/ListDriversFiltersDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaDriverRepository implements IDriverRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Driver | null> {
    const data = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        delivery_zones: {
          include: {
            delivery_zone: {
              select: { id: true, name: true },
            },
          },
        },
        vehicle: true,
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(
    logistics_provider_id?: string,
    availability_status?: DriverStatus,
    tenant_id?: string
  ): Promise<Driver[]> {
    const where: Prisma.DriverWhereInput = {};

    // Si hay un logistics_provider_id específico, usarlo directamente
    // (un logistics_provider ya está asociado a un tenant específico)
    if (logistics_provider_id) {
      where.logistics_provider_id = logistics_provider_id;
    } else if (tenant_id) {
      // Si no hay logistics_provider_id pero hay tenant_id, filtrar por tenant
      where.logistics_provider = { tenant_id };
    }

    if (availability_status) {
      where.availability_status = availability_status;
    }

    const data = await this.prisma.driver.findMany({
      where,
      include: {
        delivery_zones: {
          include: {
            delivery_zone: {
              select: { id: true, name: true },
            },
          },
        },
        vehicle: true,
      },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAllWithFilters(
    logistics_provider_id: string | undefined,
    filters: ListDriversFiltersDto,
    tenant_id?: string
  ): Promise<DriversListResult> {
    const where: Prisma.DriverWhereInput = {};

    // Filtro por logistics_provider_id (puede venir del parámetro o del filtro)
    const providerId = filters.logistics_provider_id || logistics_provider_id;

    // Si hay un logistics_provider_id específico, usarlo directamente
    // (un logistics_provider ya está asociado a un tenant específico)
    if (providerId) {
      where.logistics_provider_id = providerId;
    } else if (tenant_id) {
      // Si no hay logistics_provider_id pero hay tenant_id, filtrar por tenant
      // Usar la relación logistics_provider para filtrar por tenant_id
      where.logistics_provider = {
        tenant_id: tenant_id,
      };
    }

    // Filtro por availability_status
    if (filters.availability_status) {
      where.availability_status = filters.availability_status;
    }

    // Filtro por work_type
    if (filters.work_type) {
      where.work_type = filters.work_type;
    }

    // Búsqueda de texto (case-insensitive) en User (first_name, last_name, email), driving_license, identity_document
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();

      try {
        // Buscar usuarios que coincidan con el término de búsqueda
        const matchingUsers = await this.prisma.user.findMany({
          where: {
            OR: [
              { first_name: { contains: searchTerm, mode: 'insensitive' } },
              { last_name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
          select: { id: true },
        });

        const matchingUserIds = matchingUsers.map((u) => u.id);

        // Condiciones de búsqueda: campos del driver Y user_ids encontrados
        const searchConditions: Prisma.DriverWhereInput[] = [
          { driving_license: { contains: searchTerm, mode: 'insensitive' } },
          { identity_document: { contains: searchTerm, mode: 'insensitive' } },
        ];

        // Si hay usuarios que coinciden, agregar condición para user_id
        if (matchingUserIds.length > 0) {
          searchConditions.push({ user_id: { in: matchingUserIds } });
        }

        // Combinar condiciones de búsqueda con otros filtros
        if (where.AND) {
          const andArray = Array.isArray(where.AND) ? where.AND : [where.AND];
          where.AND = [...andArray, { OR: searchConditions }];
        } else {
          if (where.OR) {
            where.AND = [{ OR: where.OR }, { OR: searchConditions }];
            delete where.OR;
          } else {
            where.OR = searchConditions;
          }
        }
      } catch (error) {
        console.error('Error searching users', {
          error: error instanceof Error ? error.message : String(error),
          searchTerm,
        });
        // Si falla la búsqueda de usuarios, continuar solo con búsqueda en campos del driver
        // No agregar condición de user_id
      }
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    try {
      // Log del where clause para debugging
      console.log(
        'PrismaDriverRepository.findAllWithFilters - where clause:',
        JSON.stringify(where, null, 2)
      );
      console.log('PrismaDriverRepository.findAllWithFilters - tenant_id:', tenant_id);
      console.log(
        'PrismaDriverRepository.findAllWithFilters - logistics_provider_id:',
        logistics_provider_id
      );
      console.log('PrismaDriverRepository.findAllWithFilters - filters:', filters);

      // Obtener total de registros (sin paginación)
      const total = await this.prisma.driver.count({ where });

      // Obtener datos con paginación
      const data = await this.prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          delivery_zones: {
            include: {
              delivery_zone: {
                select: { id: true, name: true },
              },
            },
          },
          vehicle: true,
        },
      });

      return {
        data: data.map((item) => this.toDomain(item)),
        total,
      };
    } catch (error) {
      // Log del error con detalles del where clause para debugging
      console.error('Error in findAllWithFilters', {
        error: error instanceof Error ? error.message : String(error),
        where: JSON.stringify(where, null, 2),
        tenant_id,
        logistics_provider_id,
        filters,
      });
      throw error;
    }
  }

  async create(data: CreateDriverData): Promise<Driver> {
    const created = await this.prisma.driver.create({
      data: {
        logistics_provider_id: data.logistics_provider_id,
        user_id: data.user_id,
        identity_document: data.identity_document,
        driving_license: data.driving_license,
        date_of_birth: data.date_of_birth,
        emergency_contact: data.emergency_contact as Prisma.InputJsonValue,
        has_own_vehicle: data.has_own_vehicle,
        vehicle_id: data.vehicle_id ?? null,
        work_type: data.work_type,
        work_zone: data.work_zone ?? null,
        availability_status: data.availability_status ?? 'AVAILABLE',
        documents: data.documents as Prisma.InputJsonValue,
        delivery_zones:
          data.delivery_zone_ids && data.delivery_zone_ids.length > 0
            ? {
                createMany: {
                  data: data.delivery_zone_ids.map((delivery_zone_id) => ({
                    delivery_zone_id,
                  })),
                  skipDuplicates: true,
                },
              }
            : undefined,
      },
      include: {
        delivery_zones: {
          include: {
            delivery_zone: {
              select: { id: true, name: true },
            },
          },
        },
        vehicle: true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateDriverData): Promise<Driver> {
    const deliveryZonesUpdate =
      data.delivery_zone_ids !== undefined
        ? {
            deleteMany: {},
            ...(data.delivery_zone_ids.length > 0
              ? {
                  createMany: {
                    data: data.delivery_zone_ids.map((delivery_zone_id) => ({
                      delivery_zone_id,
                    })),
                    skipDuplicates: true,
                  },
                }
              : {}),
          }
        : undefined;

    const updated = await this.prisma.driver.update({
      where: { id },
      data: {
        identity_document: data.identity_document,
        driving_license: data.driving_license,
        date_of_birth: data.date_of_birth,
        emergency_contact: data.emergency_contact
          ? (data.emergency_contact as Prisma.InputJsonValue)
          : undefined,
        has_own_vehicle: data.has_own_vehicle,
        // Permitir explicitamente limpiar el vehículo enviando null.
        // Si no viene vehicle_id, no tocar el campo.
        vehicle_id: data.vehicle_id === undefined ? undefined : data.vehicle_id,
        work_type: data.work_type,
        work_zone: data.work_zone ?? undefined,
        delivery_zones: deliveryZonesUpdate,
        availability_status: data.availability_status,
        documents: data.documents ? (data.documents as Prisma.InputJsonValue) : undefined,
      },
      include: {
        delivery_zones: {
          include: {
            delivery_zone: {
              select: { id: true, name: true },
            },
          },
        },
        vehicle: true,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.driver.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    logistics_provider_id: string;
    user_id: string;
    identity_document: string;
    driving_license: string;
    date_of_birth: Date;
    emergency_contact: Prisma.JsonValue;
    has_own_vehicle: boolean;
    vehicle_id: string | null;
    work_type: string;
    work_zone: string | null;
    availability_status: string;
    rating_avg: Prisma.Decimal | number | null;
    total_deliveries: number;
    documents: Prisma.JsonValue;
    created_at: Date;
    updated_at: Date;
    delivery_zones?: Array<{
      id: string;
      delivery_zone_id: string;
      created_at: Date;
      delivery_zone?: { id: string; name: string } | null;
    }>;
    vehicle?: {
      id: string;
      logistics_provider_id: string | null;
      driver_id: string | null;
      vehicle_type: string;
      license_plate: string;
      brand: string;
      model: string;
      year: number;
      color: string;
      insurance_policy: string;
      insurance_expires_at: Date;
      last_maintenance_at: Date | null;
      status: string;
      specifications: Prisma.JsonValue | null;
      created_at: Date;
      updated_at: Date;
    } | null;
  }): Driver {
    const deliveryZones =
      data.delivery_zones?.map((dz) => ({
        id: dz.id,
        delivery_zone_id: dz.delivery_zone_id,
        created_at: dz.created_at,
        delivery_zone: dz.delivery_zone ? { id: dz.delivery_zone.id, name: dz.delivery_zone.name } : undefined,
      })) ?? [];

    const vehicle = data.vehicle
      ? {
          id: data.vehicle.id,
          logistics_provider_id: data.vehicle.logistics_provider_id,
          driver_id: data.vehicle.driver_id,
          vehicle_type: data.vehicle.vehicle_type as
            | 'MOTORCYCLE'
            | 'SEDAN'
            | 'MINI_VAN'
            | 'PANEL'
            | 'TRUCK'
            | 'PICKUP',
          license_plate: data.vehicle.license_plate,
          brand: data.vehicle.brand,
          model: data.vehicle.model,
          year: data.vehicle.year,
          color: data.vehicle.color,
          insurance_policy: data.vehicle.insurance_policy,
          insurance_expires_at: data.vehicle.insurance_expires_at,
          last_maintenance_at: data.vehicle.last_maintenance_at,
          status: data.vehicle.status as 'AVAILABLE' | 'IN_SERVICE' | 'MAINTENANCE' | 'OUT_OF_SERVICE',
          specifications: data.vehicle.specifications
            ? (data.vehicle.specifications as Record<string, unknown>)
            : null,
          created_at: data.vehicle.created_at,
          updated_at: data.vehicle.updated_at,
        }
      : null;

    return new Driver(
      data.id,
      data.logistics_provider_id,
      data.user_id,
      data.identity_document,
      data.driving_license,
      data.date_of_birth,
      data.emergency_contact as Record<string, unknown>,
      data.has_own_vehicle,
      data.vehicle_id,
      data.work_type as WorkType,
      data.work_zone,
      data.availability_status as DriverStatus,
      data.rating_avg ? Number(data.rating_avg) : null,
      data.total_deliveries,
      data.documents as Record<string, unknown>,
      data.created_at,
      data.updated_at,
      deliveryZones,
      vehicle
    );
  }
}

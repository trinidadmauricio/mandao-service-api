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
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(logistics_provider_id?: string, availability_status?: DriverStatus): Promise<Driver[]> {
    const where: Prisma.DriverWhereInput = {};
    
    if (logistics_provider_id) {
      where.logistics_provider_id = logistics_provider_id;
    }
    
    if (availability_status) {
      where.availability_status = availability_status;
    }
    
    const data = await this.prisma.driver.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAllWithFilters(
    logistics_provider_id: string | undefined,
    filters: ListDriversFiltersDto
  ): Promise<DriversListResult> {
    const where: Prisma.DriverWhereInput = {};

    // Filtro por logistics_provider_id (puede venir del parámetro o del filtro)
    const providerId = filters.logistics_provider_id || logistics_provider_id;
    if (providerId) {
      where.logistics_provider_id = providerId;
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
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

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
    });

    return {
      data: data.map((item) => this.toDomain(item)),
      total,
    };
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
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateDriverData): Promise<Driver> {
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
        vehicle_id: data.vehicle_id ?? undefined,
        work_type: data.work_type,
        work_zone: data.work_zone ?? undefined,
        availability_status: data.availability_status,
        documents: data.documents ? (data.documents as Prisma.InputJsonValue) : undefined,
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
  }): Driver {
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
      data.updated_at
    );
  }
}


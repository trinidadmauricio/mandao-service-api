/**
 * Implementación de LogisticsProvider Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  ILogisticsProviderRepository,
  CreateLogisticsProviderData,
  UpdateLogisticsProviderData,
} from '../../domain/repositories/ILogisticsProviderRepository';
import {
  LogisticsProvider,
  VerificationStatus,
  ProviderStatus,
} from '../../domain/entities/LogisticsProvider';
import { ListLogisticsProvidersFiltersDto } from '../../application/dto/ListLogisticsProvidersFiltersDto';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaLogisticsProviderRepository implements ILogisticsProviderRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<LogisticsProvider | null> {
    const data = await this.prisma.logisticsProvider.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string): Promise<LogisticsProvider[]> {
    // Si hay tenant_id, incluir proveedores de ese tenant Y proveedores globales (tenant_id = null)
    // Si no hay tenant_id, mostrar todos los proveedores
    const where = tenant_id
      ? {
          OR: [{ tenant_id }, { tenant_id: null }],
        }
      : {};
    const data = await this.prisma.logisticsProvider.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAllWithFilters(
    tenant_id: string | undefined,
    filters: ListLogisticsProvidersFiltersDto
  ): Promise<LogisticsProvider[]> {
    const where: Prisma.LogisticsProviderWhereInput = {};

    // Filtro por is_global
    if (filters.is_global !== undefined) {
      if (filters.is_global) {
        // Solo globales (tenant_id = null)
        where.tenant_id = null;
      } else {
        // Solo locales (tenant_id != null)
        if (tenant_id) {
          // Si hay tenant_id, mostrar solo los locales de ese tenant
          where.tenant_id = tenant_id;
        } else {
          // Si no hay tenant_id, mostrar todos los locales (cualquier tenant_id != null)
          where.tenant_id = { not: null };
        }
      }
    } else {
      // Si no hay filtro is_global, aplicar lógica normal de tenant
      // Si hay tenant_id, incluir proveedores de ese tenant Y proveedores globales
      // Si no hay tenant_id, mostrar todos los proveedores
      if (tenant_id) {
        where.OR = [{ tenant_id }, { tenant_id: null }];
      }
    }

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro por verification_status
    if (filters.verification_status) {
      where.verification_status = filters.verification_status;
    }

    // Búsqueda de texto (case-insensitive) en company_name, tax_id, representative_name
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      const searchConditions: Prisma.LogisticsProviderWhereInput[] = [
        { company_name: { contains: searchTerm, mode: 'insensitive' } },
        { tax_id: { contains: searchTerm, mode: 'insensitive' } },
        { representative_name: { contains: searchTerm, mode: 'insensitive' } },
      ];

      // Si ya hay condiciones AND, agregar la búsqueda ahí
      if (where.AND) {
        // Asegurarse de que AND es un array
        const andArray = Array.isArray(where.AND) ? where.AND : [where.AND];
        where.AND = [...andArray, { OR: searchConditions }];
      } else {
        // Si no hay AND pero hay OR, necesitamos combinar
        if (where.OR) {
          where.AND = [{ OR: where.OR }, { OR: searchConditions }];
          delete where.OR;
        } else {
          where.OR = searchConditions;
        }
      }
    }

    const data = await this.prisma.logisticsProvider.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateLogisticsProviderData): Promise<LogisticsProvider> {
    const created = await this.prisma.logisticsProvider.create({
      data: {
        tenant_id: data.tenant_id ?? null,
        company_name: data.company_name,
        tax_id: data.tax_id,
        representative_name: data.representative_name,
        representative_phone: data.representative_phone,
        representative_document: data.representative_document,
        verification_status: data.verification_status ?? 'PENDING',
        verification_documents: data.verification_documents
          ? (data.verification_documents as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        status: data.status ?? 'ACTIVE',
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateLogisticsProviderData): Promise<LogisticsProvider> {
    const updated = await this.prisma.logisticsProvider.update({
      where: { id },
      data: {
        company_name: data.company_name,
        tax_id: data.tax_id,
        representative_name: data.representative_name,
        representative_phone: data.representative_phone,
        representative_document: data.representative_document,
        verification_status: data.verification_status,
        verification_documents: data.verification_documents
          ? (data.verification_documents as Prisma.InputJsonValue)
          : undefined,
        status: data.status,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.logisticsProvider.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string | null;
    company_name: string;
    tax_id: string;
    representative_name: string;
    representative_phone: string;
    representative_document: string;
    verification_status: string;
    verification_documents: Prisma.JsonValue | null;
    rating_avg: Prisma.Decimal | number | null;
    total_deliveries: number;
    status: string;
    created_at: Date;
    updated_at: Date;
  }): LogisticsProvider {
    return new LogisticsProvider(
      data.id,
      data.tenant_id,
      data.company_name,
      data.tax_id,
      data.representative_name,
      data.representative_phone,
      data.representative_document,
      data.verification_status as VerificationStatus,
      data.verification_documents ? (data.verification_documents as Record<string, unknown>) : null,
      data.rating_avg ? Number(data.rating_avg) : null,
      data.total_deliveries,
      data.status as ProviderStatus,
      data.created_at,
      data.updated_at
    );
  }
}

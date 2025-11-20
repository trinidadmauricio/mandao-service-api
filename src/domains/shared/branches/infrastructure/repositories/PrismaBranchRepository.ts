/**
 * Implementación de Branch Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IBranchRepository,
  CreateBranchData,
  UpdateBranchData,
} from '../../domain/repositories/IBranchRepository';
import { Branch } from '../../domain/entities/Branch';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaBranchRepository implements IBranchRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Branch | null> {
    const data = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTenantId(tenant_id: string): Promise<Branch[]> {
    const data = await this.prisma.branch.findMany({
      where: { tenant_id },
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findMainByTenantId(tenant_id: string): Promise<Branch | null> {
    const data = await this.prisma.branch.findFirst({
      where: {
        tenant_id,
        is_main: true,
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(): Promise<Branch[]> {
    const data = await this.prisma.branch.findMany({
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(data: CreateBranchData): Promise<Branch> {
    const created = await this.prisma.branch.create({
      data: {
        tenant_id: data.tenant_id,
        name: data.name,
        address: data.address,
        gps_lat: data.gps_lat,
        gps_lng: data.gps_lng,
        contact_phone: data.contact_phone,
        is_main: data.is_main || false,
        operating_hours: data.operating_hours ? (data.operating_hours as Prisma.InputJsonValue) : Prisma.JsonNull,
        status: data.status || 'ACTIVE',
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateBranchData): Promise<Branch> {
    const updated = await this.prisma.branch.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        gps_lat: data.gps_lat,
        gps_lng: data.gps_lng,
        contact_phone: data.contact_phone,
        is_main: data.is_main,
        operating_hours: data.operating_hours !== undefined
          ? (data.operating_hours ? (data.operating_hours as Prisma.InputJsonValue) : Prisma.JsonNull)
          : undefined,
        status: data.status,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.branch.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    name: string;
    address: string;
    gps_lat: Prisma.Decimal;
    gps_lng: Prisma.Decimal;
    contact_phone: string;
    is_main: boolean;
    operating_hours: Prisma.JsonValue | null;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: Date;
    updated_at: Date;
  }): Branch {
    // Convertir Prisma.JsonValue a Record<string, unknown>
    const operating_hours =
      data.operating_hours && typeof data.operating_hours === 'object' && !Array.isArray(data.operating_hours)
        ? (data.operating_hours as Record<string, unknown>)
        : null;

    return new Branch(
      data.id,
      data.tenant_id,
      data.name,
      data.address,
      Number(data.gps_lat),
      Number(data.gps_lng),
      data.contact_phone,
      data.is_main,
      operating_hours,
      data.status,
      data.created_at,
      data.updated_at
    );
  }
}


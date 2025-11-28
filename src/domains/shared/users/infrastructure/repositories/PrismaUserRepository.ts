/**
 * Implementación de User Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
  UsersListResult,
} from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { ListUsersFiltersDto } from '../../application/dto/ListUsersFiltersDto';
import { TYPES } from '../../../../../config/types';
import { UserRole } from '../../../../../shared/constants/permissions';

@injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTenantId(tenant_id: string): Promise<User[]> {
    const data = await this.prisma.user.findMany({
      where: { tenant_id },
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAll(): Promise<User[]> {
    const data = await this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAllWithFilters(
    tenant_id: string | undefined,
    filters: ListUsersFiltersDto
  ): Promise<UsersListResult> {
    const where: Prisma.UserWhereInput = {};

    // Filtro por tenant_id
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }

    // Filtro por role
    if (filters.role) {
      where.role = filters.role;
    }

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro por logistics_provider_id
    if (filters.logistics_provider_id) {
      where.logistics_provider_id = filters.logistics_provider_id;
    }

    // Búsqueda de texto (case-insensitive) en first_name, last_name, email, phone
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      where.OR = [
        { first_name: { contains: searchTerm, mode: 'insensitive' } },
        { last_name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Obtener total de registros (sin paginación)
    const total = await this.prisma.user.count({ where });

    // Obtener datos con paginación
    const data = await this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((item) => this.toDomain(item)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async create(data: CreateUserData): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        tenant_id: data.tenant_id ?? null,
        email: data.email,
        password_hash: data.password_hash,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone ?? null,
        status: data.status || 'ACTIVE',
        logistics_provider_id: data.logistics_provider_id ?? null,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    // Construir objeto de actualización solo con campos definidos
    const updateData: Prisma.UserUpdateInput = {};

    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.password_hash !== undefined) updateData.password_hash = data.password_hash;
    if (data.email_verified_at !== undefined) updateData.email_verified_at = data.email_verified_at;
    if (data.email_verification_token !== undefined) updateData.email_verification_token = data.email_verification_token;
    if (data.password_reset_token !== undefined) updateData.password_reset_token = data.password_reset_token;
    if (data.password_reset_expires_at !== undefined) updateData.password_reset_expires_at = data.password_reset_expires_at;
    if (data.last_login_at !== undefined) updateData.last_login_at = data.last_login_at;
    if (data.failed_login_attempts !== undefined) updateData.failed_login_attempts = data.failed_login_attempts;
    if (data.locked_until !== undefined) updateData.locked_until = data.locked_until;
    if (data.logistics_provider_id !== undefined) {
      if (data.logistics_provider_id === null) {
        updateData.logistics_provider = { disconnect: true };
      } else {
        updateData.logistics_provider = { connect: { id: data.logistics_provider_id } };
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string | null;
    email: string;
    password_hash: string;
    role: string | UserRole; // Prisma enum o nuestro enum
    first_name: string;
    last_name: string;
    phone: string | null;
    email_verified_at: Date | null;
    email_verification_token: string | null;
    password_reset_token: string | null;
    password_reset_expires_at: Date | null;
    last_login_at: Date | null;
    failed_login_attempts: number;
    locked_until: Date | null;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    logistics_provider_id: string | null;
    created_at: Date;
    updated_at: Date;
  }): User {
    return new User(
      data.id,
      data.tenant_id,
      data.email,
      data.password_hash,
      data.role as UserRole, // Cast del enum de Prisma a nuestro enum
      data.first_name,
      data.last_name,
      data.phone,
      data.email_verified_at,
      data.email_verification_token,
      data.password_reset_token,
      data.password_reset_expires_at,
      data.last_login_at,
      data.failed_login_attempts,
      data.locked_until,
      data.status,
      data.logistics_provider_id,
      data.created_at,
      data.updated_at
    );
  }
}


/**
 * Implementación de User Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { TYPES } from '../../../../../config/types';

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
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role,
        status: data.status,
        password_hash: data.password_hash,
        email_verified_at: data.email_verified_at,
        email_verification_token: data.email_verification_token,
        password_reset_token: data.password_reset_token,
        password_reset_expires_at: data.password_reset_expires_at,
        last_login_at: data.last_login_at,
        failed_login_attempts: data.failed_login_attempts,
        locked_until: data.locked_until,
      },
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
    role: 'SAAS_ADMIN' | 'SAAS_EDITOR' | 'OWNER' | 'SUPERVISOR' | 'MERCHANT_USER' | 'LOGISTICS_PROVIDER' | 'CUSTOMER';
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
      data.role,
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


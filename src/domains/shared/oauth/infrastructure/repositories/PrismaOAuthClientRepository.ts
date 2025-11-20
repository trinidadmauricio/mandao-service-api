/**
 * Implementación de OAuthClient Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  IOAuthClientRepository,
  CreateOAuthClientData,
  UpdateOAuthClientData,
} from '../../domain/repositories/IOAuthClientRepository';
import { OAuthClient } from '../../domain/entities/OAuthClient';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaOAuthClientRepository implements IOAuthClientRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<OAuthClient | null> {
    const data = await this.prisma.oAuthClient.findUnique({
      where: { id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByClientId(client_id: string): Promise<OAuthClient | null> {
    const data = await this.prisma.oAuthClient.findUnique({
      where: { client_id },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTenantId(tenant_id: string): Promise<OAuthClient[]> {
    const data = await this.prisma.oAuthClient.findMany({
      where: { tenant_id },
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAll(): Promise<OAuthClient[]> {
    const data = await this.prisma.oAuthClient.findMany({
      orderBy: { created_at: 'desc' },
    });

    return data.map((item) => this.toDomain(item));
  }

  async create(
    data: CreateOAuthClientData & { client_id: string; client_secret_hash: string }
  ): Promise<OAuthClient> {
    const created = await this.prisma.oAuthClient.create({
      data: {
        tenant_id: data.tenant_id ?? null,
        client_id: data.client_id,
        client_secret_hash: data.client_secret_hash,
        name: data.name,
        redirect_uris: data.redirect_uris as Prisma.InputJsonValue,
        grant_types: data.grant_types as Prisma.InputJsonValue,
        scope: data.scope,
        is_confidential: data.is_confidential,
        is_active: true,
      },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: UpdateOAuthClientData): Promise<OAuthClient> {
    const updated = await this.prisma.oAuthClient.update({
      where: { id },
      data: {
        name: data.name,
        redirect_uris: data.redirect_uris as Prisma.InputJsonValue | undefined,
        grant_types: data.grant_types as Prisma.InputJsonValue | undefined,
        scope: data.scope,
        is_active: data.is_active,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.oAuthClient.delete({
      where: { id },
    });
  }

  private toDomain(data: {
    id: string;
    tenant_id: string | null;
    client_id: string;
    client_secret_hash: string;
    name: string;
    redirect_uris: Prisma.JsonValue;
    grant_types: Prisma.JsonValue;
    scope: string;
    is_confidential: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
  }): OAuthClient {
    // Convertir Prisma.JsonValue a arrays
    const redirect_uris = Array.isArray(data.redirect_uris) ? (data.redirect_uris as string[]) : [];
    const grant_types = Array.isArray(data.grant_types) ? (data.grant_types as string[]) : [];

    return new OAuthClient(
      data.id,
      data.tenant_id,
      data.client_id,
      data.client_secret_hash,
      data.name,
      redirect_uris,
      grant_types,
      data.scope,
      data.is_confidential,
      data.is_active,
      data.created_at,
      data.updated_at
    );
  }
}

/**
 * Implementación de OAuthAuthorizationCode Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import {
  IOAuthAuthorizationCodeRepository,
  CreateAuthorizationCodeData,
} from '../../domain/repositories/IOAuthAuthorizationCodeRepository';
import { OAuthAuthorizationCode } from '../../domain/entities/OAuthAuthorizationCode';
import { TYPES } from '../../../../../config/types';

@injectable()
export class PrismaOAuthAuthorizationCodeRepository implements IOAuthAuthorizationCodeRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findByCode(code: string): Promise<OAuthAuthorizationCode | null> {
    const data = await this.prisma.oAuthAuthorizationCode.findUnique({
      where: { code },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async create(data: CreateAuthorizationCodeData): Promise<OAuthAuthorizationCode> {
    const created = await this.prisma.oAuthAuthorizationCode.create({
      data: {
        code: data.code,
        client_id: data.client_id,
        user_id: data.user_id,
        redirect_uri: data.redirect_uri,
        scope: data.scope,
        expires_at: data.expires_at,
        is_used: false,
      },
    });

    return this.toDomain(created);
  }

  async markAsUsed(code: string): Promise<void> {
    await this.prisma.oAuthAuthorizationCode.update({
      where: { code },
      data: { is_used: true },
    });
  }

  async deleteExpiredCodes(): Promise<void> {
    await this.prisma.oAuthAuthorizationCode.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }

  private toDomain(data: {
    id: string;
    code: string;
    client_id: string;
    user_id: string;
    redirect_uri: string;
    scope: string;
    expires_at: Date;
    is_used: boolean;
    created_at: Date;
  }): OAuthAuthorizationCode {
    return new OAuthAuthorizationCode(
      data.id,
      data.code,
      data.client_id,
      data.user_id,
      data.redirect_uri,
      data.scope,
      data.expires_at,
      data.is_used,
      data.created_at
    );
  }
}

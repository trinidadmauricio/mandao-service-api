/**
 * Interface para LogisticsProvider Repository
 */

import { LogisticsProvider } from '../entities/LogisticsProvider';

export interface ILogisticsProviderRepository {
  findById(id: string): Promise<LogisticsProvider | null>;
  findAll(tenant_id?: string): Promise<LogisticsProvider[]>;
  create(data: CreateLogisticsProviderData): Promise<LogisticsProvider>;
  update(id: string, data: UpdateLogisticsProviderData): Promise<LogisticsProvider>;
  delete(id: string): Promise<void>;
}

export interface CreateLogisticsProviderData {
  tenant_id?: string | null;
  company_name: string;
  tax_id: string;
  representative_name: string;
  representative_phone: string;
  representative_document: string;
  verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verification_documents?: Record<string, unknown> | null;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}

export interface UpdateLogisticsProviderData {
  company_name?: string;
  tax_id?: string;
  representative_name?: string;
  representative_phone?: string;
  representative_document?: string;
  verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verification_documents?: Record<string, unknown> | null;
  status?: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
}


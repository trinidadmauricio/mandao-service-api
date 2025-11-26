/**
 * Implementación de Order Repository usando Prisma
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { PrismaClient, Prisma } from '@prisma/client';
import { IOrderRepository, CreateOrderData, OrdersListResult } from '../../domain/repositories/IOrderRepository';
import { Order, OrderType, OrderStatus, OrderPriority } from '../../domain/entities/Order';
import { generateSecureToken } from '../../../../../shared/utils/crypto.util';
import { TYPES } from '../../../../../config/types';
import { ListOrdersFiltersDto } from '../../application/dto/ListOrdersFiltersDto';

@injectable()
export class PrismaOrderRepository implements IOrderRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_drivers: true,
        order_branches: true,
        order_items: true,
        order_summary_totals: true,
        order_status_history: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByTrackingCode(tracking_code: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({
      where: { tracking_code },
    });

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findAll(tenant_id?: string, status?: string, logistics_provider_id?: string): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (status) where.status = status as OrderStatus;
    
    // Si se especifica logistics_provider_id, filtrar órdenes asignadas a ese proveedor
    if (logistics_provider_id) {
      where.order_drivers = {
        some: {
          is_current: true,
          logistics_provider_id: logistics_provider_id,
        },
      };
    }

    const data = await this.prisma.order.findMany({
      where,
    });

    return data.map((item) => this.toDomain(item));
  }

  async findAllWithFilters(
    tenant_id: string | undefined,
    logistics_provider_id: string | undefined,
    filters: ListOrdersFiltersDto
  ): Promise<OrdersListResult> {
    const where: Prisma.OrderWhereInput = {};
    
    // Solo filtrar por tenant_id si está presente
    // LOGISTICS_PROVIDER y SUPERVISOR no tienen tenant_id
    if (tenant_id) {
      where.tenant_id = tenant_id;
    }

    // Si se especifica logistics_provider_id, filtrar órdenes asignadas a ese proveedor
    if (logistics_provider_id) {
      where.order_drivers = {
        some: {
          is_current: true,
          logistics_provider_id: logistics_provider_id,
        },
      };
    }

    // Filtro por status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filtro por order_type
    if (filters.order_type) {
      where.order_type = filters.order_type;
    }

    // Filtro por driver_id
    if (filters.driver_id) {
      where.order_drivers = {
        some: {
          is_current: true,
          driver_id: filters.driver_id,
        },
      };
    }

    // Filtro por branch_id
    if (filters.branch_id) {
      where.order_branches = {
        some: {
          is_current: true,
          branch_id: filters.branch_id,
        },
      };
    }

    // Filtro por rango de fechas
    if (filters.start_date || filters.end_date) {
      where.created_at = {};
      if (filters.start_date) {
        where.created_at.gte = new Date(filters.start_date);
      }
      if (filters.end_date) {
        where.created_at.lte = new Date(filters.end_date);
      }
    }

    // Búsqueda de texto (case-insensitive) en order_display_number, tracking_code, order_number
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      const searchConditions: Prisma.OrderWhereInput[] = [
        { order_display_number: { contains: searchTerm, mode: 'insensitive' } },
        { tracking_code: { contains: searchTerm, mode: 'insensitive' } },
      ];

      // Buscar también por order_number (convertir a string para búsqueda)
      // Nota: order_number es BigInt, necesitamos buscar en la representación string
      try {
        const searchNumber = BigInt(searchTerm);
        searchConditions.push({ order_number: searchNumber });
      } catch {
        // Si no es un número válido, ignorar esta condición
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
    const total = await this.prisma.order.count({ where });

    // Obtener datos con paginación
    const data = await this.prisma.order.findMany({
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

  async create(data: CreateOrderData): Promise<Order> {
    // Generar tracking_code único si no se proporciona
    const tracking_code = data.tracking_code || this.generateTrackingCode();

    const created = await this.prisma.order.create({
      data: {
        tenant_id: data.tenant_id,
        order_number: data.order_number,
        order_display_number: data.order_display_number,
        order_type: data.order_type,
        customer_id: data.customer_id ?? null,
        customer_snapshot: data.customer_snapshot as Prisma.InputJsonValue,
        delivery_address: data.delivery_address as Prisma.InputJsonValue,
        delivery_lat: data.delivery_lat,
        delivery_lng: data.delivery_lng,
        pickup_address: data.pickup_address ? (data.pickup_address as Prisma.InputJsonValue) : Prisma.JsonNull,
        pickup_lat: data.pickup_lat ?? null,
        pickup_lng: data.pickup_lng ?? null,
        status: data.status ?? 'PENDING',
        scheduled_pickup_at: data.scheduled_pickup_at ?? null,
        estimated_delivery_at: data.estimated_delivery_at,
        special_instructions: data.special_instructions ?? null,
        priority: data.priority ?? 'NORMAL',
        cargo_description: data.cargo_description ?? null,
        tracking_code,
      },
    });

    return this.toDomain(created);
  }

  /**
   * ACTUALIZA el status de una orden.
   * 
   * ⚠️ IMPORTANTE: Este es el ÚNICO UPDATE permitido en la tabla Order.
   * 
   * El sistema sigue un patrón inmutable (append-only) para órdenes:
   * - Cambios de driver: INSERT nuevo order_drivers (is_current = true)
   * - Cambios de branch: INSERT nuevo order_branches (is_current = true)
   * - Modificación de items: INSERT todos los items de nueva versión
   * - Recalculo de totals: INSERT nuevo order_summary_totals (is_current = true)
   * 
   * EXCEPCIÓN: Solo se permite UPDATE en el campo `status` y `cancellation_reason`
   * porque el estado de la orden debe reflejarse en tiempo real y no requiere
   * historial de versiones (el historial se maneja en OrderStatusHistory).
   * 
   * ⚠️ NOTA: Este método NO valida transiciones de estado ni crea OrderStatusHistory.
   * Debe usarse a través de UpdateOrderStatusUseCase que incluye:
   * - Validación de transiciones usando OrderStateMachine
   * - Creación de registro en OrderStatusHistory
   * - Validación de reglas de negocio
   * 
   * @param id - ID de la orden
   * @param status - Nuevo status (debe ser un OrderStatus válido)
   * @param cancellation_reason - Razón de cancelación (opcional, solo para CANCELLED)
   * @returns Order actualizada
   * @throws Error si la orden no existe
   */
  async updateStatus(
    id: string,
    status: string,
    cancellation_reason?: string | null
  ): Promise<Order> {
    // Validar que el status es un OrderStatus válido
    const validStatuses: OrderStatus[] = [
      'DRAFT',
      'PENDING',
      'CONFIRMED',
      'ASSIGNED',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED',
      'FAILED',
    ];

    if (!validStatuses.includes(status as OrderStatus)) {
      throw new Error(`Invalid order status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`);
    }

    // Validar que cancellation_reason solo se proporciona para CANCELLED
    if (cancellation_reason !== undefined && cancellation_reason !== null && status !== 'CANCELLED') {
      throw new Error('cancellation_reason can only be set when status is CANCELLED');
    }

    const data: Prisma.OrderUpdateInput = {
      status: status as OrderStatus,
    };

    if (cancellation_reason !== undefined) {
      data.cancellation_reason = cancellation_reason;
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data,
    });

    return this.toDomain(updated);
  }

  private generateTrackingCode(): string {
    // Generar código de tracking único (ej: TRK-ABC123XYZ)
    const prefix = 'TRK';
    const randomPart = generateSecureToken(12).toUpperCase();
    return `${prefix}-${randomPart}`;
  }

  private toDomain(data: {
    id: string;
    tenant_id: string;
    order_number: bigint;
    order_display_number: string;
    order_type: string;
    customer_id: string | null;
    customer_snapshot: Prisma.JsonValue;
    delivery_address: Prisma.JsonValue;
    delivery_lat: Prisma.Decimal | number | null;
    delivery_lng: Prisma.Decimal | number | null;
    pickup_address: Prisma.JsonValue | null;
    pickup_lat: Prisma.Decimal | number | null;
    pickup_lng: Prisma.Decimal | number | null;
    status: string;
    cancellation_reason: string | null;
    scheduled_pickup_at: Date | null;
    estimated_delivery_at: Date;
    special_instructions: string | null;
    priority: string;
    cargo_description: string | null;
    tracking_code: string;
    created_at: Date;
    updated_at: Date;
  }): Order {
    return new Order(
      data.id,
      data.tenant_id,
      data.order_number,
      data.order_display_number,
      data.order_type as OrderType,
      data.customer_id,
      data.customer_snapshot as Record<string, unknown>,
      data.delivery_address as Record<string, unknown>,
      Number(data.delivery_lat),
      Number(data.delivery_lng),
      data.pickup_address ? (data.pickup_address as Record<string, unknown>) : null,
      data.pickup_lat ? Number(data.pickup_lat) : null,
      data.pickup_lng ? Number(data.pickup_lng) : null,
      data.status as OrderStatus,
      data.cancellation_reason,
      data.scheduled_pickup_at,
      data.estimated_delivery_at,
      data.special_instructions,
      data.priority as OrderPriority,
      data.cargo_description,
      data.tracking_code,
      data.created_at,
      data.updated_at
    );
  }
}

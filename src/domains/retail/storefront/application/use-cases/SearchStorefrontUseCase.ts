/**
 * Use case para búsqueda en storefront
 * Busca en productos, categorías y marcas
 */

import { injectable, inject } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { TYPES } from '../../../../../config/types';

export interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    selling_price: number;
    compare_at_price: number | null;
    currency: string;
    featured_image_url: string | null;
    is_featured: boolean;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    brand: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
  }>;
  brands: Array<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
  }>;
}

@injectable()
export class SearchStorefrontUseCase {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async execute(tenant_id: string, query: string, limit: number = 20): Promise<SearchResult> {
    const searchTerm = query.trim().toLowerCase();

    if (!searchTerm) {
      return {
        products: [],
        categories: [],
        brands: [],
      };
    }

    // Buscar productos
    const products = await this.prisma.product.findMany({
      where: {
        tenant_id,
        is_active: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      take: limit,
      orderBy: [
        { is_featured: 'desc' },
        { created_at: 'desc' },
      ],
    });

    // Buscar categorías
    const categories = await this.prisma.category.findMany({
      where: {
        tenant_id,
        is_active: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
      },
      take: limit,
      orderBy: {
        display_order: 'asc',
      },
    });

    // Buscar marcas
    const brands = await this.prisma.brand.findMany({
      where: {
        tenant_id,
        is_active: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { slug: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo_url: true,
        description: true,
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        selling_price: Number(p.selling_price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        currency: p.currency,
        featured_image_url: p.featured_image_url,
        is_featured: p.is_featured,
        category: p.category,
        brand: p.brand,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image_url: c.image_url,
      })),
      brands: brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo_url: b.logo_url,
        description: b.description,
      })),
    };
  }
}


/**
 * Use Case: Agregar item al carrito
 * 
 * Valida stock y agrega item al carrito
 */

import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { ICartRepository } from '../../domain/repositories/ICartRepository';
import { IProductRepository } from '../../../products/domain/repositories/IProductRepository';
import { IProductVariantRepository } from '../../../product-variants/domain/repositories/IProductVariantRepository';
import { AddCartItemDto } from '../dto/AddCartItemDto';
import { Cart } from '../../domain/entities/Cart';
import { TYPES } from '../../../../../config/types';

export interface AddCartItemParams {
  tenant_id: string;
  customer_id?: string | null;
  session_id?: string | null;
  item: AddCartItemDto;
}

@injectable()
export class AddCartItemUseCase {
  constructor(
    @inject(TYPES.ICartRepository) private cartRepository: ICartRepository,
    @inject(TYPES.IProductRepository) private productRepository: IProductRepository,
    @inject(TYPES.IProductVariantRepository) private variantRepository: IProductVariantRepository
  ) {}

  async execute(params: AddCartItemParams): Promise<Cart> {
    const { tenant_id, customer_id, session_id, item } = params;

    // Validar producto
    const product = await this.productRepository.findById(item.product_id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.tenant_id !== tenant_id) {
      throw new Error('Product belongs to different tenant');
    }

    if (!product.is_active) {
      throw new Error('Product is not active');
    }

    // Validar variante si existe
    let variant = null;
    if (item.variant_id) {
      variant = await this.variantRepository.findById(item.variant_id);
      if (!variant) {
        throw new Error('Product variant not found');
      }

      if (variant.product_id !== product.id) {
        throw new Error('Variant does not belong to product');
      }

      if (!variant.is_active) {
        throw new Error('Product variant is not active');
      }
    }

    // Validar stock
    const stock = variant ? variant.current_stock : product.current_stock;
    const trackInventory = variant ? variant.track_inventory : product.track_inventory;

    if (trackInventory && stock < item.quantity) {
      throw new Error(`Insufficient stock. Only ${stock} items available`);
    }

    // Obtener o crear carrito
    let cart = await this.getOrCreateCart(tenant_id, customer_id ?? null, session_id ?? null);

    // Verificar si el item ya existe en el carrito
    const existingItem = cart.items.find(
      (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
    );

    let updatedCart: Cart;

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + item.quantity;

      if (trackInventory && stock < newQuantity) {
        throw new Error(`Insufficient stock. Only ${stock} items available`);
      }

      await this.cartRepository.updateItem(existingItem.id, {
        quantity: newQuantity,
      });

      // Recargar carrito
      const reloadedCart = await this.cartRepository.findById(cart.id);
      if (!reloadedCart) {
        throw new Error('Cart not found after update');
      }
      updatedCart = reloadedCart;
    } else {
      // Calcular precio unitario
      const unitPrice = variant
        ? Number(product.selling_price) + Number(variant.price_adjustment)
        : Number(product.selling_price);

      // Agregar nuevo item
      await this.cartRepository.addItem(cart.id, {
        product_id: item.product_id,
        variant_id: item.variant_id ?? null,
        quantity: item.quantity,
        unit_price: unitPrice,
      });

      // Recargar carrito
      const reloadedCart = await this.cartRepository.findById(cart.id);
      if (!reloadedCart) {
        throw new Error('Cart not found after adding item');
      }
      updatedCart = reloadedCart;
    }

    return updatedCart;
  }

  private async getOrCreateCart(
    tenant_id: string,
    customer_id: string | null,
    session_id: string | null
  ): Promise<Cart> {
    if (customer_id) {
      let cart = await this.cartRepository.findByTenantAndCustomer(tenant_id, customer_id);
      if (cart && !cart.isExpired()) {
        return cart;
      }
    }

    if (session_id) {
      let cart = await this.cartRepository.findByTenantAndSession(tenant_id, session_id);
      if (cart && !cart.isExpired()) {
        return cart;
      }
    }

    // Crear nuevo carrito
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Expira en 30 días

    return await this.cartRepository.create({
      tenant_id,
      customer_id: customer_id ?? null,
      session_id: session_id ?? null,
      expires_at: expiresAt,
    });
  }
}


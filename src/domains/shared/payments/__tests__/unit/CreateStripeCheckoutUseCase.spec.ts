/**
 * Tests unitarios para CreateStripeCheckoutUseCase
 */

import { CreateStripeCheckoutUseCase } from '../../application/use-cases/CreateStripeCheckoutUseCase';
import { StripeService } from '../../application/services/StripeService';
import { IOrderRepository } from '../../../../delivery/orders/domain/repositories/IOrderRepository';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/CreatePaymentTransactionUseCase';
import { Order } from '../../../../delivery/orders/domain/entities/Order';

describe('CreateStripeCheckoutUseCase', () => {
  let useCase: CreateStripeCheckoutUseCase;
  let mockStripeService: jest.Mocked<StripeService>;
  let mockOrderRepository: jest.Mocked<IOrderRepository>;
  let mockCreatePaymentTransactionUseCase: jest.Mocked<CreatePaymentTransactionUseCase>;

  beforeEach(() => {
    mockStripeService = {
      createCheckoutSession: jest.fn(),
    } as any;

    mockOrderRepository = {
      findById: jest.fn(),
    } as any;

    mockCreatePaymentTransactionUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new CreateStripeCheckoutUseCase(
      mockStripeService,
      mockOrderRepository,
      mockCreatePaymentTransactionUseCase
    );
  });

  it('should create checkout session and payment transaction', async () => {
    const order = new Order(
      'order-id',
      'tenant-id',
      BigInt(1),
      'ORD-001',
      'RETAIL',
      null,
      {},
      {},
      0,
      0,
      null,
      null,
      null,
      'PENDING',
      null,
      null,
      new Date(),
      null,
      'NORMAL',
      null,
      'TRK-001',
      new Date(),
      new Date()
    );

    const mockSession = {
      id: 'cs_123',
      url: 'https://checkout.stripe.com/pay/cs_123',
      payment_intent: 'pi_123',
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    mockStripeService.createCheckoutSession.mockResolvedValue(mockSession as any);
    mockCreatePaymentTransactionUseCase.execute.mockResolvedValue({
      payment: {} as any,
      orderPayment: {} as any,
    });

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    };

    const result = await useCase.execute(dto);

    expect(result).toHaveProperty('checkout_url', 'https://checkout.stripe.com/pay/cs_123');
    expect(result).toHaveProperty('payment_intent_id', 'pi_123');
    expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-id');
    expect(mockStripeService.createCheckoutSession).toHaveBeenCalled();
    expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalled();
  });

  it('should throw error if order not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Order not found');
  });

  it('should throw error if order belongs to different tenant', async () => {
    const order = new Order(
      'order-id',
      'different-tenant-id',
      BigInt(1),
      'ORD-001',
      'RETAIL',
      null,
      {},
      {},
      0,
      0,
      null,
      null,
      null,
      'PENDING',
      null,
      null,
      new Date(),
      null,
      'NORMAL',
      null,
      'TRK-001',
      new Date(),
      new Date()
    );

    mockOrderRepository.findById.mockResolvedValue(order);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      success_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Order belongs to different tenant');
  });
});


/**
 * Tests unitarios para CreatePaymentTransactionUseCase
 */

import { CreatePaymentTransactionUseCase } from '../../application/use-cases/CreatePaymentTransactionUseCase';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { IOrderPaymentTransactionRepository } from '../../../../delivery/order-payments/domain/repositories/IOrderPaymentTransactionRepository';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import { OrderPaymentTransaction } from '../../../../delivery/order-payments/domain/entities/OrderPaymentTransaction';

describe('CreatePaymentTransactionUseCase', () => {
  let useCase: CreatePaymentTransactionUseCase;
  let mockPaymentRepository: jest.Mocked<IPaymentTransactionRepository>;
  let mockOrderPaymentRepository: jest.Mocked<IOrderPaymentTransactionRepository>;

  beforeEach(() => {
    mockPaymentRepository = {
      create: jest.fn(),
    } as any;

    mockOrderPaymentRepository = {
      create: jest.fn(),
    } as any;

    useCase = new CreatePaymentTransactionUseCase(mockPaymentRepository, mockOrderPaymentRepository);
  });

  it('should create payment transaction and order payment relationship', async () => {
    const payment = new PaymentTransaction(
      'payment-id',
      'tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      null,
      null,
      100,
      'USD',
      'PENDING',
      null,
      '1234',
      'visa',
      null,
      new Date(),
      new Date()
    );

    const orderPayment = new OrderPaymentTransaction(
      'order-payment-id',
      'order-id',
      'payment-id',
      new Date()
    );

    mockPaymentRepository.create.mockResolvedValue(payment);
    mockOrderPaymentRepository.create.mockResolvedValue(orderPayment);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      transaction_type: 'CHARGE' as const,
      payment_method: 'CARD' as const,
      amount: 100,
      currency: 'USD',
    };

    const result = await useCase.execute(dto);

    expect(result).toHaveProperty('payment');
    expect(result).toHaveProperty('orderPayment');
    expect(result.payment.id).toBe('payment-id');
    expect(result.orderPayment.order_id).toBe('order-id');
    expect(result.orderPayment.payment_transaction_id).toBe('payment-id');
    expect(mockPaymentRepository.create).toHaveBeenCalledWith({
      tenant_id: 'tenant-id',
      transaction_type: 'CHARGE',
      payment_method: 'CARD',
      amount: 100,
      currency: 'USD',
      payment_intent_id: undefined,
      charge_id: undefined,
      refund_id: undefined,
      status: 'PENDING',
      card_last4: undefined,
      card_brand: undefined,
      metadata: undefined,
    });
    expect(mockOrderPaymentRepository.create).toHaveBeenCalledWith({
      order_id: 'order-id',
      payment_transaction_id: 'payment-id',
    });
  });

  it('should create payment transaction with optional fields', async () => {
    const payment = new PaymentTransaction(
      'payment-id',
      'tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      'ch_123',
      null,
      100,
      'USD',
      'PENDING',
      null,
      '1234',
      'visa',
      { key: 'value' },
      new Date(),
      new Date()
    );

    const orderPayment = new OrderPaymentTransaction(
      'order-payment-id',
      'order-id',
      'payment-id',
      new Date()
    );

    mockPaymentRepository.create.mockResolvedValue(payment);
    mockOrderPaymentRepository.create.mockResolvedValue(orderPayment);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      transaction_type: 'CHARGE' as const,
      payment_method: 'CARD' as const,
      amount: 100,
      currency: 'USD',
      payment_intent_id: 'pi_123',
      charge_id: 'ch_123',
      card_last4: '1234',
      card_brand: 'visa',
      metadata: { key: 'value' },
    };

    const result = await useCase.execute(dto);

    expect(result.payment.payment_intent_id).toBe('pi_123');
    expect(result.payment.charge_id).toBe('ch_123');
    expect(result.payment.card_last4).toBe('1234');
    expect(result.payment.card_brand).toBe('visa');
  });
});


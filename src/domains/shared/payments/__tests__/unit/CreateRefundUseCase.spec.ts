/**
 * Tests unitarios para CreateRefundUseCase
 */

import { CreateRefundUseCase } from '../../application/use-cases/CreateRefundUseCase';
import { StripeService } from '../../application/services/StripeService';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { CreatePaymentTransactionUseCase } from '../../application/use-cases/CreatePaymentTransactionUseCase';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';

describe('CreateRefundUseCase', () => {
  let useCase: CreateRefundUseCase;
  let mockStripeService: jest.Mocked<StripeService>;
  let mockPaymentRepository: jest.Mocked<IPaymentTransactionRepository>;
  let mockCreatePaymentTransactionUseCase: jest.Mocked<CreatePaymentTransactionUseCase>;

  beforeEach(() => {
    mockStripeService = {
      createRefund: jest.fn(),
    } as any;

    mockPaymentRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockCreatePaymentTransactionUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new CreateRefundUseCase(
      mockStripeService,
      mockPaymentRepository,
      mockCreatePaymentTransactionUseCase
    );
  });

  it('should create full refund', async () => {
    const originalPayment = new PaymentTransaction(
      'original-payment-id',
      'tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      'ch_123',
      null,
      100,
      'USD',
      'SUCCEEDED',
      null,
      '1234',
      'visa',
      null,
      new Date(),
      new Date()
    );

    const refund = new PaymentTransaction(
      'refund-id',
      'tenant-id',
      'REFUND',
      'CARD',
      null,
      null,
      're_123',
      100,
      'USD',
      'SUCCEEDED',
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    const stripeRefund = {
      id: 're_123',
    };

    mockPaymentRepository.findById.mockResolvedValue(originalPayment);
    mockStripeService.createRefund.mockResolvedValue(stripeRefund as any);
    mockCreatePaymentTransactionUseCase.execute.mockResolvedValue({
      payment: refund,
      orderPayment: {} as any,
    });
    mockPaymentRepository.update.mockResolvedValue(refund);
    mockPaymentRepository.findById.mockResolvedValueOnce(originalPayment).mockResolvedValueOnce(refund);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
    };

    const result = await useCase.execute(dto);

    expect(result).toHaveProperty('refund');
    expect(result).toHaveProperty('refund_id', 're_123');
    expect(mockStripeService.createRefund).toHaveBeenCalledWith({
      charge_id: 'ch_123',
      amount: 100,
      reason: undefined,
      metadata: expect.objectContaining({
        order_id: 'order-id',
        tenant_id: 'tenant-id',
      }),
    });
    expect(mockCreatePaymentTransactionUseCase.execute).toHaveBeenCalledWith({
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      transaction_type: 'REFUND',
      payment_method: 'CARD',
      amount: 100,
      currency: 'USD',
      refund_id: 're_123',
      metadata: expect.objectContaining({
        original_payment_transaction_id: 'original-payment-id',
      }),
    });
  });

  it('should create partial refund', async () => {
    const originalPayment = new PaymentTransaction(
      'original-payment-id',
      'tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      'ch_123',
      null,
      100,
      'USD',
      'SUCCEEDED',
      null,
      '1234',
      'visa',
      null,
      new Date(),
      new Date()
    );

    const refund = new PaymentTransaction(
      'refund-id',
      'tenant-id',
      'REFUND',
      'CARD',
      null,
      null,
      're_123',
      50,
      'USD',
      'SUCCEEDED',
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    const stripeRefund = {
      id: 're_123',
    };

    mockPaymentRepository.findById.mockResolvedValue(originalPayment);
    mockStripeService.createRefund.mockResolvedValue(stripeRefund as any);
    mockCreatePaymentTransactionUseCase.execute.mockResolvedValue({
      payment: refund,
      orderPayment: {} as any,
    });
    mockPaymentRepository.update.mockResolvedValue(refund);
    mockPaymentRepository.findById.mockResolvedValueOnce(originalPayment).mockResolvedValueOnce(refund);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
      amount: 50,
      reason: 'requested_by_customer' as const,
    };

    const result = await useCase.execute(dto);

    expect(result.refund.amount).toBe(50);
    expect(mockStripeService.createRefund).toHaveBeenCalledWith({
      charge_id: 'ch_123',
      amount: 50,
      reason: 'requested_by_customer',
      metadata: expect.any(Object),
    });
  });

  it('should throw error if original payment not found', async () => {
    mockPaymentRepository.findById.mockResolvedValue(null);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Original payment transaction not found');
  });

  it('should throw error if original payment belongs to different tenant', async () => {
    const originalPayment = new PaymentTransaction(
      'original-payment-id',
      'different-tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      'ch_123',
      null,
      100,
      'USD',
      'SUCCEEDED',
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    mockPaymentRepository.findById.mockResolvedValue(originalPayment);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Payment transaction belongs to different tenant');
  });

  it('should throw error if original payment does not have charge_id', async () => {
    const originalPayment = new PaymentTransaction(
      'original-payment-id',
      'tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      null,
      null,
      100,
      'USD',
      'SUCCEEDED',
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    mockPaymentRepository.findById.mockResolvedValue(originalPayment);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Original payment does not have a charge_id');
  });

  it('should throw error if original payment is not succeeded', async () => {
    const originalPayment = new PaymentTransaction(
      'original-payment-id',
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
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    mockPaymentRepository.findById.mockResolvedValue(originalPayment);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Can only refund succeeded payments');
  });

  it('should throw error if refund amount exceeds original payment', async () => {
    const originalPayment = new PaymentTransaction(
      'original-payment-id',
      'tenant-id',
      'CHARGE',
      'CARD',
      'pi_123',
      'ch_123',
      null,
      100,
      'USD',
      'SUCCEEDED',
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    mockPaymentRepository.findById.mockResolvedValue(originalPayment);

    const dto = {
      order_id: 'order-id',
      tenant_id: 'tenant-id',
      original_payment_transaction_id: 'original-payment-id',
      amount: 150,
    };

    await expect(useCase.execute(dto)).rejects.toThrow('Refund amount cannot exceed original payment amount');
  });
});


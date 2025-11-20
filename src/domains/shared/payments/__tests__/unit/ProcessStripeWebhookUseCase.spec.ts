/**
 * Tests unitarios para ProcessStripeWebhookUseCase
 */

import { ProcessStripeWebhookUseCase } from '../../application/use-cases/ProcessStripeWebhookUseCase';
import { StripeService } from '../../application/services/StripeService';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import { UpdatePaymentStatusUseCase } from '../../application/use-cases/UpdatePaymentStatusUseCase';
import { UpdateOrderStatusUseCase } from '../../../../delivery/orders/application/use-cases/UpdateOrderStatusUseCase';
import { PaymentTransaction } from '../../domain/entities/PaymentTransaction';
import Stripe from 'stripe';

describe('ProcessStripeWebhookUseCase', () => {
  let useCase: ProcessStripeWebhookUseCase;
  let mockStripeService: jest.Mocked<StripeService>;
  let mockPaymentRepository: jest.Mocked<IPaymentTransactionRepository>;
  let mockUpdatePaymentStatusUseCase: jest.Mocked<UpdatePaymentStatusUseCase>;
  let mockUpdateOrderStatusUseCase: jest.Mocked<UpdateOrderStatusUseCase>;

  beforeEach(() => {
    mockStripeService = {
      getCharge: jest.fn(),
    } as any;

    mockPaymentRepository = {
      findByPaymentIntentId: jest.fn(),
    } as any;

    mockUpdatePaymentStatusUseCase = {
      execute: jest.fn(),
    } as any;

    mockUpdateOrderStatusUseCase = {
      execute: jest.fn(),
    } as any;

    useCase = new ProcessStripeWebhookUseCase(
      mockStripeService,
      mockPaymentRepository,
      mockUpdatePaymentStatusUseCase,
      mockUpdateOrderStatusUseCase
    );
  });

  it('should handle checkout.session.completed event', async () => {
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
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    const event: Stripe.Event = {
      id: 'evt_123',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          payment_intent: 'pi_123',
          metadata: { order_id: 'order-id' },
        } as any,
      },
    } as Stripe.Event;

    mockPaymentRepository.findByPaymentIntentId.mockResolvedValue(payment);
    mockUpdatePaymentStatusUseCase.execute.mockResolvedValue(payment);

    await useCase.execute(event);

    expect(mockPaymentRepository.findByPaymentIntentId).toHaveBeenCalledWith('pi_123');
    expect(mockUpdatePaymentStatusUseCase.execute).toHaveBeenCalledWith({
      payment_transaction_id: 'payment-id',
      status: 'PROCESSING',
      payment_intent_id: 'pi_123',
    });
  });

  it('should handle payment_intent.succeeded event', async () => {
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
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    const charge = {
      id: 'ch_123',
      payment_method_details: {
        card: {
          last4: '1234',
          brand: 'visa',
        },
      },
    } as any;

    const event: Stripe.Event = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          latest_charge: 'ch_123',
          metadata: { order_id: 'order-id' },
        } as any,
      },
    } as Stripe.Event;

    mockPaymentRepository.findByPaymentIntentId.mockResolvedValue(payment);
    mockStripeService.getCharge.mockResolvedValue(charge);
    mockUpdatePaymentStatusUseCase.execute.mockResolvedValue(payment);

    await useCase.execute(event);

    expect(mockUpdatePaymentStatusUseCase.execute).toHaveBeenCalledWith({
      payment_transaction_id: 'payment-id',
      status: 'SUCCEEDED',
      payment_intent_id: 'pi_123',
      charge_id: 'ch_123',
      card_last4: '1234',
      card_brand: 'visa',
    });
    expect(mockUpdateOrderStatusUseCase.execute).toHaveBeenCalledWith({
      order_id: 'order-id',
      to_status: 'CONFIRMED',
      changed_by_user_id: 'system',
      notes: 'Payment succeeded',
    });
  });

  it('should handle payment_intent.payment_failed event', async () => {
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
      null,
      null,
      null,
      new Date(),
      new Date()
    );

    const event: Stripe.Event = {
      id: 'evt_123',
      type: 'payment_intent.payment_failed',
      data: {
        object: {
          id: 'pi_123',
          last_payment_error: { message: 'Card declined' },
          metadata: { order_id: 'order-id' },
        } as any,
      },
    } as Stripe.Event;

    mockPaymentRepository.findByPaymentIntentId.mockResolvedValue(payment);
    mockUpdatePaymentStatusUseCase.execute.mockResolvedValue(payment);

    await useCase.execute(event);

    expect(mockUpdatePaymentStatusUseCase.execute).toHaveBeenCalledWith({
      payment_transaction_id: 'payment-id',
      status: 'FAILED',
      payment_intent_id: 'pi_123',
      failure_reason: 'Card declined',
    });
    expect(mockUpdateOrderStatusUseCase.execute).toHaveBeenCalledWith({
      order_id: 'order-id',
      to_status: 'CANCELLED',
      changed_by_user_id: 'system',
      notes: 'Payment failed',
    });
  });

  it('should handle unhandled event types gracefully', async () => {
    const event: Stripe.Event = {
      id: 'evt_123',
      type: 'customer.created',
      data: {
        object: {} as any,
      },
    } as Stripe.Event;

    await expect(useCase.execute(event)).resolves.not.toThrow();
  });
});


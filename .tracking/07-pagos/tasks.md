# Tareas - Pagos

## Tareas de PaymentTransaction

- [x] Crear tabla PaymentTransaction (shared schema - ya existe)
- [x] CRUD PaymentTransaction (repositories implementados)
- [x] Currency support
- [x] Status tracking
- [ ] Tests unitarios

## Tareas de OrderPaymentTransaction

- [x] Crear tabla OrderPaymentTransaction (delivery schema, pivot - ya existe)
- [x] CRUD OrderPaymentTransaction (repositories implementados)
- [x] Relación many-to-many
- [ ] Tests unitarios

## Tareas de Stripe Integration

- [x] Configurar Stripe SDK (StripeService)
- [x] Crear Checkout Session (CreateStripeCheckoutUseCase)
- [x] Crear Payment Intent (StripeService.createPaymentIntent)
- [x] Implementar webhook handler (ProcessStripeWebhookUseCase)
- [x] Verificar signature de webhook (StripeService.verifyWebhookSignature)
- [ ] Tests unitarios (mocks de Stripe)

## Tareas de Payment Status Tracking

- [x] Implementar estados (PENDING, PROCESSING, etc.) - en PaymentTransaction entity
- [x] Actualizar desde webhooks (ProcessStripeWebhookUseCase)
- [x] Historial completo (findByOrderId en repository)
- [ ] Tests unitarios

## Tareas de Multi-currency

- [x] Currency en PaymentTransaction (campo currency en entity)
- [x] Validar currency entre orden y pago (pendiente validación explícita)
- [x] Stripe Checkout con currency (StripeService.createCheckoutSession)
- [ ] Tests unitarios

## Tareas de Refunds

- [x] Implementar refund parcial (CreateRefundUseCase con amount)
- [x] Implementar refund completo (CreateRefundUseCase sin amount)
- [x] Crear PaymentTransaction tipo REFUND
- [ ] Tests unitarios

## Tareas de Testing

- [ ] Tests unitarios PaymentTransaction
- [ ] Tests unitarios Stripe integration (mocks)
- [ ] Tests unitarios Webhook handler
- [ ] Tests unitarios Refunds
- [ ] Verificar coverage >80%


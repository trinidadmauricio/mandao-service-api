# Sub-plan 07: Pagos

## Objetivo

Implementar sistema de pagos con Stripe, multi-currency y relación many-to-many con órdenes.

## Alcance

- PaymentTransaction en schema shared
- OrderPaymentTransaction (tabla pivot)
- Stripe Checkout Session
- Webhook handler
- Payment status tracking
- Refunds
- Multi-currency en pagos

## Entregables

1. **PaymentTransaction**
   - Tabla en schema shared
   - CRUD completo
   - Currency support
   - Status tracking

2. **OrderPaymentTransaction**
   - Tabla pivot en schema delivery
   - Relación many-to-many
   - CRUD completo

3. **Stripe Integration**
   - Checkout Session con currency
   - Payment Intents
   - Webhook handler con signature verification
   - Refunds

4. **Payment Status Tracking**
   - PENDING, PROCESSING, SUCCEEDED, FAILED, CANCELLED
   - Actualización desde webhooks
   - Historial completo

5. **Multi-currency**
   - Currency en PaymentTransaction
   - Validación de currency entre orden y pago
   - Stripe con currency correcta

6. **Refunds**
   - Refunds parciales
   - Refunds completos
   - PaymentTransaction tipo REFUND

## Criterios de Éxito

- ✓ Pago exitoso → orden confirmed + PaymentTransaction creada
- ✓ Pago fallido → orden cancelled + PaymentTransaction con status FAILED
- ✓ Refund parcial funciona
- ✓ Webhooks manejados correctamente
- ✓ Historial completo de transacciones por orden recuperable
- ✓ Currency validada entre orden y pago
- ✓ Stripe recibe currency correcta

## Duración Estimada

1 semana (Semana 12)

## Dependencias

- Sub-plan 01: Setup y Fundación
- Sub-plan 04: Órdenes Delivery

## Riesgos

- Webhook security crítico
- Currency conversion (futuro)
- Múltiples transacciones por orden


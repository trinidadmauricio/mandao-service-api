# Sub-plan 06: Retail Storefront API

## Objetivo

Implementar Storefront API backend completo con multi-language y multi-currency, e integración con delivery domain.

## Alcance

- Storefront API endpoints
- Theme configurator API
- Checkout flow
- Integración retail → delivery
- DeliveryClient implementación

## Entregables

1. **Storefront API Endpoints**
   - GET /api/v1/storefront/products?locale=es&currency=USD
   - GET /api/v1/storefront/products/:id?locale=es&currency=USD
   - POST /api/v1/storefront/checkout
   - Respuestas en idioma solicitado
   - Precios en moneda solicitada

2. **Theme Configurator API**
   - CRUD de themes
   - Configuración de storefront
   - Personalización

3. **Checkout Flow**
   - Validación de stock
   - Reserva de stock
   - Creación de orden en delivery
   - Liberación de stock si falla

4. **DeliveryClient Implementación**
   - Implementación de IDeliveryClient
   - Llamada a CreateRetailOrderUseCase en delivery
   - Preparado para extracción futura

5. **Integración Retail → Delivery**
   - Verificación de stock antes de crear orden
   - Reserva de stock al crear orden
   - Liberación de stock si orden se cancela
   - Currency se pasa a delivery

## Criterios de Éxito

- ✓ Storefront API funciona (backend solamente)
- ✓ Productos muestran precios en currency solicitada
- ✓ Productos muestran descripciones en idioma solicitado
- ✓ Checkout reserva stock
- ✓ Cancelación libera stock
- ✓ Órdenes retail se crean correctamente en delivery
- ✓ DeliveryClient puede intercambiarse (preparado para extracción)

## Duración Estimada

Parte de Fase 4 (Semanas 9-11)

## Dependencias

- Sub-plan 01: Setup y Fundación
- Sub-plan 04: Órdenes Delivery
- Sub-plan 05: Retail Products

## Riesgos

- Integración retail-delivery puede tener edge cases
- Stock reservations en checkout crítico
- Performance con muchos productos


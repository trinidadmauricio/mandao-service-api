# Sub-plan 04: Órdenes Delivery

## Objetivo

Implementar core de órdenes inmutable para ambos tipos (RETAIL y ON_DEMAND) con patrón append-only.

## Alcance

- Schema completo orders + pivots
- CreateOnDemandOrderUseCase
- CreateRetailOrderUseCase
- Patrón inmutable para todos los cambios
- IDeliveryClient interface
- Status transitions
- Order tracking público
- Delivery proofs y ratings

## Entregables

1. **Schema de Órdenes**
   - Orders table (delivery schema)
   - OrderBranches (pivot)
   - OrderDrivers (pivot)
   - OrderItems
   - OrderSummaryTotals
   - OrderStatusHistory
   - OrderDeliveryProofs
   - DeliveryRatings

2. **CreateOnDemandOrderUseCase**
   - order_type: ON_DEMAND
   - Sin productos previamente registrados
   - Currency del tenant

3. **CreateRetailOrderUseCase**
   - order_type: RETAIL
   - Con product_snapshot
   - Currency del tenant
   - Recibe llamada desde retail domain

4. **IDeliveryClient Interface**
   - Interface para comunicación retail → delivery
   - Preparado para extracción futura

5. **Patrón Inmutable**
   - Cambio de driver: INSERT nuevo order_drivers
   - Cambio de branch: INSERT nuevo order_branches
   - Modificación de items: INSERT todos los items de nueva versión
   - Recalculo de totals: INSERT nuevo order_summary_totals

6. **Status Transitions**
   - State machine para transiciones válidas
   - OrderStatusHistory tracking

7. **Order Tracking Público**
   - Endpoint público sin auth
   - Mensajes en idioma solicitado

8. **Delivery Features**
   - Delivery proofs (fotos, firmas)
   - Rating system

## Criterios de Éxito

- ✓ Historial completo de cambios recuperable
- ✓ Snapshot de orden en fecha X funciona
- ✓ Tracking público sin auth
- ✓ Estado transitions validados
- ✓ Órdenes on-demand funcionan
- ✓ IDeliveryClient interface definida y testeable
- ✓ Modificación de items: INSERT de todos los items de nueva versión
- ✓ Mismo patrón que branches y drivers: cada cambio = nueva versión completa

## Duración Estimada

3 semanas (Semanas 6-8)

## Dependencias

- Sub-plan 01: Setup y Fundación
- Sub-plan 03: Delivery Base

## Riesgos

- Complejidad de inmutabilidad
- Performance con historial completo
- Validación de state transitions


# Tareas - Órdenes Delivery

## Tareas de Schema

- [x] Crear tabla Orders (delivery schema) - Ya existe en Prisma
- [x] Crear tabla OrderBranches (pivot) - Ya existe en Prisma
- [x] Crear tabla OrderDrivers (pivot) - Ya existe en Prisma
- [x] Crear tabla OrderItems - Ya existe en Prisma
- [x] Crear tabla OrderSummaryTotals - Ya existe en Prisma
- [x] Crear tabla OrderStatusHistory - Ya existe en Prisma
- [x] Crear tabla OrderDeliveryProofs - Ya existe en Prisma
- [x] Crear tabla DeliveryRatings - Ya existe en Prisma
- [x] Crear índices apropiados - Ya existen en Prisma

## Tareas de CreateOnDemandOrderUseCase

- [x] Implementar use case
- [x] Validar datos de entrada
- [x] Obtener order number
- [x] Crear orden con order_type: ON_DEMAND
- [x] Crear order_items sin product_id
- [x] Crear order_summary_totals
- [ ] Tests unitarios

## Tareas de CreateRetailOrderUseCase

- [x] Implementar use case
- [x] Validar datos de entrada
- [x] Obtener order number
- [x] Crear orden con order_type: RETAIL
- [x] Crear order_items con product_snapshot
- [x] Crear order_summary_totals
- [x] Integrar con IDeliveryClient
- [ ] Tests unitarios

## Tareas de IDeliveryClient Interface

- [x] Definir interface IDeliveryClient - Ya existe
- [x] Definir DTOs de comunicación - Ya existen en order.contracts.ts
- [x] Documentar interface - Ya documentada
- [x] Integrar con CreateRetailOrderUseCase
- [ ] Tests unitarios de interface

## Tareas de Patrón Inmutable - Driver

- [x] Implementar AssignDriverUseCase
- [x] INSERT nuevo order_drivers
- [x] Marcar anteriores is_current = false
- [x] Crear OrderStatusHistory si cambia estado
- [ ] Tests unitarios

## Tareas de Patrón Inmutable - Branch

- [x] Implementar ChangeBranchUseCase
- [x] INSERT nuevo order_branches
- [x] Marcar anteriores is_current = false
- [ ] Tests unitarios

## Tareas de Patrón Inmutable - Items

- [x] Implementar ModifyItemsUseCase
- [x] INSERT todos los items de nueva versión
- [x] Mantener items anteriores (historial)
- [x] No UPDATE ni DELETE
- [ ] Tests unitarios

## Tareas de Patrón Inmutable - Totals

- [x] Implementar RecalculateTotalsUseCase
- [x] INSERT nuevo order_summary_totals
- [x] Marcar anterior is_current = false
- [ ] Tests unitarios

## Tareas de Status Transitions

- [x] Implementar OrderStateMachine
- [x] Validar transiciones
- [x] Crear OrderStatusHistory entries
- [x] Implementar UpdateOrderStatusUseCase
- [ ] Tests unitarios

## Tareas de Order Tracking Público

- [x] Crear endpoint público /api/public/orders/:trackingNumber
- [x] Implementar i18n en mensajes
- [ ] Tests unitarios

## Tareas de Delivery Features

- [x] Implementar delivery proofs
- [x] Implementar rating system
- [x] Tests unitarios

## Tareas de Testing

- [x] Tests unitarios CreateOnDemandOrder
- [ ] Tests unitarios CreateRetailOrder
- [x] Tests unitarios patrón inmutable (driver)
- [x] Tests unitarios patrón inmutable (branch)
- [x] Tests unitarios patrón inmutable (items)
- [ ] Tests unitarios patrón inmutable (totals)
- [x] Tests unitarios state transitions
- [x] Tests unitarios delivery rating
- [x] Tests unitarios delivery proof
- [ ] Tests unitarios tracking público
- [ ] Verificar coverage >80%


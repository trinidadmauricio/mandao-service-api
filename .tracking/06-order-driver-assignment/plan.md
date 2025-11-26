# Parte 6: Asignación de Órdenes y Drivers (CRÍTICO)

## Objetivo

Implementar sistema de asignación de órdenes a LOGISTICS_PROVIDER y drivers a órdenes, con validaciones críticas de ownership.

## Alcance

### Backend
- Implementar assignLogisticsProvider: Solo SAAS roles o sistema pueden asignar órdenes a LOGISTICS_PROVIDER
- Implementar assignDriver con validaciones críticas:
  - Orden debe estar asignada a LOGISTICS_PROVIDER antes de asignar driver
  - LOGISTICS_PROVIDER/SUPERVISOR solo pueden asignar drivers de su flota
  - LOGISTICS_PROVIDER/SUPERVISOR solo pueden asignar a órdenes de su proveedor
- Implementar markAsAutomatic para LOGISTICS_PROVIDER/SUPERVISOR
- Validar ownership en todas las operaciones

### Frontend
- Actualizar UI para mostrar opciones de asignación según rol
- Ocultar opciones de asignación para roles no autorizados

### Tests
- Unit tests para todas las validaciones de asignación
- Tests para verificar ownership y restricciones

## Archivos a Modificar

### Backend
- `src/domains/delivery/orders/presentation/controllers/OrderController.ts`
- `src/domains/delivery/orders/application/use-cases/AssignDriverUseCase.ts` (crear o actualizar)
- `src/domains/delivery/orders/application/use-cases/AssignLogisticsProviderUseCase.ts` (crear o actualizar)

## Reglas de Asignación

- **Asignar orden a LOGISTICS_PROVIDER**: Solo SAAS roles o sistema (proceso automático)
- **Asignar driver a orden**:
  - Orden debe estar previamente asignada a un LOGISTICS_PROVIDER
  - LOGISTICS_PROVIDER/SUPERVISOR solo pueden asignar drivers de su flota
  - LOGISTICS_PROVIDER/SUPERVISOR solo pueden asignar a órdenes de su proveedor
  - SAAS roles pueden asignar cualquier driver a cualquier orden
- **Marcar como automático**: LOGISTICS_PROVIDER/SUPERVISOR pueden marcar órdenes para asignación automática


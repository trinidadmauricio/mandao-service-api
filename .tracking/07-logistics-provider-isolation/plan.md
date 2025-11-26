# Parte 7: Aislamiento de LOGISTICS_PROVIDER (CRÍTICO)

## Objetivo

Implementar filtros y validaciones de ownership para LOGISTICS_PROVIDER y SUPERVISOR en todos los recursos relacionados, asegurando que solo puedan ver y gestionar recursos asociados a su `logistics_provider_id`.

## Contexto

- LOGISTICS_PROVIDER y SUPERVISOR actúan independientemente de tenant types
- Deben ver solo recursos asociados a su `logistics_provider_id`
- SAAS roles pueden ver todos los recursos sin restricciones
- Otros roles no deben tener acceso a recursos de LOGISTICS_PROVIDER

## Recursos a Aislar

### 1. Drivers
- **Relación**: `Driver.logistics_provider_id` (obligatorio)
- **Acciones**: getById, list, create, update, delete
- **Validación**: LOGISTICS_PROVIDER/SUPERVISOR solo pueden gestionar drivers de su proveedor

### 2. Vehicles
- **Relación**: `Vehicle.logistics_provider_id` (opcional)
- **Acciones**: getById, list, create, update, delete
- **Validación**: LOGISTICS_PROVIDER/SUPERVISOR solo pueden gestionar vehicles de su proveedor

### 3. Orders
- **Relación**: `OrderDriver.logistics_provider_id` (obligatorio)
- **Acciones**: getById, list
- **Validación**: LOGISTICS_PROVIDER/SUPERVISOR solo pueden ver órdenes asignadas a su proveedor
- **Nota**: Ya parcialmente implementado en Parte 6

### 4. Users
- **Relación**: `User.logistics_provider_id` (opcional, solo para SUPERVISOR)
- **Acciones**: list
- **Validación**: LOGISTICS_PROVIDER/SUPERVISOR solo pueden ver usuarios de su proveedor

### 5. Logistics Providers
- **Relación**: `LogisticsProvider.id`
- **Acciones**: getById, list
- **Validación**: LOGISTICS_PROVIDER/SUPERVISOR solo pueden ver su propio proveedor

### 6. Delivery Zones
- **Relación**: Verificar si tienen `logistics_provider_id`
- **Acciones**: getById, list, create, update, delete
- **Validación**: Si tienen relación, aplicar filtro

### 7. Delivery Rates
- **Relación**: Verificar si tienen `logistics_provider_id`
- **Acciones**: getById, list, create, update, delete
- **Validación**: Si tienen relación, aplicar filtro

## Estrategia de Implementación

### Backend

1. **Repositorios**: Agregar filtro `logistics_provider_id` en métodos `findAll` y `findById`
2. **Use Cases**: Validar ownership antes de operaciones de escritura (create, update, delete)
3. **Controllers**: Pasar `logistics_provider_id` del usuario autenticado a los use cases
4. **Middleware**: Asegurar que `req.user.logistics_provider_id` esté disponible

### Validaciones por Recurso

#### Drivers
- `list`: Filtrar por `logistics_provider_id` si el usuario es LOGISTICS_PROVIDER/SUPERVISOR
- `getById`: Validar que el driver pertenece al proveedor del usuario
- `create`: Asignar automáticamente `logistics_provider_id` del usuario
- `update`: Validar ownership antes de actualizar
- `delete`: Validar ownership antes de eliminar

#### Vehicles
- `list`: Filtrar por `logistics_provider_id` si el usuario es LOGISTICS_PROVIDER/SUPERVISOR
- `getById`: Validar que el vehicle pertenece al proveedor del usuario
- `create`: Asignar automáticamente `logistics_provider_id` del usuario
- `update`: Validar ownership antes de actualizar
- `delete`: Validar ownership antes de eliminar

#### Orders
- `list`: Filtrar por `logistics_provider_id` a través de `OrderDriver` (ya parcialmente implementado)
- `getById`: Validar que la orden está asignada al proveedor del usuario

#### Users
- `list`: Filtrar por `logistics_provider_id` si el usuario es LOGISTICS_PROVIDER/SUPERVISOR

#### Logistics Providers
- `list`: Si el usuario es LOGISTICS_PROVIDER/SUPERVISOR, solo retornar su propio proveedor
- `getById`: Validar que el proveedor es el del usuario

## Tests

- Unit tests para cada validación de ownership
- Tests de integración para verificar filtros en listados
- Tests para verificar que SAAS roles no tienen restricciones
- Cobertura mínima: 80%

## Archivos a Modificar

### Backend

- `src/domains/delivery/drivers/application/use-cases/*`
- `src/domains/delivery/drivers/presentation/controllers/DriverController.ts`
- `src/domains/delivery/drivers/infrastructure/repositories/PrismaDriverRepository.ts`
- `src/domains/delivery/vehicles/application/use-cases/*`
- `src/domains/delivery/vehicles/presentation/controllers/VehicleController.ts`
- `src/domains/delivery/vehicles/infrastructure/repositories/PrismaVehicleRepository.ts`
- `src/domains/delivery/orders/presentation/controllers/OrderController.ts`
- `src/domains/shared/users/presentation/controllers/UserController.ts`
- `src/domains/delivery/logistics-providers/presentation/controllers/LogisticsProviderController.ts`
- `src/domains/delivery/delivery-zones/*` (si aplica)
- `src/domains/delivery/delivery-rates/*` (si aplica)

## Criterios de Éxito

- ✅ LOGISTICS_PROVIDER solo ve recursos de su proveedor
- ✅ SUPERVISOR solo ve recursos de su proveedor
- ✅ SAAS roles ven todos los recursos sin restricciones
- ✅ Validaciones de ownership en todas las operaciones de escritura
- ✅ Filtros automáticos en todas las operaciones de lectura
- ✅ Unit tests con cobertura mínima 80%
- ✅ No se rompe funcionalidad existente


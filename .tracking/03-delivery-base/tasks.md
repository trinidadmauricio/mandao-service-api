# Tareas - Delivery Base

## Tareas de Order Counters

- [x] Crear tabla order_counters (shared schema)
- [x] Implementar OrderNumberService
- [x] Implementar concurrencia segura (row locks)
- [ ] Implementar reset de contador
- [x] Tests unitarios de concurrencia (100 requests)
- [ ] Tests unitarios de reset

## Tareas de Logistics Providers

- [x] CRUD Logistics Providers
- [ ] Asociar providers con drivers
- [ ] Gestión de flota
- [x] Tests unitarios (CreateUseCase)

## Tareas de Drivers

- [x] CRUD Drivers
- [ ] Asignación de vehículos
- [ ] Gestión de disponibilidad
- [x] Asociación con providers
- [x] Tests unitarios (CreateUseCase)

## Tareas de Vehicles

- [x] CRUD Vehicles
- [x] Tipos de vehículos
- [x] Asociación con drivers
- [x] Tests unitarios (CreateUseCase)

## Tareas de Delivery Zones

- [x] CRUD Delivery Zones
- [x] Integración PostGIS (boundary como WKT)
- [ ] Validación geográfica (pendiente PostGIS queries)
- [x] Tests unitarios (CreateUseCase)

## Tareas de Delivery Rates

- [x] CRUD Delivery Rates
- [x] Rates por zona
- [x] Currency support
- [x] Calculadora de costos
- [x] Tests unitarios (CreateUseCase)

## Tareas de Testing

- [x] Tests unitarios OrderNumberService (concurrencia)
- [x] Tests unitarios CRUD Providers
- [x] Tests unitarios CRUD Drivers
- [x] Tests unitarios CRUD Vehicles
- [x] Tests unitarios CRUD Delivery Zones
- [x] Tests unitarios CRUD Delivery Rates
- [x] Tests unitarios Calculadora de Costos
- [ ] Verificar coverage >80%

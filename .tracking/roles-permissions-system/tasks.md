# Tareas - Sistema de Roles y Permisos - Backend API

## Fase 1: Base de Datos

- [ ] **db-1:** Agregar LOGISTICS_PROVIDER al enum UserRole en prisma/schema.prisma
- [ ] **db-2:** Agregar relación User->LogisticsProvider en prisma/schema.prisma (logistics_provider_id en User)
- [ ] **db-3:** Crear y ejecutar migración Prisma para los cambios de schema

## Fase 2: Constantes y Definiciones

- [ ] **backend-1:** Actualizar enum UserRole en src/shared/constants/roles.ts (agregar LOGISTICS_PROVIDER)
- [ ] **backend-2:** Crear src/shared/constants/permissions.ts con matriz completa de permisos por rol

## Fase 3: Middlewares

- [ ] **backend-3:** Crear middleware require-permission.middleware.ts genérico y reutilizable
- [ ] **backend-4:** Crear middleware require-tenant-type.middleware.ts para validar tenant type
- [ ] **backend-5:** Crear utils/logistics-provider-validations.ts para validaciones específicas

## Fase 4: Aplicar a Rutas

- [ ] **backend-6:** Aplicar permisos a rutas de orders, products, drivers, vehicles, branches
- [ ] **backend-7:** Aplicar permisos a rutas de delivery-zones, delivery-rates, logistics-providers, users
- [ ] **backend-8:** Aplicar permisos a rutas de reports, payments, order-counters, categories, brands

## Fase 5: Use Cases

- [ ] **backend-9:** Actualizar use cases para validar tenant type y logistics provider
  - [ ] CreateOnDemandOrderUseCase - validar tenant type
  - [ ] CreateRetailOrderUseCase - validar tenant type
  - [ ] ListOrdersUseCase - filtrar por logistics_provider_id si es LOGISTICS_PROVIDER
  - [ ] ListDriversUseCase - filtrar por logistics_provider_id
  - [ ] ListVehiclesUseCase - filtrar por logistics_provider_id

## Criterios de Aceptación

- [ ] Enum UserRole actualizado con LOGISTICS_PROVIDER
- [ ] Relación User->LogisticsProvider creada
- [ ] Migración Prisma ejecutada exitosamente
- [ ] Roles y permisos definidos en código (type-safe)
- [ ] Middlewares de permisos funcionando
- [ ] Middleware de tenant type funcionando
- [ ] Validaciones de logistics provider funcionando
- [ ] Todas las rutas protegidas con permisos
- [ ] Validaciones de tenant type aplicadas donde corresponde
- [ ] Usuarios LOGISTICS_PROVIDER solo ven sus recursos


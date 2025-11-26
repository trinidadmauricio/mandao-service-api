# Tareas: Parte 7 - Aislamiento de LOGISTICS_PROVIDER

## Backend - Drivers

- [x] Actualizar `PrismaDriverRepository.findAll`:
  - Agregar filtro `logistics_provider_id` opcional
- [x] Actualizar `ListDriversUseCase`:
  - Pasar `logistics_provider_id` del usuario autenticado al repositorio
- [x] Actualizar `GetDriverUseCase`:
  - Validar ownership antes de retornar
- [x] Actualizar `CreateDriverUseCase`:
  - Asignar automáticamente `logistics_provider_id` del usuario
- [x] Actualizar `UpdateDriverUseCase`:
  - Validar ownership antes de actualizar
- [x] Actualizar `DeleteDriverUseCase`:
  - Validar ownership antes de eliminar
- [x] Actualizar `DriverController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [x] Escribir unit tests para todas las validaciones

## Backend - Vehicles

- [x] Actualizar `PrismaVehicleRepository.findAll`:
  - Agregar filtro `logistics_provider_id` opcional
- [x] Actualizar `ListVehiclesUseCase`:
  - Pasar `logistics_provider_id` del usuario autenticado al repositorio
- [x] Actualizar `GetVehicleUseCase`:
  - Validar ownership antes de retornar
- [x] Actualizar `CreateVehicleUseCase`:
  - Asignar automáticamente `logistics_provider_id` del usuario
- [x] Actualizar `UpdateVehicleUseCase`:
  - Validar ownership antes de actualizar
- [x] Actualizar `DeleteVehicleUseCase`:
  - Validar ownership antes de eliminar
- [x] Actualizar `VehicleController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [x] Escribir unit tests para todas las validaciones

## Backend - Orders

- [x] Actualizar `ListOrdersUseCase`:
  - Verificar que el filtro por `logistics_provider_id` funciona correctamente
- [x] Actualizar `GetOrderUseCase`:
  - Validar ownership para LOGISTICS_PROVIDER/SUPERVISOR
- [x] Actualizar `OrderController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [x] Escribir unit tests para validaciones de ownership

## Backend - Users

- [x] Actualizar `PrismaUserRepository.findAllWithFilters`:
  - Agregar filtro `logistics_provider_id` opcional
- [x] Actualizar `ListUsersUseCase`:
  - Pasar `logistics_provider_id` del usuario autenticado al repositorio
- [x] Actualizar `UserController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [x] Escribir unit tests para filtros (implícito en tests de otros módulos)

## Backend - Logistics Providers

- [x] Actualizar `ListLogisticsProvidersUseCase`:
  - Si el usuario es LOGISTICS_PROVIDER/SUPERVISOR, solo retornar su proveedor
- [x] Actualizar `GetLogisticsProviderUseCase`:
  - Validar ownership para LOGISTICS_PROVIDER/SUPERVISOR
- [x] Actualizar `LogisticsProviderController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [x] Escribir unit tests para validaciones

## Backend - Delivery Zones (si aplica)

- [x] Verificar si tienen `logistics_provider_id` en el schema
  - **Resultado**: NO tienen `logistics_provider_id` en el schema actual
  - **Nota**: DeliveryZone solo tiene `tenant_id`. Si en el futuro se necesita asociar zonas a LOGISTICS_PROVIDER, se requerirá modificar el schema.
  - **Acción**: Por ahora, LOGISTICS_PROVIDER puede acceder a zonas a través de permisos, pero no hay aislamiento por `logistics_provider_id`

## Backend - Delivery Rates (si aplica)

- [x] Verificar si tienen `logistics_provider_id` en el schema
  - **Resultado**: NO tienen `logistics_provider_id` en el schema actual
  - **Nota**: DeliveryRate solo tiene `tenant_id`. Si en el futuro se necesita asociar tarifas a LOGISTICS_PROVIDER, se requerirá modificar el schema.
  - **Acción**: Por ahora, LOGISTICS_PROVIDER puede acceder a tarifas a través de permisos, pero no hay aislamiento por `logistics_provider_id`

## Verificación

- [ ] Probar que LOGISTICS_PROVIDER solo ve sus drivers
- [ ] Probar que LOGISTICS_PROVIDER solo ve sus vehicles
- [ ] Probar que LOGISTICS_PROVIDER solo ve órdenes asignadas a su proveedor
- [ ] Probar que SAAS_ADMIN ve todos los recursos
- [ ] Probar que OWNER no puede acceder a recursos de LOGISTICS_PROVIDER
- [ ] Verificar que no se rompe funcionalidad existente


# Tareas: Parte 7 - Aislamiento de LOGISTICS_PROVIDER

## Backend - Drivers

- [ ] Actualizar `PrismaDriverRepository.findAll`:
  - Agregar filtro `logistics_provider_id` opcional
- [ ] Actualizar `ListDriversUseCase`:
  - Pasar `logistics_provider_id` del usuario autenticado al repositorio
- [ ] Actualizar `GetDriverUseCase`:
  - Validar ownership antes de retornar
- [ ] Actualizar `CreateDriverUseCase`:
  - Asignar automáticamente `logistics_provider_id` del usuario
- [ ] Actualizar `UpdateDriverUseCase`:
  - Validar ownership antes de actualizar
- [ ] Actualizar `DeleteDriverUseCase`:
  - Validar ownership antes de eliminar
- [ ] Actualizar `DriverController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [ ] Escribir unit tests para todas las validaciones

## Backend - Vehicles

- [ ] Actualizar `PrismaVehicleRepository.findAll`:
  - Agregar filtro `logistics_provider_id` opcional
- [ ] Actualizar `ListVehiclesUseCase`:
  - Pasar `logistics_provider_id` del usuario autenticado al repositorio
- [ ] Actualizar `GetVehicleUseCase`:
  - Validar ownership antes de retornar
- [ ] Actualizar `CreateVehicleUseCase`:
  - Asignar automáticamente `logistics_provider_id` del usuario
- [ ] Actualizar `UpdateVehicleUseCase`:
  - Validar ownership antes de actualizar
- [ ] Actualizar `DeleteVehicleUseCase`:
  - Validar ownership antes de eliminar
- [ ] Actualizar `VehicleController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [ ] Escribir unit tests para todas las validaciones

## Backend - Orders

- [ ] Actualizar `ListOrdersUseCase`:
  - Verificar que el filtro por `logistics_provider_id` funciona correctamente
- [ ] Actualizar `GetOrderUseCase`:
  - Validar ownership para LOGISTICS_PROVIDER/SUPERVISOR
- [ ] Actualizar `OrderController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [ ] Escribir unit tests para validaciones de ownership

## Backend - Users

- [ ] Actualizar `PrismaUserRepository.findAllWithFilters`:
  - Agregar filtro `logistics_provider_id` opcional
- [ ] Actualizar `ListUsersUseCase`:
  - Pasar `logistics_provider_id` del usuario autenticado al repositorio
- [ ] Actualizar `UserController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [ ] Escribir unit tests para filtros

## Backend - Logistics Providers

- [ ] Actualizar `ListLogisticsProvidersUseCase`:
  - Si el usuario es LOGISTICS_PROVIDER/SUPERVISOR, solo retornar su proveedor
- [ ] Actualizar `GetLogisticsProviderUseCase`:
  - Validar ownership para LOGISTICS_PROVIDER/SUPERVISOR
- [ ] Actualizar `LogisticsProviderController`:
  - Pasar `logistics_provider_id` del usuario a los use cases
- [ ] Escribir unit tests para validaciones

## Backend - Delivery Zones (si aplica)

- [ ] Verificar si tienen `logistics_provider_id` en el schema
- [ ] Si tienen relación, aplicar mismo patrón que Drivers/Vehicles
- [ ] Escribir unit tests

## Backend - Delivery Rates (si aplica)

- [ ] Verificar si tienen `logistics_provider_id` en el schema
- [ ] Si tienen relación, aplicar mismo patrón que Drivers/Vehicles
- [ ] Escribir unit tests

## Verificación

- [ ] Probar que LOGISTICS_PROVIDER solo ve sus drivers
- [ ] Probar que LOGISTICS_PROVIDER solo ve sus vehicles
- [ ] Probar que LOGISTICS_PROVIDER solo ve órdenes asignadas a su proveedor
- [ ] Probar que SAAS_ADMIN ve todos los recursos
- [ ] Probar que OWNER no puede acceder a recursos de LOGISTICS_PROVIDER
- [ ] Verificar que no se rompe funcionalidad existente


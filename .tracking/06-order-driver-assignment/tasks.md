# Tareas: Parte 6 - Asignación de Órdenes y Drivers

## Backend

- [x] Crear o actualizar `AssignLogisticsProviderUseCase.ts`:
  - Validar que solo SAAS roles o sistema pueden asignar
  - Asignar orden a LOGISTICS_PROVIDER
- [x] Crear o actualizar `AssignDriverUseCase.ts`:
  - Validar que orden esté asignada a LOGISTICS_PROVIDER
  - Validar que LOGISTICS_PROVIDER/SUPERVISOR solo asignen drivers de su flota
  - Validar que LOGISTICS_PROVIDER/SUPERVISOR solo asignen a órdenes de su proveedor
  - Permitir SAAS roles asignar cualquier driver
- [x] Crear o actualizar `MarkAsAutomaticUseCase.ts`:
  - Permitir LOGISTICS_PROVIDER/SUPERVISOR marcar órdenes como automáticas
- [x] Actualizar `OrderController.ts`:
  - Agregar endpoints para asignar LOGISTICS_PROVIDER
  - Agregar endpoints para asignar driver
  - Agregar endpoints para marcar como automático
  - Validar permisos en cada endpoint
- [x] Actualizar `requireTenantMiddleware.ts`:
  - Permitir LOGISTICS_PROVIDER/SUPERVISOR sin tenant
- [ ] Escribir unit tests para todas las validaciones

## Frontend

- [ ] Actualizar UI de órdenes para mostrar opciones de asignación según rol
- [ ] Ocultar opciones de asignación para roles no autorizados

## Tests

- [ ] Backend: Test que valida solo SAAS puede asignar LOGISTICS_PROVIDER
- [ ] Backend: Test que valida orden debe estar asignada antes de asignar driver
- [ ] Backend: Test que valida LOGISTICS_PROVIDER solo puede asignar drivers de su flota
- [ ] Backend: Test que valida LOGISTICS_PROVIDER solo puede asignar a órdenes de su proveedor

## Verificación

- [ ] Probar asignar LOGISTICS_PROVIDER como SAAS (debe funcionar)
- [ ] Probar asignar LOGISTICS_PROVIDER como OWNER (debe fallar con error 403)
- [ ] Probar asignar driver a orden sin LOGISTICS_PROVIDER (debe fallar)
- [ ] Probar asignar driver de otra flota como LOGISTICS_PROVIDER (debe fallar)


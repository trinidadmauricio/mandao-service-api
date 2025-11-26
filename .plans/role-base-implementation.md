# Plan de Seguridad y Visibilidad: Sistema Completo con Tracking

## Contexto y Principios Fundamentales

### Separación Crítica: LOGISTICS_PROVIDER es Independiente

**IMPORTANTE**: LOGISTICS_PROVIDER actúa completamente independiente de ON_DEMAND/RETAIL. No hay relación entre tenant types y LOGISTICS_PROVIDER. El sistema debe garantizar:

- LOGISTICS_PROVIDER y SUPERVISOR NO están atados a ningún tenant (tenant_id puede ser NULL)
- LOGISTICS_PROVIDER gestiona recursos por `logistics_provider_id`, NO por `tenant_id`
- Los módulos de LOGISTICS_PROVIDER (drivers, vehicles, zonas, tarifas) son independientes de tenant types
- Las órdenes se asignan a LOGISTICS_PROVIDER por `logistics_provider_id`, no por tenant

### Roles del Sistema

- **SAAS_ADMIN**: Acceso total cross-tenant. Único que puede crear SAAS_EDITOR.
- **SAAS_EDITOR**: Acceso total cross-tenant. NO puede crear SAAS_ADMIN ni SAAS_EDITOR.
- **OWNER**: Acceso total dentro de su tenant (con restricciones por tenant type). **Solo puede crear usuarios con rol MERCHANT_USER**.
- **SUPERVISOR**: **ROL CRÍTICO** - Solo puede ser creado por LOGISTICS_PROVIDER. Actúa independiente, NO está atado a tenant. Solo gestiona recursos de su `logistics_provider_id`. Puede asignar drivers a órdenes de su proveedor.
- **MERCHANT_USER**: Administra TODO su catálogo sin restricciones (si RETAIL) o solo órdenes (si ON_DEMAND). Tiene acceso completo a productos, categorías, marcas, sucursales, UOMs.
- **LOGISTICS_PROVIDER**: Gestiona su flota y ve órdenes asignadas. Puede crear usuarios con rol SUPERVISOR. Puede asignar drivers a órdenes de su proveedor. **NO está atado a tenant**.
- **DRIVER**: NO tiene acceso al backoffice - solo link de rastreo público.
- **CUSTOMER**: Solo para storefront - se crea mediante signup en el storefront. **NINGÚN rol del backoffice puede crear usuarios CUSTOMER**.

### Tenant Types (Activos)

- **RETAIL**: Catálogo completo + órdenes
- **ON_DEMAND**: Solo órdenes (NO tiene catálogo)
- **HYBRID**: Deshabilitado - NO se puede crear desde formulario ni API

## Sistema de Tracking

El plan está dividido en **partes pequeñas** ubicadas en `.tracking/`, cada una con:

- Archivo `plan.md` con objetivos y alcance
- Archivo `tasks.md` con lista de tareas detalladas
- Branch de Git como `feature/[parte-nombre]`
- Unit tests obligatorios (cobertura mínima 80%)
- Agentes especializados reutilizables

### Estructura de Tracking

```
.tracking/
├── 01-disable-hybrid-tenant/
│   ├── plan.md
│   └── tasks.md
├── 02-create-uoms-module/
│   ├── plan.md
│   └── tasks.md
├── 03-add-driver-role/
│   ├── plan.md
│   └── tasks.md
├── 04-supervisor-creation-validation/
│   ├── plan.md
│   └── tasks.md
├── 05-user-creation-restrictions/
│   ├── plan.md
│   └── tasks.md
├── 06-order-driver-assignment/
│   ├── plan.md
│   └── tasks.md
├── 07-logistics-provider-isolation/
│   ├── plan.md
│   └── tasks.md
├── 08-tenant-type-visibility/
│   ├── plan.md
│   └── tasks.md
├── 09-saas-modules-restrictions/
│   ├── plan.md
│   └── tasks.md
└── 10-permissions-update/
    ├── plan.md
    └── tasks.md
```

## Agentes Especializados Reutilizables

Se crearán agentes especializados basados en los existentes, ubicados en `.cursor/` de cada servicio:

### Backend API (`mandao-service-api/.cursor/`)

1. **security-validation-agent.md**: Especialista en validaciones de seguridad, ownership, permisos
2. **logistics-provider-agent.md**: Especialista en lógica de LOGISTICS_PROVIDER y SUPERVISOR
3. **tenant-type-agent.md**: Especialista en validaciones por tenant type
4. **user-creation-agent.md**: Especialista en restricciones de creación de usuarios

### Frontend Backoffice (`mandao-service-backoffice/.cursor/`)

1. **visibility-control-agent.md**: Especialista en ocultar/mostrar módulos según rol y tenant type
2. **form-validation-agent.md**: Especialista en validaciones de formularios y restricciones de roles
3. **permission-guard-agent.md**: Especialista en guards de permisos y acceso a páginas

## Partes del Plan

### Parte 1: Deshabilitar HYBRID en Creación de Tenants

**Branch**: `feature/disable-hybrid-tenant`

**Objetivo**: Eliminar la opción HYBRID del formulario de creación de tenants y del API.

**Tareas**:

- Backend: Actualizar DTOs y validaciones para excluir HYBRID
- Frontend: Quitar opción HYBRID del select
- Tests: Unit tests para validaciones de tenant type
- Verificar que tenant middleware no bloquee cambios

**Archivos**:

- `mandao-service-api/src/domains/shared/tenants/application/dto/CreateTenantDto.ts`
- `mandao-service-api/src/domains/shared/tenants/domain/repositories/ITenantRepository.ts`
- `mandao-service-api/src/domains/shared/tenants/presentation/controllers/TenantController.ts`
- Formulario de creación de tenants en frontend

### Parte 2: Crear Módulo de UOMs (Unidades de Medida)

**Branch**: `feature/create-uoms-module`

**Objetivo**: Crear módulo completo de UOMs en backend y frontend (solo visible para RETAIL).

**Tareas**:

- Backend: Crear estructura completa del módulo (domain, application, infrastructure, presentation)
- Frontend: Crear página y componentes para gestionar UOMs
- Tests: Unit tests para todos los use cases
- Agregar al sidebar solo para tenants RETAIL

**Archivos**:

- `mandao-service-api/src/domains/retail/units-of-measure/` (módulo completo)
- `mandao-service-backoffice/src/app/(dashboard)/units-of-measure/`
- `mandao-service-backoffice/src/components/units-of-measure/`

### Parte 3: Agregar Rol DRIVER al Sistema

**Branch**: `feature/add-driver-role`

**Objetivo**: Agregar rol DRIVER al enum UserRole en Prisma y constants.

**Tareas**:

- Actualizar Prisma schema: Agregar DRIVER al enum UserRole
- Crear migración de Prisma
- Actualizar constants en backend y frontend
- Tests: Validar que DRIVER no tiene permisos en backoffice
- Verificar que tenant middleware no bloquee (DRIVER no tiene tenant)

**Archivos**:

- `mandao-service-api/prisma/schema.prisma`
- `mandao-service-api/src/shared/constants/permissions.ts`
- `mandao-service-backoffice/src/lib/constants/roles.ts`

### Parte 4: Validar SUPERVISOR - Solo creado por LOGISTICS_PROVIDER (CRÍTICO)

**Branch**: `feature/supervisor-creation-validation`

**Objetivo**: Implementar validaciones críticas para que SOLO LOGISTICS_PROVIDER pueda crear SUPERVISOR.

**Tareas**:

- Backend: Validar en CreateUserUseCase que solo LOGISTICS_PROVIDER puede crear SUPERVISOR
- Backend: Validar que SUPERVISOR tenga logistics_provider_id obligatorio
- Backend: Asignar automáticamente logistics_provider_id del creador
- Frontend: Ocultar SUPERVISOR del select si no es LOGISTICS_PROVIDER
- Frontend: Asignar automáticamente logistics_provider_id al crear SUPERVISOR
- Tests: Unit tests para todas las validaciones
- Verificar que tenant middleware no bloquee (SUPERVISOR no tiene tenant)

**Archivos**:

- `mandao-service-api/src/domains/shared/users/application/use-cases/CreateUserUseCase.ts`
- `mandao-service-api/src/domains/shared/users/application/dto/CreateUserDto.ts`
- `mandao-service-backoffice/src/components/users/user-form.tsx`

### Parte 5: Restricciones de Creación de Usuarios (CRÍTICO)

**Branch**: `feature/user-creation-restrictions`

**Objetivo**: Implementar todas las restricciones de creación de usuarios por rol.

**Tareas**:

- Backend: Validar SAAS_ADMIN (puede crear todos excepto CUSTOMER)
- Backend: Validar SAAS_EDITOR (puede crear todos excepto SAAS roles y CUSTOMER)
- Backend: Validar OWNER (solo puede crear MERCHANT_USER)
- Backend: Validar LOGISTICS_PROVIDER (solo puede crear SUPERVISOR)
- Backend: Validar que ningún rol puede crear CUSTOMER
- Frontend: Ocultar CUSTOMER del select para todos
- Frontend: Mostrar solo opciones permitidas según rol
- Tests: Unit tests para todas las validaciones

**Archivos**:

- `mandao-service-api/src/domains/shared/users/presentation/controllers/UserController.ts`
- `mandao-service-api/src/domains/shared/users/application/use-cases/CreateUserUseCase.ts`
- `mandao-service-backoffice/src/components/users/user-form.tsx`

### Parte 6: Asignación de Órdenes y Drivers (CRÍTICO)

**Branch**: `feature/order-driver-assignment`

**Objetivo**: Implementar sistema de asignación de órdenes a LOGISTICS_PROVIDER y drivers a órdenes.

**Tareas**:

- Backend: Implementar assignLogisticsProvider (solo SAAS o sistema)
- Backend: Implementar assignDriver con validaciones críticas:
                                - Orden debe estar asignada a LOGISTICS_PROVIDER antes de asignar driver
                                - LOGISTICS_PROVIDER/SUPERVISOR solo pueden asignar drivers de su flota
                                - LOGISTICS_PROVIDER/SUPERVISOR solo pueden asignar a órdenes de su proveedor
- Backend: Implementar markAsAutomatic para LOGISTICS_PROVIDER/SUPERVISOR
- Tests: Unit tests para todas las validaciones
- Verificar que tenant middleware no bloquee (LOGISTICS_PROVIDER no tiene tenant)

**Archivos**:

- `mandao-service-api/src/domains/delivery/orders/presentation/controllers/OrderController.ts`
- `mandao-service-api/src/domains/delivery/orders/application/use-cases/AssignDriverUseCase.ts`
- `mandao-service-api/src/domains/delivery/orders/application/use-cases/AssignLogisticsProviderUseCase.ts`

### Parte 7: Aislamiento de LOGISTICS_PROVIDER (CRÍTICO)

**Branch**: `feature/logistics-provider-isolation`

**Objetivo**: Implementar filtros y validaciones de ownership para LOGISTICS_PROVIDER y SUPERVISOR en todos los recursos.

**Tareas**:

- Drivers: Validar ownership en getById, create, update, delete
- Vehicles: Validar ownership en getById, create, update, delete
- Orders: Validar ownership en getById (solo órdenes asignadas a su proveedor)
- Users: Filtrar por logistics_provider_id en list
- Logistics Providers: Filtrar para que solo vean el suyo
- Delivery Zones: Permitir acceso y validar ownership
- Delivery Rates: Permitir acceso y validar ownership
- Tests: Unit tests para todas las validaciones
- Verificar que tenant middleware NO se aplique a LOGISTICS_PROVIDER/SUPERVISOR

**Archivos**:

- `mandao-service-api/src/domains/delivery/drivers/presentation/controllers/DriverController.ts`
- `mandao-service-api/src/domains/delivery/vehicles/presentation/controllers/VehicleController.ts`
- `mandao-service-api/src/domains/delivery/orders/presentation/controllers/OrderController.ts`
- `mandao-service-api/src/domains/shared/users/presentation/controllers/UserController.ts`
- `mandao-service-api/src/domains/delivery/logistics-providers/presentation/controllers/LogisticsProviderController.ts`
- `mandao-service-api/src/domains/delivery/delivery-zones/presentation/controllers/DeliveryZoneController.ts`
- `mandao-service-api/src/domains/delivery/delivery-rates/presentation/controllers/DeliveryRateController.ts`

### Parte 8: Visibilidad por Tenant Type

**Branch**: `feature/tenant-type-visibility`

**Objetivo**: Ocultar/mostrar módulos según tenant type (RETAIL vs ON_DEMAND).

**Tareas**:

- Backend: Middleware para validar tenant type en rutas de productos, categorías, etc.
- Backend: Validar que MERCHANT_USER en ON_DEMAND no acceda a módulos de catálogo
- Frontend: Ocultar módulos de catálogo para ON_DEMAND
- Frontend: Mostrar módulos de catálogo solo para RETAIL
- Frontend: Actualizar sidebar según tenant type y rol
- Tests: Unit tests para validaciones de tenant type
- Verificar que LOGISTICS_PROVIDER/SUPERVISOR no se vean afectados (no tienen tenant)

**Archivos**:

- `mandao-service-api/src/shared/middleware/require-tenant-type.middleware.ts` (ya existe, actualizar)
- Routes de productos, categorías, marcas, sucursales, UOMs
- `mandao-service-backoffice/src/components/layout/sidebar.tsx`
- `mandao-service-backoffice/src/components/auth/permission-guard.tsx`

### Parte 9: Restricciones de Módulos SAAS

**Branch**: `feature/saas-modules-restrictions`

**Objetivo**: Restringir módulos SAAS (contadores, pagos, suscripciones) solo a roles SAAS.

**Tareas**:

- Backend: Validar permisos en rutas de Order Counters, Payments, Subscriptions
- Backend: Excepción: LOGISTICS_PROVIDER/SUPERVISOR pueden ver su propio proveedor
- Frontend: Ocultar módulos SAAS en sidebar para roles no-SAAS
- Tests: Unit tests para validaciones de permisos
- Verificar que tenant middleware no bloquee (SAAS roles son cross-tenant)

**Archivos**:

- Routes de Order Counters, Payments, Subscriptions
- `mandao-service-backoffice/src/components/layout/sidebar.tsx`

### Parte 10: Actualizar Permisos en Constants

**Branch**: `feature/permissions-update`

**Objetivo**: Actualizar matriz de permisos para reflejar todas las reglas nuevas.

**Tareas**:

- Backend: Actualizar ROLE_PERMISSIONS con permisos correctos
- Backend: Agregar permisos para UOMs
- Backend: Actualizar permisos de MERCHANT_USER (acceso completo en RETAIL)
- Backend: Agregar permisos de asignación de drivers para LOGISTICS_PROVIDER/SUPERVISOR
- Frontend: Actualizar constants para coincidir con backend
- Tests: Unit tests para validación de permisos
- Verificar que tenant middleware respete los permisos

**Archivos**:

- `mandao-service-api/src/shared/constants/permissions.ts`
- `mandao-service-backoffice/src/lib/constants/roles.ts`

## Consideraciones Críticas

### 1. LOGISTICS_PROVIDER es Independiente de Tenant

- LOGISTICS_PROVIDER y SUPERVISOR NO tienen tenant_id (puede ser NULL)
- Todos los filtros deben usar `logistics_provider_id`, NO `tenant_id`
- El middleware de tenant NO debe aplicarse a LOGISTICS_PROVIDER/SUPERVISOR
- Las validaciones de tenant type NO aplican a LOGISTICS_PROVIDER/SUPERVISOR

### 2. Sistema de Login y Acceso

- Login debe validar que LOGISTICS_PROVIDER/SUPERVISOR tengan `logistics_provider_id`
- Login debe validar que otros roles tengan `tenant_id`
- Redirección después de login según rol y tenant type
- Guards de acceso a páginas según rol y permisos

### 3. Filtros en Backend

- LOGISTICS_PROVIDER/SUPERVISOR: Filtrar por `logistics_provider_id`
- Otros roles: Filtrar por `tenant_id`
- SAAS roles: Sin filtros (cross-tenant)

### 4. Visualización de Secciones en Frontend

- Sidebar debe ocultar/mostrar según:
                                - Rol del usuario
                                - Tenant type (solo para roles con tenant)
                                - Permisos del rol
- LOGISTICS_PROVIDER/SUPERVISOR: Solo ver módulos de logística
- MERCHANT_USER en RETAIL: Ver todo el catálogo
- MERCHANT_USER en ON_DEMAND: Solo ver órdenes

### 5. Acciones en Backend

- Validar ownership antes de cualquier acción (create, update, delete)
- Validar permisos antes de permitir acción
- Validar tenant type cuando aplique
- NO validar tenant para LOGISTICS_PROVIDER/SUPERVISOR

### 6. Acceso a Información

- LOGISTICS_PROVIDER/SUPERVISOR: Solo información de su `logistics_provider_id`
- Otros roles: Solo información de su `tenant_id`
- SAAS roles: Toda la información (cross-tenant)

## Modificaciones al Schema de Prisma

### Cambios Necesarios

1. **Agregar DRIVER al enum UserRole**:
```prisma
enum UserRole {
  SAAS_ADMIN
  SAAS_EDITOR
  OWNER
  SUPERVISOR
  MERCHANT_USER
  LOGISTICS_PROVIDER
  DRIVER
  CUSTOMER
  @@schema("shared")
}
```

2. **Verificar que User.logistics_provider_id permita NULL** (ya existe, verificar)

3. **Verificar que User.tenant_id permita NULL** (ya existe, verificar)

4. **Crear migración de Prisma** para agregar DRIVER

## Unit Tests Obligatorios

Cada parte debe incluir unit tests con cobertura mínima del 80%. Estructura:

```
src/domains/[domain]/[module]/__tests__/unit/
├── [UseCase].spec.ts
├── [Entity].spec.ts
└── [Service].spec.ts
```

### Ejemplos de Tests Necesarios

1. **CreateUserUseCase.spec.ts**: Validar restricciones de creación por rol
2. **AssignDriverUseCase.spec.ts**: Validar asignación de drivers
3. **DriverController.spec.ts**: Validar ownership para LOGISTICS_PROVIDER
4. **PermissionGuard.spec.ts**: Validar guards de permisos
5. **TenantTypeMiddleware.spec.ts**: Validar validaciones de tenant type

## Verificación de Tenant Middleware

**CRÍTICO**: Verificar que el middleware de tenant NO bloquee las modificaciones:

- LOGISTICS_PROVIDER/SUPERVISOR pueden tener `tenant_id = NULL`
- El middleware debe permitir requests sin tenant para estos roles
- El middleware debe validar `logistics_provider_id` para LOGISTICS_PROVIDER/SUPERVISOR
- El middleware debe validar `tenant_id` para otros roles

## Orden de Implementación

1. Parte 1: Deshabilitar HYBRID (base)
2. Parte 3: Agregar rol DRIVER (base)
3. Parte 4: Validar SUPERVISOR (crítico)
4. Parte 5: Restricciones de creación (crítico)
5. Parte 6: Asignación de órdenes y drivers (crítico)
6. Parte 7: Aislamiento de LOGISTICS_PROVIDER (crítico)
7. Parte 2: Crear módulo UOMs (depende de Parte 8)
8. Parte 8: Visibilidad por tenant type
9. Parte 9: Restricciones de módulos SAAS
10. Parte 10: Actualizar permisos (final)

## Archivos a Modificar

### Backend API

- `mandao-service-api/prisma/schema.prisma` (agregar DRIVER)
- `mandao-service-api/src/shared/constants/permissions.ts`
- `mandao-service-api/src/domains/shared/tenants/application/dto/CreateTenantDto.ts`
- `mandao-service-api/src/domains/shared/users/application/use-cases/CreateUserUseCase.ts`
- `mandao-service-api/src/domains/shared/users/application/dto/CreateUserDto.ts`
- `mandao-service-api/src/domains/shared/users/presentation/controllers/UserController.ts`
- `mandao-service-api/src/domains/delivery/orders/presentation/controllers/OrderController.ts`
- `mandao-service-api/src/domains/delivery/drivers/presentation/controllers/DriverController.ts`
- `mandao-service-api/src/domains/delivery/vehicles/presentation/controllers/VehicleController.ts`
- `mandao-service-api/src/domains/delivery/logistics-providers/presentation/controllers/LogisticsProviderController.ts`
- `mandao-service-api/src/domains/delivery/delivery-zones/presentation/controllers/DeliveryZoneController.ts`
- `mandao-service-api/src/domains/delivery/delivery-rates/presentation/controllers/DeliveryRateController.ts`
- `mandao-service-api/src/shared/middleware/require-tenant-type.middleware.ts`
- `mandao-service-api/src/shared/middleware/auth.middleware.ts`
- Routes de todos los módulos

### Frontend Backoffice

- `mandao-service-backoffice/src/lib/constants/roles.ts`
- `mandao-service-backoffice/src/components/layout/sidebar.tsx`
- `mandao-service-backoffice/src/components/auth/permission-guard.tsx`
- `mandao-service-backoffice/src/components/users/user-form.tsx`
- `mandao-service-backoffice/src/components/drivers/driver-form.tsx`
- Formulario de creación de tenants
- `mandao-service-backoffice/src/app/(dashboard)/units-of-measure/` (crear)

## Proceso de Git por Parte

### Flujo de Trabajo

Para cada parte del plan:

1. **Crear branch desde la rama anterior** (empezando desde la rama actual):
   ```bash
   # Primera parte: desde rama actual (feature/drivers-filters)
   git checkout feature/drivers-filters
   git pull origin feature/drivers-filters
   git checkout -b feature/[parte-1-nombre]
   
   # Partes siguientes: desde la rama de la parte anterior
   git checkout feature/[parte-anterior-nombre]
   git pull origin feature/[parte-anterior-nombre]
   git checkout -b feature/[parte-actual-nombre]
   ```

2. **Implementar cambios**:

                                                - Seguir el archivo `tasks.md` de la parte
                                                - Escribir código según especificaciones
                                                - Escribir unit tests (cobertura mínima 80%)

3. **Commit con mensaje descriptivo**:
   ```bash
   git add .
   git commit -m "feat: [parte-nombre] - [descripción breve]
   
   - [Cambio 1]
   - [Cambio 2]
   - [Cambio 3]
   
   Parte X de 10: [descripción de la parte]"
   ```

4. **Push a remote**:
   ```bash
   git push origin feature/[parte-nombre]
   ```

5. **Actualizar SUMMARY.md**:

                                                - Marcar parte como completada
                                                - Agregar fecha de completación
                                                - Agregar resumen de cambios
                                                - Actualizar estado general

### Ejemplo de Commit Message

```
feat: disable-hybrid-tenant - Remove HYBRID option from tenant creation

- Remove HYBRID from CreateTenantDto enum
- Update ITenantRepository type definition
- Add validation in TenantController to reject HYBRID
- Remove HYBRID option from frontend tenant form
- Add unit tests for tenant type validation

Parte 1 de 10: Deshabilitar HYBRID en creación de tenants
```

## Archivo SUMMARY.md

El archivo `.tracking/SUMMARY.md` se actualizará después de cada parte completada:

```markdown
# Resumen General del Proyecto: Seguridad y Visibilidad

## Estado General
- **Progreso**: X/10 partes completadas (X%)
- **Última actualización**: [Fecha]
- **Branch actual**: feature/[parte-nombre]

## Partes Completadas

### ✅ Parte 1: Deshabilitar HYBRID en Creación de Tenants
- **Fecha de completación**: [Fecha]
- **Branch**: feature/disable-hybrid-tenant
- **Resumen**: Se eliminó la opción HYBRID del formulario y API de creación de tenants.
- **Cambios principales**:
  - Backend: Actualizado CreateTenantDto, ITenantRepository, TenantController
  - Frontend: Removida opción HYBRID del select
  - Tests: Unit tests para validaciones de tenant type

### ✅ Parte 2: Crear Módulo de UOMs
- **Fecha de completación**: [Fecha]
- **Branch**: feature/create-uoms-module
- **Resumen**: Módulo completo de UOMs creado en backend y frontend.
- **Cambios principales**:
  - Backend: Estructura completa del módulo (domain, application, infrastructure, presentation)
  - Frontend: Página y componentes para gestionar UOMs
  - Tests: Unit tests para todos los use cases

## Partes en Progreso

### 🚧 Parte X: [Nombre]
- **Branch**: feature/[parte-nombre]
- **Estado**: En desarrollo
- **Progreso**: X/Y tareas completadas

## Partes Pendientes

- [ ] Parte 3: Agregar Rol DRIVER
- [ ] Parte 4: Validar SUPERVISOR
- ...

## Notas Importantes

- LOGISTICS_PROVIDER es completamente independiente de tenant types
- Unit tests obligatorios con cobertura mínima 80%
- Cada parte debe tener commit y push antes de continuar
```

## Notas Finales

- **LOGISTICS_PROVIDER es completamente independiente**: No hay relación con tenant types
- **Unit tests son obligatorios**: Cobertura mínima 80%
- **Agentes especializados**: Reutilizables para futuras tareas
- **Tracking en .tracking/**: Cada parte con su plan y tasks
- **Branches por feature**: Una branch por parte del plan
- **Commits y push obligatorios**: Cada parte debe tener commit y push antes de continuar
- **Summary general**: Actualizar SUMMARY.md después de cada parte completada
- **Verificar tenant middleware**: No debe bloquear modificaciones para LOGISTICS_PROVIDER/SUPERVISOR
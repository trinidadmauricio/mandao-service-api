# Parte 10: Actualizar Permisos en Constants

## Objetivo

Actualizar la matriz de permisos (`ROLE_PERMISSIONS`) para reflejar todas las reglas nuevas implementadas en las partes anteriores, asegurando que los permisos sean consistentes con las validaciones de backend y frontend.

## Contexto

Después de implementar todas las partes anteriores, necesitamos asegurar que la matriz de permisos en `permissions.ts` refleje correctamente:

1. Permisos de UOMs (Unidades de Medida) - solo RETAIL
2. Permisos de MERCHANT_USER según tenant type (RETAIL vs ON_DEMAND)
3. Permisos de asignación de drivers para LOGISTICS_PROVIDER/SUPERVISOR
4. Permisos de delivery-zones y delivery-rates para LOGISTICS_PROVIDER/SUPERVISOR
5. Permisos de reports para diferentes roles
6. Exclusión de módulos SAAS para roles no-SAAS

## Permisos a Actualizar

### 1. UOMs (Unidades de Medida)

- **Resource**: `'units-of-measure'` (nuevo)
- **RETAIL roles**: OWNER, MERCHANT_USER (read, create, update, delete)
- **ON_DEMAND roles**: Sin acceso
- **LOGISTICS_PROVIDER/SUPERVISOR**: Sin acceso
- **SAAS roles**: Acceso completo

### 2. MERCHANT_USER

**RETAIL tenant**:
- Dashboard: read
- Orders: read, create, update, delete
- Products: read, create, update, delete
- Categories: read, create, update, delete
- Brands: read, create, update, delete
- Branches: read, create, update, delete
- Units of Measure: read, create, update, delete
- Reports: read (solo sus datos)

**ON_DEMAND tenant**:
- Dashboard: read
- Orders: read, create, update, delete
- Reports: read (solo sus datos)

### 3. LOGISTICS_PROVIDER

- Dashboard: read
- Orders: read, update (solo órdenes asignadas a su proveedor)
- Drivers: read, create, update, delete (solo su flota)
- Vehicles: read, create, update, delete (solo su flota)
- Delivery Zones: read, create, update, delete
- Delivery Rates: read, create, update, delete
- Users: read, create (solo SUPERVISOR), update
- Logistics Providers: read (solo el suyo)
- Reports: read (solo sus datos)

### 4. SUPERVISOR

- Dashboard: read
- Orders: read, update (solo órdenes asignadas a su proveedor)
- Drivers: read, create, update, delete (solo su flota)
- Vehicles: read, create, update, delete (solo su flota)
- Delivery Zones: read, create, update, delete
- Delivery Rates: read, create, update, delete
- Users: read, update (no puede crear)
- Logistics Providers: read (solo el suyo)
- Reports: read (solo sus datos)

### 5. OWNER

- Acceso total EXCEPTO módulos SAAS (order-counters, payments, subscriptions, subscription-plans)
- Puede ver/actualizar su propio order-counter (excepción especial)

### 6. SAAS Roles

- Acceso total a todos los recursos sin restricciones

## Estrategia de Implementación

### Backend

1. **Agregar resource 'units-of-measure'** al tipo `Resource`
2. **Actualizar ROLE_PERMISSIONS** para cada rol según las especificaciones
3. **Actualizar funciones helper** (`hasPermission`, `canAccessResource`, `getAllowedActions`) si es necesario
4. **Verificar consistencia** con las validaciones implementadas en las partes anteriores

### Frontend

1. **Actualizar constants** en `mandao-service-backoffice/src/lib/constants/roles.ts` para coincidir con backend
2. **Verificar que los guards** usen los permisos correctos

### Tests

1. **Unit tests** para validar que cada rol tiene los permisos correctos
2. **Tests de integración** para verificar que los permisos se respetan en los endpoints

## Consideraciones Críticas

1. **MERCHANT_USER**: Los permisos deben reflejar que en RETAIL tiene acceso completo al catálogo, pero en ON_DEMAND solo tiene acceso a órdenes
2. **LOGISTICS_PROVIDER/SUPERVISOR**: No tienen tenant, así que los permisos de catálogo no aplican
3. **OWNER**: Tiene acceso total excepto módulos SAAS, pero puede ver su propio order-counter
4. **UOMs**: Solo visible para RETAIL, así que solo OWNER y MERCHANT_USER (en RETAIL) tienen acceso

## Archivos a Modificar

### Backend

- `mandao-service-api/src/shared/constants/permissions.ts`
- `mandao-service-api/src/shared/constants/__tests__/unit/permissions.spec.ts`

### Frontend

- `mandao-service-backoffice/src/lib/constants/roles.ts`


# Plan: Sistema Completo de Roles, Permisos y Acceso - Backend API

## Objetivo

Implementar un sistema completo, estándar y consistente de roles, permisos y acceso en el backend API que considere: almacenamiento en código, nuevos roles (LOGISTICS_PROVIDER), exclusión de CUSTOMER del backoffice, soporte para tenants HYBRID, y evaluación global de base de datos, rutas y estructura de archivos.

## Decisión Arquitectónica: Almacenamiento

**Roles y Permisos en Código:**
- Type safety con TypeScript
- Performance (sin queries a DB)
- Validación en compile-time
- Fácil de mantener y versionar
- Estándar en la industria para roles fijos

**Asignación de Roles en PostgreSQL:**
- Ya existe: `User.role` (enum UserRole)
- Relación con tenant: `User.tenant_id`
- Auditoría y trazabilidad

## Fases del Plan

### Fase 1: Actualizar Base de Datos
- Agregar LOGISTICS_PROVIDER al enum UserRole
- Agregar relación User -> LogisticsProvider
- Validar estructura de Tenant

### Fase 2: Definir Roles del Sistema
- Roles para Backoffice: SAAS_ADMIN, SAAS_EDITOR, OWNER, SUPERVISOR, MERCHANT_USER, LOGISTICS_PROVIDER
- Roles para E-commerce: CUSTOMER (solo storefront)
- Implementar en código

### Fase 3: Definir Matriz de Permisos
- Listar todos los recursos
- Definir acciones estándar
- Matriz completa por rol
- Implementar en código

### Fase 4: Implementar Middlewares
- Middleware de permisos genérico
- Middleware de tenant type
- Helper para validaciones de logistics provider

### Fase 5: Aplicar a Rutas
- Aplicar middlewares a todas las rutas
- Validar tenant type donde corresponde
- Validar logistics provider donde corresponde

### Fase 6: Actualizar Use Cases
- Validar tenant type en creación
- Validar logistics provider en listados
- Filtrar recursos según rol

## Recursos del Sistema

- dashboard, orders, products, categories, brands, drivers, vehicles, branches, delivery-zones, delivery-rates, logistics-providers, users, tenants, payments, reports, subscriptions, order-counters, storefront

## Roles Definidos

1. **SAAS_ADMIN** - Administrador del SaaS (cross-tenant)
2. **SAAS_EDITOR** - Editor del SaaS (cross-tenant)
3. **OWNER** - Dueño del tenant (acceso total)
4. **SUPERVISOR** - Supervisor operativo
5. **MERCHANT_USER** - Usuario de retail
6. **LOGISTICS_PROVIDER** - Proveedor de logística
7. **CUSTOMER** - Cliente final (solo storefront)

## Validaciones de Tenant Type

- **RETAIL o HYBRID:** products, categories, brands, crear orden retail
- **ON_DEMAND o HYBRID:** drivers, vehicles, delivery-zones, delivery-rates, logistics-providers, crear orden on-demand
- **Todos:** dashboard, orders (lectura), branches, users, payments, reports, subscriptions

## Archivos Clave

- `prisma/schema.prisma` - Schema de BD
- `src/shared/constants/roles.ts` - Roles
- `src/shared/constants/permissions.ts` - Permisos (NUEVO)
- `src/shared/middleware/require-permission.middleware.ts` - Middleware permisos (NUEVO)
- `src/shared/middleware/require-tenant-type.middleware.ts` - Middleware tenant type (NUEVO)
- `src/shared/utils/logistics-provider-validations.ts` - Validaciones logistics (NUEVO)


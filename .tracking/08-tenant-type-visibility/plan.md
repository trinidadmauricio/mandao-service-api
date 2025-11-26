# Parte 8: Visibilidad por Tenant Type

## Objetivo

Ocultar/mostrar módulos según tenant type (RETAIL vs ON_DEMAND) tanto en backend como frontend, asegurando que usuarios de ON_DEMAND no puedan acceder a módulos de catálogo.

## Contexto

- **RETAIL**: Tiene acceso completo a catálogo (productos, categorías, marcas, sucursales, UOMs) + órdenes
- **ON_DEMAND**: Solo tiene acceso a órdenes (NO tiene catálogo)
- **LOGISTICS_PROVIDER/SUPERVISOR**: No tienen tenant, no se ven afectados por estas validaciones
- **SAAS roles**: Pueden acceder a todo sin restricciones de tenant type

## Módulos de Catálogo (Solo RETAIL)

Los siguientes módulos deben ser visibles/accesibles SOLO para tenants RETAIL:

1. **Products** (Productos)
2. **Categories** (Categorías)
3. **Brands** (Marcas)
4. **Branches** (Sucursales)
5. **UOMs** (Unidades de Medida) - cuando se implemente

## Estrategia de Implementación

### Backend

1. **Actualizar `requireTenantType` middleware**:
   - Remover HYBRID de los tipos permitidos (ya está deshabilitado)
   - Asegurar que LOGISTICS_PROVIDER/SUPERVISOR no se vean afectados

2. **Agregar `requireTenantType(['RETAIL'])` a todas las rutas de catálogo**:
   - Products: list, getById, create, update, delete
   - Categories: list, getById, create, update, delete
   - Brands: list, getById, create, update, delete
   - Branches: list, getById, create, update, delete
   - UOMs: todas las rutas (cuando se implemente)

3. **Validar que MERCHANT_USER en ON_DEMAND no acceda a módulos de catálogo**:
   - El middleware `requireTenantType` ya bloquea esto automáticamente

### Frontend

1. **Actualizar Sidebar**:
   - Ocultar módulos de catálogo para ON_DEMAND
   - Mostrar módulos de catálogo solo para RETAIL
   - LOGISTICS_PROVIDER/SUPERVISOR no deben ver módulos de catálogo

2. **Actualizar Permission Guards**:
   - Validar tenant type además de permisos
   - Redirigir a página de error si intentan acceder a módulo no permitido

3. **Ocultar enlaces y botones**:
   - Ocultar CTAs de creación de productos/categorías/etc para ON_DEMAND

## Consideraciones Críticas

1. **LOGISTICS_PROVIDER/SUPERVISOR**: No tienen tenant, por lo que `requireTenantType` debe permitirles pasar (o no aplicarse a ellos)
2. **SAAS roles**: Pueden acceder a todo sin restricciones
3. **HYBRID está deshabilitado**: No debe estar en los tipos permitidos
4. **Backward compatibility**: Asegurar que cambios no rompan funcionalidad existente

## Orden de Implementación

1. Actualizar middleware `requireTenantType` para excluir HYBRID y manejar LOGISTICS_PROVIDER
2. Agregar `requireTenantType(['RETAIL'])` a todas las rutas de catálogo
3. Actualizar frontend sidebar para ocultar/mostrar según tenant type
4. Actualizar permission guards en frontend
5. Escribir unit tests


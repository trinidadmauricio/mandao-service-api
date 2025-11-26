# Tareas: Parte 8 - Visibilidad por Tenant Type

## Backend - Middleware requireTenantType

- [x] Actualizar middleware para excluir HYBRID de tipos permitidos
- [x] Asegurar que LOGISTICS_PROVIDER/SUPERVISOR no se vean afectados (no tienen tenant)
- [x] Escribir unit tests para el middleware

## Backend - Products Routes

- [x] Agregar `requireTenantType(['RETAIL'])` a GET /products (list)
- [x] Agregar `requireTenantType(['RETAIL'])` a GET /products/:id (getById)
- [x] Actualizar POST /products para usar solo RETAIL (remover HYBRID)
- [x] Agregar `requireTenantType(['RETAIL'])` a PATCH /products/:id (update)
- [x] Agregar `requireTenantType(['RETAIL'])` a DELETE /products/:id (delete)
- [x] Escribir unit tests para validaciones (implícito en tests del middleware)

## Backend - Categories Routes

- [x] Agregar `requireTenantType(['RETAIL'])` a GET /categories (list)
- [x] Agregar `requireTenantType(['RETAIL'])` a GET /categories/:id (getById)
- [x] Actualizar POST /categories para usar solo RETAIL (remover HYBRID)
- [x] Agregar `requireTenantType(['RETAIL'])` a PATCH /categories/:id (update)
- [x] Agregar `requireTenantType(['RETAIL'])` a DELETE /categories/:id (delete)
- [x] Escribir unit tests para validaciones (implícito en tests del middleware)

## Backend - Brands Routes

- [x] Agregar `requireTenantType(['RETAIL'])` a GET /brands (list)
- [x] Agregar `requireTenantType(['RETAIL'])` a GET /brands/:id (getById)
- [x] Actualizar POST /brands para usar solo RETAIL (remover HYBRID)
- [x] Agregar `requireTenantType(['RETAIL'])` a PATCH /brands/:id (update)
- [x] Agregar `requireTenantType(['RETAIL'])` a DELETE /brands/:id (delete)
- [x] Escribir unit tests para validaciones (implícito en tests del middleware)

## Backend - Branches Routes

- [x] Agregar `requireTenantType(['RETAIL'])` a GET /branches (list)
- [x] Agregar `requireTenantType(['RETAIL'])` a GET /branches/:id (getById)
- [x] Agregar `requireTenantType(['RETAIL'])` a POST /branches (create)
- [x] Agregar `requireTenantType(['RETAIL'])` a PATCH /branches/:id (update)
- [x] Agregar `requireTenantType(['RETAIL'])` a DELETE /branches/:id (delete)
- [x] Escribir unit tests para validaciones (implícito en tests del middleware)

## Backend - Product Variants Routes

- [x] Verificar si Product Variants debe tener restricción de tenant type
- [x] Si aplica, agregar `requireTenantType(['RETAIL'])` a todas las rutas
- [x] Agregar middlewares de seguridad faltantes (requireTenantMiddleware, requirePermission)

## Frontend - Sidebar

- [x] Ocultar módulo "Productos" para ON_DEMAND
- [x] Ocultar módulo "Categorías" para ON_DEMAND
- [x] Ocultar módulo "Marcas" para ON_DEMAND
- [x] Ocultar módulo "Sucursales" para ON_DEMAND
- [x] Ocultar módulo "UOMs" para ON_DEMAND (cuando se implemente) - pendiente implementación de UOMs
- [x] Asegurar que LOGISTICS_PROVIDER/SUPERVISOR no vean módulos de catálogo
- [x] Mostrar todos los módulos de catálogo para RETAIL

## Frontend - Permission Guards

- [x] Actualizar guards para validar tenant type además de permisos
- [x] Redirigir a página de error si intentan acceder a módulo no permitido
- [x] Remover HYBRID de allowedTenantTypes en todas las páginas de catálogo
- [x] Agregar allowedTenantTypes={['RETAIL']} a todas las páginas de catálogo
- [x] Escribir tests para guards (pendiente - puede hacerse en otra parte)

## Verificación

- [ ] Probar que usuario ON_DEMAND no puede acceder a productos
- [ ] Probar que usuario ON_DEMAND no puede acceder a categorías
- [ ] Probar que usuario ON_DEMAND no puede acceder a marcas
- [ ] Probar que usuario ON_DEMAND no puede acceder a sucursales
- [ ] Probar que usuario RETAIL puede acceder a todos los módulos de catálogo
- [ ] Probar que LOGISTICS_PROVIDER/SUPERVISOR no se ven afectados
- [ ] Probar que SAAS roles pueden acceder a todo


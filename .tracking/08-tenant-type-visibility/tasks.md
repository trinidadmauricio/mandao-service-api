# Tareas: Parte 8 - Visibilidad por Tenant Type

## Backend - Middleware requireTenantType

- [ ] Actualizar middleware para excluir HYBRID de tipos permitidos
- [ ] Asegurar que LOGISTICS_PROVIDER/SUPERVISOR no se vean afectados (no tienen tenant)
- [ ] Escribir unit tests para el middleware

## Backend - Products Routes

- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /products (list)
- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /products/:id (getById)
- [ ] Actualizar POST /products para usar solo RETAIL (remover HYBRID)
- [ ] Agregar `requireTenantType(['RETAIL'])` a PATCH /products/:id (update)
- [ ] Agregar `requireTenantType(['RETAIL'])` a DELETE /products/:id (delete)
- [ ] Escribir unit tests para validaciones

## Backend - Categories Routes

- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /categories (list)
- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /categories/:id (getById)
- [ ] Actualizar POST /categories para usar solo RETAIL (remover HYBRID)
- [ ] Agregar `requireTenantType(['RETAIL'])` a PATCH /categories/:id (update)
- [ ] Agregar `requireTenantType(['RETAIL'])` a DELETE /categories/:id (delete)
- [ ] Escribir unit tests para validaciones

## Backend - Brands Routes

- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /brands (list)
- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /brands/:id (getById)
- [ ] Actualizar POST /brands para usar solo RETAIL (remover HYBRID)
- [ ] Agregar `requireTenantType(['RETAIL'])` a PATCH /brands/:id (update)
- [ ] Agregar `requireTenantType(['RETAIL'])` a DELETE /brands/:id (delete)
- [ ] Escribir unit tests para validaciones

## Backend - Branches Routes

- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /branches (list)
- [ ] Agregar `requireTenantType(['RETAIL'])` a GET /branches/:id (getById)
- [ ] Agregar `requireTenantType(['RETAIL'])` a POST /branches (create)
- [ ] Agregar `requireTenantType(['RETAIL'])` a PATCH /branches/:id (update)
- [ ] Agregar `requireTenantType(['RETAIL'])` a DELETE /branches/:id (delete)
- [ ] Escribir unit tests para validaciones

## Backend - Product Variants Routes

- [ ] Verificar si Product Variants debe tener restricción de tenant type
- [ ] Si aplica, agregar `requireTenantType(['RETAIL'])` a todas las rutas

## Frontend - Sidebar

- [ ] Ocultar módulo "Productos" para ON_DEMAND
- [ ] Ocultar módulo "Categorías" para ON_DEMAND
- [ ] Ocultar módulo "Marcas" para ON_DEMAND
- [ ] Ocultar módulo "Sucursales" para ON_DEMAND
- [ ] Ocultar módulo "UOMs" para ON_DEMAND (cuando se implemente)
- [ ] Asegurar que LOGISTICS_PROVIDER/SUPERVISOR no vean módulos de catálogo
- [ ] Mostrar todos los módulos de catálogo para RETAIL

## Frontend - Permission Guards

- [ ] Actualizar guards para validar tenant type además de permisos
- [ ] Redirigir a página de error si intentan acceder a módulo no permitido
- [ ] Escribir tests para guards

## Verificación

- [ ] Probar que usuario ON_DEMAND no puede acceder a productos
- [ ] Probar que usuario ON_DEMAND no puede acceder a categorías
- [ ] Probar que usuario ON_DEMAND no puede acceder a marcas
- [ ] Probar que usuario ON_DEMAND no puede acceder a sucursales
- [ ] Probar que usuario RETAIL puede acceder a todos los módulos de catálogo
- [ ] Probar que LOGISTICS_PROVIDER/SUPERVISOR no se ven afectados
- [ ] Probar que SAAS roles pueden acceder a todo


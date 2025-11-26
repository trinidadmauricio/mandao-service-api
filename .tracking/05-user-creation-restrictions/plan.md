# Parte 5: Restricciones de Creación de Usuarios (CRÍTICO)

## Objetivo

Implementar todas las restricciones de creación de usuarios por rol según las reglas de negocio definidas.

## Alcance

### Backend
- Validar SAAS_ADMIN: Puede crear todos excepto CUSTOMER
- Validar SAAS_EDITOR: Puede crear todos excepto SAAS roles y CUSTOMER
- Validar OWNER: Solo puede crear MERCHANT_USER
- Validar LOGISTICS_PROVIDER: Solo puede crear SUPERVISOR (ya implementado en Parte 4)
- Validar que ningún rol puede crear CUSTOMER (exclusivo del storefront)
- Validar que SUPERVISOR y MERCHANT_USER no pueden crear usuarios

### Frontend
- Ocultar CUSTOMER del select para todos los usuarios del backoffice
- Mostrar solo opciones permitidas según rol del usuario actual:
  - SAAS_ADMIN: Todos excepto CUSTOMER
  - SAAS_EDITOR: Todos excepto SAAS_ADMIN, SAAS_EDITOR, CUSTOMER
  - OWNER: Solo MERCHANT_USER
  - LOGISTICS_PROVIDER: Solo SUPERVISOR
  - Otros: No pueden crear usuarios

### Tests
- Unit tests para todas las validaciones de creación por rol
- Tests para verificar que CUSTOMER no puede ser creado desde backoffice

## Archivos a Modificar

### Backend
- `src/domains/shared/users/application/use-cases/CreateUserUseCase.ts` (extender validaciones)
- `src/domains/shared/users/presentation/controllers/UserController.ts` (mejorar manejo de errores)

### Frontend
- `src/components/users/user-form.tsx` (filtrar opciones según rol)

## Reglas de Creación de Usuarios

- **SAAS_ADMIN**: Puede crear SAAS_EDITOR, OWNER, LOGISTICS_PROVIDER, MERCHANT_USER, SUPERVISOR, DRIVER. NO puede crear CUSTOMER
- **SAAS_EDITOR**: Puede crear OWNER, LOGISTICS_PROVIDER, MERCHANT_USER, SUPERVISOR, DRIVER. NO puede crear SAAS_ADMIN, SAAS_EDITOR, ni CUSTOMER
- **OWNER**: Solo puede crear MERCHANT_USER. NO puede crear OWNER, LOGISTICS_PROVIDER, SUPERVISOR, SAAS roles, DRIVER, ni CUSTOMER
- **LOGISTICS_PROVIDER**: Solo puede crear SUPERVISOR. NO puede crear CUSTOMER
- **SUPERVISOR**: NO puede crear usuarios
- **MERCHANT_USER**: NO puede crear usuarios
- **CUSTOMER**: NINGÚN rol del backoffice puede crear CUSTOMER (exclusivo del storefront)


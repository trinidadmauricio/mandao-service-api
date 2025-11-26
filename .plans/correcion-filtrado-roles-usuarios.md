# Corrección de Filtrado y Creación de Usuarios por Rol

## Problema Identificado

### 1. Filtrado de Usuarios en Listado

El endpoint `GET /api/v1/users` no aplica filtrado automático por rol según el usuario autenticado:

- **OWNER** debería ver solo usuarios con rol `MERCHANT_USER`
- **SAAS_ADMIN** y **SAAS_EDITOR** deben ver todos los usuarios sin restricciones
- **LOGISTICS_PROVIDER** y **SUPERVISOR** ya tienen filtrado por `logistics_provider_id` (correcto)
- El frontend muestra todos los usuarios sin restricciones porque el backend no filtra automáticamente

### 2. Reglas de Creación de Usuarios

**Reglas correctas según especificaciones**:

- **SAAS_ADMIN**: puede crear **cualquier usuario posible** (sin restricciones)
- **SAAS_EDITOR**: puede crear **cualquier usuario posible EXCEPTO SAAS_ADMIN y SAAS_EDITOR**
- **OWNER**: solo puede crear MERCHANT_USER
- **LOGISTICS_PROVIDER**: solo puede crear SUPERVISOR

**Estado actual del código**:

- **SAAS_ADMIN** (líneas 38-40): Ya puede crear cualquier rol (correcto - no requiere cambios)
- **SAAS_EDITOR** (líneas 42-47): Ya tiene restricción correcta - no puede crear SAAS_ADMIN ni SAAS_EDITOR (correcto - no requiere cambios)
- **OWNER** (líneas 49-54): Ya está correcto (solo MERCHANT_USER) - no requiere cambios
- **LOGISTICS_PROVIDER** (líneas 56-67): Ya está correcto (solo SUPERVISOR) - no requiere cambios

## Análisis del Código Actual

### Backend - `UserController.list()`

- **Archivo**: `mandao-service-api/src/domains/shared/users/presentation/controllers/UserController.ts`
- **Líneas 104-194**: Solo filtra por `logistics_provider_id` para LOGISTICS_PROVIDER/SUPERVISOR
- **Falta**: Filtrado automático por rol para OWNER

### Backend - `CreateUserUseCase.execute()`

- **Archivo**: `mandao-service-api/src/domains/shared/users/application/use-cases/CreateUserUseCase.ts`
- **Líneas 38-40**: SAAS_ADMIN ya puede crear cualquier rol (correcto)
- **Líneas 42-47**: SAAS_EDITOR tiene restricción correcta - no puede crear SAAS_ADMIN ni SAAS_EDITOR (correcto)
- **No requiere cambios**: Las reglas de creación ya están implementadas correctamente

### Backend - `PrismaUserRepository.findAllWithFilters()`

- **Archivo**: `mandao-service-api/src/domains/shared/users/infrastructure/repositories/PrismaUserRepository.ts`
- **Líneas 63-127**: Ya soporta filtrar por rol
- **Correcto**: No requiere cambios

### Frontend - `UsersPage`

- **Archivo**: `mandao-service-backoffice/src/app/(dashboard)/users/page.tsx`
- **Líneas 28-284**: No aplica filtros automáticos
- **Correcto**: El filtrado debe ser automático en el backend, no requiere cambios en frontend

## Solución

### 1. Backend: Agregar Filtrado Automático por Rol en `UserController`

**Archivo**: `mandao-service-api/src/domains/shared/users/presentation/controllers/UserController.ts`

**Método**: `list()` (líneas 104-194)

**Cambios**:

- Agregar lógica después de la línea 112 para filtrar automáticamente por rol según el usuario actual
- Si `req.user.role === 'OWNER'`: Agregar filtro `role: 'MERCHANT_USER'` automáticamente
- Si `req.user.role === 'SAAS_ADMIN'` o `'SAAS_EDITOR'`: No aplicar restricciones (ver todos)
- Mantener lógica existente para LOGISTICS_PROVIDER/SUPERVISOR

**Lógica a implementar**:

```typescript
// Después de línea 112, agregar:
let autoRoleFilter: string | undefined;

// OWNER solo puede ver MERCHANT_USER
if (req.user?.role === 'OWNER') {
  autoRoleFilter = 'MERCHANT_USER';
}

// SAAS roles ven todos (no aplicar filtro)
// LOGISTICS_PROVIDER/SUPERVISOR ya tienen su filtro por logistics_provider_id

// Si hay autoRoleFilter y no está en los filtros del usuario, agregarlo
if (autoRoleFilter && !filtersInput.role) {
  filtersInput.role = autoRoleFilter;
}
```

### 2. Backend: Verificar Restricciones de Creación en `CreateUserUseCase`

**Archivo**: `mandao-service-api/src/domains/shared/users/application/use-cases/CreateUserUseCase.ts`

**Método**: `execute()` (líneas 23-107)

**Verificación**:

- **SAAS_ADMIN** (líneas 38-40): Ya puede crear cualquier rol (correcto - no requiere cambios)
- **SAAS_EDITOR** (líneas 42-47): Ya tiene restricción correcta - no puede crear SAAS_ADMIN ni SAAS_EDITOR (correcto - no requiere cambios)
- **OWNER** (líneas 49-54): Ya está correcto (solo MERCHANT_USER) - no requiere cambios
- **LOGISTICS_PROVIDER** (líneas 56-67): Ya está correcto (solo SUPERVISOR) - no requiere cambios

**Conclusión**: Las reglas de creación ya están implementadas correctamente. Solo se requiere verificación mediante tests.

### 3. Testing

**Archivos a crear/modificar**:

- `mandao-service-api/src/domains/shared/users/__tests__/unit/UserController.spec.ts` (crear o actualizar)
- `mandao-service-api/src/domains/shared/users/__tests__/unit/CreateUserUseCase.spec.ts` (crear o actualizar)

**Tests para UserController.list()**:

- OWNER solo ve MERCHANT_USER
- SAAS_ADMIN ve todos los usuarios (sin restricciones)
- SAAS_EDITOR ve todos los usuarios (sin restricciones)
- LOGISTICS_PROVIDER mantiene su filtro por logistics_provider_id
- SUPERVISOR mantiene su filtro por logistics_provider_id

**Tests para CreateUserUseCase.execute()**:

- SAAS_ADMIN puede crear cualquier rol (OWNER, MERCHANT_USER, LOGISTICS_PROVIDER, SUPERVISOR, DRIVER, SAAS_EDITOR, etc.)
- SAAS_EDITOR puede crear cualquier rol EXCEPTO SAAS_ADMIN y SAAS_EDITOR
- SAAS_EDITOR NO puede crear SAAS_ADMIN
- SAAS_EDITOR NO puede crear SAAS_EDITOR
- OWNER solo puede crear MERCHANT_USER
- LOGISTICS_PROVIDER solo puede crear SUPERVISOR

## Archivos a Modificar

1. **Backend**:
   - `mandao-service-api/src/domains/shared/users/presentation/controllers/UserController.ts` (método `list()`)

2. **Tests**:
   - `mandao-service-api/src/domains/shared/users/__tests__/unit/UserController.spec.ts` (crear o actualizar)
   - `mandao-service-api/src/domains/shared/users/__tests__/unit/CreateUserUseCase.spec.ts` (crear o actualizar)

## Notas Importantes

- El filtrado debe ser **automático** en el backend, no requiere cambios en el frontend
- OWNER puede seguir usando el filtro manual de rol en el frontend, pero el backend siempre aplicará la restricción automática
- SAAS roles deben poder ver todos los usuarios independientemente del tenant
- SAAS_ADMIN tiene permisos completos para crear cualquier usuario
- SAAS_EDITOR puede crear cualquier usuario EXCEPTO SAAS_ADMIN y SAAS_EDITOR
- Las reglas de creación ya están implementadas correctamente en el código, solo se requiere verificación mediante tests
- Las restricciones de creación son críticas para la seguridad del sistema

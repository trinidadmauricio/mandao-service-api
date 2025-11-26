# Parte 4: Validar SUPERVISOR - Solo creado por LOGISTICS_PROVIDER (CRÍTICO)

## Objetivo

Implementar validaciones críticas para que SOLO LOGISTICS_PROVIDER pueda crear usuarios con rol SUPERVISOR, y que SUPERVISOR tenga logistics_provider_id obligatorio.

## Alcance

### Backend
- Validar en CreateUserUseCase que solo LOGISTICS_PROVIDER puede crear SUPERVISOR
- Validar que SUPERVISOR tenga logistics_provider_id obligatorio
- Asignar automáticamente logistics_provider_id del creador al SUPERVISOR
- Actualizar CreateUserDto para validar estas reglas

### Frontend
- Ocultar SUPERVISOR del select de roles si el usuario NO es LOGISTICS_PROVIDER
- Asignar automáticamente logistics_provider_id al crear SUPERVISOR
- Mostrar mensaje claro si intenta crear SUPERVISOR sin ser LOGISTICS_PROVIDER

### Tests
- Unit tests para todas las validaciones
- Tests para verificar que otros roles no pueden crear SUPERVISOR
- Tests para verificar que SUPERVISOR tiene logistics_provider_id obligatorio

## Archivos a Modificar

### Backend
- `src/domains/shared/users/application/use-cases/CreateUserUseCase.ts`
- `src/domains/shared/users/application/dto/CreateUserDto.ts`
- `src/shared/middleware/auth.middleware.ts` (validar que SUPERVISOR tenga logistics_provider_id)

### Frontend
- `src/components/users/user-form.tsx`

## Consideraciones Críticas

- SUPERVISOR es EXCLUSIVO de LOGISTICS_PROVIDER
- SUPERVISOR NO debe aparecer como opción para OWNER u otros roles
- SUPERVISOR DEBE tener logistics_provider_id asignado - validación obligatoria
- SUPERVISOR actúa de manera independiente, NO está atado a tenant
- El middleware de tenant NO debe bloquear SUPERVISOR (no tiene tenant)


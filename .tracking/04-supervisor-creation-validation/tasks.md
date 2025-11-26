# Tareas: Parte 4 - Validar SUPERVISOR Solo Creado por LOGISTICS_PROVIDER

## Backend

- [ ] Actualizar `CreateUserUseCase.ts`: 
  - Validar que SOLO LOGISTICS_PROVIDER puede crear usuarios con rol SUPERVISOR
  - Si intenta crear SUPERVISOR y no es LOGISTICS_PROVIDER, lanzar error
  - Validar que SUPERVISOR tenga logistics_provider_id obligatorio
  - Asignar automáticamente el logistics_provider_id del LOGISTICS_PROVIDER al SUPERVISOR creado
- [ ] Actualizar `CreateUserDto.ts`: 
  - Validar schema para SUPERVISOR - logistics_provider_id requerido
  - Validar que si role es SUPERVISOR, el usuario que crea debe ser LOGISTICS_PROVIDER
- [ ] Actualizar `auth.middleware.ts`: Validar que SUPERVISOR tenga logistics_provider_id al autenticarse
- [ ] Escribir unit tests para CreateUserUseCase validando restricciones de SUPERVISOR
- [ ] Escribir unit tests para CreateUserDto validando schema de SUPERVISOR

## Frontend

- [ ] Actualizar `user-form.tsx`: 
  - Ocultar opción SUPERVISOR del select de roles si el usuario NO es LOGISTICS_PROVIDER
  - Si es LOGISTICS_PROVIDER, mostrar SUPERVISOR como opción
  - Asignar automáticamente su logistics_provider_id al crear SUPERVISOR
  - Mostrar mensaje claro si intenta crear SUPERVISOR sin ser LOGISTICS_PROVIDER

## Tests

- [ ] Backend: Test que valida que solo LOGISTICS_PROVIDER puede crear SUPERVISOR
- [ ] Backend: Test que valida que otros roles no pueden crear SUPERVISOR
- [ ] Backend: Test que valida que SUPERVISOR tiene logistics_provider_id obligatorio
- [ ] Backend: Test que valida asignación automática de logistics_provider_id
- [ ] Frontend: Verificar que SUPERVISOR no aparece para roles no-LOGISTICS_PROVIDER

## Verificación

- [ ] Verificar que tenant middleware no bloquee SUPERVISOR (no tiene tenant)
- [ ] Probar crear SUPERVISOR como LOGISTICS_PROVIDER (debe funcionar)
- [ ] Probar crear SUPERVISOR como OWNER (debe fallar con error 403)
- [ ] Probar crear SUPERVISOR sin logistics_provider_id (debe fallar con error 400)


# Tareas: Parte 5 - Restricciones de Creación de Usuarios

## Backend

- [ ] Actualizar `CreateUserUseCase.ts`:
  - Validar SAAS_ADMIN (puede crear todos excepto CUSTOMER)
  - Validar SAAS_EDITOR (puede crear todos excepto SAAS roles y CUSTOMER)
  - Validar OWNER (solo puede crear MERCHANT_USER)
  - Validar que ningún rol puede crear CUSTOMER
  - Validar que SUPERVISOR no puede crear usuarios
  - Validar que MERCHANT_USER no puede crear usuarios
- [ ] Actualizar `UserController.ts`: Mejorar manejo de errores con códigos HTTP apropiados (403 para restricciones)
- [ ] Escribir unit tests para todas las validaciones de creación por rol

## Frontend

- [ ] Actualizar `user-form.tsx`:
  - Ocultar CUSTOMER del select para todos
  - Filtrar opciones según rol del usuario actual:
    - SAAS_ADMIN: Mostrar todos excepto CUSTOMER
    - SAAS_EDITOR: Mostrar todos excepto SAAS_ADMIN, SAAS_EDITOR, CUSTOMER
    - OWNER: Mostrar solo MERCHANT_USER
    - LOGISTICS_PROVIDER: Mostrar solo SUPERVISOR (ya implementado)
    - Otros: No mostrar opciones (o deshabilitar formulario)

## Tests

- [ ] Backend: Test que valida SAAS_ADMIN puede crear todos excepto CUSTOMER
- [ ] Backend: Test que valida SAAS_EDITOR no puede crear SAAS roles ni CUSTOMER
- [ ] Backend: Test que valida OWNER solo puede crear MERCHANT_USER
- [ ] Backend: Test que valida que ningún rol puede crear CUSTOMER
- [ ] Backend: Test que valida que SUPERVISOR no puede crear usuarios
- [ ] Backend: Test que valida que MERCHANT_USER no puede crear usuarios

## Verificación

- [ ] Probar crear usuario como SAAS_ADMIN (debe funcionar para todos excepto CUSTOMER)
- [ ] Probar crear CUSTOMER como SAAS_ADMIN (debe fallar con error 403)
- [ ] Probar crear usuario como OWNER (solo MERCHANT_USER debe funcionar)
- [ ] Probar crear usuario como SUPERVISOR (debe fallar con error 403)
- [ ] Verificar que CUSTOMER no aparece en el select del frontend


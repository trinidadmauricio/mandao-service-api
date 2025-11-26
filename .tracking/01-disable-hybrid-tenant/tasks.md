# Tareas: Parte 1 - Deshabilitar HYBRID

## Backend

- [ ] Actualizar `CreateTenantDto.ts`: Cambiar enum a `['RETAIL', 'ON_DEMAND']`
- [ ] Actualizar `ITenantRepository.ts`: Cambiar tipo a `'RETAIL' | 'ON_DEMAND'`
- [ ] Agregar validación en `TenantController.create()`: Rechazar HYBRID con error 400
- [ ] Escribir unit tests para `CreateTenantUseCase` validando rechazo de HYBRID
- [ ] Escribir unit tests para `TenantController` validando rechazo de HYBRID

## Frontend

- [ ] Buscar formulario de creación de tenants
- [ ] Quitar opción HYBRID del select
- [ ] Actualizar `src/types/api.ts`: Cambiar tipo Tenant.type a `'RETAIL' | 'ON_DEMAND'`
- [ ] Actualizar `src/lib/hooks/use-tenant.ts`: Remover referencias a HYBRID
- [ ] Verificar que no haya otros lugares donde se use HYBRID

## Tests

- [ ] Backend: Test que valida rechazo de HYBRID en CreateTenantDto
- [ ] Backend: Test que valida rechazo de HYBRID en TenantController
- [ ] Frontend: Verificar que HYBRID no aparece en el select

## Verificación

- [ ] Verificar que tenant middleware no bloquee cambios
- [ ] Probar creación de tenant RETAIL (debe funcionar)
- [ ] Probar creación de tenant ON_DEMAND (debe funcionar)
- [ ] Probar creación de tenant HYBRID (debe fallar con error 400)


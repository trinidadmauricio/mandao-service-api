# Parte 1: Deshabilitar HYBRID en Creación de Tenants

## Objetivo

Eliminar la opción HYBRID del formulario de creación de tenants y del API, asegurando que solo RETAIL y ON_DEMAND sean opciones válidas.

## Alcance

### Backend
- Actualizar `CreateTenantDto` para excluir HYBRID del enum
- Actualizar `ITenantRepository.CreateTenantData` para excluir HYBRID
- Agregar validación en `TenantController` para rechazar HYBRID si se intenta crear

### Frontend
- Quitar opción HYBRID del select en el formulario de creación de tenants
- Actualizar tipos TypeScript para excluir HYBRID

### Tests
- Unit tests para validaciones de tenant type
- Tests para verificar que HYBRID es rechazado

## Archivos a Modificar

### Backend
- `src/domains/shared/tenants/application/dto/CreateTenantDto.ts`
- `src/domains/shared/tenants/domain/repositories/ITenantRepository.ts`
- `src/domains/shared/tenants/presentation/controllers/TenantController.ts`

### Frontend
- Formulario de creación de tenants (buscar en componentes)
- `src/types/api.ts` (actualizar tipo Tenant)
- `src/lib/hooks/use-tenant.ts` (actualizar tipo)

## Consideraciones

- El enum en Prisma schema puede mantener HYBRID para compatibilidad con datos existentes
- Solo se deshabilita la creación de nuevos tenants HYBRID
- Los tenants HYBRID existentes seguirán funcionando


# Parte 3: Agregar Rol DRIVER al Sistema

## Objetivo

Agregar el rol DRIVER al enum UserRole en Prisma schema y en las constants del sistema, asegurando que DRIVER no tenga permisos en el backoffice.

## Alcance

### Backend
- Actualizar Prisma schema: Agregar DRIVER al enum UserRole
- Crear migración de Prisma
- Actualizar constants en backend (permissions.ts)
- Verificar que DRIVER no tenga permisos en backoffice

### Frontend
- Actualizar constants en frontend (roles.ts)
- Verificar que DRIVER no aparezca en opciones de creación de usuarios

### Tests
- Tests para validar que DRIVER no tiene permisos
- Tests para validar que DRIVER no puede acceder al backoffice

## Archivos a Modificar

### Backend
- `prisma/schema.prisma` (agregar DRIVER al enum UserRole)
- `src/shared/constants/permissions.ts` (agregar DRIVER sin permisos)
- Crear migración de Prisma

### Frontend
- `src/lib/constants/roles.ts` (agregar DRIVER)

## Consideraciones

- DRIVER no tiene permisos en el backoffice (no puede loguearse)
- DRIVER solo puede acceder al link de rastreo público
- DRIVER no tiene tenant_id (puede ser NULL)
- El middleware de tenant no debe bloquear DRIVER


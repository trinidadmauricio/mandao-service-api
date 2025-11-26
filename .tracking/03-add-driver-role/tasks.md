# Tareas: Parte 3 - Agregar Rol DRIVER

## Backend

- [ ] Actualizar `prisma/schema.prisma`: Agregar DRIVER al enum UserRole
- [ ] Crear migración de Prisma: `npx prisma migrate dev --name add_driver_role`
- [ ] Actualizar `src/shared/constants/permissions.ts`: Agregar DRIVER sin permisos (array vacío)
- [ ] Verificar que DRIVER no tenga permisos en backoffice
- [ ] Escribir unit tests para validar que DRIVER no tiene permisos

## Frontend

- [ ] Actualizar `src/lib/constants/roles.ts`: Agregar DRIVER al tipo UserRole
- [ ] Verificar que DRIVER no aparezca en opciones de creación de usuarios

## Tests

- [ ] Backend: Test que valida que DRIVER no tiene permisos
- [ ] Backend: Test que valida que DRIVER no puede acceder al backoffice

## Verificación

- [ ] Verificar que tenant middleware no bloquee DRIVER (puede tener tenant_id = NULL)
- [ ] Verificar que DRIVER no aparece en formularios de creación de usuarios
- [ ] Verificar que migración de Prisma se creó correctamente


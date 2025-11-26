# Tareas: Parte 10 - Actualizar Permisos en Constants

## Tareas Backend

- [ ] Agregar resource 'units-of-measure' al tipo Resource
- [ ] Actualizar ROLE_PERMISSIONS para SAAS_ADMIN (agregar units-of-measure)
- [ ] Actualizar ROLE_PERMISSIONS para SAAS_EDITOR (agregar units-of-measure)
- [ ] Actualizar ROLE_PERMISSIONS para OWNER (agregar units-of-measure, mantener exclusión de módulos SAAS)
- [ ] Actualizar ROLE_PERMISSIONS para MERCHANT_USER (agregar units-of-measure, mantener acceso completo en RETAIL)
- [ ] Actualizar ROLE_PERMISSIONS para LOGISTICS_PROVIDER (verificar permisos de delivery-zones y delivery-rates)
- [ ] Actualizar ROLE_PERMISSIONS para SUPERVISOR (verificar permisos de delivery-zones y delivery-rates)
- [ ] Verificar que DRIVER y CUSTOMER no tengan permisos de backoffice
- [ ] Actualizar funciones helper si es necesario (hasPermission, canAccessResource, getAllowedActions)
- [ ] Verificar consistencia con validaciones de las partes anteriores

## Tareas Frontend

- [ ] Actualizar constants en roles.ts para coincidir con backend
- [ ] Verificar que los guards usen los permisos correctos

## Tareas Tests

- [ ] Unit tests para validar permisos de SAAS_ADMIN
- [ ] Unit tests para validar permisos de SAAS_EDITOR
- [ ] Unit tests para validar permisos de OWNER (con exclusión de módulos SAAS)
- [ ] Unit tests para validar permisos de MERCHANT_USER (RETAIL vs ON_DEMAND)
- [ ] Unit tests para validar permisos de LOGISTICS_PROVIDER
- [ ] Unit tests para validar permisos de SUPERVISOR
- [ ] Unit tests para validar que DRIVER no tiene permisos
- [ ] Unit tests para validar que CUSTOMER no tiene permisos de backoffice
- [ ] Unit tests para validar permisos de units-of-measure

## Verificación Final

- [ ] Verificar que todos los permisos son consistentes con las validaciones de backend
- [ ] Verificar que los permisos son consistentes con las validaciones de frontend
- [ ] Verificar que los tests pasan (cobertura mínima 80%)
- [ ] Verificar que no hay permisos duplicados o conflictivos


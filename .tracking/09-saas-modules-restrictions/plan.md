# Parte 9: Restricciones de Módulos SAAS

## Objetivo

Restringir módulos SAAS (Order Counters, Payments, Subscriptions) solo a roles SAAS, con excepciones específicas para LOGISTICS_PROVIDER/SUPERVISOR.

## Contexto

- **SAAS roles** (SAAS_ADMIN, SAAS_EDITOR): Acceso completo a todos los módulos SAAS sin restricciones
- **LOGISTICS_PROVIDER/SUPERVISOR**: Pueden ver su propio proveedor de logística, pero NO tienen acceso a módulos SAAS generales
- **Otros roles** (OWNER, MERCHANT_USER, etc.): NO tienen acceso a módulos SAAS

## Módulos SAAS a Restringir

1. **Order Counters** (Contadores de Órdenes)
2. **Payments** (Pagos) - excepto pagos de órdenes específicas
3. **Subscriptions** (Suscripciones)
4. **Subscription Plans** (Planes de Suscripción)

## Excepciones

- **LOGISTICS_PROVIDER/SUPERVISOR**: Pueden ver su propio proveedor de logística (ya implementado en Parte 7)
- **Payments de órdenes**: Los usuarios pueden ver pagos de sus propias órdenes (no es módulo SAAS general)

## Estrategia de Implementación

### Backend

1. **Order Counters**:
   - Validar que solo SAAS roles pueden acceder
   - Excepción: OWNER puede ver/actualizar su propio contador (ya tiene requireTenantMiddleware)

2. **Payments**:
   - Validar que solo SAAS roles pueden acceder a `/payments/transactions` (listado general)
   - Permitir acceso a `/payments/orders/:orderId/payments` para usuarios con órdenes (ya validado por tenant)

3. **Subscriptions**:
   - Validar que solo SAAS roles pueden acceder

4. **Subscription Plans**:
   - Validar que solo SAAS roles pueden acceder

### Frontend

1. **Sidebar**:
   - Ocultar "Contadores" para roles no-SAAS
   - Ocultar "Pagos" para roles no-SAAS
   - Ocultar "Suscripción" para roles no-SAAS

2. **Permission Guards**:
   - Validar permisos SAAS antes de mostrar contenido

## Consideraciones Críticas

1. **OWNER puede ver su contador**: Order Counters está atado a tenant, así que OWNER puede ver el suyo
2. **Payments de órdenes**: Los usuarios pueden ver pagos de sus órdenes, pero no el listado general de transacciones
3. **LOGISTICS_PROVIDER/SUPERVISOR**: No tienen tenant, así que no pueden acceder a módulos SAAS que requieren tenant


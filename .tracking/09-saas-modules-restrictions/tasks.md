# Tareas: Parte 9 - Restricciones de Módulos SAAS

## Backend - Order Counters

- [ ] Crear middleware `requireSaasRole` o validar en rutas
- [ ] Validar que solo SAAS roles pueden acceder a GET /order-counters/tenant/:tenant_id (listado general)
- [ ] Permitir OWNER ver su propio contador (ya tiene requireTenantMiddleware)
- [ ] Validar que solo SAAS roles pueden crear contadores (POST /order-counters)
- [ ] Validar que solo SAAS roles pueden actualizar cualquier contador (PATCH /order-counters/tenant/:tenant_id)
- [ ] OWNER puede actualizar su propio contador (ya validado por tenant)
- [ ] Escribir unit tests para validaciones

## Backend - Payments

- [ ] Validar que solo SAAS roles pueden acceder a POST /payments/transactions (crear transacción general)
- [ ] Permitir usuarios ver pagos de sus órdenes (GET /payments/orders/:orderId/payments) - ya validado por tenant
- [ ] Validar que solo SAAS roles pueden acceder a POST /payments/checkout (si es necesario)
- [ ] Validar que solo SAAS roles pueden acceder a POST /payments/refunds (si es necesario)
- [ ] Webhook de Stripe no requiere validación (ya es público)
- [ ] Escribir unit tests para validaciones

## Backend - Subscriptions

- [ ] Validar que solo SAAS roles pueden acceder a todas las rutas de subscriptions
- [ ] Revisar rutas: change-plan, start-trial, convert-trial, limits
- [ ] Escribir unit tests para validaciones

## Backend - Subscription Plans

- [ ] Validar que solo SAAS roles pueden acceder a todas las rutas de subscription-plans
- [ ] Revisar rutas: list, create, get, update, delete
- [ ] Escribir unit tests para validaciones

## Frontend - Sidebar

- [x] Ocultar "Contadores" para roles no-SAAS ✅ (completado en Parte 10)
- [x] Ocultar "Pagos" para roles no-SAAS ✅ (completado en Parte 10)
- [x] Ocultar "Suscripción" para roles no-SAAS ✅ (completado en Parte 10)
- [x] Asegurar que LOGISTICS_PROVIDER/SUPERVISOR no vean módulos SAAS ✅ (completado en Parte 10)

## Frontend - Permission Guards

- [x] Actualizar guards en páginas de Order Counters ✅ (completado en Parte 10 - los guards usan hasPermission que ya excluye módulos SAAS)
- [x] Actualizar guards en páginas de Payments ✅ (completado en Parte 10 - los guards usan hasPermission que ya excluye módulos SAAS)
- [x] Actualizar guards en páginas de Subscriptions ✅ (completado en Parte 10 - los guards usan hasPermission que ya excluye módulos SAAS)
- [x] Redirigir a página de error si intentan acceder sin permisos SAAS ✅ (los guards ya manejan esto automáticamente con hasPermission)

## Verificación

- [ ] Probar que SAAS_ADMIN puede acceder a todos los módulos SAAS
- [ ] Probar que SAAS_EDITOR puede acceder a todos los módulos SAAS
- [ ] Probar que OWNER NO puede acceder a módulos SAAS (excepto su contador)
- [ ] Probar que MERCHANT_USER NO puede acceder a módulos SAAS
- [ ] Probar que LOGISTICS_PROVIDER/SUPERVISOR NO pueden acceder a módulos SAAS
- [ ] Probar que OWNER puede ver su propio contador


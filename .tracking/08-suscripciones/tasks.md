# Tareas - Suscripciones

## Tareas de Subscription Plans

- [x] Crear tabla SubscriptionPlans (ya existe en schema)
- [x] Definir planes predefinidos (básico, pro, enterprise) - en schema
- [x] CRUD de planes custom (ya implementado)
- [x] Precios en múltiples currencies (currency en schema)
- [ ] Tests unitarios

## Tareas de Límites por Plan

- [x] Definir límites (productos, órdenes, branches) - en schema
- [x] Almacenar límites en plan (max_products, max_orders_month, max_branches)
- [x] Validar límites (SubscriptionLimitService)
- [ ] Tests unitarios

## Tareas de Upgrade/Downgrade

- [x] Implementar cambio de plan (ChangeTenantPlanUseCase)
- [x] Aplicar cambios inmediatamente
- [x] Validar compatibilidad (validación de plan existe)
- [ ] Tests unitarios

## Tareas de Billing Recurrente

- [x] Implementar billing mensual (BillingService.renewSubscription)
- [x] Implementar billing anual (BillingService.renewSubscription)
- [x] Currency del tenant (en Tenant entity)
- [ ] Tests unitarios

## Tareas de Enforcement de Límites

- [x] Middleware de enforcement (checkProductLimit, checkBranchLimit, checkOrderLimit)
- [x] Validar en creación de recursos (middleware listo para usar)
- [x] Mensajes de error traducidos (i18n en middleware)
- [ ] Tests unitarios

## Tareas de Trial Periods

- [x] Implementar trial periods (StartTrialUseCase)
- [x] Expiración automática (BillingService.suspendExpiredSubscriptions)
- [x] Conversión a plan pago (ConvertTrialToPaidUseCase)
- [ ] Tests unitarios

## Tareas de Testing

- [ ] Tests unitarios Subscription Plans
- [ ] Tests unitarios Límites
- [ ] Tests unitarios Upgrade/Downgrade
- [ ] Tests unitarios Billing
- [ ] Verificar coverage >80%


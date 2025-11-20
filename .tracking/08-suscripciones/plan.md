# Sub-plan 08: Suscripciones

## Objetivo

Implementar sistema de planes de suscripción y billing recurrente para monetización de la plataforma.

## Alcance

- Planes de suscripción (3 tiers + custom)
- Límites por plan
- Upgrade/downgrade
- Billing recurrente
- Enforcement de límites
- Trial periods
- Multi-currency en precios

## Entregables

1. **Subscription Plans**
   - Planes predefinidos (básico, pro, enterprise)
   - Planes custom
   - Precios en múltiples currencies
   - Límites por plan

2. **Límites por Plan**
   - Productos máximos
   - Órdenes máximas
   - Branches máximas
   - Features habilitadas

3. **Upgrade/Downgrade**
   - Cambio de plan
   - Aplicación inmediata
   - Prorating (opcional futuro)

4. **Billing Recurrente**
   - Billing mensual/anual
   - Currency del tenant
   - Integración con Stripe (futuro)

5. **Enforcement de Límites**
   - Validación en creación de recursos
   - Middleware de enforcement
   - Mensajes de error

6. **Trial Periods**
   - Períodos de prueba
   - Expiración automática
   - Conversión a plan pago

## Criterios de Éxito

- ✓ Límites respetados por plan
- ✓ Upgrade inmediato funciona
- ✓ Billing automático mensual/anual
- ✓ Precios mostrados en currency del tenant
- ✓ Trial periods funcionan

## Duración Estimada

2 semanas (Semanas 13-14)

## Dependencias

- Sub-plan 01: Setup y Fundación
- Sub-plan 07: Pagos (para billing futuro)

## Riesgos

- Lógica de límites puede ser compleja
- Upgrade/downgrade puede tener edge cases
- Billing recurrente requiere integración externa


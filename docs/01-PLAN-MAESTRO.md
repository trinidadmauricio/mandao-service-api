# Plan Maestro - Sistema de Delivery Multi-Tenant

## Visión General

Sistema SaaS de gestión de entregas con dos modelos de operación:
- **Retail (E-commerce + Delivery):** Gestión de catálogo, storefront y entregas
- **On-Demand (Last-Mile):** Creación de órdenes en tiempo real sin catálogo

## Objetivos del Proyecto

### Funcionales
- ✅ Autenticación OAuth2 propia (sin proveedores externos)
- ✅ Multi-tenancy con aislamiento completo
- ✅ Gestión de órdenes con inmutabilidad (solo inserts)
- ✅ Correlativos por merchant con concurrencia segura
- ✅ Catálogo de productos con variants
- ✅ Tracking público de órdenes
- ✅ Sistema de pagos con Stripe
- ✅ Planes de suscripción (básico, pro, enterprise, custom)
- ✅ Reportería y analytics

### No Funcionales
- ✅ TDD obligatorio (cobertura mínima 80%)
- ✅ Seguridad sin over-engineering
- ✅ Escalabilidad horizontal
- ✅ Performance optimizado con Prisma
- ✅ Auditoría completa con inmutabilidad

## Principios Arquitectónicos

### 1. Vertical Slicing
- Cada feature es una slice completa (controller → service → repository)
- Deploy independiente de features
- Testing aislado por slice

### 2. Inmutabilidad en Órdenes
- Órdenes y sus relaciones son append-only
- Cambios generan nuevos registros con versión
- Facilita auditoría y reconstrucción de estado

**Excepción: UPDATE de Status**
- El único UPDATE permitido en la tabla `Order` es el campo `status` (y opcionalmente `cancellation_reason`)
- Razón: El estado de la orden debe reflejarse en tiempo real y no requiere historial de versiones
- El historial de cambios de estado se maneja en la tabla `OrderStatusHistory` (append-only)
- Validación: Las transiciones de estado se validan usando `OrderStateMachine`
- Uso: Siempre usar `UpdateOrderStatusUseCase` que incluye validación y creación de historial
- Otros campos: Todos los demás campos de `Order` y sus relaciones (drivers, branches, items, totals) son inmutables

### 3. Multi-Schema Database
- `shared`: Tenants, users, auth
- `delivery`: Órdenes, drivers, logística
- `retail`: Productos, inventario, storefront

### 4. Clean Code Practices
- SOLID principles
- Dependency injection
- Separation of concerns
- Interface-based design

## Alcance del MVP

### Incluido en MVP
- ✅ OAuth2 completo (3 flows)
- ✅ CRUD completo de entidades base
- ✅ Órdenes on-demand y retail
- ✅ Tracking público
- ✅ Pagos con Stripe (checkout básico)
- ✅ Planes de suscripción predefinidos
- ✅ Reportes básicos (órdenes, inventario)
- ✅ Gestión de drivers y vehículos
- ✅ Productos con variants

### Fuera del MVP (Post-Launch)
- ⏸ Real-time tracking con websockets
- ⏸ Notificaciones push mobile
- ⏸ Machine learning para asignación de drivers
- ⏸ Gamificación para drivers
- ⏸ Programa de referidos
- ⏸ Multi-currency
- ⏸ Multi-language

## Roadmap de Implementación

### Fase 1: Fundación + OAuth (Semanas 1-3)
**Objetivo:** Base sólida con autenticación propia

**Entregables:**
- Setup proyecto (Node.js + TypeScript + Prisma)
- Schemas DB (shared, delivery, retail)
- OAuth2 completo (3 flows)
- Gestión de clients OAuth
- Login/registro tradicional
- Email verification
- Password reset
- Tenant isolation middleware
- CRUD tenants y users

**Criterios de Éxito:**
- ✓ Tests unitarios OAuth pasan (coverage >80%)
- ✓ Authorization Code Flow funciona E2E
- ✓ Refresh token rotation implementado
- ✓ Tenant isolation verificado

---

### Fase 2: Correlativos + Logística Base (Semanas 4-5)
**Objetivo:** Sistema de numeración y entidades logísticas

**Entregables:**
- Tabla order_counters
- OrderNumberService con concurrencia
- CRUD logistics providers
- CRUD drivers con asignación de vehículos
- CRUD vehicles
- Delivery zones y rates
- Calculadora de costos

**Criterios de Éxito:**
- ✓ 100 requests concurrentes generan correlativos únicos
- ✓ Reset de contador funciona
- ✓ Driver puede tener vehículo propio o asignado

---

### Fase 3: Órdenes Inmutables (Semanas 6-8)
**Objetivo:** Core de órdenes con arquitectura inmutable

**Entregables:**
- Schema completo orders + pivots
- Crear orden on-demand
- Crear orden retail
- Asignar/cambiar driver (inmutable)
- Cambiar branch (inmutable)
- Modificar items + recalcular totals
- Status transitions
- Order tracking público
- Delivery proofs
- Rating system

**Criterios de Éxito:**
- ✓ Historial completo de cambios recuperable
- ✓ Snapshot de orden en fecha X funciona
- ✓ Tracking público sin auth
- ✓ Estado transitions validados

---

### Fase 4: Retail + Variants (Semanas 9-11)
**Objetivo:** E-commerce completo

**Entregables:**
- CRUD productos con variants
- Gestión de stock por variant + branch
- Movimientos de inventario
- Stock reservations
- Storefront provisioning
- Theme configurator
- Checkout flow
- Integración orden retail → delivery

**Criterios de Éxito:**
- ✓ Producto con 3 variants funciona
- ✓ Stock por branch correcto
- ✓ Checkout reserva stock
- ✓ Cancelación libera stock

---

### Fase 5: Pagos (Semana 12)
**Objetivo:** Monetización de órdenes

**Entregables:**
- Payment transactions independientes
- Stripe Checkout Session
- Webhook handler con signature verification
- Payment status tracking
- Refunds

**Criterios de Éxito:**
- ✓ Pago exitoso → orden confirmed
- ✓ Pago fallido → orden cancelled
- ✓ Refund parcial funciona
- ✓ Webhooks manejados correctamente

---

### Fase 6: Suscripciones (Semanas 13-14)
**Objetivo:** Monetización de plataforma

**Entregables:**
- Planes de suscripción (3 tiers + custom)
- Límites por plan (productos, órdenes, branches)
- Upgrade/downgrade
- Billing recurrente
- Enforcement de límites
- Trial periods

**Criterios de Éxito:**
- ✓ Límites respetados por plan
- ✓ Upgrade inmediato
- ✓ Billing automático mensual/anual

---

### Fase 7: Reportería (Semana 15)
**Objetivo:** Analytics para merchants

**Entregables:**
- Reporte de órdenes con filtros
- Export a CSV
- Reporte de inventario
- Reporte de drivers (performance)
- Dashboard con KPIs
- Scheduled reports (opcional)

**Criterios de Éxito:**
- ✓ Export de 10k+ órdenes en <5s
- ✓ Filtros combinados funcionan
- ✓ Dashboard carga en <2s

---

### Fase 8: Optimización & Deploy (Semana 16)
**Objetivo:** Production-ready

**Entregables:**
- Performance audit
- Load testing (1000 RPS)
- Security audit
- Monitoring (Sentry + Datadog)
- CI/CD pipeline
- Documentation (OpenAPI/ReDoc)
- Deployment a staging
- Deployment a production

**Criterios de Éxito:**
- ✓ Load test pasa con 1000 RPS
- ✓ Security scan sin vulnerabilidades críticas
- ✓ Zero-downtime deployment
- ✓ Monitoring alerts configurados

---

## Métricas de Éxito

### Performance
- API response time p95 < 200ms
- DB queries < 100ms p95
- Uptime > 99.9%

### Quality
- Test coverage > 80%
- Zero critical security vulnerabilities
- Code review approval antes de merge

### Business
- MVP completo en 16 semanas
- 10 merchants en beta al final del MVP
- <5% churn rate en beta

## Riesgos y Mitigaciones

### Riesgo 1: Complejidad de Inmutabilidad
**Impacto:** Alto
**Probabilidad:** Media
**Mitigación:**
- Documentación exhaustiva de patrones
- Helper functions para queries comunes
- Views materializadas para performance

### Riesgo 2: Concurrencia en Correlativos
**Impacto:** Alto
**Probabilidad:** Media
**Mitigación:**
- Tests de carga desde Fase 2
- Row-level locks en DB
- Retry logic

### Riesgo 3: OAuth2 Custom
**Impacto:** Medio
**Probabilidad:** Baja
**Mitigación:**
- Seguir RFC 6749 estrictamente
- Security audit temprano
- Tests exhaustivos de flows

### Riesgo 4: Scope Creep
**Impacto:** Alto
**Probabilidad:** Alta
**Mitigación:**
- MVP estrictamente definido
- Features post-launch claramente separadas
- Review semanal de prioridades

## Equipo Requerido

### Para MVP (16 semanas)
- 1 Full-Stack Lead (OAuth, core architecture)
- 1 Backend Developer (órdenes, payments)
- 1 Frontend Developer (dashboard, storefront)
- 1 QA Engineer (testing strategy, automation)
- 0.5 DevOps (CI/CD, monitoring)

### Post-MVP
- +1 Backend Developer (features avanzadas)
- +1 Mobile Developer (apps nativas)
- 1 Product Manager (roadmap, priorización)

## Stack Decisiones

### Backend
- **Node.js + TypeScript:** Type safety, ecosistema maduro
- **Express:** Ligero, flexible, bien documentado
- **Prisma:** ORM moderno, multi-schema, migrations
- **PostgreSQL:** Robusto, JSONB, geografía
- **Redis:** Caching, sessions, rate limiting
- **BullMQ:** Job queues

### Testing
- **Jest:** Unit tests
- **Supertest:** Integration tests
- **Testcontainers:** DB tests aislados

### Deployment
- **Docker:** Containerización
- **GitHub Actions:** CI/CD
- **Railway/Render:** Hosting inicial
- **AWS/GCP:** Scaling futuro

## Siguientes Pasos

1. ✅ Revisar y aprobar plan maestro
2. → Configurar repositorio y proyecto base
3. → Implementar Fase 1: OAuth
4. → Demos semanales con stakeholders
5. → Iteración basada en feedback

---

**Última actualización:** 2024-01-15
**Versión:** 1.0

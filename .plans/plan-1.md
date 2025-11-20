# Plan Maestro - Sistema de Delivery Multi-Tenant (Backend Core)

## Visión General

Sistema SaaS de gestión de entregas con dos modelos de operación:

- **Retail (E-commerce + Delivery):** Gestión de catálogo, storefront, ecommerce completo. Las órdenes ingresan al sistema y se entregan usando proveedores logísticos.
- **On-Demand (Last-Mile):** Creación de órdenes en tiempo real sin catálogo previamente registrado. Solo last-mile delivery usando los mismos proveedores logísticos.

**Arquitectura:** Monolito modular preparado para extracción. Retail puede extraerse como servicio independiente sin reescribir código.

## Objetivos del Proyecto

### Funcionales

- ✅ Autenticación OAuth2 propia (sin proveedores externos)
- ✅ Multi-tenancy con aislamiento completo
- ✅ Gestión de órdenes con inmutabilidad (solo inserts)
- ✅ Correlativos por merchant con concurrencia segura
- ✅ Catálogo de productos con variants (solo Retail)
- ✅ Tracking público de órdenes
- ✅ Sistema de pagos con Stripe
- ✅ Planes de suscripción (básico, pro, enterprise, custom)
- ✅ Reportería y analytics
- ✅ Proveedores logísticos con flota de drivers (compartido)
- ✅ Multi-currency (soporte múltiples monedas)
- ✅ Multi-language (i18n para API y mensajes)

### No Funcionales

- ✅ TDD obligatorio (cobertura mínima 80% con unit tests)
- ✅ Seguridad sin over-engineering
- ✅ Escalabilidad horizontal
- ✅ Performance optimizado con Prisma
- ✅ Auditoría completa con inmutabilidad
- ✅ **Preparado para extracción de Retail como servicio independiente**
- ✅ **Comunicación desacoplada entre dominios**

## Principios Arquitectónicos

### 1. Monolito Modular (Modular Monolith)

- Estructura modular que permite extracción futura
- Dominios independientes con interfaces bien definidas
- Comunicación a través de interfaces/clients, no dependencias directas
- Cada dominio puede escalarse independientemente cuando se extraiga

### 2. Inmutabilidad en Órdenes

- Órdenes y sus relaciones son append-only (solo INSERT, nunca UPDATE ni DELETE)
- **Todos los cambios generan nuevos registros siguiendo el mismo patrón:**
  - **Cambio de driver:**
    - INSERT nuevo order_drivers (is_current = true)
    - Marcar anteriores como is_current = false
    - No UPDATE de registros existentes
  - **Cambio de branch:**
    - INSERT nuevo order_branches (is_current = true)
    - Marcar anteriores como is_current = false
    - No UPDATE de registros existentes
  - **Modificación de items (agregar, remover, cambiar cantidad):**
    - INSERT todos los order_items de la nueva versión completa
    - Cada modificación genera una nueva "versión" completa de items
    - Mantener todos los items anteriores (historial completo)
    - No UPDATE ni DELETE de items existentes
    - Ejemplo: Orden con 3 items, modificas cantidad de 1 → INSERT los 3 items nuevamente (con cantidad actualizada)
    - Ejemplo: Orden con 3 items, agregas 1 nuevo → INSERT los 4 items (3 anteriores + 1 nuevo)
    - Ejemplo: Orden con 3 items, remueves 1 → INSERT los 2 items restantes
  - **Recalculo de totals:**
    - INSERT nuevo order_summary_totals (is_current = true)
    - Marcar anterior como is_current = false
    - No UPDATE de registros existentes
- Historial completo preservado para auditoría
- Facilita reconstrucción de estado en cualquier punto en el tiempo

### 3. Multi-Schema Database

- `shared`: Tenants, SubscriptionPlans, Users, Branches, OrderCounters, OAuth, AuditLogs, PaymentTransactions
- `delivery`: Orders (RETAIL y ON_DEMAND), Drivers, Vehicles, LogisticsProviders, DeliveryZones, DeliveryRates, OrderBranches, OrderDrivers, OrderItems, OrderSummaryTotals, OrderStatusHistory, OrderDeliveryProofs, DeliveryRatings, OrderPaymentTransactions
- `retail`: Products, ProductVariants, Categories, Brands, InventoryMovements, StockByBranch, Storefronts

**Nota:** PaymentTransaction en `shared`, relación many-to-many con Order a través de OrderPaymentTransaction.

**Multi-currency:**

- Currency almacenado en Tenant (default_currency: USD, EUR, etc.)
- Currency en OrderSummaryTotal, PaymentTransaction
- Productos pueden tener precios en currency del tenant
- Conversión de currency opcional (usando rates externos o fijos)

**Multi-language:**

- Locale almacenado en Tenant (default_locale: es, en, etc.)
- Traducciones en archivos JSON (i18n)
- Mensajes de API, errores y validaciones traducidos
- Headers Accept-Language para selección de idioma

### 4. Clean Code Practices

- SOLID principles
- Dependency Injection con InversifyJS
- Separation of concerns
- Interface-based design

### 5. Desacoplamiento para Extracción

- **Domain Interfaces:** Contratos claros entre dominios
- **Event Bus Simple:** Comunicación asíncrona ligera (BullMQ)
- **API Clients:** Interfaces para comunicación entre dominios
- **Shared Contracts:** DTOs y tipos compartidos
- Retail puede extraerse cambiando solo la implementación del client de delivery

## Estructura de Dominios (Preparada para Extracción)

```
src/
├── domains/
│   ├── retail/                        # Dominio Retail (Extraíble)
│   │   ├── products/
│   │   ├── inventory/
│   │   ├── catalog/
│   │   ├── storefront/
│   │   └── clients/
│   │       ├── IDeliveryClient.ts
│   │       └── DeliveryClient.ts
│   │
│   ├── delivery/                     # Dominio Delivery (Core)
│   │   ├── orders/
│   │   ├── drivers/
│   │   ├── vehicles/
│   │   ├── logistics-providers/
│   │   ├── delivery-zones/
│   │   ├── tracking/
│   │   └── events/
│   │       └── OrderCreatedEvent.ts
│   │
│   └── shared/                         # Código compartido
│       ├── auth/
│       ├── tenants/
│       ├── users/
│       ├── payments/
│       ├── subscriptions/
│       ├── reports/
│       ├── i18n/                       # Multi-language
│       │   ├── locales/
│       │   │   ├── es/
│       │   │   └── en/
│       │   └── I18nService.ts
│       ├── currency/                   # Multi-currency
│       │   ├── CurrencyService.ts
│       │   └── currency.types.ts
│       ├── events/
│       │   ├── EventBus.ts
│       │   └── EventHandler.ts
│       └── contracts/
│           ├── order.contracts.ts
│           └── payment.contracts.ts
│
├── config/
├── server.ts
└── app.ts
```

## Alcance del MVP

### Incluido en MVP

- ✅ OAuth2 completo (3 flows)
- ✅ CRUD completo de entidades base
- ✅ Órdenes on-demand (dominio delivery)
- ✅ Órdenes retail (dominio retail → delivery)
- ✅ Storefront API (dominio retail, backend solamente)
- ✅ Tracking público (dominio delivery)
- ✅ Pagos con Stripe (checkout básico)
- ✅ Planes de suscripción predefinidos
- ✅ Reportes básicos (órdenes, inventario)
- ✅ Gestión de drivers y vehículos (dominio delivery, compartido)
- ✅ Proveedores logísticos (dominio delivery, compartido)
- ✅ Productos con variants (dominio retail)
- ✅ Multi-currency (soporte múltiples monedas en precios, pagos, órdenes)
- ✅ Multi-language (i18n para mensajes de API, validaciones, errores)

### Fuera del MVP (Post-Launch)

- ⏸ Real-time tracking con websockets
- ⏸ Notificaciones push mobile
- ⏸ Machine learning para asignación de drivers
- ⏸ Gamificación para drivers
- ⏸ Programa de referidos

## Roadmap de Implementación

### Fase 1: Fundación + OAuth (Semanas 1-3)

**Objetivo:** Base sólida con autenticación propia y estructura modular

**Entregables:**

- Setup proyecto (Node.js + TypeScript + Prisma)
- Estructura de dominios (retail, delivery, shared)
- Schemas DB (shared, delivery, retail) - todas las tablas
- **Arquitectura modular:**
  - Interfaces entre dominios definidas
  - Event bus simple (BullMQ básico)
  - Contracts compartidos
- **Multi-language setup:**
  - i18next library configurado
  - Locale middleware (Accept-Language header)
  - Traducciones base (es, en)
  - Mensajes de error y validación traducidos
  - Locale en tenant (default_locale)
- **Multi-currency setup:**
  - Currency enum (USD, EUR, MXN, etc.)
  - Currency en tenant (default_currency)
  - CurrencyService para formato y validación
  - Helpers para conversión (opcional, rates fijos inicialmente)
- InversifyJS container configurado con bindings por dominio
- OAuth2 completo (3 flows) - dominio shared
- Gestión de clients OAuth
- Login/registro tradicional
- Email verification
- Password reset
- Tenant isolation middleware
- CRUD tenants, subscription plans, users, branches, order counters

**Criterios de Éxito:**

- ✓ Tests unitarios OAuth pasan (coverage >80%)
- ✓ Authorization Code Flow funciona
- ✓ Refresh token rotation implementado
- ✓ Tenant isolation verificado
- ✓ InversifyJS container funcionando
- ✓ Estructura modular establecida
- ✓ Interfaces entre dominios definidas
- ✓ i18n funciona con Accept-Language header
- ✓ Currency puede configurarse por tenant

---

### Fase 2: Delivery Base - Proveedores y Drivers (Semanas 4-5)

**Objetivo:** Sistema de delivery compartido (proveedores, drivers, vehículos)

**Entregables:**

- Tabla order_counters (shared)
- OrderNumberService con concurrencia (shared)
- CRUD logistics providers (dominio delivery, compartido)
- CRUD drivers (dominio delivery, compartido)
- CRUD vehicles (dominio delivery, compartido)
- Delivery zones y rates (dominio delivery)
  - Rates con currency del tenant
- Calculadora de costos (dominio delivery)
  - Respeta currency del tenant

**Criterios de Éxito:**

- ✓ 100 requests concurrentes generan correlativos únicos
- ✓ Reset de contador funciona
- ✓ Driver puede tener vehículo propio o asignado
- ✓ Proveedores logísticos pueden gestionar su flota
- ✓ Drivers disponibles para ambos tipos de órdenes
- ✓ Rates y costos en currency correcta

---

### Fase 3: Órdenes Delivery (Semanas 6-8)

**Objetivo:** Core de órdenes inmutable (RETAIL y ON_DEMAND)

**Entregables:**

- Schema completo orders + pivots (delivery schema)
- **CreateOnDemandOrderUseCase** (dominio delivery)
  - order_type: ON_DEMAND
  - Sin productos previamente registrados
  - Currency del tenant
- **CreateRetailOrderUseCase** (dominio delivery)
  - order_type: RETAIL
  - Con product_snapshot
  - Currency del tenant
  - Recibe llamada desde retail domain
- **IDeliveryClient interface** definida
- **Patrón inmutable para todos los cambios (solo INSERT, nunca UPDATE ni DELETE):**
  - **Asignar/cambiar driver (inmutable):**
    - INSERT nuevo order_drivers (is_current = true)
    - Marcar anteriores como is_current = false
    - No UPDATE de registros existentes
  - **Cambiar branch (inmutable):**
    - INSERT nuevo order_branches (is_current = true)
    - Marcar anteriores como is_current = false
    - No UPDATE de registros existentes
  - **Modificar items (inmutable - mismo patrón que branches y drivers):**
    - INSERT todos los order_items de la nueva versión completa
    - Cada modificación (agregar, remover, cambiar cantidad) genera una nueva versión completa
    - Mantener todos los items anteriores (historial completo)
    - No UPDATE ni DELETE de items existentes
    - Ejemplos:
      - Orden con items [A, B, C], cambias cantidad de A → INSERT [A(nueva cantidad), B, C]
      - Orden con items [A, B, C], agregas D → INSERT [A, B, C, D]
      - Orden con items [A, B, C], remueves B → INSERT [A, C]
  - **Recalcular totals (inmutable):**
    - INSERT nuevo order_summary_totals (is_current = true, version incrementado)
    - Marcar anterior como is_current = false
    - No UPDATE de registros existentes
- Status transitions
- Order tracking público
  - Mensajes en idioma solicitado
- Delivery proofs
- Rating system
- **Eventos:** OrderCreatedEvent, OrderStatusChangedEvent

**Criterios de Éxito:**

- ✓ Historial completo de cambios recuperable
- ✓ Snapshot de orden en fecha X funciona
- ✓ Tracking público sin auth
- ✓ Estado transitions validados
- ✓ Órdenes on-demand funcionan
- ✓ IDeliveryClient interface definida y testeable
- ✓ Órdenes almacenan currency correcta
- ✓ Tracking muestra mensajes en idioma correcto
- ✓ Cambio de driver: nuevo registro, anteriores marcados is_current = false
- ✓ Cambio de branch: nuevo registro, anteriores marcados is_current = false
- ✓ Modificación de items: INSERT de todos los items de la nueva versión (insert only)
- ✓ Agregar producto: INSERT todos los items incluyendo el nuevo
- ✓ Remover producto: INSERT todos los items sin el removido
- ✓ Cambiar cantidad: INSERT todos los items con la cantidad actualizada
- ✓ Items anteriores preservados para historial (sin UPDATE ni DELETE)
- ✓ Recalculo de totals: nuevo registro, anterior marcado is_current = false
- ✓ Historial completo de items recuperable (todas las versiones preservadas)
- ✓ Mismo patrón que branches y drivers: cada cambio = nueva versión completa

---

### Fase 4: Retail - Productos y Storefront API (Semanas 9-11)

**Objetivo:** E-commerce completo (dominio retail, backend API solamente)

**Entregables:**

- CRUD productos con variants (dominio retail)
  - Precios en currency del tenant
  - Descripciones multi-language (JSONB o tabla separada)
  - Nombres y descripciones traducibles
- Gestión de stock por variant + branch (dominio retail)
- Movimientos de inventario (dominio retail)
- Stock reservations (dominio retail)
- Storefront API endpoints (dominio retail, backend solamente)
  - GET /api/v1/storefront/products?locale=es&currency=USD
  - GET /api/v1/storefront/products/:id?locale=es&currency=USD
  - POST /api/v1/storefront/checkout
  - Respuestas en idioma solicitado (locale)
  - Precios en moneda solicitada (currency)
  - Validación de currency válida
- Theme configurator API (dominio retail)
- **DeliveryClient implementación** (llama a delivery domain)
- **Integración retail → delivery:**
  - CreateRetailOrderUseCase en retail usa IDeliveryClient
  - Verificación de stock antes de crear orden
  - Reserva de stock al crear orden
  - Liberación de stock si orden se cancela
  - Currency se pasa a delivery

**Criterios de Éxito:**

- ✓ Producto con 3 variants funciona
- ✓ Stock por branch correcto
- ✓ Checkout reserva stock
- ✓ Cancelación libera stock
- ✓ Storefront API funciona (backend solamente)
- ✓ Órdenes retail se crean correctamente en delivery
- ✓ DeliveryClient puede intercambiarse (preparado para extracción)
- ✓ Productos muestran precios en currency solicitada
- ✓ Productos muestran descripciones en idioma solicitado
- ✓ Validación de currency en checkout

---

### Fase 5: Pagos (Semana 12)

**Objetivo:** Monetización de órdenes (Retail y On-Demand) - dominio shared

**Entregables:**

- Tabla PaymentTransaction en schema `shared`
- Tabla pivot OrderPaymentTransaction en schema `delivery`
- CRUD PaymentTransaction (dominio shared)
- CRUD OrderPaymentTransaction
- **Multi-currency en pagos:**
  - Currency en PaymentTransaction (debe coincidir con orden)
  - Currency en OrderSummaryTotal
  - Stripe soporta múltiples monedas
  - Validación de currency entre orden y pago
  - Stripe Checkout Session con currency correcta
- Stripe Checkout Session (con currency del tenant)
- Webhook handler con signature verification
- Payment status tracking
- Refunds (en currency original)
- Historial de transacciones por orden
- Interfaces para que delivery y retail consuman el servicio de pagos
- Mensajes de error de pago traducidos

**Criterios de Éxito:**

- ✓ Pago exitoso → orden confirmed + PaymentTransaction creada
- ✓ Pago fallido → orden cancelled + PaymentTransaction con status FAILED
- ✓ Refund parcial funciona
- ✓ Webhooks manejados correctamente
- ✓ Historial completo de transacciones por orden recuperable
- ✓ Pagos funcionan tanto para órdenes Retail como On-Demand
- ✓ Currency validada entre orden y pago
- ✓ Stripe recibe currency correcta
- ✓ Mensajes de error en idioma correcto

---

### Fase 6: Suscripciones (Semanas 13-14)

**Objetivo:** Monetización de plataforma (dominio shared)

**Entregables:**

- Planes de suscripción (3 tiers + custom)
  - Precios en múltiples currencies
- Límites por plan (productos, órdenes, branches)
- Upgrade/downgrade
- Billing recurrente
  - Currency del tenant
- Enforcement de límites
- Trial periods
- Mensajes de suscripción traducidos

**Criterios de Éxito:**

- ✓ Límites respetados por plan
- ✓ Upgrade inmediato
- ✓ Billing automático mensual/anual
- ✓ Precios mostrados en currency del tenant

---

### Fase 7: Reportería (Semana 15)

**Objetivo:** Analytics para merchants (dominio shared)

**Entregables:**

- Reporte de órdenes con filtros (consulta delivery schema)
  - Filtros por currency
  - Agrupación por currency
  - Totales en currency del tenant
- Export a CSV
  - Columnas en idioma solicitado
  - Valores en currency del tenant
  - Headers traducidos
- Reporte de inventario (dominio retail)
  - Valores en currency del tenant
- Reporte de drivers (performance) (dominio delivery)
  - Mensajes en idioma solicitado
- Dashboard API con KPIs (backend solamente)
  - Respuestas en idioma solicitado
  - Valores monetarios en currency del tenant
  - Labels y descripciones traducidos
- Scheduled reports (opcional)

**Criterios de Éxito:**

- ✓ Export de 10k+ órdenes en <5s
- ✓ Filtros combinados funcionan
- ✓ Dashboard API carga en <2s
- ✓ Reportes en idioma correcto
- ✓ Valores monetarios en currency correcta

---

### Fase 8: Optimización (Semana 16)

**Objetivo:** Production-ready

**Entregables:**

- Performance audit
- Load testing (1000 RPS)
- Security audit
- Documentation (OpenAPI/ReDoc)
- Docker y Docker Compose configurados

**Criterios de Éxito:**

- ✓ Load test pasa con 1000 RPS
- ✓ Security scan sin vulnerabilidades críticas
- ✓ Docker compose funciona correctamente

---

## Estrategia de Extracción Futura

### Extracción de Retail Domain

**Preparación (Ya en MVP):**

- ✅ IDeliveryClient interface definida
- ✅ DeliveryClient implementación intercambiable
- ✅ Contracts compartidos (DTOs)
- ✅ Event bus simple para desacoplamiento

**Pasos para Extracción:**

1. Extraer retail domain a servicio independiente
2. Cambiar DeliveryClient a HTTP client
3. Configurar API Gateway si es necesario
4. Mantener contracts compartidos (npm package o git submodule)
5. Sin cambios en delivery domain

**Beneficios:**

- Retail puede escalar independientemente
- Deploy independiente
- Tecnología diferente si es necesario (futuro)

### Escalabilidad Horizontal

**Monolito Actual:**

- Múltiples instancias detrás de load balancer
- Shared database (PostgreSQL)
- Redis compartido para cache/sessions

**Futuro (Microservicios):**

- Delivery service: múltiples instancias
- Retail service: múltiples instancias (extraído)
- Shared services: auth, payments, subscriptions
- API Gateway para routing

## Métricas de Éxito

### Performance

- API response time p95 < 200ms
- DB queries < 100ms p95
- Uptime > 99.9%

### Quality

- Test coverage > 80% (solo unit tests)
- Zero critical security vulnerabilities
- Code review approval antes de merge

### Business

- MVP completo en 16 semanas
- 10 merchants en beta al final del MVP
- <5% churn rate en beta

### Arquitectura

- Dominio retail completamente separado
- Dominio delivery compartido entre retail y on-demand
- Interfaces bien definidas para extracción futura
- Sin acoplamiento directo entre dominios

## Riesgos y Mitigaciones

### Riesgo 1: Complejidad de Inmutabilidad

**Impacto:** Alto

**Probabilidad:** Media

**Mitigación:**

- Documentación exhaustiva de patrones
- Helper functions para queries comunes
- Views materializadas para performance
- Queries optimizadas para obtener solo items actuales cuando sea necesario
- Índices apropiados en order_items (order_id, created_at)

### Riesgo 2: Concurrencia en Correlativos

**Impacto:** Alto

**Probabilidad:** Media

**Mitigación:**

- Tests unitarios de concurrencia desde Fase 2
- Row-level locks en DB
- Retry logic

### Riesgo 3: OAuth2 Custom

**Impacto:** Medio

**Probabilidad:** Baja

**Mitigación:**

- Seguir RFC 6749 estrictamente
- Security audit temprano
- Tests unitarios exhaustivos de flows

### Riesgo 4: Scope Creep

**Impacto:** Alto

**Probabilidad:** Alta

**Mitigación:**

- MVP estrictamente definido
- Features post-launch claramente separadas
- Review semanal de prioridades

### Riesgo 5: Acoplamiento entre Dominios

**Impacto:** Alto

**Probabilidad:** Media

**Mitigación:**

- Interfaces bien definidas (IDeliveryClient)
- Dependency inversion principle
- Tests de integración entre dominios
- Event bus para comunicación asíncrona (opcional)

### Riesgo 6: Over-Engineering

**Impacto:** Medio

**Probabilidad:** Media

**Mitigación:**

- Mantener simple: interfaces, no frameworks pesados
- Event bus opcional, no obligatorio
- Extracción solo cuando sea necesario
- KISS principle

### Riesgo 7: Complejidad Multi-Currency

**Impacto:** Medio

**Probabilidad:** Media

**Mitigación:**

- Inicialmente: currency fija por tenant, sin conversión
- Conversión de currency como feature futura
- Validación estricta de currency en pagos
- Tests exhaustivos de currency

### Riesgo 8: Mantenimiento de Traducciones

**Impacto:** Medio

**Probabilidad:** Media

**Mitigación:**

- Traducciones en archivos JSON simples
- Estructura clara de keys
- Documentación de proceso de traducción
- Validación de traducciones completas en tests

### Riesgo 9: Performance con Historial Completo de Items

**Impacto:** Medio

**Probabilidad:** Media

**Mitigación:**

- Queries optimizadas con índices apropiados
- Views materializadas para items actuales
- Paginación cuando se consulta historial completo
- Caching de items actuales
- Query para items actuales: WHERE order_id = X ORDER BY created_at DESC LIMIT (cantidad items actuales)

## Equipo Requerido

### Para MVP (16 semanas)

- 1 Full-Stack Lead (OAuth, core architecture, separación de dominios)
- 1 Backend Developer (órdenes, payments, integración retail-delivery, i18n, currency)
- 1 QA Engineer (testing strategy, unit tests)
- 0.5 DevOps (Docker setup)

**Nota:** Frontend developers trabajan en proyectos separados, no en este backend core.

### Post-MVP

- +1 Backend Developer (features avanzadas)
- +1 Mobile Developer (apps nativas, proyecto separado)
- 1 Product Manager (roadmap, priorización)

## Stack Decisiones

### Backend

- **Node.js + TypeScript:** Type safety, ecosistema maduro
- **Express:** Ligero, flexible, bien documentado
- **Prisma:** ORM moderno, multi-schema, migrations
- **PostgreSQL:** Robusto, JSONB, geografía
- **Redis:** Caching, sessions, rate limiting
- **BullMQ:** Job queues (event bus simple)
- **InversifyJS:** Dependency Injection container
- **i18next:** Internacionalización (multi-language)
- **currency.js o dinero.js:** Manejo de monedas (multi-currency)

### Testing

- **Jest:** Unit tests únicamente
- **Coverage:** >80% con unit tests

### Deployment

- **Docker:** Containerización
- **Docker Compose:** Orquestación local y desarrollo

### Logging

- **Winston:** Solo transporte de consola (no archivos)

## Sistema de Seguimiento

El plan está dividido en sub-planes estratégicos ubicados en `.tracking/`. Cada sub-plan contiene:

- `plan.md`: Descripción detallada del sub-plan
- `tasks.md`: Lista de tareas específicas
- `summary.md`: Resumen de progreso y estado

### Sub-planes Estratégicos

1. **01-setup-fundacion**: Setup inicial del proyecto, estructura modular, i18n y multi-currency base
2. **02-oauth2-completo**: Implementación OAuth2 (shared)
3. **03-delivery-base**: Proveedores logísticos, drivers y vehículos (delivery, compartido)
4. **04-ordenes-delivery**: Core de órdenes inmutable con multi-currency (delivery, RETAIL y ON_DEMAND)
5. **05-retail-products**: Productos, variants e inventario con multi-currency (retail)
6. **06-retail-storefront-api**: Storefront API backend con multi-language y multi-currency (retail)
7. **07-pagos**: Integración con Stripe con multi-currency (shared)
8. **08-suscripciones**: Planes y billing (shared)
9. **09-reporteria**: Analytics y reportes con multi-language y multi-currency (shared)
10. **10-optimizacion**: Performance y Docker

## Siguientes Pasos

1. ✅ Revisar y aprobar plan maestro actualizado
2. → Configurar repositorio y proyecto base
3. → Establecer estructura modular preparada para extracción
4. → Implementar Sub-plan 01: Setup y Fundación
5. → Seguimiento en `.tracking/`
6. → Demos semanales con stakeholders
7. → Iteración basada en feedback

---

**Última actualización:** 2024-01-15

**Versión:** 4.3 (Inmutabilidad Completa - Items con Mismo Patrón)

# Tareas - Setup y Fundación

## Tareas de Setup

- [x] Inicializar proyecto Node.js con TypeScript
- [x] Configurar Express
- [x] Configurar Prisma con multi-schema
- [x] Crear estructura de directorios (domains/retail, domains/delivery, domains/shared)
- [x] Configurar ESLint y Prettier
- [x] Configurar Jest para unit tests
- [x] Configurar Docker y Docker Compose
- [x] Crear .env.example

## Tareas de Base de Datos

- [x] Definir schema `shared` (Tenants, Users, Branches, OrderCounters, OAuth, PaymentTransactions)
- [x] Definir schema `delivery` (Orders, Drivers, Vehicles, LogisticsProviders, etc.)
- [x] Definir schema `retail` (Products, ProductVariants, Categories, etc.)
- [ ] Crear migrations iniciales
- [x] Configurar Prisma Client para multi-schema

## Tareas de Arquitectura Modular

- [x] Definir interfaces entre dominios (IDeliveryClient, etc.)
- [x] Configurar BullMQ básico para event bus
- [x] Crear estructura de contracts compartidos
- [x] Configurar InversifyJS container

## Tareas de Multi-language

- [x] Instalar y configurar i18next
- [x] Crear middleware para Accept-Language header
- [x] Crear archivos de traducción base (es, en)
- [x] Agregar campo default_locale a Tenant
- [x] Implementar I18nService

## Tareas de Multi-currency

- [x] Instalar currency.js o dinero.js
- [x] Crear Currency enum
- [x] Agregar campo default_currency a Tenant
- [x] Implementar CurrencyService
- [x] Crear helpers para formato y validación

## Tareas de OAuth2

- [x] Implementar Authorization Code Flow
- [x] Implementar Client Credentials Flow
- [x] Implementar Refresh Token Flow
- [x] Crear gestión de OAuth clients
- [x] Implementar token rotation
- [ ] Tests unitarios OAuth (>80% coverage)

## Tareas de Autenticación Tradicional

- [x] Implementar login/registro
- [x] Implementar email verification
- [x] Implementar password reset
- [ ] Tests unitarios auth

## Tareas de CRUD Base

- [x] CRUD Tenants
- [x] CRUD Subscription Plans
- [x] CRUD Users
- [x] CRUD Branches
- [x] CRUD Order Counters
- [ ] Tests unitarios CRUD

## Tareas de Middleware

- [x] Tenant isolation middleware
- [x] Auth middleware
- [x] Error handler middleware
- [x] Request logger middleware

## Tareas de Testing

- [x] Configurar Jest
- [x] Crear helpers de testing
- [x] Tests unitarios OAuth
- [x] Tests unitarios auth
- [x] Tests unitarios CRUD
- [x] Tests unitarios entidades
- [x] Tests unitarios utilidades
- [ ] Verificar coverage >80% (26.47% actual - se incrementará con más funcionalidad)

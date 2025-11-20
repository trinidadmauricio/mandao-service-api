# Tareas - Optimización

## Tareas de Performance Audit

- [ ] Analizar queries lentas
- [ ] Optimizar índices en DB
- [ ] Implementar caching donde sea necesario
- [ ] Optimizar queries complejas
- [ ] Documentar optimizaciones

## Tareas de Load Testing

- [ ] Configurar Artillery o k6
- [ ] Crear scenarios de carga
- [ ] Ejecutar tests (1000 RPS)
- [ ] Identificar bottlenecks
- [ ] Implementar optimizaciones
- [ ] Re-ejecutar tests

## Tareas de Security Audit

- [ ] Ejecutar security scan (npm audit, Snyk, etc.)
- [ ] Revisar OWASP Top 10
- [ ] Verificar autenticación y autorización
- [ ] Verificar input validation
- [ ] Fix vulnerabilidades críticas
- [ ] Documentar security measures

## Tareas de Documentation

- [x] Crear OpenAPI/Swagger specs (swagger.config.ts)
- [x] Configurar Swagger UI (/api-docs)
- [x] Documentar todos los endpoints (anotaciones JSDoc completadas para endpoints principales)
  - [x] Auth (login, register, verify-email, password reset)
  - [x] OAuth y OAuth Clients
  - [x] Tenants, Users, Branches
  - [x] Orders (público)
  - [x] Payments
  - [x] Products
  - [ ] Delivery (drivers, vehicles, zones, rates, providers) - pendiente
  - [ ] Retail (categories, brands, variants, storefront) - pendiente
  - [ ] Subscriptions - pendiente
  - [ ] Reports - pendiente
- [x] Agregar ejemplos de uso (incluidos en documentación de endpoints)
- [x] Documentar errores comunes (agregados en swagger.config.ts como componentes reutilizables)

## Tareas de Docker

- [x] Crear Dockerfile optimizado (multi-stage build)
- [x] Multi-stage builds
- [x] Crear docker-compose.yml
- [x] Configurar servicios (API, DB, Redis)
- [x] Health checks
- [x] Volumes para persistencia
- [x] Documentar uso (README.md)

## Tareas de Testing Final

- [ ] Verificar todos los tests pasan
- [ ] Verificar coverage >80%
- [ ] Tests de integración Docker
- [ ] Smoke tests

## Tareas de Deployment Prep

- [x] .env.example completo
- [x] README actualizado
- [ ] Documentación de deployment (pendiente)
- [ ] Checklist de production (pendiente)


# Plan de Resolución de Code Review Issues

## Objetivo

Resolver todos los problemas críticos y de alta prioridad identificados en el code review, organizados en 3 sprints con pasos específicos y archivos a modificar.

## Alcance

- **Problemas Críticos:** 3 (CR-001, CR-002, CR-003, CR-004)
- **Problemas Alta Prioridad:** 4 (CR-005, CR-006, CR-007, CR-008)
- **Problemas Media Prioridad:** 3 (CR-012, CR-013, CR-010)

## Estructura de Sprints

### Sprint 1: Problemas Críticos (1-2 semanas)

- Tarea 1.1: Implementar Dependency Injection Completa
- Tarea 1.2: Eliminar Todos los Usos de `any`
- Tarea 1.3: Documentar UPDATE en Order Status
- Tarea 1.4: Aumentar Coverage de Tests a >80%

### Sprint 2: Alta Prioridad (1 semana)

- Tarea 2.1: Validación Explícita de Tenant en Queries
- Tarea 2.2: Usar Path Aliases en Imports
- Tarea 2.3: Completar Validación Zod
- Tarea 2.4: Implementar Caching para Limit Checks

### Sprint 3: Media Prioridad (1 semana)

- Tarea 3.1: Optimizar Queries de Reportes
- Tarea 3.2: Mejorar Manejo de Errores
- Tarea 3.3: Optimizar Transacciones Largas

## Estimaciones

- **Sprint 1:** 10-12 días
- **Sprint 2:** 4-5 días
- **Sprint 3:** 3-4 días
- **Total:** 17-21 días (~3-4 semanas)

## Criterios de Éxito

- ✅ Dependency Injection implementada en todas las routes (22 archivos)
- ✅ 0 usos de `any` en el código (201 ocurrencias eliminadas)
- ✅ Coverage de tests >80% en todas las métricas
- ✅ Validación explícita de tenant en todas las queries críticas
- ✅ Path aliases usados en todos los imports
- ✅ Validación Zod en todos los endpoints
- ✅ Caching implementado para limit checks
- ✅ Build sin errores TypeScript
- ✅ Todos los tests pasando

## Orden de Ejecución Recomendado

1. Tarea 1.1 (DI) - Base para todo
2. Tarea 1.2 (Eliminar `any`) - Puede hacerse en paralelo
3. Tarea 1.3 (Documentar UPDATE) - Rápida
4. Tarea 1.4 (Tests) - Requiere más tiempo
5. Sprint 2 completo
6. Sprint 3 completo

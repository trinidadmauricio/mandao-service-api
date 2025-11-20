# Sub-plan 09: Reportería

## Objetivo

Implementar sistema de analytics y reportes para merchants con multi-language y multi-currency.

## Alcance

- Reporte de órdenes con filtros
- Export a CSV
- Reporte de inventario
- Reporte de drivers
- Dashboard API con KPIs
- Multi-language en reportes
- Multi-currency en valores

## Entregables

1. **Reporte de Órdenes**
   - Filtros múltiples
   - Filtros por currency
   - Agrupación por currency
   - Totales en currency del tenant
   - Export a CSV

2. **Export a CSV**
   - Columnas en idioma solicitado
   - Valores en currency del tenant
   - Headers traducidos
   - Performance optimizado

3. **Reporte de Inventario**
   - Stock por branch
   - Valores en currency del tenant
   - Movimientos de inventario

4. **Reporte de Drivers**
   - Performance de drivers
   - Mensajes en idioma solicitado
   - Estadísticas de entregas

5. **Dashboard API**
   - KPIs principales
   - Respuestas en idioma solicitado
   - Valores monetarios en currency del tenant
   - Labels y descripciones traducidos

6. **Scheduled Reports**
   - Generación programada (opcional)
   - Envío por email (futuro)

## Criterios de Éxito

- ✓ Export de 10k+ órdenes en <5s
- ✓ Filtros combinados funcionan
- ✓ Dashboard API carga en <2s
- ✓ Reportes en idioma correcto
- ✓ Valores monetarios en currency correcta

## Duración Estimada

1 semana (Semana 15)

## Dependencias

- Sub-plan 01: Setup y Fundación
- Sub-plan 04: Órdenes Delivery
- Sub-plan 05: Retail Products
- Sub-plan 07: Pagos

## Riesgos

- Performance con grandes volúmenes
- Complejidad de filtros múltiples
- Export CSV puede ser lento


# Sub-plan 05: Retail Products

## Objetivo

Implementar catálogo de productos con variants, inventario y gestión de stock para dominio retail.

## Alcance

- CRUD productos con variants
- Gestión de stock por variant + branch
- Movimientos de inventario
- Stock reservations
- Multi-currency en precios
- Multi-language en descripciones

## Entregables

1. **Products**
   - CRUD completo
   - Precios en currency del tenant
   - Descripciones multi-language

2. **Product Variants**
   - CRUD completo
   - Asociación con productos
   - Precios por variant
   - Stock por variant

3. **Categories y Brands**
   - CRUD Categories
   - CRUD Brands
   - Asociación con productos

4. **Inventory Management**
   - StockByBranch (stock por variant + branch)
   - InventoryMovements (historial)
   - Stock reservations
   - Stock calculations

5. **Multi-currency**
   - Precios en currency del tenant
   - Validación de currency

6. **Multi-language**
   - Nombres y descripciones traducibles
   - Storefront API con locale

## Criterios de Éxito

- ✓ Producto con 3 variants funciona
- ✓ Stock por branch correcto
- ✓ Movimientos de inventario registrados
- ✓ Reservas de stock funcionan
- ✓ Precios en currency correcta
- ✓ Descripciones en idioma correcto

## Duración Estimada

Parte de Fase 4 (Semanas 9-11)

## Dependencias

- Sub-plan 01: Setup y Fundación
- Multi-currency y multi-language del Sub-plan 01

## Riesgos

- Complejidad de variants
- Performance con muchos productos
- Concurrencia en stock reservations


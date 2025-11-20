# Tareas - Retail Products

## Tareas de Products

- [x] CRUD Products
- [x] Precios en currency del tenant
- [x] Descripciones multi-language (JSONB)
- [x] Asociación con categories y brands
- [x] Tests unitarios (CreateUseCase)

## Tareas de Product Variants

- [x] CRUD Product Variants
- [x] Asociación con productos
- [x] Precios por variant
- [x] Stock por variant
- [x] Tests unitarios (CreateUseCase)

## Tareas de Categories y Brands

- [x] CRUD Categories
- [x] Tests unitarios Categories (CreateUseCase)
- [x] CRUD Brands
- [x] Tests unitarios Brands (CreateUseCase)
- [x] Asociación con productos (implementada en Products CRUD)

## Tareas de Inventory Management

- [x] Crear tabla StockByBranch (ya existe en schema)
- [x] Crear tabla InventoryMovements (ya existe en schema)
- [x] Implementar StockReservationService
- [x] Implementar StockCalculator
- [x] Repositories implementados
- [x] Tests unitarios (StockCalculator, StockReservationService, PrismaStockByBranchRepository)

## Tareas de Stock Reservations

- [x] Implementar reserva de stock (StockReservationService.reserveStock)
- [x] Implementar liberación de stock (StockReservationService.releaseStock)
- [x] Validar disponibilidad (StockCalculator)
- [x] Tests unitarios de concurrencia (transacciones con Prisma)

## Tareas de Multi-currency

- [ ] Validar currency en precios
- [ ] Formato de precios
- [ ] Tests unitarios

## Tareas de Multi-language

- [ ] Traducciones de nombres
- [ ] Traducciones de descripciones
- [ ] Tests unitarios

## Tareas de Testing

- [x] Tests unitarios CRUD Products (CreateUseCase)
- [x] Tests unitarios Variants (CreateUseCase)
- [x] Tests unitarios Inventory (StockCalculator, StockReservationService, PrismaStockByBranchRepository)
- [x] Tests unitarios Stock Reservations (transacciones)
- [ ] Verificar coverage >80% (pendiente verificación completa)


# Tareas - Retail Storefront API

## Tareas de Storefront API Endpoints

- [x] GET /api/v1/storefront/products
  - [x] Filtros (categoría, precio, etc.)
  - [x] Paginación
  - [x] Locale support
  - [x] Currency support
- [x] GET /api/v1/storefront/products/:id
  - [x] Locale support
  - [x] Currency support
- [x] POST /api/v1/storefront/checkout
  - [x] Validación de datos
  - [x] Validación de stock
  - [x] Reserva de stock
  - [x] Creación de orden
- [ ] Tests unitarios

## Tareas de Theme Configurator

- [ ] CRUD Themes
- [ ] Configuración de storefront
- [ ] Personalización
- [ ] Tests unitarios

## Tareas de Checkout Flow

- [x] Validar items y stock
- [x] Reservar stock
- [x] Crear orden en delivery
- [x] Manejar errores y liberar stock
- [ ] Tests unitarios

## Tareas de DeliveryClient

- [x] Implementar DeliveryClient
- [x] Implementar IDeliveryClient interface
- [x] Llamar a CreateRetailOrderUseCase
- [x] Manejar errores
- [ ] Tests unitarios

## Tareas de Integración Retail → Delivery

- [x] Verificar stock antes de crear orden
- [x] Reservar stock al crear orden
- [x] Pasar currency a delivery
- [x] Liberar stock si orden se cancela (en CheckoutUseCase)
- [ ] Tests unitarios

## Tareas de Multi-language

- [x] Respuestas en idioma solicitado (en ListStorefrontProductsUseCase y GetStorefrontProductUseCase)
- [ ] Mensajes de error traducidos (pendiente i18n en controllers)
- [ ] Tests unitarios

## Tareas de Multi-currency

- [x] Precios en moneda solicitada (validación y formato)
- [x] Validación de currency (CurrencyService.areCompatible)
- [ ] Tests unitarios

## Tareas de Testing

- [ ] Tests unitarios Storefront API
- [ ] Tests unitarios Checkout Flow
- [ ] Tests unitarios DeliveryClient
- [ ] Tests unitarios integración
- [ ] Verificar coverage >80%


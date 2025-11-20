# Sub-plan 03: Delivery Base - Proveedores y Drivers

## Objetivo

Implementar sistema de delivery compartido con proveedores logísticos, drivers, vehículos y zonas de entrega.

## Alcance

- Sistema de correlativos con concurrencia
- CRUD de proveedores logísticos
- CRUD de drivers
- CRUD de vehículos
- Delivery zones y rates
- Calculadora de costos

## Entregables

1. **Order Counters**
   - Tabla order_counters en schema shared
   - OrderNumberService con concurrencia
   - Generación de números únicos
   - Reset de contadores

2. **Logistics Providers**
   - CRUD completo
   - Gestión de flota
   - Asociación con drivers

3. **Drivers**
   - CRUD completo
   - Asignación de vehículos
   - Disponibilidad
   - Asociación con providers

4. **Vehicles**
   - CRUD completo
   - Tipos de vehículos
   - Asociación con drivers

5. **Delivery Zones**
   - CRUD de zonas
   - Geografía (PostGIS)
   - Asociación con rates

6. **Delivery Rates**
   - CRUD de rates
   - Rates por zona
   - Currency support
   - Calculadora de costos

## Criterios de Éxito

- ✓ 100 requests concurrentes generan correlativos únicos
- ✓ Reset de contador funciona
- ✓ Driver puede tener vehículo propio o asignado
- ✓ Proveedores logísticos pueden gestionar su flota
- ✓ Drivers disponibles para ambos tipos de órdenes
- ✓ Rates y costos en currency correcta

## Duración Estimada

2 semanas (Semanas 4-5)

## Dependencias

- Sub-plan 01: Setup y Fundación

## Riesgos

- Concurrencia en correlativos
- Performance con muchos drivers
- Complejidad de zonas geográficas


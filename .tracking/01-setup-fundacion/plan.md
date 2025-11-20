# Sub-plan 01: Setup y Fundación

## Objetivo

Establecer la base sólida del proyecto con autenticación propia y estructura modular preparada para extracción futura.

## Alcance

- Setup completo del proyecto (Node.js + TypeScript + Prisma)
- Estructura de dominios (retail, delivery, shared)
- Schemas DB completos (shared, delivery, retail)
- Arquitectura modular con interfaces entre dominios
- Multi-language setup (i18next)
- Multi-currency setup (currency.js)
- InversifyJS container configurado
- OAuth2 completo (3 flows)
- CRUD de entidades base

## Entregables

1. **Proyecto Base**
   - Node.js 20 LTS + TypeScript 5.3
   - Express 4.18
   - Prisma 5.8 con multi-schema
   - Estructura de directorios según arquitectura

2. **Base de Datos**
   - Schemas completos: shared, delivery, retail
   - Todas las tablas definidas
   - Migrations iniciales

3. **Arquitectura Modular**
   - Interfaces entre dominios definidas
   - Event bus simple (BullMQ básico)
   - Contracts compartidos

4. **Multi-language**
   - i18next configurado
   - Locale middleware (Accept-Language header)
   - Traducciones base (es, en)
   - Locale en tenant

5. **Multi-currency**
   - Currency enum (USD, EUR, MXN, etc.)
   - Currency en tenant
   - CurrencyService para formato y validación

6. **OAuth2**
   - Authorization Code Flow
   - Client Credentials Flow
   - Refresh Token Flow
   - Gestión de clients OAuth

7. **Autenticación Tradicional**
   - Login/registro
   - Email verification
   - Password reset

8. **CRUD Base**
   - Tenants
   - Subscription Plans
   - Users
   - Branches
   - Order Counters

## Criterios de Éxito

- ✓ Tests unitarios OAuth pasan (coverage >80%)
- ✓ Authorization Code Flow funciona
- ✓ Refresh token rotation implementado
- ✓ Tenant isolation verificado
- ✓ InversifyJS container funcionando
- ✓ Estructura modular establecida
- ✓ Interfaces entre dominios definidas
- ✓ i18n funciona con Accept-Language header
- ✓ Currency puede configurarse por tenant

## Duración Estimada

3 semanas

## Dependencias

Ninguna (es el inicio del proyecto)

## Riesgos

- Complejidad de OAuth2 custom
- Setup inicial puede tomar más tiempo del estimado
- Multi-schema en Prisma puede tener curva de aprendizaje


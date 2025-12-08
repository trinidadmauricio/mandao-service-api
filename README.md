# Mandao Service API

Sistema SaaS de gestión de entregas multi-tenant con soporte para Retail (E-commerce) y On-Demand (Last-Mile Delivery).

## 🚀 Características

- **Multi-tenant** con aislamiento por schema en PostgreSQL
- **OAuth2** completo (Authorization Code, Client Credentials, Refresh Token)
- **Autenticación tradicional** (login, registro, verificación de email, reset de password)
- **Gestión de órdenes inmutables** (append-only)
- **E-commerce** con catálogo de productos, variantes e inventario
- **Storefront API** para frontends
- **Pagos** con Stripe (Checkout, Payment Intents, Webhooks, Refunds)
- **Suscripciones** con límites por plan y billing recurrente
- **Reportes** con export a CSV
- **Multi-currency** y **Multi-language** (i18n)

## 📋 Requisitos

- Node.js 20 LTS
- PostgreSQL 16
- Redis 7.2
- Docker y Docker Compose (opcional)

## 🛠️ Instalación

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar Prisma Client
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev
```

### Docker

```bash
# Construir y levantar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec api npm run db:migrate:prod

# Ver logs
docker-compose logs -f api
```

## 📚 Documentación API

Una vez iniciado el servidor, la documentación Swagger está disponible en:

- **Swagger UI**: http://localhost:3000/api-docs

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📁 Estructura del Proyecto

```
src/
├── domains/
│   ├── shared/          # Dominio compartido (auth, tenants, payments, etc.)
│   ├── delivery/         # Dominio de entregas (orders, drivers, vehicles, etc.)
│   └── retail/           # Dominio de e-commerce (products, inventory, storefront)
├── shared/               # Utilidades compartidas
├── config/               # Configuraciones
└── server.ts             # Entry point
```

## 🔐 Variables de Entorno

Ver `.env.example` para todas las variables requeridas:

- `DATABASE_URL`: Connection string de PostgreSQL
- `REDIS_URL`: Connection string de Redis
- `JWT_SECRET`: Secret para JWT tokens
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `CORS_ORIGIN`: **OBLIGATORIO en producción** - Orígenes permitidos para CORS, separados por comas
  - Ejemplo desarrollo: `http://localhost:3001,http://localhost:3000`
  - Ejemplo producción: `https://backoffice.tudominio.com,https://store.tudominio.com,https://driver.tudominio.com`
  - ⚠️ **IMPORTANTE**: En producción, si `CORS_ORIGIN` no está configurado, las peticiones CORS serán rechazadas

## 🏗️ Arquitectura

- **Clean Architecture** con separación de capas (Domain, Application, Infrastructure, Presentation)
- **Modular Monolith** preparado para extracción futura de servicios
- **Multi-schema Database** (shared, delivery, retail)
- **Dependency Injection** con InversifyJS
- **Inmutabilidad** en órdenes (append-only)

## 📝 Scripts Disponibles

- `npm run dev`: Inicia servidor en modo desarrollo
- `npm run build`: Compila TypeScript
- `npm run start`: Inicia servidor en producción
- `npm run test`: Ejecuta tests
- `npm run db:migrate`: Ejecuta migraciones
- `npm run db:studio`: Abre Prisma Studio
- `npm run lint`: Ejecuta ESLint
- `npm run format`: Formatea código con Prettier

## 🐳 Docker

### Desarrollo

```bash
docker-compose up
```

### Producción

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📄 Licencia

ISC

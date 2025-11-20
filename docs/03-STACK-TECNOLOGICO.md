# Stack Tecnológico - Sistema de Delivery Multi-Tenant

## Backend Core

### Runtime & Language
**Node.js 20 LTS + TypeScript 5.3**
- Type safety en tiempo de desarrollo
- Ecosistema maduro y estable
- Performance excelente para I/O
- Gran comunidad y soporte

### Web Framework
**Express 4.18**
```json
{
  "express": "^4.18.2",
  "@types/express": "^4.17.21"
}
```
**Por qué:**
- Minimalista y flexible
- Middleware ecosystem robusto
- Fácil testing
- Amplia documentación

### ORM & Database Client
**Prisma 5.8**
```json
{
  "prisma": "^5.8.0",
  "@prisma/client": "^5.8.0"
}
```
**Features usadas:**
- Multi-schema support
- Type-safe queries
- Migration system
- Prisma Studio (debugging)

**PostgreSQL 16**
```
- JSONB para datos flexibles
- PostGIS para geografía (delivery zones)
- Row-level security (tenant isolation)
- Full-text search
```

### Validation & Schemas
**Zod 3.22**
```json
{
  "zod": "^3.22.4"
}
```
**Uso:**
- Validación de DTOs
- Schema inference para TypeScript
- Runtime type checking
- Error messages customizables

### Authentication & Security
**jsonwebtoken 9.0**
```json
{
  "jsonwebtoken": "^9.0.2",
  "@types/jsonwebtoken": "^9.0.5"
}
```

**bcrypt 5.1**
```json
{
  "bcrypt": "^5.1.1",
  "@types/bcrypt": "^5.0.2"
}
```
**Configuración:** 12 rounds para hashing

**crypto (Node.js built-in)**
- Generación de tokens seguros
- HMAC para webhooks


### Caching
**Redis 7.2 + ioredis 5.3**
```json
{
  "ioredis": "^5.3.2",
  "@types/ioredis": "^5.0.0"
}
```
**Uso:**
- Session store
- Rate limiting
- Data caching (rates, products)
- Job queue backend

### Job Queue
**BullMQ 5.1**
```json
{
  "bullmq": "^5.1.0"
}
```
**Jobs procesados:**
- Email notifications
- Report generation
- Webhook retries
- Stock reconciliation

### Payment Processing
**Stripe Node SDK 14.10**
```json
{
  "stripe": "^14.10.0"
}
```
**Features usadas:**
- Checkout Sessions
- Payment Intents
- Webhooks
- Refunds

### Logging
**Winston 3.11**
```json
{
  "winston": "^3.11.0"
}
```
**Transports:**
- Console only (development and production)

### HTTP Client
**Axios 1.6**
```json
{
  "axios": "^1.6.2"
}
```
**Uso:**
- Stripe API
- External logistics APIs (futuro)
- Geocoding services

### Date Handling
**date-fns 3.0**
```json
{
  "date-fns": "^3.0.0"
}
```
**Por qué:** Más ligero que Moment.js, tree-shakeable

### Internationalization
**i18next 23.7**
```json
{
  "i18next": "^23.7.0",
  "i18next-express-middleware": "^2.0.0"
}
```
**Uso:**
- Multi-language support
- API messages translation
- Error messages translation

### Currency Handling
**currency.js 2.0 o dinero.js 2.0**
```json
{
  "currency.js": "^2.0.4"
}
```
**Uso:**
- Multi-currency support
- Currency formatting
- Currency validation

### Environment Variables
**dotenv 16.3**
```json
{
  "dotenv": "^16.3.1"
}
```

### CORS
**cors 2.8**
```json
{
  "cors": "^2.8.5",
  "@types/cors": "^2.8.17"
}
```

### Security Headers
**helmet 7.1**
```json
{
  "helmet": "^7.1.0"
}
```

### Compression
**compression 1.7**
```json
{
  "compression": "^1.7.4",
  "@types/compression": "^1.7.5"
}
```

### CSV Processing
**csv-parse 5.5 + csv-stringify 6.4**
```json
{
  "csv-parse": "^5.5.3",
  "csv-stringify": "^6.4.4"
}
```
**Uso:** Export de reportes

### Rate Limiting
**express-rate-limit 7.1**
```json
{
  "express-rate-limit": "^7.1.5"
}
```

### Request Validation
**express-validator 7.0**
```json
{
  "express-validator": "^7.0.1"
}
```

---

## Testing Stack

### Test Framework
**Jest 29.7**
```json
{
  "jest": "^29.7.0",
  "@types/jest": "^29.5.11",
  "ts-jest": "^29.1.1"
}
```
**Configuración:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Mocking
**Jest (built-in) + nock 13.4**
```json
{
  "nock": "^13.4.0"
}
```
**Uso:** Mock HTTP calls (Stripe, external APIs)

### Faker
**@faker-js/faker 8.3**
```json
{
  "@faker-js/faker": "^8.3.1"
}
```
**Uso:** Generar datos de prueba

---

## Code Quality

### Linting
**ESLint 8.56**
```json
{
  "eslint": "^8.56.0",
  "@typescript-eslint/eslint-plugin": "^6.17.0",
  "@typescript-eslint/parser": "^6.17.0"
}
```

**Configuración:**
```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error'
  }
};
```

### Formatting
**Prettier 3.1**
```json
{
  "prettier": "^3.1.1",
  "eslint-config-prettier": "^9.1.0"
}
```

**Configuración:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Git Hooks
**Husky 8.0 + lint-staged 15.2**
```json
{
  "husky": "^8.0.3",
  "lint-staged": "^15.2.0"
}
```

**Configuración:**
```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests"
    ]
  }
}
```

### Commit Convention
**Commitlint 18.4**
```json
{
  "@commitlint/cli": "^18.4.3",
  "@commitlint/config-conventional": "^18.4.3"
}
```

---

## DevOps & Infrastructure

### Containerization
**Docker + Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/logihub
      REDIS_URL: redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Documentation
**OpenAPI/Swagger**
```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.0"
}
```

**ReDoc**
```json
{
  "redoc-express": "^2.1.0"
}
```

---

## Development Tools

### Process Manager
**PM2 (Production)**
```json
{
  "pm2": "^5.3.0"
}
```

**Configuración:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'logihub-api',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

### Hot Reload (Development)
**nodemon 3.0**
```json
{
  "nodemon": "^3.0.2"
}
```

### Database Tools
**Prisma Studio**
- Visual DB browser
- Query builder UI
- Seed data management

**pgAdmin 4**
- PostgreSQL management
- Query optimization
- Performance monitoring

### API Testing
**Postman / Insomnia**
- Collection management
- Environment variables
- Automated tests

### Load Testing
**Artillery 2.0**
```json
{
  "artillery": "^2.0.3"
}
```

**k6**
```bash
# Alternativa más poderosa
brew install k6
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "pm2 start ecosystem.config.js --env production",
    
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "ts-node prisma/seeds/index.ts",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    
    "prepare": "husky install"
  }
}
```

---

## Environment Variables

```bash
# .env.example

# Server
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/logihub
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TLS_URL= # For production

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d

# OAuth2
OAUTH_AUTHORIZATION_CODE_TTL=600 # 10 minutes
OAUTH_ACCESS_TOKEN_TTL=3600 # 1 hour

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (SendGrid futuro)
SENDGRID_API_KEY=
FROM_EMAIL=noreply@logihub.com


# Storage (AWS S3 futuro)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX=100 # requests per window

# CORS
CORS_ORIGIN=http://localhost:3001,http://localhost:3002
```

---

## Decisiones de Stack

### ¿Por qué Node.js?
- ✅ I/O non-blocking ideal para APIs
- ✅ JavaScript/TypeScript en front y back
- ✅ Ecosistema NPM gigante
- ✅ Fácil escalado horizontal

### ¿Por qué Prisma?
- ✅ Type safety end-to-end
- ✅ Multi-schema support crítico
- ✅ Migrations automáticas
- ✅ Best-in-class DX

### ¿Por qué PostgreSQL?
- ✅ Robustez enterprise-grade
- ✅ JSONB para flexibilidad
- ✅ PostGIS para geografía
- ✅ RLS para multi-tenancy

### ¿Por qué Redis?
- ✅ Performance excepcional
- ✅ TTL nativo
- ✅ Pub/sub para eventos
- ✅ Estructura de datos rica

### ¿Por qué Jest?
- ✅ Zero-config
- ✅ Snapshot testing
- ✅ Parallel test execution
- ✅ Code coverage incluido

---

**Última actualización:** 2024-01-15
**Versión:** 1.0

# Arquitectura - Sistema de Delivery Multi-Tenant

## Visión Arquitectónica

### Principios Fundamentales

**1. Vertical Slice Architecture**
- Cada feature contiene toda su lógica (UI → API → DB)
- Minimiza acoplamiento entre features
- Facilita testing y deployment independiente

**2. Clean Architecture Adaptada**
- Domain: Entidades, value objects, reglas de negocio
- Application: Casos de uso, DTOs
- Infrastructure: Adaptadores externos (DB, APIs)
- Presentation: Controllers, routes

**3. Multi-Tenancy por Schema**
- Isolation lógico en PostgreSQL
- Migración independiente por schema
- Permisos granulares por schema

## Estructura de Directorios

```
logihub-api/
├── src/
│   ├── modules/                    # Feature slices
│   │   ├── auth/                   # Autenticación OAuth2
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── OAuthClient.ts
│   │   │   │   │   ├── AccessToken.ts
│   │   │   │   │   └── RefreshToken.ts
│   │   │   │   ├── repositories/
│   │   │   │   │   └── IAuthRepository.ts
│   │   │   │   └── services/
│   │   │   │       └── TokenService.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── AuthorizeUseCase.ts
│   │   │   │   │   ├── GenerateTokenUseCase.ts
│   │   │   │   │   └── RefreshTokenUseCase.ts
│   │   │   │   └── dto/
│   │   │   │       ├── AuthorizeRequestDto.ts
│   │   │   │       └── TokenResponseDto.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── PrismaAuthRepository.ts
│   │   │   │   └── crypto/
│   │   │   │       └── JwtService.ts
│   │   │   ├── presentation/
│   │   │   │   ├── controllers/
│   │   │   │   │   └── AuthController.ts
│   │   │   │   ├── routes/
│   │   │   │   │   └── auth.routes.ts
│   │   │   │   └── validators/
│   │   │   │       └── auth.validators.ts
│   │   │   └── __tests__/
│   │   │       └── unit/
│   │   │
│   │   ├── tenants/                # Gestión de tenants
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── users/                  # Gestión de usuarios
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── orders/                 # Core de órdenes
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Order.ts
│   │   │   │   │   ├── OrderBranch.ts
│   │   │   │   │   ├── OrderDriver.ts
│   │   │   │   │   ├── OrderItem.ts
│   │   │   │   │   └── OrderSummary.ts
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── OrderNumber.ts
│   │   │   │   │   ├── Address.ts
│   │   │   │   │   └── Money.ts
│   │   │   │   └── services/
│   │   │   │       ├── OrderNumberService.ts
│   │   │   │       └── OrderStateMachine.ts
│   │   │   ├── application/
│   │   │   │   ├── use-cases/
│   │   │   │   │   ├── CreateOrderUseCase.ts
│   │   │   │   │   ├── AssignDriverUseCase.ts
│   │   │   │   │   ├── UpdateOrderStatusUseCase.ts
│   │   │   │   │   ├── ChangeBranchUseCase.ts
│   │   │   │   │   └── ModifyItemsUseCase.ts
│   │   │   │   └── dto/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── drivers/                # Gestión de drivers
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── vehicles/               # Gestión de vehículos
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── logistics-providers/    # Proveedores logísticos
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── products/               # Catálogo de productos
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── Product.ts
│   │   │   │   │   ├── ProductVariant.ts
│   │   │   │   │   ├── Category.ts
│   │   │   │   │   └── Brand.ts
│   │   │   │   └── services/
│   │   │   │       └── VariantResolver.ts
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── inventory/              # Gestión de inventario
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   ├── StockByBranch.ts
│   │   │   │   │   └── InventoryMovement.ts
│   │   │   │   └── services/
│   │   │   │       ├── StockReservationService.ts
│   │   │   │       └── StockCalculator.ts
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── storefront/             # E-commerce frontend
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── payments/               # Procesamiento de pagos
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   │   └── stripe/
│   │   │   │       ├── StripeService.ts
│   │   │   │       └── StripeWebhookHandler.ts
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   ├── subscriptions/          # Planes y billing
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   ├── presentation/
│   │   │   └── __tests__/
│   │   │
│   │   └── reports/                # Reportería
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       ├── presentation/
│   │       └── __tests__/
│   │
│   ├── shared/                     # Código compartido
│   │   ├── domain/
│   │   │   ├── base/
│   │   │   │   ├── Entity.ts
│   │   │   │   ├── ValueObject.ts
│   │   │   │   └── AggregateRoot.ts
│   │   │   └── errors/
│   │   │       ├── DomainError.ts
│   │   │       ├── ValidationError.ts
│   │   │       └── NotFoundError.ts
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   ├── PrismaService.ts
│   │   │   │   └── UnitOfWork.ts
│   │   │   ├── cache/
│   │   │   │   └── RedisService.ts
│   │   │   └── queue/
│   │   │       └── BullMQService.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── tenant.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   ├── error-handler.middleware.ts
│   │   │   └── request-logger.middleware.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── crypto.ts
│   │   │   └── validators.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   └── constants/
│   │       ├── roles.ts
│   │       ├── permissions.ts
│   │       └── order-status.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── stripe.config.ts
│   │   └── env.config.ts
│   │
│   ├── server.ts                   # Entry point
│   └── app.ts                      # Express app setup
│
├── prisma/
│   ├── schema.prisma               # Schema multi-schema
│   ├── migrations/
│   └── seeds/
│       ├── shared.seed.ts
│       ├── delivery.seed.ts
│       └── retail.seed.ts
│
├── tests/
│   ├── setup.ts
│   ├── helpers/
│   └── fixtures/
│
├── scripts/
│   ├── generate-oauth-client.ts
│   └── reset-counters.ts
│
├── docs/
│   ├── api/
│   │   └── openapi.yaml
│   └── architecture/
│       └── decisions/              # ADRs
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Patrones de Diseño

### 1. Repository Pattern
**Propósito:** Abstracción de persistencia

```typescript
// Interface (domain)
interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByTenant(tenantId: string): Promise<Order[]>;
}

// Implementación (infrastructure)
class PrismaOrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaService) {}
  
  async findById(id: string): Promise<Order | null> {
    const data = await this.prisma.order.findUnique({ where: { id } });
    return data ? OrderMapper.toDomain(data) : null;
  }
}
```

### 2. Use Case Pattern
**Propósito:** Encapsular lógica de negocio

```typescript
class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private orderNumberService: OrderNumberService,
    private eventBus: IEventBus
  ) {}
  
  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    // 1. Validar
    // 2. Obtener correlativo
    // 3. Crear entidad
    // 4. Guardar
    // 5. Emitir evento
    // 6. Retornar DTO
  }
}
```

### 3. Factory Pattern
**Propósito:** Creación compleja de entidades

```typescript
class OrderFactory {
  static createOnDemandOrder(data: OnDemandOrderData): Order {
    const orderNumber = // ... obtener del service
    return new Order({
      orderNumber,
      type: OrderType.ON_DEMAND,
      // ... resto de props
    });
  }
  
  static createRetailOrder(data: RetailOrderData): Order {
    // ... lógica específica retail
  }
}
```

### 4. Strategy Pattern
**Propósito:** Algoritmos intercambiables

```typescript
interface IDeliveryCostCalculator {
  calculate(order: Order): Money;
}

class ZoneBasedCalculator implements IDeliveryCostCalculator {
  calculate(order: Order): Money {
    // Lógica por zonas
  }
}

class DistanceBasedCalculator implements IDeliveryCostCalculator {
  calculate(order: Order): Money {
    // Lógica por distancia
  }
}
```

### 5. State Machine Pattern
**Propósito:** Transiciones de estado válidas

```typescript
class OrderStateMachine {
  private transitions: Map<OrderStatus, OrderStatus[]> = new Map([
    [OrderStatus.PENDING, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
    [OrderStatus.CONFIRMED, [OrderStatus.ASSIGNED, OrderStatus.CANCELLED]],
    [OrderStatus.ASSIGNED, [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED]],
    // ...
  ]);
  
  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.transitions.get(from)?.includes(to) ?? false;
  }
}
```

### 6. Unit of Work Pattern
**Propósito:** Transacciones consistentes

```typescript
class UnitOfWork {
  constructor(private prisma: PrismaClient) {}
  
  async execute<T>(work: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return await work(tx);
    });
  }
}
```

## Flujo de Request

```
┌─────────┐
│ Client  │
└────┬────┘
     │ HTTP Request
     ▼
┌─────────────────┐
│  Middleware     │
│  - Auth         │
│  - Tenant       │
│  - Rate Limit   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Router         │
│  /api/v1/orders │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Controller     │
│  - Validate DTO │
│  - Call UseCase │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Use Case       │
│  - Business     │
│    Logic        │
└────┬────────────┘
     │
     ├──────────┬──────────┬──────────┐
     ▼          ▼          ▼          ▼
┌──────────┐ ┌──────┐ ┌────────┐ ┌────────┐
│Repository│ │Domain│ │External│ │ Event  │
│          │ │Service│ │ API    │ │  Bus   │
└────┬─────┘ └──────┘ └────────┘ └────────┘
     │
     ▼
┌──────────┐
│ Database │
└──────────┘
```

## Estrategia de Testing

### Unit Tests Only
**Scope:** Lógica de negocio aislada
**Tools:** Jest + Mocks
**Coverage:** >80% obligatorio

```typescript
// Ejemplo: OrderNumberService.spec.ts
describe('OrderNumberService', () => {
  it('should generate unique order numbers concurrently', async () => {
    const promises = Array.from({ length: 100 }, () => 
      service.getNextOrderNumber(tenantId)
    );
    const numbers = await Promise.all(promises);
    const unique = new Set(numbers);
    expect(unique.size).toBe(100);
  });
});
```

**Principios:**
- Tests unitarios únicamente
- Mock de todas las dependencias externas (DB, APIs, servicios)
- Cobertura mínima del 80% en branches, functions, lines y statements
- Tests rápidos y aislados
- Sin dependencias de infraestructura real


## Error Handling

### Jerarquía de Errores

```typescript
// Base
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

// Domain
class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super(404, `${entity} with id ${id} not found`);
  }
}

// Infrastructure
class DatabaseError extends AppError {
  constructor(message: string) {
    super(500, message, false); // Not operational
  }
}
```

### Global Error Handler

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }
  
  // Unknown error
  logger.error('Unhandled error', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});
```

## Logging

### Structured Logging con Winston

```typescript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'logihub-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Request logger middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    tenantId: req.tenant?.id,
    userId: req.user?.id
  });
  next();
});
```

## Caching Strategy

### Redis Usage

**1. Session Store**
```typescript
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

**2. Rate Limiting**
```typescript
const limiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // per tenant
});
```

**3. Data Caching**
```typescript
// Cache delivery rates
const CACHE_TTL = 3600; // 1 hour

async getCachedRates(zoneId: string): Promise<Rate[]> {
  const key = `rates:zone:${zoneId}`;
  const cached = await redis.get(key);
  
  if (cached) return JSON.parse(cached);
  
  const rates = await prisma.deliveryRate.findMany({ 
    where: { zone_id: zoneId } 
  });
  
  await redis.setex(key, CACHE_TTL, JSON.stringify(rates));
  return rates;
}
```

## Monitoring & Observability

### Métricas Clave

**1. Application Metrics**
- Request rate (RPS)
- Response time (p50, p95, p99)
- Error rate
- Active connections

**2. Business Metrics**
- Orders created per minute
- Order completion rate
- Average delivery time
- Revenue per hour

**3. Infrastructure Metrics**
- DB connection pool usage
- Redis memory usage
- CPU/Memory per container

### Health Checks

```typescript
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      stripe: await checkStripe()
    }
  };
  
  const isHealthy = Object.values(health.checks).every(c => c.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

---

**Última actualización:** 2024-01-15
**Versión:** 1.0

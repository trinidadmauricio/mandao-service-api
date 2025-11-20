# Diagramas y Flujos - Sistema de Delivery Multi-Tenant

## 1. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATIONS                       │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Admin UI   │   Driver     │   Customer   │   Storefront       │
│   Dashboard  │   Mobile App │   Tracking   │   (Multi-tenant)   │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                             │
                    ┌────────▼────────┐
                    │   LOAD BALANCER  │
                    │   (Nginx/ALB)    │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐      ┌───────▼───────┐    ┌───────▼──────┐
│   API Node  │      │   API Node    │    │   API Node   │
│   Instance1 │◄────►│   Instance2   │◄──►│   Instance3  │
└──────┬──────┘      └───────┬───────┘    └───────┬──────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────────┐  ┌───────▼────────┐  ┌────────▼────────┐
│   PostgreSQL    │  │     Redis      │  │    BullMQ       │
│   (Multi-Schema)│  │   (Cache+Rate  │  │  (Job Queue)    │
│   - shared      │  │    Limiting)   │  │                 │
│   - delivery    │  │                │  │                 │
│   - retail      │  │                │  │                 │
└─────────────────┘  └────────────────┘  └─────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐      ┌───────▼───────┐    ┌───────▼──────┐
│   Stripe    │      │  Google Maps  │    │   SendGrid   │
│   (Payments)│      │  (Geocoding)  │    │   (Emails)   │
└─────────────┘      └───────────────┘    └──────────────┘
```

## 2. Flujo de Request API

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ 1. HTTP Request + JWT
     │    Authorization: Bearer eyJhbG...
     ▼
┌─────────────────────────┐
│   Middleware Chain      │
│                         │
│  ┌──────────────────┐   │
│  │ 1. CORS          │   │
│  └────────┬─────────┘   │
│           ▼             │
│  ┌──────────────────┐   │
│  │ 2. Helmet        │   │
│  │    (Security)    │   │
│  └────────┬─────────┘   │
│           ▼             │
│  ┌──────────────────┐   │
│  │ 3. Rate Limiter  │   │
│  └────────┬─────────┘   │
│           ▼             │
│  ┌──────────────────┐   │
│  │ 4. Auth          │   │
│  │    Middleware    │   │
│  │    - Verify JWT  │   │
│  └────────┬─────────┘   │
│           ▼             │
│  ┌──────────────────┐   │
│  │ 5. Tenant        │   │
│  │    Middleware    │   │
│  │    - Extract ID  │   │
│  │    - Set Context │   │
│  └────────┬─────────┘   │
└───────────┼─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Router                │
│   /api/v1/:resource     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Controller            │
│   - Validate DTO (Zod)  │
│   - Extract params      │
│   - Call Use Case       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Use Case              │
│   - Business Logic      │
│   - Orchestration       │
└────┬────────────────────┘
     │
     ├──────────┬──────────┬──────────┐
     ▼          ▼          ▼          ▼
┌─────────┐ ┌──────┐ ┌────────┐ ┌────────┐
│Repository│ │Domain│ │External│ │Event   │
│          │ │Service│ │API     │ │Bus     │
└────┬────┘ └──────┘ └────────┘ └────────┘
     │
     ▼
┌──────────┐
│PostgreSQL│
└──────────┘
```

## 3. Flujo OAuth2 - Authorization Code

```
┌────────┐                ┌──────────┐              ┌────────┐
│ Client │                │   API    │              │  User  │
└───┬────┘                └─────┬────┘              └───┬────┘
    │                           │                       │
    │ 1. GET /oauth/authorize   │                       │
    │    ?client_id=xxx         │                       │
    │    &redirect_uri=...      │                       │
    │    &scope=read write      │                       │
    ├──────────────────────────►│                       │
    │                           │                       │
    │                           │ 2. Show Login Screen  │
    │                           ├──────────────────────►│
    │                           │                       │
    │                           │ 3. Credentials        │
    │                           │◄──────────────────────┤
    │                           │                       │
    │                           │ 4. Show Consent       │
    │                           ├──────────────────────►│
    │                           │                       │
    │                           │ 5. Approve            │
    │                           │◄──────────────────────┤
    │                           │                       │
    │ 6. 302 Redirect           │                       │
    │    redirect_uri?code=ABC  │                       │
    │◄──────────────────────────┤                       │
    │                           │                       │
    │ 7. POST /oauth/token      │                       │
    │    grant_type=auth_code   │                       │
    │    code=ABC               │                       │
    │    client_id=xxx          │                       │
    │    client_secret=yyy      │                       │
    ├──────────────────────────►│                       │
    │                           │                       │
    │                           │ 8. Validate           │
    │                           │    - Code valid?      │
    │                           │    - Client auth OK?  │
    │                           │                       │
    │ 9. Token Response         │                       │
    │    {                      │                       │
    │      access_token: "...", │                       │
    │      refresh_token: "..." │                       │
    │    }                      │                       │
    │◄──────────────────────────┤                       │
    │                           │                       │
    │ 10. API Request           │                       │
    │     Authorization: Bearer │                       │
    ├──────────────────────────►│                       │
    │                           │                       │
    │ 11. Protected Resource    │                       │
    │◄──────────────────────────┤                       │
    │                           │                       │
```

## 4. Flujo de Creación de Orden (Inmutable)

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ POST /api/v1/orders
     │ Body: { customer, items[], branch_id, ... }
     │
     ▼
┌─────────────────────────────────────────┐
│         CreateOrderUseCase              │
│                                         │
│  1. Validate DTO                        │
│  2. Get next order_number               │
│     ┌────────────────────────┐          │
│     │ OrderNumberService     │          │
│     │                        │          │
│     │ BEGIN TRANSACTION      │          │
│     │ SELECT FOR UPDATE      │          │
│     │   order_counters       │          │
│     │ current_value + 1      │          │
│     │ COMMIT                 │          │
│     └────────────────────────┘          │
│                                         │
│  3. Calculate delivery cost             │
│     ┌────────────────────────┐          │
│     │ DeliveryCostCalculator │          │
│     │ - Distance             │          │
│     │ - Vehicle type         │          │
│     │ - Zone                 │          │
│     └────────────────────────┘          │
│                                         │
│  4. BEGIN TRANSACTION                   │
│                                         │
│     a) INSERT orders                    │
│        - order_number: 123              │
│        - status: PENDING                │
│        - customer_snapshot              │
│        - delivery_address               │
│                                         │
│     b) INSERT order_branches            │
│        - branch_snapshot                │
│        - is_current: true               │
│                                         │
│     c) INSERT order_items (foreach)     │
│        - product_snapshot               │
│        - quantity, price                │
│                                         │
│     d) INSERT order_summary_totals      │
│        - subtotal, tax, delivery_fee    │
│        - total_amount                   │
│        - is_current: true               │
│        - version: 1                     │
│                                         │
│     e) INSERT order_status_history      │
│        - from_status: null              │
│        - to_status: PENDING             │
│                                         │
│  5. COMMIT                              │
│                                         │
│  6. Emit OrderCreatedEvent              │
│     (for notifications, webhooks)       │
│                                         │
│  7. Return OrderResponseDto             │
└─────────────────────────────────────────┘
```

## 5. Flujo de Asignación de Driver (Inmutable)

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ POST /api/v1/orders/123/assign-driver
     │ Body: { driver_id: "xyz" }
     │
     ▼
┌──────────────────────────────────────────┐
│      AssignDriverUseCase                 │
│                                          │
│  1. Validate order exists                │
│  2. Validate order status allows assign  │
│     (PENDING or CONFIRMED only)          │
│                                          │
│  3. Validate driver available            │
│     ┌───────────────────────┐            │
│     │ DriverRepository      │            │
│     │ - Check status        │            │
│     │ - Check capacity      │            │
│     └───────────────────────┘            │
│                                          │
│  4. BEGIN TRANSACTION                    │
│                                          │
│     a) Mark previous driver as not       │
│        current (if exists)               │
│        UPDATE order_drivers              │
│        SET is_current = false            │
│        WHERE order_id = 123              │
│          AND is_current = true           │
│                                          │
│     b) INSERT new order_drivers record   │
│        - driver_id: "xyz"                │
│        - driver_snapshot: {              │
│            name, phone, vehicle          │
│          }                               │
│        - is_current: true                │
│        - assigned_at: NOW()              │
│                                          │
│     c) UPDATE orders                     │
│        SET status = 'ASSIGNED'           │
│        WHERE id = 123                    │
│                                          │
│     d) INSERT order_status_history       │
│        - from_status: PENDING            │
│        - to_status: ASSIGNED             │
│                                          │
│  5. COMMIT                               │
│                                          │
│  6. Emit DriverAssignedEvent             │
│     - Notify driver (push notification)  │
│     - Notify customer (SMS/email)        │
│                                          │
│  7. Return UpdatedOrderDto               │
└──────────────────────────────────────────┘
```

## 6. Flujo de Modificación de Items (Inmutable)

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     │ PUT /api/v1/orders/123/items
     │ Body: { items: [{ product_id, quantity }] }
     │
     ▼
┌──────────────────────────────────────────┐
│       ModifyItemsUseCase                 │
│                                          │
│  1. Validate order status                │
│     (only DRAFT or PENDING)              │
│                                          │
│  2. BEGIN TRANSACTION                    │
│                                          │
│     a) INSERT new order_items records    │
│        (foreach item in request)         │
│        - product_snapshot                │
│        - quantity, unit_price            │
│        - subtotal                        │
│                                          │
│     b) Recalculate totals                │
│        ┌───────────────────────┐         │
│        │ OrderTotalCalculator  │         │
│        │ - Sum all items       │         │
│        │ - Calculate tax       │         │
│        │ - Add delivery fee    │         │
│        └───────────────────────┘         │
│                                          │
│     c) Mark previous totals as not       │
│        current                           │
│        UPDATE order_summary_totals       │
│        SET is_current = false            │
│        WHERE order_id = 123              │
│          AND is_current = true           │
│                                          │
│     d) INSERT new order_summary_totals   │
│        - subtotal, tax, delivery_fee     │
│        - total_amount                    │
│        - is_current: true                │
│        - version: (previous + 1)         │
│                                          │
│  3. COMMIT                               │
│                                          │
│  4. Return UpdatedOrderDto               │
└──────────────────────────────────────────┘
```

## 7. Multi-Tenancy: Request Flow

```
┌─────────┐
│ Request │
└────┬────┘
     │
     │ Header: Authorization: Bearer eyJhbG...
     │ JWT contains: { tenant_id: "abc-123" }
     │
     ▼
┌─────────────────────────────────────────┐
│       TenantMiddleware                  │
│                                         │
│  1. Decode JWT                          │
│  2. Extract tenant_id from claims       │
│  3. Set req.tenant = { id, name, ... }  │
│  4. Next()                              │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│       PrismaMiddleware                  │
│       (Auto-filter by tenant)           │
│                                         │
│  prisma.$use(async (params, next) => {  │
│    if (params.model in TENANT_MODELS) { │
│      if (!params.args.where) {          │
│        params.args.where = {};          │
│      }                                  │
│      params.args.where.tenant_id =      │
│        context.tenant.id;               │
│    }                                    │
│    return next(params);                 │
│  });                                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│       Database Query                    │
│                                         │
│  SELECT * FROM orders                   │
│  WHERE tenant_id = 'abc-123'            │
│    AND id = '456'                       │
│                                         │
│  ✅ Automatic tenant isolation          │
└─────────────────────────────────────────┘
```

## 8. Arquitectura por Módulos (Vertical Slicing)

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Controller│  │Controller│  │Controller│  │Controller│ │
│  │  Auth    │  │  Orders  │  │  Drivers │  │ Products │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└───────┼─────────────┼─────────────┼──────────────┼──────┘
        │             │             │              │
        │             │             │              │
┌───────┼─────────────┼─────────────┼──────────────┼──────┐
│       │             │             │              │       │
│  ┌────▼─────┐  ┌────▼─────┐  ┌───▼──────┐  ┌────▼────┐ │
│  │ UseCase  │  │ UseCase  │  │ UseCase  │  │UseCase  │ │
│  │ Login    │  │ Create   │  │ Assign   │  │ Create  │ │
│  │          │  │ Order    │  │ Vehicle  │  │ Product │ │
│  └────┬─────┘  └────┬─────┘  └───┬──────┘  └────┬────┘ │
│       │             │             │              │       │
│              APPLICATION LAYER                           │
└───────┼─────────────┼─────────────┼──────────────┼──────┘
        │             │             │              │
┌───────┼─────────────┼─────────────┼──────────────┼──────┐
│       │             │             │              │       │
│  ┌────▼─────┐  ┌────▼──────┐ ┌───▼───────┐ ┌────▼────┐ │
│  │ Domain   │  │  Domain   │ │  Domain   │ │ Domain  │ │
│  │ Service  │  │  Service  │ │  Service  │ │ Service │ │
│  │ Token    │  │  Order    │ │  Driver   │ │ Product │ │
│  └────┬─────┘  └────┬──────┘ └───┬───────┘ └────┬────┘ │
│       │             │             │              │       │
│                   DOMAIN LAYER                           │
└───────┼─────────────┼─────────────┼──────────────┼──────┘
        │             │             │              │
┌───────┼─────────────┼─────────────┼──────────────┼──────┐
│       │             │             │              │       │
│  ┌────▼──────┐ ┌────▼──────┐ ┌───▼────────┐ ┌───▼─────┐│
│  │Repository │ │Repository │ │ Repository │ │Repository││
│  │  User     │ │  Order    │ │   Driver   │ │ Product ││
│  └────┬──────┘ └────┬──────┘ └───┬────────┘ └───┬─────┘│
│       │             │             │              │       │
│            INFRASTRUCTURE LAYER                          │
└───────┼─────────────┼─────────────┼──────────────┼──────┘
        │             │             │              │
        └─────────────┴─────────────┴──────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │  (Multi-Schema) │
                    └─────────────────┘
```

## 9. Flujo de Tracking Público

```
┌──────────┐
│ Customer │
└─────┬────┘
      │
      │ GET /track/{tracking_code}
      │ (No authentication required)
      │
      ▼
┌─────────────────────────────────────────┐
│       PublicTrackingController          │
│                                         │
│  1. Extract tracking_code from URL      │
│  2. No auth middleware applied          │
│     (public endpoint)                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       TrackOrderUseCase                 │
│                                         │
│  1. Find order by tracking_code         │
│     (no tenant_id required)             │
│                                         │
│  2. Load public data only:              │
│     - Order status                      │
│     - Status timeline                   │
│     - Estimated delivery time           │
│     - Driver first name (optional)      │
│     - Provider contact info             │
│                                         │
│  3. Exclude sensitive data:             │
│     ❌ Customer full details            │
│     ❌ Pricing information              │
│     ❌ Driver personal info             │
│                                         │
│  4. Return PublicTrackingDto            │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│       Response                          │
│                                         │
│  {                                      │
│    tracking_code: "ABC123",             │
│    status: "IN_TRANSIT",                │
│    timeline: [                          │
│      {                                  │
│        status: "PENDING",               │
│        timestamp: "2024-01-15T10:00"    │
│      },                                 │
│      {                                  │
│        status: "ASSIGNED",              │
│        timestamp: "2024-01-15T10:30"    │
│      },                                 │
│      {                                  │
│        status: "IN_TRANSIT",            │
│        timestamp: "2024-01-15T11:00"    │
│      }                                  │
│    ],                                   │
│    estimated_delivery: "2024-01-15T14:00│
│    provider_contact: {                  │
│      name: "LogiExpress",               │
│      phone: "+503-1234-5678",           │
│      whatsapp: "https://wa.me/..."      │
│    }                                    │
│  }                                      │
└─────────────────────────────────────────┘
```

## 10. Database Schema Relationships

```
SCHEMA: shared
┌─────────────┐       ┌─────────────────┐
│   Tenant    │◄──────┤ Subscription    │
│             │       │     Plan        │
└──────┬──────┘       └─────────────────┘
       │
       │ 1:N
       │
┌──────▼──────┐       ┌─────────────────┐
│    User     │──────►│  OAuth Tokens   │
│             │  1:N  │  (Access/       │
└─────────────┘       │   Refresh)      │
                      └─────────────────┘

SCHEMA: delivery
┌──────────────┐       ┌──────────────────┐
│    Order     │◄──────┤  OrderBranch     │
│              │  1:N  │  (Snapshot)      │
│              │       └──────────────────┘
│              │       ┌──────────────────┐
│              │◄──────┤  OrderDriver     │
│              │  1:N  │  (Snapshot)      │
│              │       └──────────────────┘
│              │       ┌──────────────────┐
│              │◄──────┤  OrderItem       │
│              │  1:N  │  (Snapshot)      │
│              │       └──────────────────┘
│              │       ┌──────────────────┐
│              │◄──────┤ OrderSummary     │
│              │  1:N  │  Total           │
│              │       │ (Versioned)      │
└──────────────┘       └──────────────────┘

┌──────────────┐       ┌──────────────────┐
│   Driver     │◄──────┤  Logistics       │
│              │  N:1  │  Provider        │
└──────┬───────┘       └──────────────────┘
       │
       │ 1:1 (optional)
       │
┌──────▼───────┐
│   Vehicle    │
└──────────────┘

SCHEMA: retail
┌──────────────┐       ┌──────────────────┐
│   Product    │◄──────┤  Product         │
│              │  1:N  │  Variant         │
└──────┬───────┘       └──────────────────┘
       │
       │ 1:N
       │
┌──────▼───────────┐   ┌──────────────────┐
│  StockByBranch   │◄──┤  Inventory       │
│                  │1:N│  Movement        │
└──────────────────┘   └──────────────────┘
```

---

**Última actualización:** 2024-01-15
**Versión:** 1.0

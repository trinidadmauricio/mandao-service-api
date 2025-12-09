# Documentación de APIs - Mandao Service API

Este documento detalla todos los endpoints disponibles en el backend de Mandao Service API.

## Tabla de Contenidos

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Tenants](#tenants)
- [Sucursales (Branches)](#sucursales-branches)
- [Órdenes](#órdenes)
- [Órdenes Públicas](#órdenes-públicas)
- [Conductores (Drivers)](#conductores-drivers)
- [Vehículos](#vehículos)
- [Proveedores Logísticos](#proveedores-logísticos)
- [Zonas de Entrega](#zonas-de-entrega)
- [Tarifas de Entrega](#tarifas-de-entrega)
- [Productos](#productos)
- [Variantes de Productos](#variantes-de-productos)
- [Categorías](#categorías)
- [Marcas](#marcas)
- [Storefront](#storefront)
- [Geocoding](#geocoding)
- [Pagos](#pagos)
- [Reportes](#reportes)
- [OAuth2](#oauth2)
- [Clientes OAuth](#clientes-oauth)
- [Planes de Suscripción](#planes-de-suscripción)
- [Suscripciones](#suscripciones)
- [Contadores de Órdenes](#contadores-de-órdenes)

---

## Autenticación

### POST `/api/v1/auth/login`
Iniciar sesión con email y contraseña.

**Autenticación:** No requerida

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "OWNER",
      "email_verified": true
    }
  }
}
```

---

### POST `/api/v1/auth/register`
Registrar un nuevo usuario.

**Autenticación:** No requerida

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "tenant_id": "uuid (opcional)"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "CUSTOMER"
    },
    "verification_token": "token (solo en desarrollo)",
    "message": "User registered successfully. Please verify your email."
  }
}
```

---

### GET `/api/v1/auth/verify-email`
Verificar email del usuario.

**Autenticación:** No requerida

**Query Parameters:**
- `token` (string, requerido): Token de verificación recibido por email

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

---

### POST `/api/v1/auth/password/reset-request`
Solicitar restablecimiento de contraseña.

**Autenticación:** No requerida

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "If the email exists, a password reset link has been sent"
}
```

---

### POST `/api/v1/auth/password/reset`
Restablecer contraseña.

**Autenticación:** No requerida

**Body:**
```json
{
  "token": "reset_token_abc123...",
  "password": "newSecurePassword123"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

---

## Usuarios

### GET `/api/v1/users`
Listar usuarios del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `users:read`

**Query Parameters:**
- `search` (string, opcional): Búsqueda en nombre, apellido, email o teléfono
- `role` (string, opcional): Filtrar por rol (SAAS_ADMIN, SAAS_EDITOR, OWNER, SUPERVISOR, MERCHANT_USER, LOGISTICS_PROVIDER, CUSTOMER)
- `status` (string, opcional): Filtrar por estado (ACTIVE, INACTIVE, SUSPENDED)
- `page` (integer, opcional, default: 1): Número de página
- `limit` (integer, opcional, default: 10, max: 100): Resultados por página

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "OWNER",
      "status": "ACTIVE"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

### GET `/api/v1/users/:id`
Obtener usuario por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `users:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "OWNER",
    "email_verified": true
  }
}
```

---

### POST `/api/v1/users`
Crear nuevo usuario.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `users:create`

**Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "role": "MERCHANT_USER",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "status": "ACTIVE",
  "tenant_id": "uuid (opcional)"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "role": "MERCHANT_USER",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE"
  }
}
```

---

### PATCH `/api/v1/users/:id`
Actualizar usuario.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `users:update`

**Body (todos los campos opcionales):**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "role": "MERCHANT_USER",
  "status": "ACTIVE",
  "password": "newSecurePassword123"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MERCHANT_USER",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE"
  }
}
```

---

### DELETE `/api/v1/users/:id`
Eliminar usuario.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `users:delete`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## Tenants

### GET `/api/v1/tenants`
Listar tenants (solo para administradores).

**Autenticación:** Requerida (Bearer Token)

**Query Parameters:**
- `page` (integer, opcional, default: 1): Número de página
- `limit` (integer, opcional, default: 10): Resultados por página

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "domain": "acme-corp",
      "default_currency": "USD",
      "default_locale": "es"
    }
  ]
}
```

---

### GET `/api/v1/tenants/:id`
Obtener tenant por ID.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Acme Corporation",
    "domain": "acme-corp",
    "default_currency": "USD",
    "default_locale": "es"
  }
}
```

---

### POST `/api/v1/tenants`
Crear nuevo tenant.

**Autenticación:** Requerida (Bearer Token)

**Body:**
```json
{
  "slug": "acme-corp",
  "name": "Acme Corporation",
  "type": "HYBRID",
  "subscription_plan_id": "uuid (opcional)",
  "default_currency": "USD",
  "default_locale": "es",
  "settings": {
    "feature_flags": {
      "enable_notifications": true
    }
  }
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "slug": "acme-corp",
    "name": "Acme Corporation",
    "type": "HYBRID",
    "default_currency": "USD",
    "default_locale": "es"
  }
}
```

---

### PATCH `/api/v1/tenants/:id`
Actualizar tenant.

**Autenticación:** Requerida (Bearer Token)

**Body (todos los campos opcionales):**
```json
{
  "name": "Updated Company Name",
  "default_currency": "EUR",
  "default_locale": "es"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Updated Company Name",
    "default_currency": "EUR",
    "default_locale": "es"
  }
}
```

---

### DELETE `/api/v1/tenants/:id`
Eliminar tenant.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Tenant deleted successfully"
}
```

---

## Sucursales (Branches)

### GET `/api/v1/branches`
Listar sucursales del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `branches:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Sucursal Centro",
      "address": "Calle Principal 123, Ciudad, País",
      "phone": "+1234567890",
      "gps_lat": 19.432608,
      "gps_lng": -99.133209,
      "is_main": false,
      "status": "ACTIVE"
    }
  ]
}
```

---

### GET `/api/v1/branches/:id`
Obtener sucursal por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `branches:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Sucursal Centro",
    "address": "Calle Principal 123, Ciudad, País",
    "phone": "+1234567890",
    "gps_lat": 19.432608,
    "gps_lng": -99.133209,
    "is_main": false,
    "status": "ACTIVE"
  }
}
```

---

### POST `/api/v1/branches`
Crear nueva sucursal.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `branches:create`

**Tipo de Tenant:** RETAIL

**Body:**
```json
{
  "tenant_id": "uuid",
  "name": "Sucursal Centro",
  "address": "Calle Principal 123, Ciudad, País",
  "gps_lat": 19.432608,
  "gps_lng": -99.133209,
  "contact_phone": "+1234567890",
  "is_main": false,
  "operating_hours": {
    "monday": {
      "open": "09:00",
      "close": "18:00"
    }
  },
  "status": "ACTIVE"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Sucursal Centro",
    "address": "Calle Principal 123, Ciudad, País",
    "gps_lat": 19.432608,
    "gps_lng": -99.133209,
    "contact_phone": "+1234567890",
    "is_main": false,
    "status": "ACTIVE"
  }
}
```

---

### PATCH `/api/v1/branches/:id`
Actualizar sucursal.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `branches:update`

**Tipo de Tenant:** RETAIL

**Body (todos los campos opcionales):**
```json
{
  "name": "Sucursal Centro Actualizada",
  "address": "Nueva Calle 456, Ciudad, País",
  "gps_lat": 19.432608,
  "gps_lng": -99.133209,
  "contact_phone": "+1234567890",
  "is_main": false,
  "status": "ACTIVE"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Sucursal Centro Actualizada",
    "address": "Nueva Calle 456, Ciudad, País",
    "status": "ACTIVE"
  }
}
```

---

### DELETE `/api/v1/branches/:id`
Eliminar sucursal.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `branches:delete`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Branch deleted successfully"
}
```

---

## Órdenes

### GET `/api/v1/orders`
Listar órdenes del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:read`

**Query Parameters:**
- `search` (string, opcional): Buscar por número de orden, tracking code o order number
- `status` (string, opcional): Filtrar por estado (DRAFT, PENDING, CONFIRMED, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED, FAILED)
- `order_type` (string, opcional): Filtrar por tipo (RETAIL, ON_DEMAND)
- `driver_id` (uuid, opcional): Filtrar por ID del driver
- `branch_id` (uuid, opcional): Filtrar por ID de la sucursal
- `start_date` (date, opcional): Fecha de inicio
- `end_date` (date, opcional): Fecha de fin
- `page` (integer, opcional, default: 1): Número de página
- `limit` (integer, opcional, default: 10, max: 100): Resultados por página

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-000001",
      "order_display_number": "ORD-000001",
      "tracking_code": "TRACK123456",
      "status": "PENDING",
      "order_type": "RETAIL"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

### GET `/api/v1/orders/:id`
Obtener orden por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "order_number": "ORD-000001",
    "order_display_number": "ORD-000001",
    "tracking_code": "TRACK123456",
    "status": "PENDING",
    "order_type": "RETAIL"
  }
}
```

---

### POST `/api/v1/orders`
Crear orden on-demand.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:create`

**Tipo de Tenant:** ON_DEMAND, HYBRID

**Body:**
```json
{
  "customer_snapshot": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+1234567890"
  },
  "delivery_address": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zip_code": "12345",
    "country": "País",
    "lat": 19.432608,
    "lng": -99.133209
  },
  "pickup_address": {
    "street": "Calle Recogida 456",
    "city": "Ciudad",
    "country": "País",
    "lat": 19.432608,
    "lng": -99.133209
  },
  "items": [
    {
      "product_snapshot": {
        "name": "Producto",
        "price": 100.00,
        "currency": "USD"
      },
      "quantity": 2,
      "unit_price": 100.00,
      "notes": "Notas del item"
    }
  ],
  "special_instructions": "Instrucciones especiales",
  "scheduled_pickup_at": "2024-12-25T10:00:00Z",
  "estimated_delivery_at": "2024-12-25T14:00:00Z",
  "priority": "NORMAL",
  "cargo_description": "Descripción del cargo"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "uuid"
    },
    "order_number": "ORD-000001",
    "order_display_number": "ORD-000001",
    "tracking_code": "TRACK123456"
  }
}
```

---

### POST `/api/v1/orders/retail`
Crear orden retail.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:create`

**Tipo de Tenant:** RETAIL, HYBRID

**Body:**
```json
{
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid (opcional)",
      "quantity": 2
    }
  ],
  "customer_snapshot": {
    "name": "Juan Pérez",
    "phone": "+1234567890"
  },
  "delivery_address": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "country": "País",
    "lat": 19.432608,
    "lng": -99.133209
  },
  "branch_id": "uuid",
  "estimated_delivery_at": "2024-12-25T14:00:00Z"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-000001",
    "order_display_number": "ORD-000001",
    "tracking_code": "TRACK123456",
    "status": "PENDING"
  }
}
```

---

### PATCH `/api/v1/orders/:id`
Actualizar estado de orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:update`

**Body:**
```json
{
  "to_status": "CONFIRMED",
  "notes": "Notas opcionales",
  "cancellation_reason": "Razón (requerido si to_status es CANCELLED)"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Order status updated successfully"
}
```

---

### POST `/api/v1/orders/:id/assign-driver`
Asignar driver a orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Body:**
```json
{
  "driver_id": "uuid"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Driver assigned successfully"
}
```

---

### POST `/api/v1/orders/:id/assign-logistics-provider`
Asignar proveedor logístico a orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Body:**
```json
{
  "logistics_provider_id": "uuid"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Logistics provider assigned successfully"
}
```

---

### POST `/api/v1/orders/:id/mark-as-automatic`
Marcar orden como automática.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Order marked as automatic successfully"
}
```

---

### POST `/api/v1/orders/:id/change-branch`
Cambiar branch de orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Body:**
```json
{
  "branch_id": "uuid"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Branch changed successfully"
}
```

---

### POST `/api/v1/orders/:id/modify-items`
Modificar items de orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Body:**
```json
{
  "items": [
    {
      "product_id": "uuid (opcional)",
      "variant_id": "uuid (opcional)",
      "product_snapshot": {},
      "quantity": 2,
      "unit_price": 100.00,
      "notes": "Notas"
    }
  ]
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Items modified successfully"
}
```

---

### POST `/api/v1/orders/:id/cancel`
Cancelar orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:delete`

**Body (opcional):**
```json
{
  "cancellation_reason": "Razón de cancelación"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Order cancelled successfully"
}
```

---

### POST `/api/v1/orders/:id/recalculate-totals`
Recalcular totales de orden.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Body (opcional):**
```json
{
  "tax_rate": 0.16,
  "discount_amount": 10.00
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Totals recalculated successfully"
}
```

---

### POST `/api/v1/orders/:id/delivery-proof`
Agregar prueba de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:manage`

**Body:**
```json
{
  "proof_type": "SIGNATURE",
  "proof_data": {},
  "delivered_to_name": "Juan Pérez",
  "delivered_at": "2024-12-25T14:00:00Z",
  "driver_notes": "Notas del driver"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "message": "Delivery proof added successfully"
}
```

---

### POST `/api/v1/orders/:id/rating`
Agregar rating de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `orders:update`

**Body:**
```json
{
  "customer_rating": 5,
  "driver_rating": 4,
  "customer_comment": "Excelente servicio",
  "driver_comment": "Cliente amable"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "message": "Delivery rating added successfully"
}
```

---

## Órdenes Públicas

### GET `/api/public/orders/:trackingCode`
Obtener orden por código de tracking (público).

**Autenticación:** No requerida

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tracking_code": "TRACK123456",
    "status": "IN_TRANSIT",
    "customer_name": "Juan Pérez",
    "delivery_address": "Calle Principal 123"
  }
}
```

---

## Conductores (Drivers)

### GET `/api/v1/drivers`
Listar conductores del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `drivers:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "logistics_provider_id": "uuid",
      "identity_document": "12345678",
      "driving_license": "LICENSE123",
      "availability_status": "AVAILABLE"
    }
  ]
}
```

---

### GET `/api/v1/drivers/:id`
Obtener conductor por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `drivers:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "logistics_provider_id": "uuid",
    "identity_document": "12345678",
    "driving_license": "LICENSE123",
    "availability_status": "AVAILABLE"
  }
}
```

---

### POST `/api/v1/drivers`
Crear nuevo conductor.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `drivers:create`

**Tipo de Tenant:** ON_DEMAND, HYBRID

**Body:**
```json
{
  "logistics_provider_id": "uuid",
  "user_id": "uuid",
  "identity_document": "12345678",
  "driving_license": "LICENSE123",
  "date_of_birth": "1990-01-15",
  "emergency_contact": {
    "name": "María Pérez",
    "phone": "+1234567890",
    "relationship": "Esposa"
  },
  "has_own_vehicle": true,
  "vehicle_id": "uuid (opcional)",
  "work_type": "FULL_TIME",
  "work_zone": "Zona Centro",
  "availability_status": "AVAILABLE",
  "documents": {
    "insurance": "POLICY123",
    "registration": "REG456"
  }
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "logistics_provider_id": "uuid"
  }
}
```

---

### PATCH `/api/v1/drivers/:id`
Actualizar conductor.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `drivers:update`

**Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "phone": "+1234567890",
  "email": "juan@example.com",
  "license_number": "LICENSE123"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

---

### DELETE `/api/v1/drivers/:id`
Eliminar conductor.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `drivers:delete`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Driver deleted successfully"
}
```

---

## Vehículos

### GET `/api/v1/vehicles`
Listar vehículos del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `vehicles:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "vehicle_type": "SEDAN",
      "license_plate": "ABC-123",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "color": "Blanco",
      "status": "AVAILABLE"
    }
  ]
}
```

---

### GET `/api/v1/vehicles/:id`
Obtener vehículo por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `vehicles:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "vehicle_type": "SEDAN",
    "license_plate": "ABC-123",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "color": "Blanco",
    "status": "AVAILABLE"
  }
}
```

---

### POST `/api/v1/vehicles`
Crear nuevo vehículo.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `vehicles:create`

**Tipo de Tenant:** ON_DEMAND, HYBRID

**Body:**
```json
{
  "logistics_provider_id": "uuid (opcional)",
  "driver_id": "uuid (opcional)",
  "vehicle_type": "SEDAN",
  "license_plate": "ABC-123",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "Blanco",
  "insurance_policy": "POL-123456",
  "insurance_expires_at": "2025-12-31",
  "last_maintenance_at": "2024-01-15",
  "status": "AVAILABLE",
  "specifications": {
    "fuel_type": "Gasolina",
    "capacity_kg": 500
  }
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "vehicle_type": "SEDAN",
    "license_plate": "ABC-123"
  }
}
```

---

### PATCH `/api/v1/vehicles/:id`
Actualizar vehículo.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `vehicles:update`

**Body:**
```json
{
  "plate_number": "ABC-123",
  "vehicle_type": "SEDAN",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "license_plate": "ABC-123"
  }
}
```

---

### DELETE `/api/v1/vehicles/:id`
Eliminar vehículo.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `vehicles:delete`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Vehicle deleted successfully"
}
```

---

## Proveedores Logísticos

### GET `/api/v1/logistics-providers`
Listar proveedores logísticos.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `logistics-providers:read`

**Query Parameters:**
- `search` (string, opcional): Búsqueda en nombre, RUC/NIT o representante
- `status` (string, opcional): Filtrar por estado (ACTIVE, SUSPENDED, INACTIVE)
- `verification_status` (string, opcional): Filtrar por verificación (PENDING, VERIFIED, REJECTED)
- `is_global` (boolean, opcional): Filtrar por tipo (true = globales, false = locales)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "company_name": "Delivery Express S.A.",
      "tax_id": "12345678901",
      "representative_name": "Juan Pérez",
      "status": "ACTIVE",
      "verification_status": "VERIFIED"
    }
  ]
}
```

---

### GET `/api/v1/logistics-providers/:id`
Obtener proveedor logístico por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `logistics-providers:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "company_name": "Delivery Express S.A.",
    "tax_id": "12345678901",
    "representative_name": "Juan Pérez",
    "status": "ACTIVE"
  }
}
```

---

### POST `/api/v1/logistics-providers`
Crear nuevo proveedor logístico.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `logistics-providers:create`

**Tipo de Tenant:** ON_DEMAND, HYBRID

**Body:**
```json
{
  "tenant_id": "uuid (opcional, null para globales)",
  "company_name": "Delivery Express S.A.",
  "tax_id": "12345678901",
  "representative_name": "Juan Pérez",
  "representative_phone": "+1234567890",
  "representative_document": "12345678",
  "verification_status": "PENDING",
  "verification_documents": {
    "business_license": "LIC-123",
    "tax_certificate": "TAX-456"
  },
  "status": "ACTIVE"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "company_name": "Delivery Express S.A."
  }
}
```

---

### PATCH `/api/v1/logistics-providers/:id`
Actualizar proveedor logístico.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `logistics-providers:update`

**Body:**
```json
{
  "name": "Nuevo Nombre",
  "provider_type": "EXTERNAL",
  "api_key": "api_key",
  "api_url": "https://api.example.com"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Nuevo Nombre"
  }
}
```

---

### DELETE `/api/v1/logistics-providers/:id`
Eliminar proveedor logístico.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `logistics-providers:delete`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Logistics provider deleted successfully"
}
```

---

## Zonas de Entrega

### GET `/api/v1/delivery-zones`
Listar zonas de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-zones:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Zona Centro",
      "boundary": "POLYGON(...)",
      "base_rate": 5.00,
      "rate_per_km": 1.50,
      "is_active": true
    }
  ]
}
```

---

### GET `/api/v1/delivery-zones/:id`
Obtener zona de entrega por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-zones:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Zona Centro",
    "boundary": "POLYGON(...)",
    "base_rate": 5.00,
    "rate_per_km": 1.50
  }
}
```

---

### POST `/api/v1/delivery-zones`
Crear nueva zona de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-zones:create`

**Tipo de Tenant:** ON_DEMAND, HYBRID

**Body:**
```json
{
  "tenant_id": "uuid",
  "name": "Zona Centro",
  "boundary": "POLYGON((-58.3816 -34.6037, -58.3826 -34.6047, -58.3836 -34.6057, -58.3816 -34.6037))",
  "base_rate": 5.00,
  "rate_per_km": 1.50,
  "surge_multiplier": 1.5,
  "currency": "USD",
  "is_active": true
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Zona Centro"
  }
}
```

---

### PATCH `/api/v1/delivery-zones/:id`
Actualizar zona de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-zones:update`

**Body:**
```json
{
  "name": "Zona Centro Actualizada",
  "polygon": []
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Zona Centro Actualizada"
  }
}
```

---

### DELETE `/api/v1/delivery-zones/:id`
Eliminar zona de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-zones:delete`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Delivery zone deleted successfully"
}
```

---

## Tarifas de Entrega

### GET `/api/v1/delivery-rates`
Listar tarifas de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-rates:read`

**Query Parameters:**
- `zone_id` (uuid, opcional): Filtrar por zona de entrega

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "vehicle_type": "MOTORCYCLE",
      "distance_km_min": 0,
      "distance_km_max": 5,
      "base_price": 5.00,
      "price_per_km": 1.50,
      "currency": "USD"
    }
  ]
}
```

---

### GET `/api/v1/delivery-rates/:id`
Obtener tarifa de entrega por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-rates:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "vehicle_type": "MOTORCYCLE",
    "base_price": 5.00,
    "price_per_km": 1.50
  }
}
```

---

### POST `/api/v1/delivery-rates`
Crear nueva tarifa de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-rates:create`

**Tipo de Tenant:** ON_DEMAND, HYBRID

**Body:**
```json
{
  "tenant_id": "uuid",
  "zone_id": "uuid (opcional)",
  "vehicle_type": "MOTORCYCLE",
  "distance_km_min": 0,
  "distance_km_max": 5,
  "base_price": 5.00,
  "price_per_km": 1.50,
  "currency": "USD",
  "priority_multiplier": {
    "NORMAL": 1.0,
    "EXPRESS": 1.5,
    "URGENT": 2.0
  }
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "vehicle_type": "MOTORCYCLE"
  }
}
```

---

### PATCH `/api/v1/delivery-rates/:id`
Actualizar tarifa de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-rates:update`

**Body:**
```json
{
  "base_price": 6.00,
  "currency": "USD",
  "price_per_km": 2.00,
  "min_order_value": 50.00
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "base_price": 6.00
  }
}
```

---

### DELETE `/api/v1/delivery-rates/:id`
Eliminar tarifa de entrega.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `delivery-rates:delete`

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Delivery rate deleted successfully"
}
```

---

## Productos

### GET `/api/v1/products`
Listar productos del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:read`

**Tipo de Tenant:** RETAIL

**Query Parameters:**
- `page` (integer, opcional, default: 1): Número de página
- `limit` (integer, opcional, default: 10): Resultados por página
- `category_id` (uuid, opcional): Filtrar por categoría
- `brand_id` (uuid, opcional): Filtrar por marca

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Producto Ejemplo",
      "description": "Descripción del producto",
      "price": 99.99,
      "currency": "USD"
    }
  ]
}
```

---

### GET `/api/v1/products/:id`
Obtener producto por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Producto Ejemplo",
    "description": "Descripción del producto",
    "price": 99.99,
    "currency": "USD",
    "variants": []
  }
}
```

---

### POST `/api/v1/products`
Crear nuevo producto.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:create`

**Tipo de Tenant:** RETAIL

**Body:**
```json
{
  "tenant_id": "uuid",
  "sku": "PROD-001",
  "barcode": "1234567890123",
  "name": "Producto Ejemplo",
  "description": "Descripción detallada",
  "name_translations": {
    "en": "Example Product",
    "es": "Producto Ejemplo"
  },
  "category_id": "uuid",
  "brand_id": "uuid (opcional)",
  "cost_price": 50.00,
  "selling_price": 99.99,
  "compare_at_price": 129.99,
  "currency": "USD",
  "track_inventory": true,
  "current_stock": 100,
  "min_stock_alert": 10,
  "uom": "UNIT",
  "weight_kg": 0.5,
  "dimensions": {
    "length": 10,
    "width": 5,
    "height": 3,
    "unit": "cm"
  },
  "images": {
    "primary": "https://example.com/image1.jpg",
    "gallery": ["https://example.com/image2.jpg"]
  },
  "featured_image_url": "https://example.com/featured.jpg",
  "has_variants": false,
  "is_active": true,
  "is_featured": false,
  "meta_title": "Producto Ejemplo - Tienda Online",
  "meta_description": "Descripción para motores de búsqueda"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "sku": "PROD-001",
    "name": "Producto Ejemplo",
    "selling_price": 99.99,
    "currency": "USD"
  }
}
```

---

### PATCH `/api/v1/products/:id`
Actualizar producto.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:update`

**Tipo de Tenant:** RETAIL

**Body (todos los campos opcionales):**
```json
{
  "name": "Producto Actualizado",
  "selling_price": 89.99,
  "is_active": true
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Producto Actualizado",
    "selling_price": 89.99
  }
}
```

---

### DELETE `/api/v1/products/:id`
Eliminar producto.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:delete`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Product deleted successfully"
}
```

---

## Variantes de Productos

### GET `/api/v1/product-variants`
Listar variantes de productos.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:read`

**Tipo de Tenant:** RETAIL

**Query Parameters:**
- `product_id` (uuid, opcional): Filtrar por producto

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "sku": "PROD-001-RED-L",
      "option1_name": "Color",
      "option1_value": "Rojo",
      "option2_name": "Talla",
      "option2_value": "L"
    }
  ]
}
```

---

### GET `/api/v1/product-variants/:id`
Obtener variante por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "product_id": "uuid",
    "sku": "PROD-001-RED-L",
    "option1_name": "Color",
    "option1_value": "Rojo"
  }
}
```

---

### POST `/api/v1/product-variants`
Crear nueva variante de producto.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:create`

**Tipo de Tenant:** RETAIL

**Body:**
```json
{
  "product_id": "uuid",
  "tenant_id": "uuid",
  "sku": "PROD-001-RED-L",
  "barcode": "1234567890123",
  "option1_name": "Color",
  "option1_value": "Rojo",
  "option2_name": "Talla",
  "option2_value": "L",
  "price_adjustment": 10.00,
  "cost_price": 50.00,
  "currency": "USD",
  "track_inventory": true,
  "current_stock": 100,
  "weight_kg": 0.5,
  "image_url": "https://example.com/variant-image.jpg",
  "is_active": true
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "sku": "PROD-001-RED-L"
  }
}
```

---

### PATCH `/api/v1/product-variants/:id`
Actualizar variante de producto.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:update`

**Tipo de Tenant:** RETAIL

**Body (todos los campos opcionales):**
```json
{
  "sku": "PROD-001-RED-L-UPDATED",
  "current_stock": 150,
  "is_active": true
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "sku": "PROD-001-RED-L-UPDATED"
  }
}
```

---

### DELETE `/api/v1/product-variants/:id`
Eliminar variante de producto.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `products:delete`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Product variant deleted successfully"
}
```

---

## Categorías

### GET `/api/v1/categories`
Listar categorías del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `categories:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Electrónica",
      "slug": "electronica",
      "description": "Categoría de productos electrónicos",
      "is_active": true
    }
  ]
}
```

---

### GET `/api/v1/categories/:id`
Obtener categoría por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `categories:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Electrónica",
    "slug": "electronica",
    "description": "Categoría de productos electrónicos"
  }
}
```

---

### POST `/api/v1/categories`
Crear nueva categoría.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `categories:create`

**Tipo de Tenant:** RETAIL

**Body:**
```json
{
  "tenant_id": "uuid",
  "parent_id": "uuid (opcional)",
  "name": "Electrónica",
  "slug": "electronica",
  "description": "Categoría de productos electrónicos",
  "image_url": "https://example.com/category-image.jpg",
  "display_order": 0,
  "is_active": true
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Electrónica",
    "slug": "electronica"
  }
}
```

---

### PATCH `/api/v1/categories/:id`
Actualizar categoría.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `categories:update`

**Tipo de Tenant:** RETAIL

**Body (todos los campos opcionales):**
```json
{
  "name": "Electrónica Actualizada",
  "slug": "electronica-actualizada",
  "is_active": true
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Electrónica Actualizada"
  }
}
```

---

### DELETE `/api/v1/categories/:id`
Eliminar categoría.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `categories:delete`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Category deleted successfully"
}
```

---

## Marcas

### GET `/api/v1/brands`
Listar marcas del tenant actual.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `brands:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Nike",
      "slug": "nike",
      "logo_url": "https://example.com/nike-logo.png",
      "is_active": true
    }
  ]
}
```

---

### GET `/api/v1/brands/:id`
Obtener marca por ID.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `brands:read`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Nike",
    "slug": "nike",
    "logo_url": "https://example.com/nike-logo.png"
  }
}
```

---

### POST `/api/v1/brands`
Crear nueva marca.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `brands:create`

**Tipo de Tenant:** RETAIL

**Body:**
```json
{
  "tenant_id": "uuid",
  "name": "Nike",
  "slug": "nike",
  "logo_url": "https://example.com/nike-logo.png",
  "description": "Marca de ropa y calzado deportivo",
  "is_active": true
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Nike",
    "slug": "nike"
  }
}
```

---

### PATCH `/api/v1/brands/:id`
Actualizar marca.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `brands:update`

**Tipo de Tenant:** RETAIL

**Body (todos los campos opcionales):**
```json
{
  "name": "Nike Actualizado",
  "slug": "nike-actualizado",
  "is_active": true
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Nike Actualizado"
  }
}
```

---

### DELETE `/api/v1/brands/:id`
Eliminar marca.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `brands:delete`

**Tipo de Tenant:** RETAIL

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Brand deleted successfully"
}
```

---

## Storefront

### GET `/api/v1/storefront/products`
Listar productos del storefront (público).

**Autenticación:** Opcional (Bearer Token)

**Query Parameters:**
- `category_id` (uuid, opcional): Filtrar por categoría
- `brand_id` (uuid, opcional): Filtrar por marca
- `page` (integer, opcional, default: 1): Número de página
- `limit` (integer, opcional, default: 10): Resultados por página

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Producto Ejemplo",
      "selling_price": 99.99,
      "currency": "USD",
      "featured_image_url": "https://example.com/image.jpg"
    }
  ]
}
```

---

### GET `/api/v1/storefront/products/:id`
Obtener producto del storefront por ID (público).

**Autenticación:** Opcional (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Producto Ejemplo",
    "description": "Descripción del producto",
    "selling_price": 99.99,
    "currency": "USD",
    "variants": []
  }
}
```

---

### POST `/api/v1/storefront/checkout`
Procesar checkout (público con auth opcional).

**Autenticación:** Opcional (Bearer Token)

**Body:**
```json
{
  "tenant_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid (opcional)",
      "quantity": 2
    }
  ],
  "customer": {
    "name": "Juan Pérez",
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "delivery_address": {
    "street": "Calle Principal 123",
    "city": "Ciudad",
    "state": "Estado",
    "zip_code": "12345",
    "country": "País",
    "lat": 19.432608,
    "lng": -99.133209
  },
  "pickup_address": {
    "street": "Calle Recogida 456",
    "city": "Ciudad",
    "country": "País",
    "lat": 19.432608,
    "lng": -99.133209
  },
  "branch_id": "uuid",
  "currency": "USD",
  "locale": "es",
  "special_instructions": "Dejar en la puerta",
  "scheduled_pickup_at": "2024-12-25T10:00:00Z",
  "estimated_delivery_at": "2024-12-25T14:00:00Z",
  "priority": "NORMAL"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-000001",
    "order_display_number": "ORD-000001",
    "tracking_code": "TRACK123456",
    "status": "PENDING",
    "created_at": "2024-12-25T10:00:00Z"
  }
}
```

---

## Geocoding

### GET `/api/v1/geocoding/search`
Buscar direcciones.

**Autenticación:** Requerida (Bearer Token)

**Query Parameters:**
- `q` (string, requerido): Query de búsqueda
- `limit` (integer, opcional, default: 10, max: 50): Número máximo de resultados
- `lang` (string, opcional): Idioma (es, en)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "name": "San Salvador",
      "display_name": "San Salvador, El Salvador",
      "lat": 13.6929,
      "lng": -89.2182,
      "address": {
        "street": "Calle Principal",
        "city": "San Salvador",
        "state": "San Salvador",
        "zip_code": "1101",
        "country": "El Salvador"
      }
    }
  ],
  "count": 1
}
```

---

### GET `/api/v1/geocoding/reverse`
Reverse geocoding (obtener dirección desde coordenadas).

**Autenticación:** Requerida (Bearer Token)

**Query Parameters:**
- `lat` (number, requerido): Latitud (-90 a 90)
- `lng` (number, requerido): Longitud (-180 a 180)
- `lang` (string, opcional): Idioma (es, en)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "name": "San Salvador",
    "display_name": "San Salvador, El Salvador",
    "lat": 13.6929,
    "lng": -89.2182,
    "address": {
      "street": "Calle Principal",
      "city": "San Salvador",
      "state": "San Salvador",
      "zip_code": "1101",
      "country": "El Salvador"
    }
  }
}
```

---

## Pagos

### POST `/api/v1/payments/webhooks/stripe`
Webhook de Stripe.

**Autenticación:** No requerida (valida firma de Stripe)

**Body:** Evento de Stripe (estructura definida por Stripe)

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Webhook processed successfully"
}
```

---

### GET `/api/v1/payments/orders/:orderId/payments`
Obtener pagos de una orden.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "amount": 100.50,
      "currency": "USD",
      "status": "COMPLETED",
      "payment_method": "CARD"
    }
  ]
}
```

---

### GET `/api/v1/payments/transactions`
Listar transacciones de pago.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `payments:read`

**Query Parameters:**
- `transaction_type` (string, opcional): Filtrar por tipo (CHARGE, REFUND, AUTHORIZATION, CAPTURE)
- `payment_method` (string, opcional): Filtrar por método (CARD, CASH, TRANSFER, WALLET)
- `status` (string, opcional): Filtrar por estado (PENDING, COMPLETED, FAILED, CANCELLED)
- `order_id` (uuid, opcional): Filtrar por ID de orden
- `start_date` (date-time, opcional): Fecha de inicio
- `end_date` (date-time, opcional): Fecha de fin

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "order_id": "uuid",
      "transaction_type": "CHARGE",
      "payment_method": "CARD",
      "amount": 100.50,
      "currency": "USD",
      "status": "COMPLETED",
      "payment_intent_id": "pi_1234567890",
      "charge_id": "ch_1234567890",
      "card_last4": "4242",
      "card_brand": "visa",
      "created_at": "2024-12-25T10:00:00Z",
      "updated_at": "2024-12-25T10:00:00Z"
    }
  ]
}
```

---

### POST `/api/v1/payments/transactions`
Crear transacción de pago (solo SAAS).

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "order_id": "uuid",
  "transaction_type": "CHARGE",
  "payment_method": "CARD",
  "amount": 100.50,
  "currency": "USD",
  "payment_intent_id": "pi_1234567890",
  "charge_id": "ch_1234567890",
  "refund_id": "re_1234567890",
  "card_last4": "4242",
  "card_brand": "visa",
  "metadata": {
    "customer_id": "cust_123",
    "order_reference": "ORD-001"
  }
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "id": "uuid",
      "amount": 100.50,
      "currency": "USD",
      "status": "COMPLETED"
    }
  }
}
```

---

### POST `/api/v1/payments/checkout`
Crear sesión de checkout con Stripe.

**Autenticación:** Requerida (Bearer Token)

**Body:**
```json
{
  "order_id": "uuid",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "checkout_url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

---

### POST `/api/v1/payments/refunds`
Crear reembolso (solo SAAS).

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "payment_transaction_id": "uuid",
  "amount": 50.25,
  "reason": "requested_by_customer"
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "refund_id": "re_1234567890"
  }
}
```

---

## Reportes

### GET `/api/v1/reports/orders`
Reporte de órdenes.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `reports:read`

**Query Parameters:**
- `tenant_id` (uuid, opcional): ID del tenant (requerido para SAAS_ADMIN)
- `start_date` (date, opcional): Fecha de inicio
- `end_date` (date, opcional): Fecha de fin
- `status` (string, opcional): Filtrar por estado

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "total_orders": 100,
    "total_revenue": 10000.00,
    "by_status": {
      "PENDING": 10,
      "CONFIRMED": 20,
      "DELIVERED": 70
    }
  }
}
```

---

### GET `/api/v1/reports/orders/export`
Exportar órdenes a CSV.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `reports:read`

**Query Parameters:**
- `start_date` (date, opcional): Fecha de inicio
- `end_date` (date, opcional): Fecha de fin
- `status` (string, opcional): Filtrar por estado

**Respuesta 200:**
Content-Type: `text/csv`

---

### GET `/api/v1/reports/inventory`
Reporte de inventario.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `reports:read`

**Query Parameters:**
- `category_id` (uuid, opcional): Filtrar por categoría
- `low_stock` (boolean, opcional): Solo productos con stock bajo

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "total_products": 100,
    "low_stock_products": 10,
    "total_value": 50000.00
  }
}
```

---

### GET `/api/v1/reports/drivers`
Reporte de conductores.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `reports:read`

**Query Parameters:**
- `start_date` (date, opcional): Fecha de inicio
- `end_date` (date, opcional): Fecha de fin
- `driver_id` (uuid, opcional): Filtrar por conductor

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "total_drivers": 10,
    "total_deliveries": 500,
    "average_rating": 4.5
  }
}
```

---

### GET `/api/v1/reports/dashboard/kpis`
KPIs del dashboard.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `reports:read`

**Query Parameters:**
- `tenant_id` (uuid, opcional): ID del tenant (requerido para SAAS_ADMIN)
- `period` (string, opcional, default: month): Período (today, week, month, year)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "total_orders": 100,
    "total_revenue": 10000.00,
    "average_order_value": 100.00,
    "active_drivers": 10
  }
}
```

---

## OAuth2

### GET `/oauth/authorize`
Endpoint de autorización OAuth2.

**Autenticación:** Opcional (Bearer Token)

**Query Parameters:**
- `response_type` (string, requerido): Tipo de respuesta (code, token)
- `client_id` (string, requerido): ID del cliente OAuth
- `redirect_uri` (uri, requerido): URI de redirección
- `scope` (string, opcional): Scopes solicitados
- `state` (string, opcional): Valor de estado para prevenir CSRF

**Respuesta 302:** Redirección a `redirect_uri` con código o token

---

### POST `/oauth/token`
Endpoint de token OAuth2.

**Autenticación:** No requerida (usa client_id y client_secret)

**Content-Type:** `application/x-www-form-urlencoded`

**Body:**
```
grant_type=authorization_code&code=abc123&redirect_uri=https://example.com/callback&client_id=client_123&client_secret=secret_456
```

**Tipos de grant:**
- `authorization_code`: Intercambiar código por token
- `client_credentials`: Token para aplicaciones
- `refresh_token`: Renovar token

**Respuesta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_abc123",
  "scope": "read write"
}
```

---

## Clientes OAuth

### GET `/api/v1/oauth-clients`
Listar clientes OAuth.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "My OAuth Client",
      "client_id": "client_123",
      "redirect_uris": ["https://example.com/callback"]
    }
  ]
}
```

---

### GET `/api/v1/oauth-clients/:id`
Obtener cliente OAuth por ID.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "My OAuth Client",
    "client_id": "client_123",
    "client_secret": "secret_456",
    "redirect_uris": ["https://example.com/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "scope": "read write"
  }
}
```

---

### POST `/api/v1/oauth-clients`
Crear nuevo cliente OAuth.

**Autenticación:** Requerida (Bearer Token)

**Body:**
```json
{
  "tenant_id": "uuid (opcional, null para globales)",
  "name": "My OAuth Client",
  "redirect_uris": ["https://example.com/callback", "https://example.com/callback2"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "read write admin",
  "is_confidential": true
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "My OAuth Client",
    "client_id": "client_123",
    "client_secret": "secret_456",
    "redirect_uris": ["https://example.com/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "scope": "read write admin"
  }
}
```

---

### PATCH `/api/v1/oauth-clients/:id`
Actualizar cliente OAuth.

**Autenticación:** Requerida (Bearer Token)

**Body (todos los campos opcionales):**
```json
{
  "name": "Updated Client Name",
  "redirect_uris": ["https://example.com/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "scope": "read write admin",
  "is_active": true
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Updated Client Name"
  }
}
```

---

### DELETE `/api/v1/oauth-clients/:id`
Eliminar cliente OAuth.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "OAuth client deleted successfully"
}
```

---

## Planes de Suscripción

### GET `/api/v1/subscription-plans`
Listar planes de suscripción.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Respuesta 200:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "Plan Básico",
      "type": "BASIC",
      "price_monthly": 29.99,
      "price_yearly": 299.99
    }
  ]
}
```

---

### GET `/api/v1/subscription-plans/:id`
Obtener plan de suscripción por ID.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Plan Básico",
    "type": "BASIC",
    "price_monthly": 29.99,
    "price_yearly": 299.99,
    "features": {
      "max_products": 100,
      "max_orders": 1000
    }
  }
}
```

---

### POST `/api/v1/subscription-plans`
Crear nuevo plan de suscripción.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "name": "Plan Básico",
  "type": "BASIC",
  "price_monthly": 29.99,
  "price_yearly": 299.99,
  "features": {
    "max_products": 100,
    "max_orders": 1000,
    "support_level": "basic"
  },
  "max_products": 100,
  "max_orders_month": 1000,
  "max_branches": 5
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Plan Básico"
  }
}
```

---

### PATCH `/api/v1/subscription-plans/:id`
Actualizar plan de suscripción.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "name": "Plan Básico Actualizado",
  "price_monthly": 39.99,
  "price_yearly": 399.99
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "Plan Básico Actualizado"
  }
}
```

---

### DELETE `/api/v1/subscription-plans/:id`
Eliminar plan de suscripción.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Subscription plan deleted successfully"
}
```

---

## Suscripciones

### POST `/api/v1/subscriptions/change-plan`
Cambiar plan de suscripción.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "plan_id": "uuid"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Plan changed successfully"
}
```

---

### POST `/api/v1/subscriptions/start-trial`
Iniciar período de prueba.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "plan_id": "uuid",
  "trial_days": 14
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Trial started successfully"
}
```

---

### POST `/api/v1/subscriptions/convert-trial`
Convertir trial a plan de pago.

**Autenticación:** Requerida (Bearer Token)

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "payment_method_id": "pm_1234567890"
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "message": "Trial converted to paid plan successfully"
}
```

---

### GET `/api/v1/subscriptions/limits`
Obtener límites de suscripción.

**Autenticación:** Requerida (Bearer Token)

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "max_products": 100,
    "max_orders_month": 1000,
    "max_branches": 5,
    "current_products": 50,
    "current_orders_month": 200,
    "current_branches": 2
  }
}
```

---

## Contadores de Órdenes

### GET `/api/v1/order-counters/tenant/:tenant_id`
Obtener contador de órdenes por tenant.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `order-counters:read`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "current_value": 1000,
    "prefix": "ORD",
    "padding_length": 6
  }
}
```

---

### POST `/api/v1/order-counters`
Crear contador de órdenes.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `order-counters:create`

**Rol:** SAAS_ADMIN, SAAS_EDITOR

**Body:**
```json
{
  "tenant_id": "uuid",
  "prefix": "ORD",
  "padding_length": 6
}
```

**Respuesta 201:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "tenant_id": "uuid",
    "current_value": 0,
    "prefix": "ORD",
    "padding_length": 6
  }
}
```

---

### POST `/api/v1/order-counters/tenant/:tenant_id/increment`
Incrementar contador de órdenes.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `order-counters:manage`

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "new_value": 1001,
    "order_number": "ORD-0001001"
  }
}
```

---

### PATCH `/api/v1/order-counters/tenant/:tenant_id`
Actualizar contador de órdenes.

**Autenticación:** Requerida (Bearer Token)

**Permisos:** `order-counters:update`

**Body:**
```json
{
  "current_value": 1000,
  "prefix": "ORD",
  "padding_length": 6,
  "reset": false
}
```

**Respuesta 200:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "current_value": 1000,
    "prefix": "ORD"
  }
}
```

---

## Notas Generales

### Autenticación
- La mayoría de los endpoints requieren autenticación mediante Bearer Token
- El token se obtiene mediante `/api/v1/auth/login` o mediante OAuth2
- El token debe incluirse en el header: `Authorization: Bearer <token>`

### Multi-tenancy
- Todos los endpoints (excepto los públicos) requieren el header `X-Tenant-Id`
- El tenant se obtiene automáticamente del token JWT si el usuario pertenece a un tenant
- Los usuarios SAAS_ADMIN pueden especificar `tenant_id` en algunos endpoints

### Permisos
- Cada endpoint requiere permisos específicos (ej: `users:read`, `orders:create`)
- Los permisos se validan según el rol del usuario
- Ver documentación de roles y permisos para más detalles

### Tipos de Tenant
- Algunos endpoints solo están disponibles para ciertos tipos de tenant:
  - `RETAIL`: Solo para tenants de tipo RETAIL o HYBRID
  - `ON_DEMAND`: Solo para tenants de tipo ON_DEMAND o HYBRID
  - `HYBRID`: Disponible para ambos tipos

### Paginación
- Los endpoints de listado soportan paginación con `page` y `limit`
- El límite máximo por defecto es 10, máximo 100
- La respuesta incluye `total`, `page`, `limit` y `totalPages`

### Códigos de Respuesta
- `200`: Éxito
- `201`: Creado exitosamente
- `400`: Error de validación
- `401`: No autenticado
- `403`: Sin permisos suficientes
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

### Formato de Fechas
- Las fechas se envían y reciben en formato ISO 8601: `2024-12-25T14:00:00Z`
- Para fechas sin hora: `2024-12-25`

### Moneda
- La moneda se especifica en formato ISO 4217 (3 caracteres): `USD`, `EUR`, etc.
- Si no se especifica, se usa la moneda por defecto del tenant

### Idioma
- El idioma se especifica mediante el header `Accept-Language`
- Si no se especifica, se usa el idioma por defecto del tenant
- Formatos soportados: `es`, `en`

---

## Documentación Interactiva

Para una documentación interactiva completa con ejemplos y pruebas, visita:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **ReDoc**: `http://localhost:3000/redoc`
- **JSON Spec**: `http://localhost:3000/api-docs.json`

---

**Última actualización:** Diciembre 2024


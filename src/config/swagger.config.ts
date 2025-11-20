/**
 * Configuración de Swagger/OpenAPI
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mandao Service API',
      version: '1.0.0',
      description: `API para sistema SaaS de gestión de entregas multi-tenant

## Autenticación

La API soporta dos métodos de autenticación:

1. **Autenticación Tradicional (JWT)**: Usa el endpoint \`/api/v1/auth/login\` para obtener un token JWT
2. **OAuth2**: Soporta Authorization Code y Client Credentials flows

Todos los endpoints protegidos requieren el header \`Authorization: Bearer <token>\`

## Multi-Tenancy

La API es multi-tenant. El tenant se identifica mediante:
- Header \`X-Tenant-Id\` (opcional si el usuario pertenece a un tenant)
- El tenant del usuario autenticado

## Multi-Currency y Multi-Language

- Cada tenant tiene una moneda por defecto (\`default_currency\`)
- Cada tenant tiene un locale por defecto (\`default_locale\`)
- Los montos monetarios se almacenan con su currency
- Los mensajes de error se pueden traducir usando el header \`Accept-Language\`

## Errores Comunes

### 401 Unauthorized
- Token JWT inválido o expirado
- Token no proporcionado
- Usuario no autenticado

### 404 Not Found
- Recurso no existe
- ID inválido o formato incorrecto

### 400 Bad Request
- Datos de validación incorrectos
- Campos requeridos faltantes
- Formato de datos inválido

### 500 Internal Server Error
- Error inesperado del servidor
- Contactar soporte si persiste

## Ejemplos de Uso

### 1. Autenticación y obtención de token

\`\`\`bash
curl -X POST http://localhost:3000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'
\`\`\`

### 2. Llamada autenticada

\`\`\`bash
curl -X GET http://localhost:3000/api/v1/users \\
  -H "Authorization: Bearer <token>" \\
  -H "X-Tenant-Id: <tenant-id>"
\`\`\`

### 3. Crear recurso

\`\`\`bash
curl -X POST http://localhost:3000/api/v1/products \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Producto", "price": 99.99}'
\`\`\`
`,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint /api/v1/auth/login',
        },
        oauth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: '/oauth/authorize',
              tokenUrl: '/oauth/token',
              scopes: {},
            },
            clientCredentials: {
              tokenUrl: '/oauth/token',
              scopes: {},
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'No autenticado o token inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Unauthorized',
                  },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Resource not found',
                  },
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación de datos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Validation error',
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                        },
                        message: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Internal server error',
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      // ============================================
      // AUTENTICACIÓN Y AUTORIZACIÓN
      // ============================================
      { name: 'Auth', description: 'Autenticación tradicional con email y contraseña. Login, registro, verificación de email y recuperación de contraseña.' },
      { name: 'OAuth', description: 'OAuth2 flows: Authorization Code, Client Credentials y Refresh Token. Endpoints para obtener tokens de acceso.' },
      { name: 'OAuth Clients', description: 'Gestión de clientes OAuth2. CRUD para crear y administrar aplicaciones que usan OAuth2.' },
      
      // ============================================
      // CONFIGURACIÓN DEL SISTEMA (Shared)
      // ============================================
      { name: 'Tenants', description: 'Gestión de tenants (multi-tenancy). Crear, actualizar y administrar organizaciones en el sistema.' },
      { name: 'Users', description: 'Gestión de usuarios del sistema. CRUD de usuarios con roles y permisos.' },
      { name: 'Branches', description: 'Gestión de sucursales. Administrar ubicaciones físicas de los tenants.' },
      { name: 'Subscriptions', description: 'Gestión de planes y suscripciones. Cambiar planes, iniciar trials y consultar límites.' },
      { name: 'Subscription Plans', description: 'Gestión de planes de suscripción base. CRUD de planes disponibles en el sistema.' },
      
      // ============================================
      // RETAIL (E-commerce)
      // ============================================
      { name: 'Products', description: 'Gestión de productos del catálogo. CRUD de productos con variantes, inventario y precios.' },
      { name: 'Product Variants', description: 'Gestión de variantes de productos. Tallas, colores, y otras opciones de productos.' },
      { name: 'Categories', description: 'Gestión de categorías de productos. Organización jerárquica del catálogo.' },
      { name: 'Brands', description: 'Gestión de marcas. Administrar marcas de productos en el catálogo.' },
      { name: 'Storefront', description: 'API pública del storefront. Endpoints públicos para clientes (listar productos, checkout).' },
      
      // ============================================
      // DELIVERY (Logística)
      // ============================================
      { name: 'Orders', description: 'Gestión de órdenes de entrega. Crear, actualizar y consultar órdenes de delivery.' },
      { name: 'Drivers', description: 'Gestión de conductores. Administrar conductores y su disponibilidad.' },
      { name: 'Vehicles', description: 'Gestión de vehículos. Administrar flota de vehículos para entregas.' },
      { name: 'Delivery Zones', description: 'Gestión de zonas de entrega. Definir áreas geográficas de cobertura.' },
      { name: 'Delivery Rates', description: 'Gestión de tarifas de entrega. Configurar precios por zona, distancia y tipo de vehículo.' },
      { name: 'Logistics Providers', description: 'Gestión de proveedores logísticos. Administrar integraciones con servicios de delivery externos.' },
      
      // ============================================
      // OPERACIONES Y FINANZAS
      // ============================================
      { name: 'Payments', description: 'Gestión de pagos y transacciones. Integración con Stripe, webhooks y reembolsos.' },
      { name: 'Reports', description: 'Reportes y analytics. KPIs, reportes de órdenes, inventario y conductores.' },
      { name: 'Order Counters', description: 'Gestión de contadores de órdenes. Generación de números de orden únicos por tenant.' },
    ],
    // Agrupar tags para mejor organización en ReDoc
    'x-tagGroups': [
      {
        name: 'Autenticación y Autorización',
        tags: ['Auth', 'OAuth', 'OAuth Clients'],
      },
      {
        name: 'Configuración del Sistema',
        tags: ['Tenants', 'Users', 'Branches', 'Subscriptions', 'Subscription Plans'],
      },
      {
        name: 'Retail (E-commerce)',
        tags: ['Products', 'Product Variants', 'Categories', 'Brands', 'Storefront'],
      },
      {
        name: 'Delivery (Logística)',
        tags: ['Orders', 'Drivers', 'Vehicles', 'Delivery Zones', 'Delivery Rates', 'Logistics Providers'],
      },
      {
        name: 'Operaciones y Finanzas',
        tags: ['Payments', 'Reports', 'Order Counters'],
      },
    ],
  },
  apis: ['./src/**/*.routes.ts', './src/**/*.controller.ts'], // Rutas donde buscar anotaciones
};

export const swaggerSpec = swaggerJsdoc(options);


/// <reference path="./shared/types/express.d.ts" />
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';
import { swaggerSpec } from './config/swagger.config';
import { logger } from './shared/utils/logger';
import { i18nMiddleware } from './shared/middleware/i18n.middleware';
import { tenantMiddleware } from './shared/middleware/tenant.middleware';
import { serializerMiddleware } from './shared/middleware/serializer.middleware';

const app: Express = express();

// Security middleware - Configurar CSP más permisivo para documentación
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
          'https://fonts.googleapis.com',
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'https://unpkg.com',
          'https://cdn.jsdelivr.net',
        ],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
  credentials: true,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (antes del middleware de tenant)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Documentation (antes del middleware de tenant)
// Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Mandao API Documentation',
    customCssUrl: undefined,
    swaggerOptions: {
      docExpansion: 'list', // 'none', 'list', or 'full'
      filter: true, // Habilitar filtro de búsqueda
      showRequestHeaders: true,
      tryItOutEnabled: true,
      tagsSorter: 'alpha', // Ordenar tags alfabéticamente
      operationsSorter: 'alpha', // Ordenar operaciones alfabéticamente
    },
  })
);

// ReDoc - JSON spec endpoint
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ReDoc UI
app.get(
  '/redoc',
  redoc({
    title: 'Mandao API Documentation',
    specUrl: '/api-docs.json',
    redocOptions: {
      scrollYOffset: 0,
      hideDownloadButton: false,
      disableSearch: false,
      expandResponses: '200,201',
      jsonSampleExpandLevel: 2,
      hideSingleRequestSampleTab: false,
      menuToggle: true,
      nativeScrollbars: true,
      pathInMiddlePanel: true,
      requiredPropsFirst: true,
      sortOperationsAlphabetically: true,
      sortTagsAlphabetically: true,
      hideHostname: false,
      theme: {
        colors: {
          primary: {
            main: '#3b82f6',
          },
        },
      },
    },
  })
);

// Tenant isolation middleware (debe ir después de health y api-docs)
app.use(tenantMiddleware);

// i18n middleware (debe ir después de tenant para usar default_locale)
app.use(i18nMiddleware);

// Serializer middleware (serializa BigInt, Decimal, etc. en todas las respuestas)
app.use(serializerMiddleware);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// API routes
import tenantsRoutes from './domains/shared/tenants/presentation/routes/tenants.routes';
import subscriptionPlansRoutes from './domains/shared/subscription-plans/presentation/routes/subscription-plans.routes';
import usersRoutes from './domains/shared/users/presentation/routes/users.routes';
import branchesRoutes from './domains/shared/branches/presentation/routes/branches.routes';
import orderCountersRoutes from './domains/shared/order-counters/presentation/routes/order-counters.routes';
import oauthRoutes from './domains/shared/oauth/presentation/routes/oauth.routes';
import oauthClientsRoutes from './domains/shared/oauth/presentation/routes/oauth-clients.routes';
import authRoutes from './domains/shared/auth/presentation/routes/auth.routes';
import logisticsProvidersRoutes from './domains/delivery/logistics-providers/presentation/routes/logistics-providers.routes';
import driversRoutes from './domains/delivery/drivers/presentation/routes/drivers.routes';
import vehiclesRoutes from './domains/delivery/vehicles/presentation/routes/vehicles.routes';
import deliveryZonesRoutes from './domains/delivery/delivery-zones/presentation/routes/delivery-zones.routes';
import deliveryRatesRoutes from './domains/delivery/delivery-rates/presentation/routes/delivery-rates.routes';
import ordersRoutes from './domains/delivery/orders/presentation/routes/orders.routes';
import publicOrdersRoutes from './domains/delivery/orders/presentation/routes/public-orders.routes';
import categoriesRoutes from './domains/retail/categories/presentation/routes/categories.routes';
import brandsRoutes from './domains/retail/brands/presentation/routes/brands.routes';
import productsRoutes from './domains/retail/products/presentation/routes/products.routes';
import productVariantsRoutes from './domains/retail/product-variants/presentation/routes/product-variants.routes';
import storefrontRoutes from './domains/retail/storefront/presentation/routes/storefront.routes';
import paymentsRoutes from './domains/shared/payments/presentation/routes/payments.routes';
import subscriptionsRoutes from './domains/shared/subscription-plans/presentation/routes/subscriptions.routes';
import reportsRoutes from './domains/shared/reports/presentation/routes/reports.routes';

app.use('/api/v1/tenants', tenantsRoutes);
app.use('/api/v1/subscription-plans', subscriptionPlansRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/branches', branchesRoutes);
app.use('/api/v1/order-counters', orderCountersRoutes);
app.use('/oauth', oauthRoutes);
app.use('/api/v1/oauth-clients', oauthClientsRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/logistics-providers', logisticsProvidersRoutes);
app.use('/api/v1/drivers', driversRoutes);
app.use('/api/v1/vehicles', vehiclesRoutes);
app.use('/api/v1/delivery-zones', deliveryZonesRoutes);
app.use('/api/v1/delivery-rates', deliveryRatesRoutes);
app.use('/api/v1/orders', ordersRoutes);
app.use('/api/public/orders', publicOrdersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/brands', brandsRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/product-variants', productVariantsRoutes);
app.use('/api/v1/storefront', storefrontRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/subscriptions', subscriptionsRoutes);
app.use('/api/v1/reports', reportsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

export default app;

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  API_URL: process.env.API_URL || 'http://localhost:3000',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  DATABASE_POOL_MIN: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
  DATABASE_POOL_MAX: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),

  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  REDIS_TLS_URL: process.env.REDIS_TLS_URL || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',

  // OAuth2
  OAUTH_AUTHORIZATION_CODE_TTL: parseInt(process.env.OAUTH_AUTHORIZATION_CODE_TTL || '600', 10),
  OAUTH_ACCESS_TOKEN_TTL: parseInt(process.env.OAUTH_ACCESS_TOKEN_TTL || '3600', 10),

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',

  // Email
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@mandao.com',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Geocoding (Photon)
  // Si el backend corre fuera de Docker: usar http://localhost:2322
  // Si el backend corre dentro de Docker: usar http://photon:2322
  // Para usar servicio público: configurar PHOTON_URL=https://photon.komoot.de
  PHOTON_URL: process.env.PHOTON_URL || 'http://localhost:2322',
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

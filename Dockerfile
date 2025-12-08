# Multi-stage build para optimizar tamaño de imagen
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache libc6-compat openssl

# Copiar archivos de dependencias (copiar explícitamente package-lock.json)
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Stage de producción
FROM node:20-alpine AS production

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma en producción
RUN apk add --no-cache libc6-compat openssl curl

# Instalar solo dependencias de producción
# Deshabilitar scripts de prepare (husky) en producción
# Copiar explícitamente package-lock.json para npm ci
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copiar archivos compilados y Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Cambiar ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check mejorado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
# Nota: Las migraciones deben ejecutarse manualmente antes de iniciar el contenedor
# o usando un script de orquestación (Kubernetes init container, docker-compose, etc.)
CMD ["node", "dist/server.js"]

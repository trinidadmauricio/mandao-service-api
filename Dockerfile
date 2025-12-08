# Multi-stage build para optimizar tamaño de imagen
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache libc6-compat openssl

# Copiar archivos de dependencias
# Copiar package.json primero (siempre existe)
COPY package.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Copiar package-lock.json si existe (para builds reproducibles)
# Si no existe, npm install generará uno nuevo
COPY package-lock.json* ./

# Instalar dependencias (incluyendo devDependencies para build)
# Usar npm ci si package-lock.json existe (más rápido y determinístico)
# Si no existe, usar npm install (generará package-lock.json)
RUN if [ -f package-lock.json ]; then \
      echo "📦 Usando package-lock.json para instalación determinística" && \
      npm ci; \
    else \
      echo "⚠️  package-lock.json no encontrado, usando npm install" && \
      npm install; \
    fi

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Stage de producción
FROM node:20-alpine AS production

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma y módulos nativos (bcrypt)
# python3, make, g++ son necesarios para compilar módulos nativos como bcrypt
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Instalar solo dependencias de producción
# Excluir devDependencies (husky, jest, etc.)
COPY package.json ./
# Copiar package-lock.json si existe
COPY package-lock.json* ./
# Deshabilitar script de prepare temporalmente para evitar husky install
# Luego reinstalar con scripts habilitados para compilar módulos nativos
RUN if [ -f package-lock.json ]; then \
      echo "📦 Instalando dependencias sin scripts (para evitar husky)..." && \
      npm ci --omit=dev --ignore-scripts; \
    else \
      echo "⚠️  package-lock.json no encontrado, usando npm install" && \
      npm install --omit=dev --ignore-scripts; \
    fi && \
    # Verificar que husky no esté instalado
    if [ -d "node_modules/husky" ]; then \
      echo "⚠️  Removiendo husky de producción..." && \
      rm -rf node_modules/husky; \
    fi && \
    # Reconstruir módulos nativos (bcrypt necesita compilar sus bindings)
    echo "🔨 Compilando módulos nativos (bcrypt)..." && \
    npm rebuild bcrypt --build-from-source && \
    npm cache clean --force

# Copiar archivos compilados y Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Remover herramientas de build después de compilar módulos nativos
# (reducir tamaño de imagen)
RUN apk del python3 make g++ && \
    rm -rf /var/cache/apk/*

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

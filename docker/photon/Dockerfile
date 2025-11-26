# Dockerfile para Photon Geocoding - Construcción desde código fuente
FROM eclipse-temurin:21-jdk AS builder

# Instalar dependencias de construcción
RUN apt-get update && apt-get install -y \
    git \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Clonar y construir Photon desde el código fuente
WORKDIR /build
RUN git clone --depth 1 https://github.com/komoot/photon.git . && \
    ./gradlew installDist

# Imagen final
FROM eclipse-temurin:21-jre

# Instalar dependencias
RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar Photon construido
COPY --from=builder /build/build/install/photon /photon

WORKDIR /photon

# Exponer puerto
EXPOSE 2322

# Script de inicio que importa desde Nominatim
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
DATA_DIR="/photon_data"\n\
PHOTON_DATA="$DATA_DIR/photon_data"\n\
NOMINATIM_HOST="${NOMINATIM_HOST:-nominatim}"\n\
NOMINATIM_PORT="${NOMINATIM_PORT:-5432}"\n\
NOMINATIM_DB="${NOMINATIM_DB:-nominatim}"\n\
NOMINATIM_USER="${NOMINATIM_USER:-nominatim}"\n\
NOMINATIM_PASSWORD="${NOMINATIM_PASSWORD:-}"\n\
\n\
echo "=== Photon Geocoding Service ==="\n\
\n\
# Si ya hay datos procesados, iniciar servicio\n\
if [ -d "$PHOTON_DATA" ] && [ "$(ls -A $PHOTON_DATA 2>/dev/null)" ]; then\n\
    echo "✓ Datos de Photon encontrados, iniciando servicio..."\n\
    exec ./bin/photon -data-dir "$DATA_DIR" -listen 0.0.0.0 -listen-port 2322\n\
fi\n\
\n\
# Esperar a que Nominatim esté listo\n\
echo "⏳ Esperando a que Nominatim esté disponible..."\n\
for i in {1..60}; do\n\
    if PGPASSWORD="$NOMINATIM_PASSWORD" psql -h "$NOMINATIM_HOST" -p "$NOMINATIM_PORT" -U "$NOMINATIM_USER" -d "$NOMINATIM_DB" -c "SELECT 1" >/dev/null 2>&1; then\n\
        echo "✓ Nominatim está disponible"\n\
        break\n\
    fi\n\
    if [ $i -eq 60 ]; then\n\
        echo "❌ Nominatim no está disponible después de 5 minutos"\n\
        exit 1\n\
    fi\n\
    sleep 5\n\
done\n\
\n\
# Verificar si Nominatim tiene datos\n\
echo "⏳ Verificando datos en Nominatim..."\n\
ROW_COUNT=$(PGPASSWORD="$NOMINATIM_PASSWORD" psql -h "$NOMINATIM_HOST" -p "$NOMINATIM_PORT" -U "$NOMINATIM_USER" -d "$NOMINATIM_DB" -t -c "SELECT COUNT(*) FROM placex LIMIT 1" 2>/dev/null || echo "0")\n\
\n\
if [ "$ROW_COUNT" -lt 1000 ]; then\n\
    echo "⚠️  Nominatim no tiene suficientes datos aún. Esperando..."\n\
    echo "   El procesamiento de OSM puede tomar varias horas."\n\
    echo "   Puede ver el progreso en: docker-compose logs -f nominatim"\n\
    exit 1\n\
fi\n\
\n\
echo "✓ Nominatim tiene datos, importando a Photon..."\n\
echo "⚠️  Esto puede tomar 10-30 minutos..."\n\
\n\
# Importar desde Nominatim\n\
./bin/photon \\\n\
    -nominatim-import \\\n\
    -host "$NOMINATIM_HOST" \\\n\
    -port "$NOMINATIM_PORT" \\\n\
    -database "$NOMINATIM_DB" \\\n\
    -user "$NOMINATIM_USER" \\\n\
    -password "$NOMINATIM_PASSWORD" \\\n\
    -data-dir "$DATA_DIR"\n\
\n\
echo "✓ Importación completada, iniciando servicio..."\n\
exec ./bin/photon -data-dir "$DATA_DIR" -listen 0.0.0.0 -listen-port 2322\n\
' > /photon/start.sh && chmod +x /photon/start.sh

CMD ["/photon/start.sh"]

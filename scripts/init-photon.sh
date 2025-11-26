#!/bin/bash
# Script para inicializar Photon con datos de Centro América y Caribe

set -e

CONTAINER_NAME="mandao-photon"
DATA_DIR="./photon_data"
OSM_FILE="$DATA_DIR/central-america-caribbean-latest.osm.pbf"
CENTRAL_AMERICA_URL="https://download.geofabrik.de/central-america-latest.osm.pbf"
CARIBBEAN_URL="https://download.geofabrik.de/caribbean-latest.osm.pbf"

echo "=== Inicialización de Photon Geocoding ==="
echo ""

# Crear directorio si no existe
mkdir -p "$DATA_DIR"

# Verificar si el archivo OSM combinado ya existe
if [ -f "$OSM_FILE" ]; then
    echo "✓ Archivo OSM combinado ya existe: $OSM_FILE"
else
    echo "📥 Descargando extractos OSM de Centro América y Caribe..."
    echo "   Esto puede tomar varios minutos dependiendo de tu conexión..."
    
    # Descargar Centro América
    CENTRAL_AMERICA_FILE="$DATA_DIR/central-america-latest.osm.pbf"
    if [ ! -f "$CENTRAL_AMERICA_FILE" ]; then
        echo "   Descargando Centro América..."
        curl -L -C - "$CENTRAL_AMERICA_URL" -o "$CENTRAL_AMERICA_FILE" || {
            echo "❌ Error al descargar el extracto de Centro América"
            exit 1
        }
    fi
    
    # Descargar Caribe
    CARIBBEAN_FILE="$DATA_DIR/caribbean-latest.osm.pbf"
    if [ ! -f "$CARIBBEAN_FILE" ]; then
        echo "   Descargando Caribe..."
        curl -L -C - "$CARIBBEAN_URL" -o "$CARIBBEAN_FILE" || {
            echo "❌ Error al descargar el extracto del Caribe"
            exit 1
        }
    fi
    
    echo "✓ Descargas completadas"
    echo ""
    echo "🔄 Combinando extractos (esto puede tomar varios minutos)..."
    
    # Combinar usando osmium en Docker
    docker run --rm \
        -v "$(pwd)/$DATA_DIR:/data" \
        -w /data \
        ghcr.io/osmcode/osmium-tool:latest \
        merge \
        central-america-latest.osm.pbf \
        caribbean-latest.osm.pbf \
        -o central-america-caribbean-latest.osm.pbf || {
        echo "❌ Error al combinar los archivos OSM"
        echo "   Asegúrate de tener Docker instalado y corriendo"
        exit 1
    }
    
    echo "✓ Archivos combinados exitosamente"
fi

# Verificar que el contenedor esté corriendo
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "🚀 Iniciando contenedor Photon..."
    docker-compose up -d photon
    echo "⏳ Esperando a que el contenedor esté listo..."
    sleep 5
fi

# Copiar archivo al contenedor
echo "📦 Copiando archivo OSM combinado al contenedor..."
docker cp "$OSM_FILE" "$CONTAINER_NAME:/nominatim/data/"

echo ""
echo "🔄 Reiniciando contenedor para procesar datos..."
echo "   ⚠️  El procesamiento puede tomar 10-30 minutos dependiendo del tamaño del archivo"
docker-compose restart photon

echo ""
echo "✓ Inicialización completada"
echo ""
echo "Para ver el progreso del procesamiento:"
echo "   docker-compose logs -f photon"
echo ""
echo "Una vez completado, Photon estará disponible en:"
echo "   http://localhost:2322"


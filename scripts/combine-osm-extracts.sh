#!/bin/bash
# Script para combinar extractos OSM de Centro América y Caribe

set -e

DATA_DIR="./photon_data"
CENTRAL_AMERICA="$DATA_DIR/central-america-latest.osm.pbf"
CARIBBEAN="$DATA_DIR/caribbean-latest.osm.pbf"
COMBINED="$DATA_DIR/central-america-caribbean-latest.osm.pbf"

echo "=== Combinando extractos OSM de Centro América y Caribe ==="
echo ""

# Verificar que ambos archivos existen
if [ ! -f "$CENTRAL_AMERICA" ]; then
    echo "❌ Error: No se encontró $CENTRAL_AMERICA"
    exit 1
fi

if [ ! -f "$CARIBBEAN" ]; then
    echo "❌ Error: No se encontró $CARIBBEAN"
    echo "   Descargando extracto del Caribe..."
    curl -L "https://download.geofabrik.de/caribbean-latest.osm.pbf" -o "$CARIBBEAN" || {
        echo "❌ Error al descargar el extracto del Caribe"
        exit 1
    }
    echo "✓ Extracto del Caribe descargado"
fi

echo "✓ Archivos encontrados:"
echo "  - Centro América: $(ls -lh "$CENTRAL_AMERICA" | awk '{print $5}')"
echo "  - Caribe: $(ls -lh "$CARIBBEAN" | awk '{print $5}')"
echo ""

# Usar Docker para combinar los archivos con osmium
echo "🔄 Combinando archivos OSM (esto puede tomar varios minutos)..."
docker run --rm \
    -v "$(pwd)/$DATA_DIR:/data" \
    -w /data \
    ghcr.io/osmcode/osmium-tool:latest \
    merge \
    central-america-latest.osm.pbf \
    caribbean-latest.osm.pbf \
    -o central-america-caribbean-latest.osm.pbf

if [ $? -eq 0 ] && [ -f "$COMBINED" ]; then
    echo ""
    echo "✓ Archivos combinados exitosamente!"
    echo "  Archivo combinado: $(ls -lh "$COMBINED" | awk '{print $5}')"
    echo ""
    echo "El archivo combinado está listo para usar en Nominatim."
else
    echo "❌ Error al combinar los archivos"
    exit 1
fi


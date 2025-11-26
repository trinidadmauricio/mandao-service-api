# Comandos para Photon - Guía Rápida

## 🚀 Inicialización (Primera Vez)

### Paso 1: Construir la imagen de Photon

```bash
cd /Users/mauriciotrinidad/Downloads/ia_labs/mandao-service-api
docker-compose build photon
```

**Tiempo:** 10-15 minutos

---

### Paso 2: Descargar y preparar datos OSM (Centro América + Caribe)

```bash
# Opción A: Script automatizado (recomendado)
./scripts/init-photon.sh

# Opción B: Manual
mkdir -p photon_data
curl -L "https://download.geofabrik.de/central-america-latest.osm.pbf" -o photon_data/central-america-latest.osm.pbf
curl -L "https://download.geofabrik.de/caribbean-latest.osm.pbf" -o photon_data/caribbean-latest.osm.pbf
./scripts/combine-osm-extracts.sh
```

**Tiempo:** 10-20 minutos (descarga) + 5-10 minutos (combinación)

---

### Paso 3: Iniciar Nominatim para procesar datos OSM

```bash
docker-compose up -d nominatim
```

**Tiempo:** 2-6 horas (procesamiento de OSM)

---

### Paso 4: Monitorear el progreso de Nominatim

```bash
# Ver logs en tiempo real
docker-compose logs -f nominatim

# Verificar si terminó (en otra terminal)
docker-compose exec nominatim bash -c "PGPASSWORD=mandao_nominatim_pass psql -U nominatim -d nominatim -h localhost -c 'SELECT COUNT(*) FROM placex;'"
```

**Esperar hasta que:** El COUNT(\*) sea > 1000

---

### Paso 5: Iniciar Photon (después de que Nominatim termine)

```bash
docker-compose up -d photon
```

**Tiempo:** 10-30 minutos (importación desde Nominatim)

---

### Paso 6: Verificar que Photon funciona

```bash
# Ver logs
docker-compose logs -f photon

# Probar el servicio
curl "http://localhost:2322/api?q=San%20Salvador"
```

---

## ⚙️ Configuración del Backend

### Crear/editar archivo `.env`

```bash
# Para desarrollo local (backend fuera de Docker)
PHOTON_URL=http://localhost:2322
```

---

## 📋 Comandos de Uso Diario

### Iniciar todos los servicios

```bash
docker-compose up -d nominatim photon
```

### Ver estado de servicios

```bash
docker-compose ps
```

### Ver logs de un servicio

```bash
docker-compose logs -f nominatim  # Nominatim
docker-compose logs -f photon     # Photon
```

### Detener servicios

```bash
docker-compose stop nominatim photon
```

### Reiniciar un servicio

```bash
docker-compose restart photon
```

### Ver uso de recursos

```bash
docker stats
```

---

## 🔍 Verificación y Diagnóstico

### Verificar que Nominatim tiene datos

```bash
docker-compose exec nominatim bash -c "PGPASSWORD=mandao_nominatim_pass psql -U nominatim -d nominatim -h localhost -c 'SELECT COUNT(*) FROM placex;'"
```

### Verificar que Photon responde

```bash
curl "http://localhost:2322/api?q=test"
```

### Ver tamaño de archivos OSM

```bash
ls -lh photon_data/*.osm.pbf
```

### Ver volúmenes Docker

```bash
docker volume ls | grep mandao
```

---

## 🧹 Limpieza (si necesitas empezar de nuevo)

### Detener y eliminar contenedores

```bash
docker-compose down
```

### Eliminar contenedores y volúmenes (⚠️ BORRA LOS DATOS PROCESADOS)

```bash
docker-compose down -v
```

### Eliminar solo los datos OSM descargados

```bash
rm -rf photon_data/*.osm.pbf
```

---

## 📝 Resumen de Tiempos

| Proceso                 | Tiempo Estimado  |
| ----------------------- | ---------------- |
| Construir Photon        | 10-15 min        |
| Descargar OSM           | 10-20 min        |
| Combinar OSM            | 5-10 min         |
| Procesar con Nominatim  | **2-6 horas** ⏰ |
| Importar a Photon       | 10-30 min        |
| **Total (primera vez)** | **3-7 horas**    |

---

## 🎯 Flujo Completo (Copy-Paste)

```bash
# 1. Construir Photon
docker-compose build photon

# 2. Descargar y combinar OSM
./scripts/init-photon.sh

# 3. Iniciar Nominatim
docker-compose up -d nominatim

# 4. Monitorear (en otra terminal)
docker-compose logs -f nominatim

# 5. Cuando termine Nominatim, iniciar Photon
docker-compose up -d photon

# 6. Verificar
curl "http://localhost:2322/api?q=San%20Salvador"
```

---

## ⚠️ Notas Importantes

- **Primera vez:** El proceso completo toma 3-7 horas
- **Siguientes veces:** Solo `docker-compose up -d` (segundos)
- **Espacio en disco:** Necesitas ~50-100 GB libres
- **Memoria:** Nominatim necesita mínimo 4-8 GB RAM
- **Backend fuera de Docker:** Usa `PHOTON_URL=http://localhost:2322`
- **Backend dentro de Docker:** Usa `PHOTON_URL=http://photon:2322`

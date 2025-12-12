#!/bin/bash
#
# Script para forzar rebuild completo del API sin cache
# Resuelve el problema de "solo 2 paquetes instalados"
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     REBUILD COMPLETO API (sin cache)            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# PASO 1: Detener contenedores
# ============================================
echo -e "${BLUE}[1/6]${NC} Deteniendo contenedores..."
docker compose -f docker-compose.prod.yml down
echo -e "${GREEN}✓${NC} Contenedores detenidos"
echo ""

# ============================================
# PASO 2: Listar imágenes actuales
# ============================================
echo -e "${BLUE}[2/6]${NC} Listando imágenes actuales..."
docker images | grep euforia || echo "No se encontraron imágenes previas"
echo ""

# ============================================
# PASO 3: Eliminar imagen vieja del API
# ============================================
echo -e "${BLUE}[3/6]${NC} Eliminando imagen vieja del API..."
docker rmi -f euforia-events-api:latest 2>/dev/null || echo "Imagen no existía"
echo -e "${GREEN}✓${NC} Imagen eliminada"
echo ""

# ============================================
# PASO 4: Rebuild SIN CACHE (lo más importante)
# ============================================
echo -e "${BLUE}[4/6]${NC} Rebuilding imagen API SIN CACHE..."
echo -e "${YELLOW}⚠${NC}  Esto puede tardar 5-10 minutos..."
echo ""

docker compose -f docker-compose.prod.yml build --no-cache --progress=plain api

echo ""
echo -e "${GREEN}✓${NC} Rebuild completado"
echo ""

# ============================================
# PASO 5: Iniciar servicios
# ============================================
echo -e "${BLUE}[5/6]${NC} Iniciando servicios..."
docker compose -f docker-compose.prod.yml up -d
echo ""

# Esperar a que el contenedor esté listo
echo "Esperando a que el contenedor esté listo..."
sleep 5
echo ""

# ============================================
# PASO 6: Verificar dependencias instaladas
# ============================================
echo -e "${BLUE}[6/6]${NC} Verificando dependencias instaladas..."
echo ""

# En pnpm workspaces, las deps del API están en /app/apps/api/node_modules
DEPS_COUNT=$(docker exec euforia-api-prod ls /app/apps/api/node_modules 2>/dev/null | wc -l || echo "0")

if [ "$DEPS_COUNT" -lt 10 ]; then
    echo -e "${RED}✗${NC} FALLO: Solo $DEPS_COUNT paquetes instalados"
    echo ""
    echo "Paquetes encontrados:"
    docker exec euforia-api-prod ls /app/apps/api/node_modules
    echo ""
    echo -e "${YELLOW}El problema persiste. Posibles causas:${NC}"
    echo "1. Docker compose build no usó el Dockerfile correcto"
    echo "2. Hay un docker-compose.yml en lugar de docker-compose.prod.yml"
    echo "3. El contexto de build está mal configurado"
    echo ""
    exit 1
else
    echo -e "${GREEN}✓${NC} ¡ÉXITO! $DEPS_COUNT dependencias del API instaladas"
    echo ""
    echo "Muestra de paquetes instalados:"
    docker exec euforia-api-prod ls /app/apps/api/node_modules | head -20
    echo "..."
    echo ""

    # Verificar también el pnpm store
    PNPM_STORE_COUNT=$(docker exec euforia-api-prod ls /app/node_modules/.pnpm 2>/dev/null | wc -l || echo "0")
    echo -e "${GREEN}✓${NC} pnpm store contiene $PNPM_STORE_COUNT paquetes totales"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ REBUILD COMPLETADO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "📊 Estado de contenedores:"
docker ps --filter "name=euforia-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo -e "${GREEN}🎉 Ahora ejecuta verify-production.sh para verificación completa${NC}"

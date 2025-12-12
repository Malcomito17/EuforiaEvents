#!/bin/bash
#
# Nuclear rebuild - Limpia TODO el cache de Docker y rebuilda desde cero
# Usar solo cuando el rebuild normal no funciona
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║     NUCLEAR REBUILD (Limpia TODO el cache)      ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto eliminará:${NC}"
echo "  • Todos los contenedores de EUFORIA"
echo "  • Todas las imágenes de EUFORIA"
echo "  • TODO el build cache de Docker"
echo ""
echo -e "${YELLOW}⏱️  Tiempo estimado: 10-15 minutos${NC}"
echo ""

read -p "¿Estás SEGURO de continuar? (escribe 'SI' en mayúsculas): " confirm

if [ "$confirm" != "SI" ]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}[1/8]${NC} Deteniendo todos los contenedores..."
docker compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✓${NC} Contenedores detenidos"
echo ""

echo -e "${BLUE}[2/8]${NC} Eliminando contenedores de EUFORIA..."
docker ps -a --filter "name=euforia-" --format "{{.ID}}" | xargs -r docker rm -f || true
echo -e "${GREEN}✓${NC} Contenedores eliminados"
echo ""

echo -e "${BLUE}[3/8]${NC} Eliminando imágenes de EUFORIA..."
docker images --filter "reference=euforia-*" --format "{{.ID}}" | xargs -r docker rmi -f || true
echo -e "${GREEN}✓${NC} Imágenes eliminadas"
echo ""

echo -e "${BLUE}[4/8]${NC} Limpiando TODO el build cache de Docker..."
docker builder prune -a -f
echo -e "${GREEN}✓${NC} Build cache limpiado"
echo ""

echo -e "${BLUE}[5/8]${NC} Mostrando espacio liberado..."
docker system df
echo ""

echo -e "${BLUE}[6/8]${NC} Rebuilding API desde CERO (esto tardará varios minutos)..."
echo -e "${YELLOW}Salida en tiempo real:${NC}"
echo ""

# Build con output en tiempo real
docker compose -f docker-compose.prod.yml build --no-cache --progress=plain api 2>&1 | tee /tmp/euforia-build.log

echo ""
echo -e "${GREEN}✓${NC} Build completado"
echo ""

echo -e "${BLUE}[7/8]${NC} Iniciando servicios..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "Esperando a que el contenedor esté listo..."
sleep 8
echo ""

echo -e "${BLUE}[8/8]${NC} Verificando instalación de dependencias..."
echo ""

# En pnpm workspaces, las deps del API están en /app/apps/api/node_modules
DEPS_COUNT=$(docker exec euforia-api-prod ls /app/apps/api/node_modules 2>/dev/null | wc -l || echo "0")
PNPM_STORE_COUNT=$(docker exec euforia-api-prod ls /app/node_modules/.pnpm 2>/dev/null | wc -l || echo "0")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$DEPS_COUNT" -lt 10 ]; then
    echo -e "${RED}✗ FALLO CRÍTICO${NC}"
    echo ""
    echo "Solo $DEPS_COUNT paquetes instalados en /app/apps/api/node_modules"
    echo ""
    echo "Paquetes encontrados:"
    docker exec euforia-api-prod ls /app/apps/api/node_modules
    echo ""
    echo -e "${YELLOW}Mostrando últimas líneas del build log:${NC}"
    echo ""
    tail -100 /tmp/euforia-build.log | grep -A 5 -B 5 "pnpm install" || tail -50 /tmp/euforia-build.log
    echo ""
    echo -e "${RED}El problema PERSISTE. Posibles causas:${NC}"
    echo "1. El Dockerfile tiene un problema fundamental"
    echo "2. .dockerignore está bloqueando archivos críticos"
    echo "3. pnpm no puede resolver las dependencias en ARM64"
    echo ""
    echo "Log completo guardado en: /tmp/euforia-build.log"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ ¡ÉXITO!${NC}"
    echo ""
    echo "Dependencias del API: $DEPS_COUNT paquetes"
    echo "pnpm store: $PNPM_STORE_COUNT paquetes totales"
    echo ""
    echo "Muestra de dependencias del API:"
    docker exec euforia-api-prod ls /app/apps/api/node_modules | head -30
    echo "..."
    echo ""
    echo -e "${GREEN}🎉 Sistema rebuildeado correctamente${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 Estado final:"
docker ps --filter "name=euforia-" --format "table {{.Names}}\t{{.Status}}"
echo ""

echo "Log completo del build guardado en: /tmp/euforia-build.log"

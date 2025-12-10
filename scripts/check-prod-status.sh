#!/bin/bash

# =============================================================================
# Script para verificar el estado de la instalación de producción
# Uso: ./scripts/check-prod-status.sh
# =============================================================================

echo "=========================================="
echo "DIAGNÓSTICO PRODUCCIÓN - EUFORIA EVENTS"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd ~/projects/EuforiaEvents 2>/dev/null || {
    echo -e "${RED}Error: No se encuentra el directorio ~/projects/EuforiaEvents${NC}"
    exit 1
}

echo -e "${YELLOW}=== INFORMACIÓN DEL SISTEMA ===${NC}"
echo "Hostname: $(hostname)"
echo "Arquitectura: $(uname -m)"
echo "Sistema: $(uname -s) $(uname -r)"
echo ""

echo -e "${YELLOW}=== VERSIONES ===${NC}"
echo "Docker: $(docker --version 2>/dev/null || echo 'No instalado')"
echo "Docker Compose: $(docker compose version 2>/dev/null || echo 'No instalado')"
echo ""

echo -e "${YELLOW}=== GIT STATUS ===${NC}"
echo "Branch: $(git branch --show-current)"
echo "Commit: $(git rev-parse --short HEAD)"
echo "Últimos commits:"
git log --oneline -n 3
echo ""

echo -e "${YELLOW}=== ESTADO DE CONTENEDORES ===${NC}"
docker compose -f docker-compose.prod.yml ps
echo ""

echo -e "${YELLOW}=== IMÁGENES DOCKER ===${NC}"
docker images | grep -E "(euforia|REPOSITORY)" || echo "No hay imágenes de Euforia"
echo ""

echo -e "${YELLOW}=== LOGS API (últimas 20 líneas) ===${NC}"
echo "=========================================="
docker compose -f docker-compose.prod.yml logs api --tail 20 2>/dev/null || echo "Contenedor API no disponible"
echo "=========================================="
echo ""

echo -e "${YELLOW}=== HEALTH CHECKS ===${NC}"
API_STATUS=$(docker compose -f docker-compose.prod.yml ps api 2>/dev/null | grep -o "Up\|Restarting\|Exit" || echo "Down")
echo "API: $API_STATUS"

WEB_CLIENT_STATUS=$(docker compose -f docker-compose.prod.yml ps web-client 2>/dev/null | grep -o "Up\|Restarting\|Exit" || echo "Down")
echo "Web Client: $WEB_CLIENT_STATUS"

WEB_OPERATOR_STATUS=$(docker compose -f docker-compose.prod.yml ps web-operator 2>/dev/null | grep -o "Up\|Restarting\|Exit" || echo "Down")
echo "Web Operator: $WEB_OPERATOR_STATUS"

NGINX_STATUS=$(docker compose -f docker-compose.prod.yml ps nginx 2>/dev/null | grep -o "Up\|Restarting\|Exit" || echo "Down")
echo "Nginx: $NGINX_STATUS"
echo ""

echo -e "${YELLOW}=== PUERTOS EN USO ===${NC}"
netstat -tuln 2>/dev/null | grep -E "(3000|5173|5174|80|443)" || ss -tuln 2>/dev/null | grep -E "(3000|5173|5174|80|443)" || echo "netstat/ss no disponible"
echo ""

echo -e "${YELLOW}=== DISCO (uso del sistema) ===${NC}"
df -h / | grep -v Filesystem
echo ""

echo -e "${YELLOW}=== MEMORIA ===${NC}"
free -h 2>/dev/null || vm_stat | grep -E "(Pages free|Pages active|Pages inactive)" || echo "Comando no disponible"
echo ""

echo "=========================================="
echo -e "${GREEN}Diagnóstico completo${NC}"
echo ""
echo "Para ver logs en tiempo real de un servicio:"
echo "  docker compose -f docker-compose.prod.yml logs -f api"
echo ""
echo "Para reiniciar todos los servicios:"
echo "  docker compose -f docker-compose.prod.yml restart"
echo ""

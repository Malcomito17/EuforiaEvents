#!/bin/bash

# =============================================================================
# Script para reconstruir el contenedor API en producción sin caché
# Uso: ./scripts/rebuild-api-prod.sh
# =============================================================================

set -e  # Salir si hay algún error

echo "=========================================="
echo "REBUILD API PRODUCCIÓN - EUFORIA EVENTS"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navegar al directorio del proyecto
cd ~/projects/EuforiaEvents || {
    echo -e "${RED}Error: No se encuentra el directorio ~/projects/EuforiaEvents${NC}"
    exit 1
}

echo -e "${YELLOW}1. Verificando estado de Git...${NC}"
git log --oneline -n 3
echo ""

CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo -e "Commit actual: ${GREEN}${CURRENT_COMMIT}${NC}"
echo ""

# Verificar si tenemos el commit del fix de OpenSSL
if git log --oneline -n 5 | grep -q "OpenSSL 1.1 compatibility"; then
    echo -e "${GREEN}✓ Fix de OpenSSL 1.1 encontrado en el historial${NC}"
else
    echo -e "${YELLOW}⚠ Fix de OpenSSL no encontrado, haciendo pull...${NC}"
    git pull origin main
fi
echo ""

echo -e "${YELLOW}2. Deteniendo contenedores de producción...${NC}"
docker compose -f docker-compose.prod.yml down
echo -e "${GREEN}✓ Contenedores detenidos${NC}"
echo ""

echo -e "${YELLOW}3. Eliminando imagen anterior del API...${NC}"
docker rmi euforia-events-api:latest 2>/dev/null && echo -e "${GREEN}✓ Imagen eliminada${NC}" || echo -e "${YELLOW}⚠ Imagen no existía${NC}"
echo ""

echo -e "${YELLOW}4. Reconstruyendo API SIN caché...${NC}"
echo -e "${YELLOW}   (Esto tomará ~10-15 minutos en Raspberry Pi)${NC}"
echo ""
docker compose -f docker-compose.prod.yml build --no-cache api

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Build completado exitosamente${NC}"
else
    echo ""
    echo -e "${RED}✗ Error durante el build${NC}"
    exit 1
fi
echo ""

echo -e "${YELLOW}5. Iniciando contenedores...${NC}"
docker compose -f docker-compose.prod.yml up -d
echo ""

echo -e "${YELLOW}6. Esperando 10 segundos para que inicien...${NC}"
sleep 10
echo ""

echo -e "${YELLOW}7. Estado de contenedores:${NC}"
docker compose -f docker-compose.prod.yml ps
echo ""

echo -e "${YELLOW}8. Logs del API (últimas 30 líneas):${NC}"
echo "=========================================="
docker compose -f docker-compose.prod.yml logs api --tail 30
echo "=========================================="
echo ""

# Verificar si el API está corriendo correctamente
if docker compose -f docker-compose.prod.yml ps | grep -q "euforia-api-prod.*Up"; then
    echo -e "${GREEN}✓✓✓ API está corriendo correctamente ✓✓✓${NC}"
    echo ""
    echo -e "${GREEN}Próximos pasos para completar la instalación:${NC}"
    echo ""
    echo "1. Inicializar Prisma Client:"
    echo "   docker compose -f docker-compose.prod.yml exec api npx prisma generate"
    echo ""
    echo "2. Aplicar schema a la base de datos:"
    echo "   docker compose -f docker-compose.prod.yml exec api npx prisma db push"
    echo ""
    echo "3. Crear usuario administrador:"
    echo "   docker compose -f docker-compose.prod.yml exec api npx tsx src/scripts/create-admin.ts"
    echo ""
    echo "   Credenciales por defecto:"
    echo "   - Username: admin"
    echo "   - Password: Admin123!"
    echo "   (Cambiar después del primer login)"
    echo ""
else
    echo -e "${RED}✗✗✗ API no está corriendo correctamente ✗✗✗${NC}"
    echo ""
    echo -e "${YELLOW}Ejecuta este comando para ver logs completos:${NC}"
    echo "docker compose -f docker-compose.prod.yml logs api --tail 100"
    echo ""
    echo -e "${YELLOW}O monitorea en tiempo real:${NC}"
    echo "docker compose -f docker-compose.prod.yml logs -f api"
    exit 1
fi

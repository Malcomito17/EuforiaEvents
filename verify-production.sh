#!/bin/bash
#
# Script de verificación de producción
# Ejecuta una serie de checks para validar que el sistema está funcionando correctamente
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  EUFORIA EVENTS - Verificación de Producción   ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# CHECK 1: Contenedores corriendo
# ============================================
echo -e "${BLUE}[1/6]${NC} Verificando contenedores..."

if docker ps | grep -q "euforia-api-prod"; then
    echo -e "${GREEN}✓${NC} API Container está corriendo"
else
    echo -e "${RED}✗${NC} API Container NO está corriendo"
    docker ps -a | grep euforia-api-prod
    exit 1
fi

if docker ps | grep -q "euforia-web-operator-prod"; then
    echo -e "${GREEN}✓${NC} Operator Container está corriendo"
else
    echo -e "${YELLOW}⚠${NC} Operator Container NO está corriendo (puede ser normal)"
fi

if docker ps | grep -q "euforia-web-client-prod"; then
    echo -e "${GREEN}✓${NC} Client Container está corriendo"
else
    echo -e "${YELLOW}⚠${NC} Client Container NO está corriendo (puede ser normal)"
fi

echo ""

# ============================================
# CHECK 2: Dependencias en node_modules
# ============================================
echo -e "${BLUE}[2/6]${NC} Verificando dependencias instaladas..."

# En pnpm workspaces, las deps del API están en /app/apps/api/node_modules
DEPS_COUNT=$(docker exec euforia-api-prod ls /app/apps/api/node_modules 2>/dev/null | wc -l || echo "0")

if [ "$DEPS_COUNT" -lt 10 ]; then
    echo -e "${RED}✗${NC} Solo $DEPS_COUNT paquetes instalados (debería ser 15+)"
    echo "Paquetes encontrados:"
    docker exec euforia-api-prod ls /app/apps/api/node_modules
    exit 1
else
    echo -e "${GREEN}✓${NC} $DEPS_COUNT dependencias del API instaladas"
fi

# Verificar bcryptjs específicamente
if docker exec euforia-api-prod ls /app/apps/api/node_modules | grep -q "bcryptjs"; then
    echo -e "${GREEN}✓${NC} bcryptjs está instalado"
else
    echo -e "${RED}✗${NC} bcryptjs NO está instalado"
    exit 1
fi

# Verificar express
if docker exec euforia-api-prod ls /app/apps/api/node_modules | grep -q "express"; then
    echo -e "${GREEN}✓${NC} express está instalado"
else
    echo -e "${RED}✗${NC} express NO está instalado"
    exit 1
fi

# Verificar prisma client
if docker exec euforia-api-prod ls /app/apps/api/node_modules | grep -q "@prisma"; then
    echo -e "${GREEN}✓${NC} @prisma/client está instalado"
else
    echo -e "${RED}✗${NC} @prisma/client NO está instalado"
    exit 1
fi

# Verificar que existe el store de pnpm con todos los paquetes
PNPM_STORE_COUNT=$(docker exec euforia-api-prod ls /app/node_modules/.pnpm 2>/dev/null | wc -l || echo "0")
if [ "$PNPM_STORE_COUNT" -gt 200 ]; then
    echo -e "${GREEN}✓${NC} pnpm store contiene $PNPM_STORE_COUNT paquetes"
else
    echo -e "${YELLOW}⚠${NC} pnpm store solo tiene $PNPM_STORE_COUNT paquetes"
fi

echo ""

# ============================================
# CHECK 3: Base de datos
# ============================================
echo -e "${BLUE}[3/6]${NC} Verificando base de datos..."

# Verificar si existe el archivo de la base de datos
if [ ! -f "./data/db/production.db" ]; then
    echo -e "${YELLOW}⚠${NC} Base de datos no existe"
    echo ""
    echo -e "${YELLOW}ACCIÓN REQUERIDA:${NC} Ejecutar ./admin.sh y seleccionar opción 12 (Inicializar DB)"
    echo ""
else
    # Intentar conectar y contar usuarios
    USER_COUNT=$(docker exec euforia-api-prod node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { try { const count = await prisma.user.count(); console.log(count); } catch (e) { console.log('ERROR'); } finally { await prisma.\$disconnect(); } })();" 2>/dev/null || echo "ERROR")

    if [ "$USER_COUNT" = "ERROR" ]; then
        echo -e "${RED}✗${NC} No se pudo conectar a la base de datos (puede necesitar migraciones)"
        echo ""
        echo -e "${YELLOW}ACCIÓN REQUERIDA:${NC} Ejecutar ./admin.sh y seleccionar opción 12 (Inicializar DB)"
        echo ""
    elif [ "$USER_COUNT" = "0" ]; then
        echo -e "${YELLOW}⚠${NC} Base de datos VACÍA (0 usuarios)"
        echo ""
        echo -e "${YELLOW}ACCIÓN REQUERIDA:${NC} Ejecutar ./admin.sh y seleccionar opción 12 (Inicializar DB)"
        echo ""
    else
        echo -e "${GREEN}✓${NC} Base de datos contiene $USER_COUNT usuario(s)"
    fi
fi

echo ""

# ============================================
# CHECK 4: Health endpoint del API
# ============================================
echo -e "${BLUE}[4/6]${NC} Verificando health endpoint..."

# Check interno del contenedor
if docker exec euforia-api-prod curl -s http://localhost:3000/health > /dev/null 2>&1; then
    HEALTH_JSON=$(docker exec euforia-api-prod curl -s http://localhost:3000/health)
    echo -e "${GREEN}✓${NC} API health endpoint responde"
    echo "  Response: $HEALTH_JSON"
else
    echo -e "${RED}✗${NC} API health endpoint NO responde"
    echo ""
    echo "Logs del API:"
    docker logs euforia-api-prod --tail 20
    exit 1
fi

echo ""

# ============================================
# CHECK 5: Nginx (si existe)
# ============================================
echo -e "${BLUE}[5/6]${NC} Verificando Nginx..."

if curl -s http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Nginx proxy funcionando"
else
    echo -e "${YELLOW}⚠${NC} Nginx proxy puede tener problemas (o no está configurado)"
fi

echo ""

# ============================================
# CHECK 6: Puertos expuestos
# ============================================
echo -e "${BLUE}[6/6]${NC} Verificando puertos expuestos..."

if docker ps | grep euforia-api-prod | grep -q "3000"; then
    echo -e "${GREEN}✓${NC} Puerto 3000 (API) expuesto"
else
    echo -e "${YELLOW}⚠${NC} Puerto 3000 puede no estar expuesto"
fi

if docker ps | grep euforia-web-operator-prod | grep -q "5174"; then
    echo -e "${GREEN}✓${NC} Puerto 5174 (Operator) expuesto"
else
    echo -e "${YELLOW}⚠${NC} Puerto 5174 puede no estar expuesto"
fi

if docker ps | grep euforia-web-client-prod | grep -q "5173"; then
    echo -e "${GREEN}✓${NC} Puerto 5173 (Client) expuesto"
else
    echo -e "${YELLOW}⚠${NC} Puerto 5173 puede no estar expuesto"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ VERIFICACIÓN COMPLETADA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "📊 Resumen del Sistema:"
echo ""
docker ps --filter "name=euforia-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "🌐 URLs de Acceso:"
echo "  • API Health:     http://localhost:3000/health"
echo "  • Web Operator:   http://localhost:5174 (o http://localhost/operator vía nginx)"
echo "  • Web Client:     http://localhost:5173 (o http://localhost vía nginx)"
echo ""

echo "👤 Credenciales por defecto:"
echo "  • Usuario: admin"
echo "  • Contraseña: admin123"
echo ""

echo -e "${GREEN}🎉 Sistema funcionando correctamente${NC}"

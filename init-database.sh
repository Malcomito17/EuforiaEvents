#!/bin/bash
#
# Script para inicializar la base de datos de producción
# - Ejecuta migraciones de Prisma
# - Crea usuario admin por defecto
#

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     EUFORIA EVENTS - Inicialización de DB      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# PASO 1: Verificar que el contenedor esté corriendo
# ============================================
echo -e "${BLUE}[1/4]${NC} Verificando contenedor API..."

if ! docker ps | grep -q "euforia-api-prod"; then
    echo -e "${RED}✗${NC} El contenedor euforia-api-prod NO está corriendo"
    echo ""
    echo "Inicia los servicios con:"
    echo "  docker-compose -f docker-compose.prod.yml up -d"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Contenedor API corriendo"
echo ""

# ============================================
# PASO 2: Crear directorio para la base de datos
# ============================================
echo -e "${BLUE}[2/4]${NC} Verificando directorio de datos..."

if [ ! -d "./data/db" ]; then
    echo "Creando directorio ./data/db..."
    mkdir -p ./data/db
    echo -e "${GREEN}✓${NC} Directorio creado"
else
    echo -e "${GREEN}✓${NC} Directorio ya existe"
fi

echo ""

# ============================================
# PASO 3: Ejecutar migraciones de Prisma
# ============================================
echo -e "${BLUE}[3/4]${NC} Ejecutando migraciones de Prisma..."
echo ""

# db push es más apropiado para SQLite que migrate deploy
docker exec euforia-api-prod npx prisma db push --accept-data-loss

echo ""
echo -e "${GREEN}✓${NC} Migraciones completadas"
echo ""

# ============================================
# PASO 4: Verificar si existe usuario admin
# ============================================
echo -e "${BLUE}[4/4]${NC} Verificando usuario admin..."

USER_COUNT=$(docker exec euforia-api-prod node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { try { const count = await prisma.user.count(); console.log(count); } catch (e) { console.log('0'); } finally { await prisma.\$disconnect(); } })();" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo "Creando usuario admin..."
    echo ""

    docker exec euforia-api-prod node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

(async () => {
  try {
    const hash = bcrypt.hashSync('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@euforiaevents.com',
        password: hash,
        role: 'ADMIN'
      }
    });
    console.log('✅ Usuario admin creado');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  } catch (error) {
    console.error('Error creando usuario:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
})();
"

    echo ""
    echo -e "${GREEN}✓${NC} Usuario admin creado"
else
    echo -e "${GREEN}✓${NC} Base de datos ya contiene $USER_COUNT usuario(s)"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ INICIALIZACIÓN COMPLETADA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "📊 Credenciales de acceso:"
echo "  • Usuario: admin"
echo "  • Contraseña: admin123"
echo ""
echo "🔄 Cambia la contraseña después del primer login"
echo ""

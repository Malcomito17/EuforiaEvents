#!/bin/bash
#
# deploy.sh - Script de Deployment Automatizado para Raspberry Pi
# Uso: ./deploy.sh [--auto]
#
# Sin argumentos: Modo interactivo (pregunta en cada paso)
# Con --auto: Modo automático (se detiene solo en errores)
#

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Modo interactivo por defecto
INTERACTIVE=true
if [ "$1" == "--auto" ]; then
  INTERACTIVE=false
  echo -e "${BLUE}🤖 Modo automático activado${NC}"
fi

# Función para preguntar confirmación
ask_confirmation() {
  if [ "$INTERACTIVE" = false ]; then
    return 0  # En modo auto, siempre continuar
  fi

  local message="$1"
  echo -e "${YELLOW}❓ $message (y/n)${NC}"
  read -r response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Operación cancelada por el usuario${NC}"
    exit 1
  fi
}

# Función para logging
log_step() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Función para errores
log_error() {
  echo ""
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ ERROR: $1${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Función para éxito
log_success() {
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ $1${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════╗
║   EUFORIA EVENTS - DEPLOYMENT SCRIPT    ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ============================================
# PASO 0: Verificar que estamos en el directorio correcto
# ============================================
log_step "PASO 0: Verificando directorio"

if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
  log_error "No estás en el directorio correcto del proyecto"
  echo "Debes estar en ~/projects/EuforiaEvents"
  echo "Ejecuta: cd ~/projects/EuforiaEvents && ./deploy.sh"
  exit 1
fi

echo "✓ Directorio correcto: $(pwd)"
ask_confirmation "¿Continuar con el deployment?"

# ============================================
# PASO 1: Backup de Base de Datos
# ============================================
log_step "PASO 1: Backup de Base de Datos"

# Crear directorio de backups
mkdir -p backups

# Intentar backup desde contenedor corriendo
if docker ps | grep -q euforia-api-prod; then
  echo "Intentando backup desde contenedor corriendo..."
  docker exec euforia-api-prod sh -c "cp /app/prisma/euforia.db /tmp/euforia.db.backup" 2>/dev/null || true
  docker cp euforia-api-prod:/tmp/euforia.db.backup ./backups/euforia.db.backup-$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

  if [ -f "./backups/euforia.db.backup-$(date +%Y%m%d)-"* ]; then
    echo "✓ Backup creado exitosamente"
    ls -lh backups/ | tail -1
  else
    echo "⚠️  No se pudo crear backup (contenedor puede estar detenido)"
    echo "El backup se intentará después del git pull"
  fi
else
  echo "⚠️  Contenedor API no está corriendo, backup se hará después"
fi

# ============================================
# PASO 2: Git Pull
# ============================================
log_step "PASO 2: Descargando cambios del repositorio"

echo "Branch actual: $(git branch --show-current)"
echo "Último commit local: $(git log -1 --oneline)"
echo ""

ask_confirmation "¿Ejecutar git pull?"

git pull origin main

NEW_COMMIT=$(git log -1 --oneline)
echo ""
echo "✓ Nuevo commit: $NEW_COMMIT"

# ============================================
# PASO 3: Detener Contenedores
# ============================================
log_step "PASO 3: Deteniendo contenedores existentes"

ask_confirmation "¿Detener contenedores actuales?"

docker compose -f docker-compose.prod.yml down

echo "✓ Contenedores detenidos"

# ============================================
# PASO 4: Rebuild Completo
# ============================================
log_step "PASO 4: Reconstruyendo imágenes Docker"

echo "⚠️  Este paso puede tardar 5-10 minutos en Raspberry Pi"
ask_confirmation "¿Iniciar rebuild de imágenes?"

if docker compose -f docker-compose.prod.yml build --no-cache; then
  echo "✓ Build completado exitosamente"
else
  log_error "Build falló"
  echo "Revisa los logs arriba para ver el error de compilación"
  echo ""
  echo "Comandos útiles para debugging:"
  echo "  docker compose -f docker-compose.prod.yml build api"
  echo "  docker compose -f docker-compose.prod.yml build web-operator"
  echo "  docker compose -f docker-compose.prod.yml build web-client"
  exit 1
fi

# ============================================
# PASO 5: Levantar Servicios
# ============================================
log_step "PASO 5: Levantando servicios"

ask_confirmation "¿Levantar contenedores?"

docker compose -f docker-compose.prod.yml up -d

echo "⏳ Esperando 15 segundos para que los servicios inicien..."
sleep 15

# ============================================
# PASO 6: Verificar Estado de Contenedores
# ============================================
log_step "PASO 6: Verificando estado de contenedores"

echo "Estado de contenedores:"
docker ps -a --filter "name=euforia-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Verificar si algún contenedor está en restart loop
if docker ps -a | grep euforia- | grep -q "Restarting"; then
  log_error "Hay contenedores en restart loop"
  echo ""
  echo "Logs del API:"
  docker logs euforia-api-prod --tail 50
  echo ""
  echo "Para debugging:"
  echo "  docker logs euforia-api-prod"
  echo "  docker logs euforia-web-operator-prod"
  echo "  docker logs euforia-web-client-prod"
  exit 1
fi

# Verificar que el API esté corriendo
if ! docker ps | grep -q "euforia-api-prod"; then
  log_error "El contenedor API no está corriendo"
  docker ps -a | grep euforia-api-prod
  echo ""
  echo "Logs del API:"
  docker logs euforia-api-prod --tail 50
  exit 1
fi

echo "✓ Todos los contenedores están corriendo correctamente"

# ============================================
# PASO 7: Aplicar Cambios de Base de Datos
# ============================================
log_step "PASO 7: Aplicando cambios de schema en base de datos"

ask_confirmation "¿Aplicar migraciones de Prisma?"

if docker exec euforia-api-prod npx prisma db push; then
  echo "✓ Schema actualizado correctamente"
else
  log_error "Falló la actualización del schema"
  echo "Esto puede indicar un problema con la base de datos"
  exit 1
fi

# Regenerar Prisma Client
echo ""
echo "Regenerando Prisma Client..."
docker exec euforia-api-prod npx prisma generate

# ============================================
# PASO 8: Reiniciar API
# ============================================
log_step "PASO 8: Reiniciando API para aplicar cambios"

docker restart euforia-api-prod

echo "⏳ Esperando 5 segundos..."
sleep 5

# ============================================
# PASO 9: Health Checks
# ============================================
log_step "PASO 9: Verificando salud de los servicios"

echo "📊 Estado final de contenedores:"
docker ps --filter "name=euforia-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "🏥 Health Check API:"
if API_HEALTH=$(curl -s http://localhost:3000/api/health 2>/dev/null); then
  echo "$API_HEALTH" | head -20
  echo ""
  echo "✓ API responde correctamente"
else
  log_error "API no responde al health check"
  echo "Logs del API:"
  docker logs euforia-api-prod --tail 30
  exit 1
fi

echo ""
echo "📝 Logs recientes del API:"
docker logs euforia-api-prod --tail 20

# ============================================
# RESUMEN FINAL
# ============================================
log_success "DEPLOYMENT COMPLETADO EXITOSAMENTE"

echo -e "${GREEN}✅ Servicios deployados:${NC}"
docker ps --filter "name=euforia-" --format "  • {{.Names}} ({{.Status}})"

echo ""
echo -e "${BLUE}📋 Información útil:${NC}"
echo "  • API: http://localhost:3000"
echo "  • Web Operator: http://localhost:5174 (vía nginx: http://localhost/operator)"
echo "  • Web Client: http://localhost:5173 (vía nginx: http://localhost)"
echo ""
echo -e "${BLUE}🔍 Comandos útiles:${NC}"
echo "  • Ver logs:        docker logs euforia-api-prod"
echo "  • Ver estado:      docker ps"
echo "  • Reiniciar API:   docker restart euforia-api-prod"
echo "  • Detener todo:    docker compose -f docker-compose.prod.yml down"
echo ""
echo -e "${GREEN}🎉 ¡Deployment exitoso!${NC}"
echo ""

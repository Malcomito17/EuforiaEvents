#!/bin/bash
# =============================================================================
# Move Docker back to SD Card
# =============================================================================
# Este script mueve Docker del SSD de vuelta a la SD card
# Útil cuando el SSD tiene problemas o para desarrollo temporal
#
# Uso: sudo ./move-docker-to-sd.sh
# =============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════╗
║   MOVER DOCKER DE SSD A SD CARD          ║
╚══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Por favor ejecuta como root (sudo)${NC}"
  echo "Uso: sudo $0"
  exit 1
fi

# Verificar configuración actual de Docker
echo -e "${YELLOW}[INFO] Verificando configuración actual de Docker...${NC}"

CURRENT_ROOT=""
if [ -f /etc/docker/daemon.json ]; then
  CURRENT_ROOT=$(grep -o '"data-root"[[:space:]]*:[[:space:]]*"[^"]*"' /etc/docker/daemon.json 2>/dev/null | cut -d'"' -f4 || echo "")
fi

if [ -z "$CURRENT_ROOT" ]; then
  CURRENT_ROOT="/var/lib/docker"
fi

echo "Docker root actual: $CURRENT_ROOT"

# Si ya está en /var/lib/docker, no hay nada que hacer
if [ "$CURRENT_ROOT" = "/var/lib/docker" ]; then
  echo -e "${GREEN}Docker ya está configurado para usar la SD card (/var/lib/docker)${NC}"
  echo ""
  echo "Estado de Docker:"
  systemctl is-active docker || true
  echo ""
  echo "Contenedores:"
  docker ps -a 2>/dev/null || echo "Docker no está corriendo"
  exit 0
fi

echo ""
echo -e "${YELLOW}Docker actualmente está usando: $CURRENT_ROOT${NC}"
echo -e "${YELLOW}Se moverá a: /var/lib/docker (SD card)${NC}"
echo ""

# Mostrar espacio disponible
echo -e "${BLUE}Espacio en SD card:${NC}"
df -h /
echo ""

echo -e "${BLUE}Espacio usado por Docker actual:${NC}"
du -sh "$CURRENT_ROOT" 2>/dev/null || echo "No se pudo calcular"
echo ""

# Confirmar
read -p "¿Continuar con la migración? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelado"
  exit 1
fi

# =============================================================================
# PASO 1: Detener Docker
# =============================================================================
echo ""
echo -e "${YELLOW}[1/5] Deteniendo Docker y contenedores...${NC}"

# Detener contenedores de euforia primero
docker compose -f /home/malcomito/projects/EuforiaEvents/docker-compose.prod.yml down 2>/dev/null || true

# Detener Docker
systemctl stop docker.socket 2>/dev/null || true
systemctl stop docker 2>/dev/null || true

sleep 2
echo -e "${GREEN}✓ Docker detenido${NC}"

# =============================================================================
# PASO 2: Crear directorio en SD si no existe
# =============================================================================
echo ""
echo -e "${YELLOW}[2/5] Preparando directorio en SD card...${NC}"

# Si existe docker.old, eliminarlo
if [ -d /var/lib/docker.old ]; then
  echo "Eliminando /var/lib/docker.old antiguo..."
  rm -rf /var/lib/docker.old
fi

# Si existe /var/lib/docker con datos, moverlo
if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker 2>/dev/null)" ]; then
  echo "Respaldando /var/lib/docker existente..."
  mv /var/lib/docker /var/lib/docker.old
fi

# Crear directorio nuevo
mkdir -p /var/lib/docker
echo -e "${GREEN}✓ Directorio preparado${NC}"

# =============================================================================
# PASO 3: Copiar datos del SSD a SD (si existen)
# =============================================================================
echo ""
echo -e "${YELLOW}[3/5] Copiando datos de Docker a SD card...${NC}"
echo "Esto puede tomar varios minutos dependiendo del tamaño..."

if [ -d "$CURRENT_ROOT" ] && [ "$(ls -A "$CURRENT_ROOT" 2>/dev/null)" ]; then
  rsync -aP --info=progress2 "$CURRENT_ROOT/" /var/lib/docker/
  echo -e "${GREEN}✓ Datos copiados exitosamente${NC}"
else
  echo -e "${YELLOW}No hay datos que copiar desde $CURRENT_ROOT${NC}"
fi

# =============================================================================
# PASO 4: Actualizar configuración de Docker
# =============================================================================
echo ""
echo -e "${YELLOW}[4/5] Actualizando configuración de Docker...${NC}"

# Backup de daemon.json
if [ -f /etc/docker/daemon.json ]; then
  cp /etc/docker/daemon.json /etc/docker/daemon.json.ssd-backup.$(date +%Y%m%d_%H%M%S)
fi

# Crear nueva configuración (sin data-root, usa default)
cat > /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

echo -e "${GREEN}✓ Configuración actualizada:${NC}"
cat /etc/docker/daemon.json

# =============================================================================
# PASO 5: Reiniciar Docker
# =============================================================================
echo ""
echo -e "${YELLOW}[5/5] Reiniciando Docker...${NC}"

systemctl daemon-reload
systemctl start docker

sleep 5

# Verificar
echo ""
echo -e "${BLUE}Verificando configuración...${NC}"

DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "error")

if [ "$DOCKER_ROOT" = "/var/lib/docker" ]; then
  echo -e "${GREEN}✓ Docker ahora está usando la SD card correctamente${NC}"
  echo ""
  echo "Docker Root Dir: $DOCKER_ROOT"
  echo ""

  # Mostrar estado
  echo -e "${BLUE}Estado de Docker:${NC}"
  systemctl is-active docker
  echo ""

  echo -e "${BLUE}Espacio usado:${NC}"
  du -sh /var/lib/docker
  echo ""

  echo -e "${BLUE}Contenedores disponibles:${NC}"
  docker ps -a
  echo ""

  # =============================================================================
  # RESUMEN FINAL
  # =============================================================================
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ MIGRACIÓN COMPLETADA EXITOSAMENTE${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}Próximos pasos:${NC}"
  echo "1. Crear estructura de directorios para la app:"
  echo "   ${BLUE}cd ~/projects/EuforiaEvents${NC}"
  echo "   ${BLUE}rm -f data  # eliminar symlink roto${NC}"
  echo "   ${BLUE}mkdir -p data/db data/uploads data/logs data/nginx-cache data/logs/nginx${NC}"
  echo ""
  echo "2. Hacer deploy:"
  echo "   ${BLUE}git pull origin feature/guestlist-backend${NC}"
  echo "   ${BLUE}./deploy.sh${NC}"
  echo ""
  echo -e "${YELLOW}NOTA:${NC} Los datos antiguos del SSD están en: $CURRENT_ROOT"
  echo "Puedes eliminarlos cuando verifiques que todo funciona."

else
  echo -e "${RED}✗ Error: Docker no está usando la ubicación esperada${NC}"
  echo "Actual: $DOCKER_ROOT"
  echo "Esperado: /var/lib/docker"
  echo ""
  echo "Revisa los logs: journalctl -u docker -n 50"
  exit 1
fi

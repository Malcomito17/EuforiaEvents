#!/bin/bash
# Move Docker to SSD
# Run with: sudo ./move-docker-to-ssd.sh /path/to/ssd

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Por favor ejecuta como root (sudo)${NC}"
  exit 1
fi

# Verificar argumento
if [ -z "$1" ]; then
  echo -e "${YELLOW}Uso: sudo $0 /ruta/al/ssd${NC}"
  echo ""
  echo "Ejemplo: sudo $0 /mnt/ssd"
  echo ""
  echo "Discos montados actualmente:"
  lsblk
  exit 1
fi

SSD_PATH="$1"
DOCKER_NEW_ROOT="${SSD_PATH}/docker"

# Verificar que la ruta existe y es un punto de montaje
if [ ! -d "$SSD_PATH" ]; then
  echo -e "${RED}Error: La ruta $SSD_PATH no existe${NC}"
  exit 1
fi

echo -e "${GREEN}=== Moviendo Docker al SSD ===${NC}"
echo "SSD Path: $SSD_PATH"
echo "Docker nuevo root: $DOCKER_NEW_ROOT"
echo ""

# Mostrar espacio disponible
echo -e "${YELLOW}Espacio disponible en SSD:${NC}"
df -h "$SSD_PATH"
echo ""

# Mostrar espacio usado por Docker actual
echo -e "${YELLOW}Espacio usado por Docker actual:${NC}"
du -sh /var/lib/docker 2>/dev/null || echo "No se pudo calcular"
echo ""

read -p "¿Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelado"
  exit 1
fi

# Paso 1: Detener Docker y todos los contenedores
echo -e "${YELLOW}[1/5] Deteniendo Docker...${NC}"
systemctl stop docker.socket
systemctl stop docker

# Paso 2: Crear directorio en SSD
echo -e "${YELLOW}[2/5] Creando directorio en SSD...${NC}"
mkdir -p "$DOCKER_NEW_ROOT"

# Paso 3: Copiar datos de Docker al SSD
echo -e "${YELLOW}[3/5] Copiando datos de Docker al SSD (esto puede tomar varios minutos)...${NC}"
if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker)" ]; then
  rsync -aP /var/lib/docker/ "$DOCKER_NEW_ROOT/"
  echo -e "${GREEN}Datos copiados exitosamente${NC}"
else
  echo -e "${YELLOW}No hay datos existentes en /var/lib/docker${NC}"
fi

# Paso 4: Configurar Docker para usar el SSD
echo -e "${YELLOW}[4/5] Configurando Docker daemon...${NC}"

# Backup del archivo existente si existe
if [ -f /etc/docker/daemon.json ]; then
  cp /etc/docker/daemon.json /etc/docker/daemon.json.backup.$(date +%Y%m%d_%H%M%S)
fi

# Crear nueva configuración
cat > /etc/docker/daemon.json <<EOF
{
  "data-root": "$DOCKER_NEW_ROOT",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

echo -e "${GREEN}Configuración creada:${NC}"
cat /etc/docker/daemon.json
echo ""

# Paso 5: Reiniciar Docker
echo -e "${YELLOW}[5/5] Reiniciando Docker...${NC}"
systemctl daemon-reload
systemctl start docker

# Verificar que funciona
echo ""
echo -e "${YELLOW}Verificando configuración...${NC}"
sleep 3

DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}')
echo "Docker Root Dir: $DOCKER_ROOT"

if [ "$DOCKER_ROOT" = "$DOCKER_NEW_ROOT" ]; then
  echo -e "${GREEN}✓ Docker ahora está usando el SSD correctamente${NC}"
  echo ""

  # Mostrar contenedores
  echo -e "${YELLOW}Contenedores (deberían estar detenidos):${NC}"
  docker ps -a

  echo ""
  echo -e "${GREEN}=== Migración completada ===${NC}"
  echo ""
  echo -e "${YELLOW}IMPORTANTE:${NC}"
  echo "1. Verifica que tus contenedores funcionan correctamente"
  echo "2. Una vez verificado, puedes liberar espacio en la SD:"
  echo "   ${YELLOW}sudo rm -rf /var/lib/docker.old${NC}"
  echo ""
  echo "3. Para volver a arrancar tus servicios:"
  echo "   ${YELLOW}cd /app && ./deploy.sh${NC}"

  # Renombrar el directorio viejo (no eliminar por seguridad)
  if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker)" ]; then
    echo ""
    echo -e "${YELLOW}Renombrando directorio viejo...${NC}"
    mv /var/lib/docker /var/lib/docker.old
    echo -e "${GREEN}El directorio viejo está en /var/lib/docker.old (elimínalo manualmente cuando verifiques que todo funciona)${NC}"
  fi

else
  echo -e "${RED}✗ Error: Docker no está usando la nueva ubicación${NC}"
  echo "Docker Root Dir actual: $DOCKER_ROOT"
  echo "Esperado: $DOCKER_NEW_ROOT"
  exit 1
fi

#!/bin/bash
# Setup SSD and move Docker
# Run with: sudo ./setup-ssd-and-docker.sh

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

SSD_DEVICE="/dev/sda1"
SSD_MOUNT="/mnt/ssd"
DOCKER_NEW_ROOT="${SSD_MOUNT}/docker"

echo -e "${GREEN}=== Configuración de SSD y Docker ===${NC}"
echo ""

# Verificar que el dispositivo existe
if [ ! -b "$SSD_DEVICE" ]; then
  echo -e "${RED}Error: $SSD_DEVICE no encontrado${NC}"
  echo "Dispositivos disponibles:"
  lsblk
  exit 1
fi

# Mostrar información del SSD
echo -e "${YELLOW}Información del SSD:${NC}"
lsblk /dev/sda
echo ""

# Verificar sistema de archivos
echo -e "${YELLOW}Verificando sistema de archivos...${NC}"
FS_TYPE=$(blkid -s TYPE -o value $SSD_DEVICE 2>/dev/null || echo "none")

if [ "$FS_TYPE" = "none" ]; then
  echo -e "${YELLOW}El SSD no tiene sistema de archivos. ¿Formatearlo como ext4? (y/n)${NC}"
  read -p "> " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Formateando $SSD_DEVICE como ext4...${NC}"
    mkfs.ext4 -F $SSD_DEVICE
    echo -e "${GREEN}Formateado completado${NC}"
    FS_TYPE="ext4"
  else
    echo "Cancelado"
    exit 1
  fi
else
  echo -e "${GREEN}Sistema de archivos detectado: $FS_TYPE${NC}"
fi

# Crear punto de montaje
echo -e "${YELLOW}Creando punto de montaje $SSD_MOUNT...${NC}"
mkdir -p $SSD_MOUNT

# Verificar si ya está montado
if mountpoint -q $SSD_MOUNT; then
  echo -e "${YELLOW}$SSD_MOUNT ya está montado${NC}"
else
  echo -e "${YELLOW}Montando SSD en $SSD_MOUNT...${NC}"
  mount $SSD_DEVICE $SSD_MOUNT
  echo -e "${GREEN}SSD montado correctamente${NC}"
fi

# Mostrar espacio disponible
echo ""
echo -e "${YELLOW}Espacio disponible en SSD:${NC}"
df -h $SSD_MOUNT
echo ""

# Configurar montaje automático en /etc/fstab
echo -e "${YELLOW}Configurando montaje automático...${NC}"

# Obtener UUID del dispositivo
UUID=$(blkid -s UUID -o value $SSD_DEVICE)
FSTAB_ENTRY="UUID=$UUID $SSD_MOUNT $FS_TYPE defaults,noatime 0 2"

# Verificar si ya existe en fstab
if grep -q "$SSD_MOUNT" /etc/fstab; then
  echo -e "${YELLOW}Ya existe entrada en /etc/fstab para $SSD_MOUNT${NC}"
else
  echo -e "${YELLOW}Agregando entrada a /etc/fstab...${NC}"
  # Backup de fstab
  cp /etc/fstab /etc/fstab.backup.$(date +%Y%m%d_%H%M%S)
  echo "$FSTAB_ENTRY" >> /etc/fstab
  echo -e "${GREEN}Entrada agregada a /etc/fstab${NC}"
fi

echo ""
echo -e "${GREEN}=== SSD configurado correctamente ===${NC}"
echo ""

# Ahora mover Docker
echo -e "${YELLOW}=== Iniciando migración de Docker ===${NC}"
echo ""

read -p "¿Mover Docker al SSD ahora? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Migración de Docker cancelada"
  echo "Puedes ejecutar manualmente: sudo ./move-docker-to-ssd.sh $SSD_MOUNT"
  exit 0
fi

# Paso 1: Detener Docker y todos los contenedores
echo -e "${YELLOW}[1/5] Deteniendo Docker...${NC}"
systemctl stop docker.socket 2>/dev/null || true
systemctl stop docker

# Paso 2: Crear directorio en SSD
echo -e "${YELLOW}[2/5] Creando directorio en SSD...${NC}"
mkdir -p "$DOCKER_NEW_ROOT"

# Paso 3: Copiar datos de Docker al SSD
echo -e "${YELLOW}[3/5] Copiando datos de Docker al SSD (esto puede tomar varios minutos)...${NC}"
if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker 2>/dev/null)" ]; then
  DOCKER_SIZE=$(du -sh /var/lib/docker 2>/dev/null | cut -f1)
  echo "Tamaño a copiar: $DOCKER_SIZE"
  rsync -aP /var/lib/docker/ "$DOCKER_NEW_ROOT/"
  echo -e "${GREEN}Datos copiados exitosamente${NC}"
else
  echo -e "${YELLOW}No hay datos existentes en /var/lib/docker${NC}"
fi

# Paso 4: Configurar Docker para usar el SSD
echo -e "${YELLOW}[4/5] Configurando Docker daemon...${NC}"

# Backup del archivo existente si existe y no está vacío
if [ -f /etc/docker/daemon.json ] && [ -s /etc/docker/daemon.json ]; then
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

DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "error")
echo "Docker Root Dir: $DOCKER_ROOT"

if [ "$DOCKER_ROOT" = "$DOCKER_NEW_ROOT" ]; then
  echo -e "${GREEN}✓ Docker ahora está usando el SSD correctamente${NC}"
  echo ""

  # Mostrar contenedores
  echo -e "${YELLOW}Contenedores:${NC}"
  docker ps -a

  echo ""
  echo -e "${GREEN}=== Migración completada exitosamente ===${NC}"
  echo ""
  echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
  echo ""
  echo "1. Reinicia tus servicios:"
  echo "   ${GREEN}cd /app && ./deploy.sh${NC}"
  echo ""
  echo "2. Verifica que todo funciona correctamente"
  echo ""
  echo "3. Una vez verificado (después de varios días), libera espacio en la SD:"
  echo "   ${YELLOW}sudo rm -rf /var/lib/docker.old${NC}"
  echo ""
  echo -e "${YELLOW}Espacio liberado en SD / Usado en SSD:${NC}"
  df -h / $SSD_MOUNT

  # Renombrar el directorio viejo (no eliminar por seguridad)
  if [ -d /var/lib/docker ] && [ "$(ls -A /var/lib/docker 2>/dev/null)" ]; then
    echo ""
    echo -e "${YELLOW}Renombrando directorio viejo para seguridad...${NC}"
    mv /var/lib/docker /var/lib/docker.old
    echo -e "${GREEN}El directorio viejo está en /var/lib/docker.old${NC}"
  fi

else
  echo -e "${RED}✗ Error: Docker no está usando la nueva ubicación${NC}"
  echo "Docker Root Dir actual: $DOCKER_ROOT"
  echo "Esperado: $DOCKER_NEW_ROOT"
  echo ""
  echo "Revirtiendo cambios..."
  systemctl stop docker
  rm /etc/docker/daemon.json
  systemctl start docker
  exit 1
fi

#!/bin/bash
# =============================================================================
# Setup New SSD for EUFORIA EVENTS
# =============================================================================
#
# Script para preparar un nuevo disco SSD y configurar Docker
# Úsalo cuando necesites reemplazar el SSD o configurar uno nuevo
#
# Uso:
#   sudo ./setup-new-ssd.sh [/dev/sdX1] [/ruta/montaje]
#
# Ejemplo:
#   sudo ./setup-new-ssd.sh /dev/sda1 /mnt/ssd
#
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Por favor ejecuta como root (sudo)${NC}"
  exit 1
fi

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

# Parámetros
SSD_DEVICE="${1:-/dev/sda1}"
SSD_MOUNT="${2:-/mnt/ssd}"
DOCKER_NEW_ROOT="${SSD_MOUNT}/docker"
DATA_ROOT="${SSD_MOUNT}/euforia-data"

# =============================================================================
# FUNCIONES
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

confirm() {
    local message="$1"
    echo ""
    echo -e "${YELLOW}$message${NC}"
    read -p "¿Continuar? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Operación cancelada${NC}"
        exit 1
    fi
}

# =============================================================================
# MAIN
# =============================================================================

print_header "PREPARACIÓN DE NUEVO SSD PARA EUFORIA EVENTS"

echo -e "${CYAN}Configuración:${NC}"
echo "  • Dispositivo SSD: $SSD_DEVICE"
echo "  • Punto de montaje: $SSD_MOUNT"
echo "  • Docker root: $DOCKER_NEW_ROOT"
echo "  • Datos aplicación: $DATA_ROOT"
echo ""

# Verificar que el dispositivo existe
if [ ! -b "$SSD_DEVICE" ]; then
    print_error "Dispositivo $SSD_DEVICE no encontrado"
    echo ""
    echo "Dispositivos disponibles:"
    lsblk
    exit 1
fi

print_success "Dispositivo $SSD_DEVICE detectado"

# Mostrar información del disco
echo ""
print_info "Información del disco:"
lsblk "$SSD_DEVICE"
echo ""

# =============================================================================
# PASO 1: VERIFICAR/FORMATEAR SISTEMA DE ARCHIVOS
# =============================================================================

print_header "PASO 1: Verificar Sistema de Archivos"

FS_TYPE=$(blkid -s TYPE -o value "$SSD_DEVICE" 2>/dev/null || echo "none")

if [ "$FS_TYPE" = "none" ] || [ "$FS_TYPE" = "" ]; then
    print_warning "El disco no tiene sistema de archivos"
    confirm "⚠️  ¿Formatear como ext4? ESTO BORRARÁ TODOS LOS DATOS DEL DISCO"

    print_info "Formateando $SSD_DEVICE como ext4..."
    mkfs.ext4 -F -L "EUFORIA-SSD" "$SSD_DEVICE"
    print_success "Disco formateado correctamente"
    FS_TYPE="ext4"
else
    print_info "Sistema de archivos detectado: $FS_TYPE"
    confirm "⚠️  ¿Reformatear el disco? (Recomendado para un disco nuevo/con errores)"

    print_info "Formateando $SSD_DEVICE como ext4..."
    mkfs.ext4 -F -L "EUFORIA-SSD" "$SSD_DEVICE"
    print_success "Disco reformateado correctamente"
    FS_TYPE="ext4"
fi

# =============================================================================
# PASO 2: CREAR Y MONTAR PUNTO DE MONTAJE
# =============================================================================

print_header "PASO 2: Configurar Punto de Montaje"

# Crear directorio de montaje
mkdir -p "$SSD_MOUNT"
print_success "Directorio creado: $SSD_MOUNT"

# Desmontar si ya está montado
if mountpoint -q "$SSD_MOUNT"; then
    print_warning "$SSD_MOUNT ya está montado, desmontando..."
    umount "$SSD_MOUNT" || true
fi

# Montar el disco
print_info "Montando $SSD_DEVICE en $SSD_MOUNT..."
mount "$SSD_DEVICE" "$SSD_MOUNT"
print_success "Disco montado correctamente"

# Verificar espacio disponible
echo ""
print_info "Espacio disponible en el SSD:"
df -h "$SSD_MOUNT"
echo ""

# =============================================================================
# PASO 3: CONFIGURAR MONTAJE AUTOMÁTICO EN /etc/fstab
# =============================================================================

print_header "PASO 3: Configurar Montaje Automático"

# Obtener UUID del dispositivo
UUID=$(blkid -s UUID -o value "$SSD_DEVICE")
print_info "UUID del disco: $UUID"

# Backup de fstab
cp /etc/fstab /etc/fstab.backup.$(date +%Y%m%d_%H%M%S)
print_success "Backup de /etc/fstab creado"

# Remover entradas antiguas del mismo punto de montaje
sed -i "\|$SSD_MOUNT|d" /etc/fstab

# Agregar nueva entrada
FSTAB_ENTRY="UUID=$UUID $SSD_MOUNT $FS_TYPE defaults,noatime 0 2"
echo "$FSTAB_ENTRY" >> /etc/fstab
print_success "Entrada agregada a /etc/fstab"

# Verificar fstab
print_info "Verificando /etc/fstab..."
mount -a || {
    print_error "Error en /etc/fstab. Restaurando backup..."
    cp /etc/fstab.backup.$(date +%Y%m%d_%H%M%S) /etc/fstab
    exit 1
}
print_success "/etc/fstab configurado correctamente"

# =============================================================================
# PASO 4: CREAR ESTRUCTURA DE DIRECTORIOS
# =============================================================================

print_header "PASO 4: Crear Estructura de Directorios"

# Crear directorios para Docker
mkdir -p "$DOCKER_NEW_ROOT"
print_success "Directorio Docker: $DOCKER_NEW_ROOT"

# Crear directorios para datos de la aplicación
mkdir -p "$DATA_ROOT/db"
mkdir -p "$DATA_ROOT/uploads"
mkdir -p "$DATA_ROOT/logs"
mkdir -p "$DATA_ROOT/nginx-cache"
print_success "Directorios de datos creados en $DATA_ROOT"

# Establecer permisos
chmod -R 755 "$DATA_ROOT"
print_success "Permisos configurados"

# =============================================================================
# PASO 5: DETENER DOCKER
# =============================================================================

print_header "PASO 5: Detener Servicios Docker"

print_info "Deteniendo contenedores..."
docker compose -f /home/pi/projects/euforia-events/docker-compose.prod.yml down 2>/dev/null || true

print_info "Deteniendo Docker daemon..."
systemctl stop docker.socket 2>/dev/null || true
systemctl stop docker

print_success "Docker detenido"

# =============================================================================
# PASO 6: CONFIGURAR DOCKER PARA USAR EL SSD
# =============================================================================

print_header "PASO 6: Configurar Docker"

# Backup de daemon.json si existe
if [ -f /etc/docker/daemon.json ] && [ -s /etc/docker/daemon.json ]; then
    cp /etc/docker/daemon.json /etc/docker/daemon.json.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backup de daemon.json creado"
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

print_success "Configuración Docker creada:"
cat /etc/docker/daemon.json
echo ""

# =============================================================================
# PASO 7: REINICIAR DOCKER
# =============================================================================

print_header "PASO 7: Reiniciar Docker"

systemctl daemon-reload
systemctl start docker

print_info "Esperando que Docker inicie..."
sleep 5

# Verificar que Docker está usando el nuevo root
DOCKER_ROOT=$(docker info --format '{{.DockerRootDir}}' 2>/dev/null || echo "error")

if [ "$DOCKER_ROOT" = "$DOCKER_NEW_ROOT" ]; then
    print_success "Docker configurado correctamente en el SSD"
    print_info "Docker Root Dir: $DOCKER_ROOT"
else
    print_error "Docker no está usando la ubicación correcta"
    print_error "Esperado: $DOCKER_NEW_ROOT"
    print_error "Actual: $DOCKER_ROOT"
    exit 1
fi

# =============================================================================
# PASO 8: CREAR ENLACES SIMBÓLICOS PARA LOS DATOS
# =============================================================================

print_header "PASO 8: Configurar Enlaces a Datos"

APP_DIR="/home/pi/projects/euforia-events"

# Remover directorios antiguos si existen
if [ -d "$APP_DIR/data" ]; then
    print_warning "Respaldando directorio data antiguo..."
    mv "$APP_DIR/data" "$APP_DIR/data.old.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
fi

# Crear enlace simbólico
ln -sf "$DATA_ROOT" "$APP_DIR/data"
print_success "Enlace simbólico creado: $APP_DIR/data -> $DATA_ROOT"

# Verificar permisos para el usuario pi
chown -R pi:pi "$DATA_ROOT" 2>/dev/null || true

# =============================================================================
# RESUMEN
# =============================================================================

print_header "✅ CONFIGURACIÓN COMPLETADA"

echo -e "${GREEN}El nuevo SSD ha sido configurado exitosamente${NC}"
echo ""
echo -e "${CYAN}Información:${NC}"
echo "  • SSD montado en: $SSD_MOUNT"
echo "  • Docker root: $DOCKER_NEW_ROOT"
echo "  • Datos aplicación: $DATA_ROOT"
echo "  • Enlace simbólico: $APP_DIR/data -> $DATA_ROOT"
echo ""

print_warning "PRÓXIMOS PASOS:"
echo ""
echo "1. Si tienes un backup de la base de datos, restáuralo ahora:"
echo "   ${YELLOW}sudo cp /ruta/al/backup/production.db $DATA_ROOT/db/${NC}"
echo ""
echo "2. Cambiar al usuario pi y reconstruir los contenedores:"
echo "   ${YELLOW}su - pi${NC}"
echo "   ${YELLOW}cd ~/projects/euforia-events${NC}"
echo "   ${YELLOW}./deploy.sh${NC}"
echo ""
echo "3. Si NO tienes backup, el deploy creará una nueva base de datos vacía"
echo "   y necesitarás inicializarla:"
echo "   ${YELLOW}./admin.sh${NC} (opción 12: Inicializar Base de Datos)"
echo ""
echo "4. Verificar que todo funciona:"
echo "   ${YELLOW}./admin.sh${NC} (opción 10: Verificar Producción)"
echo ""

print_success "¡Listo para continuar!"
echo ""

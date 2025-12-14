#!/bin/bash
# =============================================================================
# Clean and Partition SSD for EUFORIA EVENTS
# =============================================================================
#
# Este script limpia completamente el SSD y crea una sola partición
# ADVERTENCIA: Esto BORRARÁ TODOS LOS DATOS del disco especificado
#
# Uso:
#   sudo ./clean-and-partition-ssd.sh [dispositivo]
#
# Ejemplo:
#   sudo ./clean-and-partition-ssd.sh /dev/sda
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

DEVICE="${1:-/dev/sda}"

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
    read -p "¿Continuar? (escriba SI en mayúsculas): " -r
    echo ""
    if [[ ! "$REPLY" == "SI" ]]; then
        echo -e "${YELLOW}Operación cancelada${NC}"
        exit 1
    fi
}

# =============================================================================
# MAIN
# =============================================================================

print_header "LIMPIEZA Y PARTICIONADO DE SSD"

echo -e "${CYAN}Dispositivo a limpiar: $DEVICE${NC}"
echo ""

# Verificar que el dispositivo existe
if [ ! -b "$DEVICE" ]; then
    print_error "Dispositivo $DEVICE no encontrado"
    echo ""
    echo "Dispositivos disponibles:"
    lsblk
    exit 1
fi

# ADVERTENCIA DE SEGURIDAD
echo -e "${RED}═══════════════════════════════════════════════════${NC}"
echo -e "${RED}        ⚠️  ADVERTENCIA CRÍTICA ⚠️${NC}"
echo -e "${RED}═══════════════════════════════════════════════════${NC}"
echo ""
echo -e "${RED}Este script va a BORRAR COMPLETAMENTE:${NC}"
echo -e "${RED}  • Dispositivo: $DEVICE${NC}"
echo -e "${RED}  • TODOS LOS DATOS serán destruidos${NC}"
echo -e "${RED}  • Esta acción NO SE PUEDE DESHACER${NC}"
echo ""

# Mostrar información del disco
print_info "Información actual del disco:"
lsblk "$DEVICE"
echo ""

# Verificación adicional contra mmcblk0
if [[ "$DEVICE" == *"mmcblk"* ]]; then
    print_error "ALTO: Intentaste especificar la tarjeta SD del sistema"
    print_error "Esto destruiría el sistema operativo"
    echo ""
    echo "El dispositivo correcto debería ser algo como /dev/sda"
    exit 1
fi

# Doble confirmación
confirm "⚠️  ¿Estás SEGURO de que quieres BORRAR COMPLETAMENTE $DEVICE?"
confirm "⚠️  Última oportunidad. ¿REALMENTE quieres continuar?"

# =============================================================================
# PASO 1: DESMONTAR TODAS LAS PARTICIONES
# =============================================================================

print_header "PASO 1: Desmontando particiones existentes"

# Intentar desmontar todas las particiones del disco
for partition in ${DEVICE}[0-9]* ${DEVICE}p[0-9]*; do
    if [ -b "$partition" ]; then
        if mountpoint -q "$partition" 2>/dev/null; then
            print_info "Desmontando $partition..."
            umount "$partition" 2>/dev/null || true
        fi
    fi
done

print_success "Particiones desmontadas"

# =============================================================================
# PASO 2: LIMPIAR TABLA DE PARTICIONES
# =============================================================================

print_header "PASO 2: Limpiando tabla de particiones"

print_info "Borrando todas las particiones existentes..."

# Usar wipefs para limpiar todas las firmas del disco
wipefs -a "$DEVICE"

# Limpiar los primeros 512MB del disco (por seguridad)
print_info "Limpiando inicio del disco..."
dd if=/dev/zero of="$DEVICE" bs=1M count=100 status=progress 2>/dev/null || true

print_success "Disco limpiado"

# =============================================================================
# PASO 3: CREAR NUEVA TABLA DE PARTICIONES GPT
# =============================================================================

print_header "PASO 3: Creando nueva tabla de particiones"

print_info "Creando tabla GPT..."

# Usar parted para crear tabla GPT y una partición que ocupe todo el disco
parted -s "$DEVICE" mklabel gpt
parted -s "$DEVICE" mkpart primary ext4 0% 100%
parted -s "$DEVICE" set 1 lvm off

print_success "Tabla de particiones creada"

# Esperar a que el kernel reconozca las particiones
sleep 2
partprobe "$DEVICE"
sleep 2

# =============================================================================
# PASO 4: FORMATEAR LA PARTICIÓN
# =============================================================================

print_header "PASO 4: Formateando partición"

# Determinar el nombre de la partición
if [ -b "${DEVICE}1" ]; then
    PARTITION="${DEVICE}1"
elif [ -b "${DEVICE}p1" ]; then
    PARTITION="${DEVICE}p1"
else
    print_error "No se pudo encontrar la partición creada"
    lsblk "$DEVICE"
    exit 1
fi

print_info "Formateando $PARTITION como ext4..."
mkfs.ext4 -F -L "EUFORIA-SSD" "$PARTITION"

print_success "Partición formateada"

# =============================================================================
# PASO 5: VERIFICAR RESULTADO
# =============================================================================

print_header "PASO 5: Verificación"

print_info "Estado final del disco:"
lsblk "$DEVICE"
echo ""

print_info "Información de la partición:"
blkid "$PARTITION"
echo ""

# =============================================================================
# RESULTADO FINAL
# =============================================================================

print_header "✅ LIMPIEZA COMPLETADA"

echo -e "${GREEN}El SSD ha sido limpiado y particionado exitosamente${NC}"
echo ""
echo -e "${CYAN}Información:${NC}"
echo "  • Dispositivo: $DEVICE"
echo "  • Partición: $PARTITION"
echo "  • Sistema de archivos: ext4"
echo "  • Etiqueta: EUFORIA-SSD"
echo ""

print_warning "PRÓXIMOS PASOS:"
echo ""
echo "Ahora puedes ejecutar el script de configuración:"
echo "  ${YELLOW}sudo ./scripts/setup-new-ssd.sh $PARTITION /mnt/ssd${NC}"
echo ""
echo "O si prefieres continuar manualmente:"
echo "  ${YELLOW}sudo mount $PARTITION /mnt/ssd${NC}"
echo ""

print_success "¡Listo para continuar!"
echo ""

#!/bin/bash
# =============================================================================
# Restaurar EUFORIA EVENTS desde Backup
# =============================================================================
#
# Script para restaurar base de datos y archivos desde un backup
#
# Uso:
#   ./restore-from-backup.sh [ruta_al_backup.tar.gz]
#
# Ejemplo:
#   ./restore-from-backup.sh ~/euforia-backups/euforia_backup_20231215_030000.tar.gz
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

# =============================================================================
# CONFIGURACIÓN
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
TEMP_DIR="/tmp/euforia-restore-$$"

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

cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
    fi
}

trap cleanup EXIT

# =============================================================================
# VALIDACIÓN
# =============================================================================

print_header "RESTAURAR EUFORIA EVENTS DESDE BACKUP"

# Verificar argumento
if [ -z "$1" ]; then
    print_error "Debes especificar la ruta al archivo de backup"
    echo ""
    echo "Uso: $0 [ruta_al_backup.tar.gz]"
    echo ""
    echo "Backups disponibles:"
    find ~/euforia-backups -name "euforia_backup_*.tar.gz" 2>/dev/null | sort -r | head -5 || echo "  (ninguno encontrado)"
    echo ""
    exit 1
fi

BACKUP_FILE="$1"

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    print_error "El archivo de backup no existe: $BACKUP_FILE"
    exit 1
fi

print_success "Backup encontrado: $BACKUP_FILE"

# Mostrar información del backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
BACKUP_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$BACKUP_FILE" 2>/dev/null || stat -c "%y" "$BACKUP_FILE" 2>/dev/null | cut -d' ' -f1,2 | cut -d':' -f1,2)

echo ""
print_info "Tamaño: $BACKUP_SIZE"
print_info "Fecha: $BACKUP_DATE"
echo ""

confirm "⚠️  ADVERTENCIA: Esto sobrescribirá los datos actuales"

# =============================================================================
# DETENER SERVICIOS
# =============================================================================

print_header "PASO 1: Detener Servicios"

cd "$APP_DIR"

if docker ps | grep -q "euforia-"; then
    print_info "Deteniendo contenedores..."
    docker compose -f docker-compose.prod.yml down
    print_success "Contenedores detenidos"
else
    print_info "No hay contenedores corriendo"
fi

# =============================================================================
# EXTRAER BACKUP
# =============================================================================

print_header "PASO 2: Extraer Backup"

mkdir -p "$TEMP_DIR"
print_info "Extrayendo backup en directorio temporal..."

tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Buscar el directorio extraído
EXTRACTED_DIR=$(find "$TEMP_DIR" -type d -name "backup_*" | head -1)

if [ -z "$EXTRACTED_DIR" ]; then
    print_error "No se pudo encontrar el directorio del backup"
    exit 1
fi

print_success "Backup extraído: $EXTRACTED_DIR"

# Listar contenido
echo ""
print_info "Contenido del backup:"
ls -lh "$EXTRACTED_DIR"
echo ""

# =============================================================================
# RESTAURAR BASE DE DATOS
# =============================================================================

print_header "PASO 3: Restaurar Base de Datos"

DB_BACKUP=$(find "$EXTRACTED_DIR" -name "*.db" | head -1)

if [ -n "$DB_BACKUP" ]; then
    # Crear directorio si no existe
    mkdir -p "$APP_DIR/data/db"

    # Backup de la DB actual si existe
    if [ -f "$APP_DIR/data/db/production.db" ]; then
        print_warning "Respaldando base de datos actual..."
        mv "$APP_DIR/data/db/production.db" "$APP_DIR/data/db/production.db.old.$(date +%Y%m%d_%H%M%S)"
    fi

    # Copiar la base de datos
    cp "$DB_BACKUP" "$APP_DIR/data/db/production.db"

    DB_SIZE=$(du -h "$APP_DIR/data/db/production.db" | cut -f1)
    print_success "Base de datos restaurada ($DB_SIZE)"

    # Verificar integridad si sqlite3 está disponible
    if command -v sqlite3 &> /dev/null; then
        print_info "Verificando integridad..."
        if sqlite3 "$APP_DIR/data/db/production.db" "PRAGMA integrity_check;" | grep -q "ok"; then
            print_success "Integridad verificada correctamente"
        else
            print_error "La base de datos puede tener problemas de integridad"
        fi
    fi
else
    print_warning "No se encontró base de datos en el backup"
fi

# =============================================================================
# RESTAURAR ARCHIVOS DE CONFIGURACIÓN
# =============================================================================

print_header "PASO 4: Restaurar Configuración"

# Restaurar .env si existe
if [ -f "$EXTRACTED_DIR/config/.env" ]; then
    # Backup del .env actual
    if [ -f "$APP_DIR/.env" ]; then
        cp "$APP_DIR/.env" "$APP_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    cp "$EXTRACTED_DIR/config/.env" "$APP_DIR/.env"
    print_success "Archivo .env restaurado"
else
    print_warning "No se encontró .env en el backup"
fi

# =============================================================================
# RESTAURAR UPLOADS
# =============================================================================

print_header "PASO 5: Restaurar Archivos Subidos"

if [ -d "$EXTRACTED_DIR/uploads" ] && [ "$(ls -A "$EXTRACTED_DIR/uploads" 2>/dev/null)" ]; then
    mkdir -p "$APP_DIR/data/uploads"

    # Backup de uploads actuales si existen
    if [ -d "$APP_DIR/data/uploads" ] && [ "$(ls -A "$APP_DIR/data/uploads" 2>/dev/null)" ]; then
        print_warning "Respaldando uploads actuales..."
        mv "$APP_DIR/data/uploads" "$APP_DIR/data/uploads.old.$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$APP_DIR/data/uploads"
    fi

    cp -r "$EXTRACTED_DIR/uploads/"* "$APP_DIR/data/uploads/" 2>/dev/null

    UPLOAD_COUNT=$(find "$APP_DIR/data/uploads" -type f 2>/dev/null | wc -l)
    print_success "Archivos restaurados: $UPLOAD_COUNT"
else
    print_warning "No se encontraron uploads en el backup"
fi

# =============================================================================
# AJUSTAR PERMISOS
# =============================================================================

print_header "PASO 6: Ajustar Permisos"

# Asegurar que el usuario actual tiene permisos
if [ -d "$APP_DIR/data" ]; then
    chmod -R 755 "$APP_DIR/data"
    print_success "Permisos configurados"
fi

# =============================================================================
# MOSTRAR INFORMACIÓN
# =============================================================================

print_header "✅ RESTAURACIÓN COMPLETADA"

echo -e "${GREEN}Los datos han sido restaurados desde el backup${NC}"
echo ""

# Mostrar información de la base de datos restaurada
if [ -f "$APP_DIR/data/db/production.db" ] && command -v sqlite3 &> /dev/null; then
    echo -e "${CYAN}Información de la base de datos:${NC}"

    TABLES=$(sqlite3 "$APP_DIR/data/db/production.db" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "N/A")
    echo "  • Tablas: $TABLES"

    USERS=$(sqlite3 "$APP_DIR/data/db/production.db" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "N/A")
    echo "  • Usuarios: $USERS"

    EVENTS=$(sqlite3 "$APP_DIR/data/db/production.db" "SELECT COUNT(*) FROM events;" 2>/dev/null || echo "N/A")
    echo "  • Eventos: $EVENTS"

    echo ""
fi

print_warning "PRÓXIMOS PASOS:"
echo ""
echo "1. Iniciar los servicios:"
echo "   ${YELLOW}./deploy.sh${NC}"
echo ""
echo "2. Verificar que todo funciona correctamente:"
echo "   ${YELLOW}./admin.sh${NC} (opción 10: Verificar Producción)"
echo ""
echo "3. Revisar logs si hay algún problema:"
echo "   ${YELLOW}docker compose -f docker-compose.prod.yml logs -f${NC}"
echo ""

print_success "¡Restauración completada!"
echo ""

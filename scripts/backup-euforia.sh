#!/bin/bash
# =============================================================================
# EUFORIA EVENTS - Automatic Backup Script
# =============================================================================
#
# Script para crear backups automáticos de:
#   - Base de datos SQLite
#   - Archivos .env
#   - Uploads/Media
#   - Logs importantes
#
# Uso:
#   chmod +x backup-euforia.sh
#   ./backup-euforia.sh
#
# Programar con cron (ejemplo: diario a las 3 AM):
#   crontab -e
#   0 3 * * * /home/pi/euforia-events/scripts/backup-euforia.sh >> /home/pi/backups/cron.log 2>&1
#
# =============================================================================

set -e

# =============================================================================
# CONFIGURATION
# =============================================================================

# Directorio de la aplicación (detectar automáticamente)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

# Directorio de backups (configurable)
BACKUP_BASE_DIR="${BACKUP_DIR:-$HOME/euforia-backups}"

# Número de backups a mantener (días)
KEEP_BACKUPS=${KEEP_BACKUPS:-7}

# Timestamp para el backup
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="$BACKUP_BASE_DIR/backup_$TIMESTAMP"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# VALIDATION
# =============================================================================

validate_environment() {
    print_header "Validando Entorno"

    # Verificar que estamos en el directorio correcto
    if [ ! -f "$APP_DIR/package.json" ]; then
        print_error "No se encontró package.json en $APP_DIR"
        print_info "Asegurate de correr este script desde el directorio correcto"
        exit 1
    fi

    print_success "Directorio de aplicación: $APP_DIR"

    # Crear directorio de backups si no existe
    if [ ! -d "$BACKUP_BASE_DIR" ]; then
        print_info "Creando directorio de backups: $BACKUP_BASE_DIR"
        mkdir -p "$BACKUP_BASE_DIR"
    fi

    print_success "Directorio de backups: $BACKUP_BASE_DIR"

    # Verificar espacio en disco (al menos 500MB libres)
    AVAILABLE_SPACE=$(df "$BACKUP_BASE_DIR" | tail -1 | awk '{print $4}')
    if [ "$AVAILABLE_SPACE" -lt 500000 ]; then
        print_warning "Espacio en disco bajo: $(df -h "$BACKUP_BASE_DIR" | tail -1 | awk '{print $4}') disponible"
        print_warning "Se recomienda al menos 500MB libres"
    else
        print_success "Espacio en disco: $(df -h "$BACKUP_BASE_DIR" | tail -1 | awk '{print $4}') disponible"
    fi
}

# =============================================================================
# BACKUP FUNCTIONS
# =============================================================================

backup_database() {
    print_header "Backup de Base de Datos"

    # Buscar la base de datos de producción
    DB_PATH="$APP_DIR/data/db/production.db"

    if [ ! -f "$DB_PATH" ]; then
        # Buscar en ubicación alternativa
        DB_PATH=$(find "$APP_DIR" -name "production.db" 2>/dev/null | head -1)

        if [ -z "$DB_PATH" ]; then
            print_warning "No se encontró production.db"
            print_info "Buscando otras bases de datos..."

            # Buscar cualquier .db
            DB_PATH=$(find "$APP_DIR" -name "*.db" -not -path "*/node_modules/*" 2>/dev/null | head -1)

            if [ -z "$DB_PATH" ]; then
                print_error "No se encontró ninguna base de datos"
                return 1
            fi
        fi
    fi

    print_info "Base de datos encontrada: $DB_PATH"

    # Crear directorio para DB en el backup
    mkdir -p "$BACKUP_DIR/database"

    # Copiar la base de datos
    cp "$DB_PATH" "$BACKUP_DIR/database/" || {
        print_error "Error al copiar la base de datos"
        return 1
    }

    # Obtener tamaño de la DB
    DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
    print_success "Base de datos respaldada ($DB_SIZE)"

    # Contar registros (opcional, solo si sqlite3 está instalado)
    if command -v sqlite3 &> /dev/null; then
        TABLES=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "N/A")
        print_info "Tablas en DB: $TABLES"
    fi
}

backup_env_files() {
    print_header "Backup de Archivos de Configuración"

    mkdir -p "$BACKUP_DIR/config"

    # Backup .env
    if [ -f "$APP_DIR/.env" ]; then
        cp "$APP_DIR/.env" "$BACKUP_DIR/config/.env" || {
            print_error "Error al copiar .env"
            return 1
        }
        print_success "Archivo .env respaldado"
    else
        print_warning "No se encontró archivo .env"
    fi

    # Backup docker-compose.prod.yml
    if [ -f "$APP_DIR/docker-compose.prod.yml" ]; then
        cp "$APP_DIR/docker-compose.prod.yml" "$BACKUP_DIR/config/" || true
        print_success "docker-compose.prod.yml respaldado"
    fi

    # Backup cloudflared config (si existe)
    if [ -f "$HOME/.cloudflared/config.yml" ]; then
        mkdir -p "$BACKUP_DIR/config/cloudflared"
        cp "$HOME/.cloudflared/config.yml" "$BACKUP_DIR/config/cloudflared/" || true
        print_success "Configuración de Cloudflare Tunnel respaldada"
    fi
}

backup_uploads() {
    print_header "Backup de Archivos Subidos"

    UPLOADS_PATH="$APP_DIR/data/uploads"

    if [ -d "$UPLOADS_PATH" ]; then
        mkdir -p "$BACKUP_DIR/uploads"

        # Copiar uploads
        cp -r "$UPLOADS_PATH/"* "$BACKUP_DIR/uploads/" 2>/dev/null || {
            print_warning "No hay archivos para respaldar en uploads/"
            return 0
        }

        UPLOAD_SIZE=$(du -sh "$UPLOADS_PATH" 2>/dev/null | cut -f1)
        UPLOAD_COUNT=$(find "$UPLOADS_PATH" -type f 2>/dev/null | wc -l)

        print_success "Uploads respaldados: $UPLOAD_COUNT archivos ($UPLOAD_SIZE)"
    else
        print_warning "Directorio uploads/ no existe"
    fi
}

backup_logs() {
    print_header "Backup de Logs Importantes"

    LOGS_PATH="$APP_DIR/data/logs"

    if [ -d "$LOGS_PATH" ]; then
        mkdir -p "$BACKUP_DIR/logs"

        # Copiar solo logs de los últimos 7 días
        find "$LOGS_PATH" -name "*.log" -mtime -7 -exec cp {} "$BACKUP_DIR/logs/" \; 2>/dev/null || true

        LOG_COUNT=$(find "$BACKUP_DIR/logs" -type f 2>/dev/null | wc -l)

        if [ "$LOG_COUNT" -gt 0 ]; then
            print_success "Logs respaldados: $LOG_COUNT archivos (últimos 7 días)"
        else
            print_warning "No se encontraron logs recientes"
        fi
    else
        print_warning "Directorio logs/ no existe"
    fi
}

create_metadata() {
    print_header "Creando Metadata del Backup"

    cat > "$BACKUP_DIR/backup_info.txt" <<EOF
# =============================================================================
# EUFORIA EVENTS - Backup Information
# =============================================================================

Timestamp: $TIMESTAMP
Date: $(date +"%Y-%m-%d %H:%M:%S %Z")
Hostname: $(hostname)
User: $(whoami)

# App Info
App Directory: $APP_DIR
Node Version: $(node --version 2>/dev/null || echo "N/A")
Docker Version: $(docker --version 2>/dev/null || echo "N/A")

# Backup Contents
$(find "$BACKUP_DIR" -type f | sed "s|$BACKUP_DIR/||" | sort)

# System Info
OS: $(uname -s)
Kernel: $(uname -r)
Architecture: $(uname -m)
Total Memory: $(free -h 2>/dev/null | awk 'NR==2{print $2}' || echo "N/A")
Disk Usage: $(df -h "$APP_DIR" | tail -1 | awk '{print $5}')

# =============================================================================
EOF

    print_success "Metadata creada"
}

compress_backup() {
    print_header "Comprimiendo Backup"

    ARCHIVE_NAME="euforia_backup_$TIMESTAMP.tar.gz"
    ARCHIVE_PATH="$BACKUP_BASE_DIR/$ARCHIVE_NAME"

    # Comprimir el backup
    tar -czf "$ARCHIVE_PATH" -C "$BACKUP_BASE_DIR" "backup_$TIMESTAMP" 2>/dev/null || {
        print_error "Error al comprimir el backup"
        return 1
    }

    # Eliminar directorio temporal
    rm -rf "$BACKUP_DIR"

    # Tamaño del archivo
    ARCHIVE_SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)

    print_success "Backup comprimido: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
    print_info "Ubicación: $ARCHIVE_PATH"
}

cleanup_old_backups() {
    print_header "Limpieza de Backups Antiguos"

    # Contar backups actuales
    BACKUP_COUNT=$(find "$BACKUP_BASE_DIR" -name "euforia_backup_*.tar.gz" | wc -l)

    print_info "Backups actuales: $BACKUP_COUNT"
    print_info "Manteniendo últimos: $KEEP_BACKUPS"

    if [ "$BACKUP_COUNT" -gt "$KEEP_BACKUPS" ]; then
        # Eliminar backups viejos
        BACKUPS_TO_DELETE=$((BACKUP_COUNT - KEEP_BACKUPS))

        find "$BACKUP_BASE_DIR" -name "euforia_backup_*.tar.gz" \
            | sort \
            | head -n "$BACKUPS_TO_DELETE" \
            | while read -r old_backup; do
                print_info "Eliminando: $(basename "$old_backup")"
                rm -f "$old_backup"
            done

        print_success "Eliminados $BACKUPS_TO_DELETE backups antiguos"
    else
        print_success "No hay backups antiguos para eliminar"
    fi

    # Mostrar backups actuales
    echo ""
    print_info "Backups disponibles:"
    find "$BACKUP_BASE_DIR" -name "euforia_backup_*.tar.gz" \
        | sort -r \
        | while read -r backup; do
            SIZE=$(du -h "$backup" | cut -f1)
            DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$backup" 2>/dev/null || stat -c "%y" "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d':' -f1,2)
            echo "  • $(basename "$backup") - $SIZE - $DATE"
        done
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    print_header "EUFORIA EVENTS - Backup Automático"

    echo ""
    print_info "Iniciando backup: $(date +"%Y-%m-%d %H:%M:%S")"
    echo ""

    # Validar entorno
    validate_environment

    # Crear directorio temporal para el backup
    mkdir -p "$BACKUP_DIR"

    # Ejecutar backups
    backup_database
    backup_env_files
    backup_uploads
    backup_logs
    create_metadata

    # Comprimir y limpiar
    compress_backup
    cleanup_old_backups

    # Resumen final
    print_header "Backup Completado"

    print_success "✅ Backup creado exitosamente"
    print_info "Timestamp: $TIMESTAMP"
    print_info "Ubicación: $BACKUP_BASE_DIR"

    echo ""
    print_info "Para restaurar un backup:"
    echo "  1. Detener los contenedores: docker-compose -f docker-compose.prod.yml down"
    echo "  2. Extraer el backup: tar -xzf euforia_backup_TIMESTAMP.tar.gz"
    echo "  3. Copiar archivos a sus ubicaciones originales"
    echo "  4. Reiniciar: docker-compose -f docker-compose.prod.yml up -d"

    echo ""
    print_success "Proceso completado: $(date +"%Y-%m-%d %H:%M:%S")"
    echo ""
}

main "$@"

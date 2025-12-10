#!/bin/bash
# =============================================================================
# EUFORIA EVENTS - Generate Production .env File
# =============================================================================
# Genera un archivo .env de producción con JWT_SECRET seguro
# y configuración para Cloudflare Tunnel
#
# Uso:
#   chmod +x generate-env-prod.sh
#   ./generate-env-prod.sh
#
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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
# MAIN
# =============================================================================

print_header "EUFORIA EVENTS - Generador de .env Producción"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json"
    print_info "Ejecutá este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar si ya existe .env
if [ -f ".env" ]; then
    print_warning "Ya existe un archivo .env"
    read -p "¿Querés sobrescribirlo? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Operación cancelada"
        exit 0
    fi

    # Backup del .env existente
    BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
    cp .env "$BACKUP_FILE"
    print_success "Backup creado: $BACKUP_FILE"
fi

# Generar JWT_SECRET seguro (64 caracteres aleatorios)
print_info "Generando JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')
print_success "JWT_SECRET generado"

# Solicitar dominio
echo ""
print_info "Ingresá tu dominio (ej: euforiateclog.cloud)"
read -p "Dominio: " DOMAIN

if [ -z "$DOMAIN" ]; then
    print_error "El dominio es requerido"
    exit 1
fi

# Validar formato del dominio (básico)
if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    print_warning "El formato del dominio parece incorrecto"
    print_info "Ejemplo válido: euforiateclog.cloud"
    read -p "¿Continuar de todas formas? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
fi

# Solicitar credenciales de Spotify (opcional)
echo ""
print_info "Credenciales de Spotify (opcional para MUSICADJ)"
read -p "SPOTIFY_CLIENT_ID (Enter para omitir): " SPOTIFY_CLIENT_ID
if [ -n "$SPOTIFY_CLIENT_ID" ]; then
    read -p "SPOTIFY_CLIENT_SECRET: " SPOTIFY_CLIENT_SECRET
fi

# Crear archivo .env
print_header "Creando archivo .env"

cat > .env << EOF
# =============================================================================
# EUFORIA EVENTS - Producción
# =============================================================================
# Generado: $(date +"%Y-%m-%d %H:%M:%S")
# Hostname: $(hostname)
# =============================================================================

# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=production
PORT=3000

# ============================================
# SECURITY
# ============================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# ============================================
# CLOUDFLARE TUNNEL - Public Access
# ============================================
# Configurado para: ${DOMAIN}

# Dominio público para acceso de invitados (escaneo QR)
PUBLIC_DOMAIN=https://${DOMAIN}

# Dominio para panel de operador (puede ser el mismo o un subdominio)
OPERATOR_DOMAIN=https://operator.${DOMAIN}

# URLs internas (usadas por docker-compose)
CLIENT_URL=http://web-client:80
OPERATOR_URL=http://web-operator:80

# ============================================
# DATABASE
# ============================================
DATABASE_URL=file:./prisma/data/production.db

# ============================================
# CORS
# ============================================
# Permitir acceso desde el dominio público
CORS_ORIGIN=https://${DOMAIN},https://operator.${DOMAIN}

# ============================================
# UPLOADS & STORAGE
# ============================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif

# ============================================
# MODULES
# ============================================
# Módulos habilitados (separados por coma)
ENABLED_MODULES=MUSICADJ,KARAOKEYA

# ============================================
# MUSICADJ - Spotify Integration
# ============================================
EOF

# Agregar credenciales de Spotify si se proporcionaron
if [ -n "$SPOTIFY_CLIENT_ID" ]; then
    cat >> .env << EOF
SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
EOF
else
    cat >> .env << EOF
# SPOTIFY_CLIENT_ID=
# SPOTIFY_CLIENT_SECRET=
EOF
fi

cat >> .env << EOF

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
LOG_FORMAT=json

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# SESSION
# ============================================
SESSION_TIMEOUT=3600000

# ============================================
# WEBSOCKET
# ============================================
WS_PING_INTERVAL=30000
WS_PING_TIMEOUT=5000

# =============================================================================
# NOTAS IMPORTANTES
# =============================================================================
#
# 1. Este archivo contiene información sensible (JWT_SECRET)
#    NO lo subas a git ni lo compartas públicamente
#
# 2. El Cloudflare Tunnel se configurará automáticamente con:
#    - PUBLIC_DOMAIN: Para invitados (QR codes)
#    - OPERATOR_DOMAIN: Para operadores (panel de control)
#
# 3. Para activar el tunnel, ejecutá:
#    ./scripts/setup-cloudflare-tunnel.sh
#
# 4. Para verificar la configuración:
#    ./scripts/check-tunnel-status.sh
#
# =============================================================================
EOF

print_success "Archivo .env creado"

# Mostrar resumen
print_header "Resumen de Configuración"

echo ""
print_info "Configuración Básica:"
echo "  • NODE_ENV: production"
echo "  • PORT: 3000"
echo "  • JWT_SECRET: ✅ Generado (64 chars)"
echo ""

print_info "Dominios:"
echo "  • PUBLIC_DOMAIN: https://${DOMAIN}"
echo "  • OPERATOR_DOMAIN: https://operator.${DOMAIN}"
echo ""

print_info "Spotify:"
if [ -n "$SPOTIFY_CLIENT_ID" ]; then
    echo "  • CLIENT_ID: ✅ Configurado"
    echo "  • CLIENT_SECRET: ✅ Configurado"
else
    echo "  • No configurado (podés agregarlo después)"
fi
echo ""

print_info "Módulos Habilitados:"
echo "  • MUSICADJ (DJ de Música con Spotify)"
echo "  • KARAOKEYA (Karaoke con YouTube)"
echo ""

# Próximos pasos
print_header "Próximos Pasos"

echo "1️⃣  Verificar archivo .env:"
echo "   nano .env"
echo ""

echo "2️⃣  Configurar Cloudflare Tunnel:"
echo "   ./scripts/setup-cloudflare-tunnel.sh"
echo ""

echo "3️⃣  Build de imágenes Docker:"
echo "   docker-compose -f docker-compose.prod.yml build"
echo ""

echo "4️⃣  Iniciar aplicación:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""

echo "5️⃣  Verificar estado:"
echo "   ./scripts/check-tunnel-status.sh"
echo ""

print_success "¡Configuración completada!"
echo ""

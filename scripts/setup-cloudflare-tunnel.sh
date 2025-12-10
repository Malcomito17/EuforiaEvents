#!/bin/bash
# =============================================================================
# EUFORIA EVENTS - Cloudflare Tunnel Setup for Raspberry Pi
# =============================================================================
#
# Este script configura un túnel de Cloudflare en tu Raspberry Pi para
# exponer la aplicación EUFORIA EVENTS a Internet de forma segura y gratuita.
#
# Requisitos:
# - Raspberry Pi con Raspberry Pi OS 64-bit
# - Cuenta de Cloudflare (gratis)
# - Dominio agregado a Cloudflare
# - Docker/CasaOS corriendo con euforia-events
#
# Uso:
#   chmod +x setup-cloudflare-tunnel.sh
#   ./setup-cloudflare-tunnel.sh
#
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
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

# Check if running on Raspberry Pi
check_platform() {
    if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
        print_warning "Este script está optimizado para Raspberry Pi"
        read -p "¿Deseas continuar de todos modos? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "No ejecutes este script como root"
        echo "Ejecutá: ./setup-cloudflare-tunnel.sh"
        exit 1
    fi
}

# Install cloudflared
install_cloudflared() {
    print_header "Instalando cloudflared"

    if command -v cloudflared &> /dev/null; then
        CURRENT_VERSION=$(cloudflared version | head -n1 | awk '{print $3}')
        print_info "cloudflared ya está instalado (versión: $CURRENT_VERSION)"
        read -p "¿Deseas reinstalar? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi

    print_info "Descargando cloudflared para ARM64..."

    # Determine architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" == "aarch64" ]] || [[ "$ARCH" == "arm64" ]]; then
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
    elif [[ "$ARCH" == "armv7l" ]]; then
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm"
    elif [[ "$ARCH" == "x86_64" ]]; then
        CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
    else
        print_error "Arquitectura no soportada: $ARCH"
        exit 1
    fi

    # Download
    curl -L "$CLOUDFLARED_URL" -o /tmp/cloudflared

    # Install
    sudo mv /tmp/cloudflared /usr/local/bin/cloudflared
    sudo chmod +x /usr/local/bin/cloudflared

    # Verify
    if command -v cloudflared &> /dev/null; then
        VERSION=$(cloudflared version | head -n1)
        print_success "cloudflared instalado correctamente: $VERSION"
    else
        print_error "Error al instalar cloudflared"
        exit 1
    fi
}

# Authenticate with Cloudflare
authenticate_cloudflare() {
    print_header "Autenticación con Cloudflare"

    if [ -f "$HOME/.cloudflared/cert.pem" ]; then
        print_info "Ya existe un certificado de autenticación"
        read -p "¿Deseas reautenticar? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi

    print_info "Abriendo navegador para autenticación..."
    print_warning "Si no se abre automáticamente, copiá la URL que aparecerá abajo"
    echo ""

    cloudflared tunnel login

    if [ -f "$HOME/.cloudflared/cert.pem" ]; then
        print_success "Autenticación exitosa"
    else
        print_error "Error en la autenticación"
        exit 1
    fi
}

# Create tunnel
create_tunnel() {
    print_header "Creando Túnel de Cloudflare"

    # Default tunnel name
    TUNNEL_NAME="${TUNNEL_NAME:-euforia-events}"

    # Check if tunnel already exists
    if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
        print_warning "El túnel '$TUNNEL_NAME' ya existe"
        read -p "¿Deseas usar el existente? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
            print_info "Usando túnel existente: $TUNNEL_UUID"
            return 0
        else
            read -p "Ingresá un nuevo nombre para el túnel: " NEW_TUNNEL_NAME
            TUNNEL_NAME="$NEW_TUNNEL_NAME"
        fi
    fi

    print_info "Creando túnel: $TUNNEL_NAME"
    cloudflared tunnel create "$TUNNEL_NAME"

    TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

    if [ -n "$TUNNEL_UUID" ]; then
        print_success "Túnel creado exitosamente"
        print_info "UUID: $TUNNEL_UUID"
        print_info "Nombre: $TUNNEL_NAME"
    else
        print_error "Error al crear el túnel"
        exit 1
    fi
}

# Configure DNS
configure_dns() {
    print_header "Configuración de DNS"

    # Get tunnel info
    TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

    if [ -z "$TUNNEL_UUID" ]; then
        print_error "No se encontró el túnel. Ejecutá la creación primero."
        exit 1
    fi

    # Ask for domain
    echo ""
    print_info "Ingresá el dominio que querés usar para EUFORIA EVENTS"
    print_warning "El dominio debe estar agregado a tu cuenta de Cloudflare"
    echo ""
    echo "Ejemplos:"
    echo "  - eventos.tudominio.com"
    echo "  - euforia.miempresa.com.ar"
    echo "  - app.eventos.org"
    echo ""
    read -p "Dominio: " DOMAIN

    if [ -z "$DOMAIN" ]; then
        print_error "Dominio requerido"
        exit 1
    fi

    # Validate domain format (basic)
    if ! [[ "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$ ]]; then
        print_warning "El formato del dominio parece incorrecto: $DOMAIN"
        read -p "¿Continuar de todos modos? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    # Configure DNS route
    print_info "Configurando ruta DNS..."
    cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

    print_success "DNS configurado para: $DOMAIN"

    # Ask for operator subdomain (optional)
    echo ""
    read -p "¿Deseas un subdominio separado para el panel de operador? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Subdominio para operador (default: admin): " OPERATOR_SUBDOMAIN
        OPERATOR_SUBDOMAIN="${OPERATOR_SUBDOMAIN:-admin}"
        OPERATOR_DOMAIN="$OPERATOR_SUBDOMAIN.$DOMAIN"

        cloudflared tunnel route dns "$TUNNEL_NAME" "$OPERATOR_DOMAIN"
        print_success "DNS configurado para operador: $OPERATOR_DOMAIN"
    else
        OPERATOR_DOMAIN="$DOMAIN"
    fi
}

# Create configuration file
create_config() {
    print_header "Creando Archivo de Configuración"

    TUNNEL_UUID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')

    if [ -z "$TUNNEL_UUID" ]; then
        print_error "No se encontró el túnel"
        exit 1
    fi

    # Create .cloudflared directory
    mkdir -p "$HOME/.cloudflared"

    # Create config file
    CONFIG_FILE="$HOME/.cloudflared/config.yml"

    print_info "Creando configuración en: $CONFIG_FILE"

    cat > "$CONFIG_FILE" << EOF
# =============================================================================
# EUFORIA EVENTS - Cloudflare Tunnel Configuration
# =============================================================================
# Generado automáticamente el $(date)
# Túnel: $TUNNEL_NAME ($TUNNEL_UUID)

tunnel: $TUNNEL_UUID
credentials-file: $HOME/.cloudflared/${TUNNEL_UUID}.json

# Opciones de logging
logfile: /var/log/cloudflared.log
loglevel: info

# Ingress rules (orden importa!)
ingress:
  # Panel de operador (si se configuró subdominio separado)
EOF

    if [ "$OPERATOR_DOMAIN" != "$DOMAIN" ]; then
        cat >> "$CONFIG_FILE" << EOF
  - hostname: $OPERATOR_DOMAIN
    service: http://localhost:80
    originRequest:
      noTLSVerify: true
EOF
    fi

    cat >> "$CONFIG_FILE" << EOF

  # Cliente público (acceso QR)
  - hostname: $DOMAIN
    service: http://localhost:80
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s
      keepAliveTimeout: 90s

  # Catch-all (404 para otros dominios)
  - service: http_status:404

# Opciones de transporte
transport:
  protocol: auto
EOF

    print_success "Configuración creada"

    # Show config
    echo ""
    print_info "Contenido de la configuración:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat "$CONFIG_FILE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Install as systemd service
install_service() {
    print_header "Instalando Servicio Systemd"

    SERVICE_FILE="/etc/systemd/system/cloudflared.service"

    if [ -f "$SERVICE_FILE" ]; then
        print_warning "El servicio ya existe"
        read -p "¿Deseas reinstalarlo? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 0
        fi
        sudo systemctl stop cloudflared 2>/dev/null || true
        sudo systemctl disable cloudflared 2>/dev/null || true
    fi

    print_info "Instalando servicio..."

    # Use cloudflared's built-in service installer
    sudo cloudflared service install

    # Enable and start
    sudo systemctl enable cloudflared
    sudo systemctl start cloudflared

    # Wait a bit for startup
    sleep 3

    # Check status
    if sudo systemctl is-active --quiet cloudflared; then
        print_success "Servicio instalado y corriendo"
    else
        print_error "Error al iniciar el servicio"
        print_info "Ver logs: sudo journalctl -u cloudflared -n 50"
        exit 1
    fi
}

# Create .env variables
create_env_config() {
    print_header "Configuración de Variables de Entorno"

    ENV_FILE="$HOME/euforia-events/.env"
    ENV_EXAMPLE="$HOME/euforia-events/.env.example"

    # Check if euforia-events directory exists
    if [ ! -d "$HOME/euforia-events" ]; then
        print_warning "Directorio euforia-events no encontrado en $HOME"
        read -p "Ingresá la ruta al proyecto (o ENTER para omitir): " PROJECT_PATH

        if [ -n "$PROJECT_PATH" ]; then
            ENV_FILE="$PROJECT_PATH/.env"
            ENV_EXAMPLE="$PROJECT_PATH/.env.example"
        else
            print_warning "Configuración de .env omitida"
            return 0
        fi
    fi

    print_info "Agregando variables al .env..."

    # Backup existing .env
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Backup creado: $ENV_FILE.backup.*"
    fi

    # Add or update PUBLIC_DOMAIN
    if [ -f "$ENV_FILE" ]; then
        # Remove old PUBLIC_DOMAIN if exists
        sed -i '/^PUBLIC_DOMAIN=/d' "$ENV_FILE"
        sed -i '/^OPERATOR_DOMAIN=/d' "$ENV_FILE"
    fi

    # Append new values
    cat >> "$ENV_FILE" << EOF

# ============================================
# CLOUDFLARE TUNNEL - Public Access
# ============================================
# Configurado el $(date)

# Dominio público para acceso de invitados (QR)
PUBLIC_DOMAIN=https://$DOMAIN

# Dominio para panel de operador
OPERATOR_DOMAIN=https://$OPERATOR_DOMAIN
EOF

    print_success "Variables agregadas a .env"
    print_info "Archivo: $ENV_FILE"
}

# Test tunnel
test_tunnel() {
    print_header "Probando Túnel"

    print_info "Esperando que el túnel se estabilice..."
    sleep 5

    # Check service status
    if ! sudo systemctl is-active --quiet cloudflared; then
        print_error "El servicio no está corriendo"
        print_info "Ver logs: sudo journalctl -u cloudflared -n 50 --no-pager"
        return 1
    fi

    print_success "Servicio activo"

    # Test DNS resolution
    print_info "Probando resolución DNS para: $DOMAIN"

    if nslookup "$DOMAIN" &> /dev/null; then
        IP=$(nslookup "$DOMAIN" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
        print_success "DNS resuelve a: $IP"
    else
        print_warning "DNS aún no propagado (puede tomar hasta 5 minutos)"
    fi

    # Test HTTP connection
    print_info "Probando conexión HTTP..."

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN" || echo "000")

    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
        print_success "Túnel funcionando correctamente (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" == "000" ]; then
        print_warning "No se pudo conectar (DNS aún propagando o servicio local no disponible)"
    else
        print_warning "Respuesta HTTP: $HTTP_CODE"
    fi
}

# Final summary
show_summary() {
    print_header "¡Setup Completado!"

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}                  EUFORIA EVENTS - URLs Públicas${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "  ${BLUE}📱 Acceso Clientes (QR):${NC}    https://$DOMAIN"
    echo -e "  ${BLUE}👤 Panel Operador:${NC}          https://$OPERATOR_DOMAIN/operator"
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    print_info "Comandos útiles:"
    echo ""
    echo "  Ver status:     sudo systemctl status cloudflared"
    echo "  Ver logs:       sudo journalctl -u cloudflared -f"
    echo "  Reiniciar:      sudo systemctl restart cloudflared"
    echo "  Detener:        sudo systemctl stop cloudflared"
    echo ""

    print_warning "IMPORTANTE:"
    echo "  1. Reiniciá los contenedores Docker para que tomen las nuevas variables:"
    echo "     cd ~/euforia-events && docker-compose restart"
    echo ""
    echo "  2. Verificá que la app esté corriendo localmente:"
    echo "     curl http://localhost:80"
    echo ""
    echo "  3. El DNS puede tardar 5-10 minutos en propagarse globalmente"
    echo ""

    print_success "Setup finalizado exitosamente 🎉"
}

# Main execution
main() {
    print_header "EUFORIA EVENTS - Cloudflare Tunnel Setup"

    check_root
    check_platform

    install_cloudflared
    authenticate_cloudflare
    create_tunnel
    configure_dns
    create_config
    install_service
    create_env_config
    test_tunnel
    show_summary
}

# Run main function
main "$@"

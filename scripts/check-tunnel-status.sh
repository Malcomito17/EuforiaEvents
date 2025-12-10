#!/bin/bash
# =============================================================================
# EUFORIA EVENTS - Check Cloudflare Tunnel Status
# =============================================================================
#
# Script para verificar el estado del túnel de Cloudflare
#
# Uso:
#   chmod +x check-tunnel-status.sh
#   ./check-tunnel-status.sh
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

# Check if cloudflared is installed
check_cloudflared_installed() {
    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared no está instalado"
        echo "Ejecutá: ./setup-cloudflare-tunnel.sh"
        exit 1
    fi

    VERSION=$(cloudflared version | head -n1)
    print_success "cloudflared instalado: $VERSION"
}

# Check service status
check_service() {
    print_header "Estado del Servicio"

    if ! systemctl list-unit-files | grep -q cloudflared.service; then
        print_error "Servicio cloudflared no instalado"
        return 1
    fi

    if sudo systemctl is-active --quiet cloudflared; then
        print_success "Servicio activo y corriendo"

        # Show uptime
        UPTIME=$(systemctl show cloudflared -p ActiveEnterTimestamp --value)
        print_info "Iniciado: $UPTIME"
    else
        print_error "Servicio NO está corriendo"
        print_info "Iniciar: sudo systemctl start cloudflared"
        return 1
    fi

    # Check if enabled
    if sudo systemctl is-enabled --quiet cloudflared; then
        print_success "Servicio habilitado (inicia automáticamente)"
    else
        print_warning "Servicio NO habilitado para inicio automático"
        print_info "Habilitar: sudo systemctl enable cloudflared"
    fi
}

# Check tunnel configuration
check_config() {
    print_header "Configuración"

    CONFIG_FILE="$HOME/.cloudflared/config.yml"

    if [ -f "$CONFIG_FILE" ]; then
        print_success "Archivo de configuración existe"
        print_info "Ubicación: $CONFIG_FILE"

        # Extract domains
        DOMAINS=$(grep "hostname:" "$CONFIG_FILE" | awk '{print $3}' | sort -u)

        if [ -n "$DOMAINS" ]; then
            echo ""
            print_info "Dominios configurados:"
            for domain in $DOMAINS; do
                echo "  • $domain"
            done
        fi
    else
        print_error "Archivo de configuración no encontrado"
        return 1
    fi
}

# Check tunnel list
check_tunnel() {
    print_header "Túneles Activos"

    if ! cloudflared tunnel list &> /dev/null; then
        print_error "No se pudo listar túneles"
        print_info "Autenticación requerida: cloudflared tunnel login"
        return 1
    fi

    TUNNEL_COUNT=$(cloudflared tunnel list | grep -c "euforia" || echo "0")

    if [ "$TUNNEL_COUNT" -gt 0 ]; then
        print_success "Túneles encontrados: $TUNNEL_COUNT"
        echo ""
        cloudflared tunnel list | grep "euforia" || true
    else
        print_warning "No se encontraron túneles con nombre 'euforia'"
    fi
}

# Check DNS resolution
check_dns() {
    print_header "Verificación DNS"

    CONFIG_FILE="$HOME/.cloudflared/config.yml"

    if [ ! -f "$CONFIG_FILE" ]; then
        print_warning "Config no encontrado, omitiendo verificación DNS"
        return 0
    fi

    # Get domains from config
    DOMAINS=$(grep "hostname:" "$CONFIG_FILE" | awk '{print $3}' | sort -u)

    if [ -z "$DOMAINS" ]; then
        print_warning "No se encontraron dominios en la configuración"
        return 0
    fi

    for domain in $DOMAINS; do
        echo ""
        print_info "Verificando: $domain"

        if IP=$(nslookup "$domain" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}'); then
            if [ -n "$IP" ]; then
                print_success "Resuelve a: $IP"
            else
                print_warning "No se pudo obtener IP"
            fi
        else
            print_error "DNS no resuelve (puede estar propagando)"
        fi
    done
}

# Check HTTP connectivity
check_http() {
    print_header "Conectividad HTTP"

    CONFIG_FILE="$HOME/.cloudflared/config.yml"

    if [ ! -f "$CONFIG_FILE" ]; then
        print_warning "Config no encontrado, omitiendo verificación HTTP"
        return 0
    fi

    # Get first domain
    DOMAIN=$(grep "hostname:" "$CONFIG_FILE" | head -1 | awk '{print $3}')

    if [ -z "$DOMAIN" ]; then
        print_warning "No se encontró dominio para verificar"
        return 0
    fi

    print_info "Probando: https://$DOMAIN"

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$DOMAIN" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" == "200" ]; then
        print_success "✅ Sitio accesible (HTTP 200 OK)"
    elif [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "302" ]; then
        print_success "Sitio accesible (HTTP $HTTP_CODE - Redirect)"
    elif [ "$HTTP_CODE" == "404" ]; then
        print_warning "Túnel OK, pero la app local no responde (HTTP 404)"
        print_info "Verificá que Docker esté corriendo: docker ps"
    elif [ "$HTTP_CODE" == "502" ] || [ "$HTTP_CODE" == "503" ]; then
        print_error "Bad Gateway (HTTP $HTTP_CODE)"
        print_info "La app local no está respondiendo en puerto 80"
    elif [ "$HTTP_CODE" == "000" ]; then
        print_error "No se pudo conectar"
        print_info "DNS aún propagando o servicio caído"
    else
        print_warning "Respuesta HTTP: $HTTP_CODE"
    fi

    # Test local service
    echo ""
    print_info "Verificando servicio local (puerto 80)..."

    if curl -s -o /dev/null --max-time 5 "http://localhost:80" 2>/dev/null; then
        print_success "Servicio local respondiendo en puerto 80"
    else
        print_error "Servicio local NO responde en puerto 80"
        print_info "Verificá Docker: docker ps"
        print_info "O iniciá: docker-compose up -d"
    fi
}

# Check logs
check_logs() {
    print_header "Últimos Logs (10 líneas)"

    echo ""
    sudo journalctl -u cloudflared -n 10 --no-pager 2>/dev/null || {
        print_error "No se pudieron obtener logs"
        print_info "Ver manualmente: sudo journalctl -u cloudflared -f"
    }
}

# Show useful commands
show_commands() {
    print_header "Comandos Útiles"

    echo ""
    echo -e "${BLUE}Servicio:${NC}"
    echo "  sudo systemctl status cloudflared    # Ver estado detallado"
    echo "  sudo systemctl restart cloudflared   # Reiniciar servicio"
    echo "  sudo systemctl stop cloudflared      # Detener servicio"
    echo "  sudo systemctl start cloudflared     # Iniciar servicio"
    echo ""
    echo -e "${BLUE}Logs:${NC}"
    echo "  sudo journalctl -u cloudflared -f    # Ver logs en tiempo real"
    echo "  sudo journalctl -u cloudflared -n 50 # Ver últimas 50 líneas"
    echo ""
    echo -e "${BLUE}Túnel:${NC}"
    echo "  cloudflared tunnel list              # Listar túneles"
    echo "  cloudflared tunnel info euforia-events  # Info del túnel"
    echo ""
    echo -e "${BLUE}Docker:${NC}"
    echo "  docker ps                            # Ver contenedores"
    echo "  docker-compose logs -f               # Ver logs de la app"
    echo ""
}

# Main
main() {
    print_header "EUFORIA EVENTS - Cloudflare Tunnel Status"

    check_cloudflared_installed
    check_service
    check_config
    check_tunnel
    check_dns
    check_http
    check_logs
    show_commands

    echo ""
    print_success "Verificación completa"
    echo ""
}

main "$@"

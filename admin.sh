#!/bin/bash
#
# admin.sh - Menú de Administración EUFORIA EVENTS
#
# Script de administración para operadores sin conocimiento técnico.
# Proporciona un menú interactivo para realizar operaciones comunes.
#

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# FUNCIONES AUXILIARES
# ============================================

# Función para mostrar banner
show_banner() {
  clear
  echo -e "${BLUE}"
  cat << "EOF"
╔══════════════════════════════════════════════════╗
║                                                  ║
║       EUFORIA EVENTS - MENÚ ADMINISTRACIÓN      ║
║                                                  ║
╚══════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"
}

# Función para mostrar error
show_error() {
  echo ""
  echo -e "${RED}❌ ERROR: $1${NC}"
  echo ""
  read -p "Presiona ENTER para continuar..."
}

# Función para mostrar éxito
show_success() {
  echo ""
  echo -e "${GREEN}✅ $1${NC}"
  echo ""
  read -p "Presiona ENTER para continuar..."
}

# Función para mostrar info
show_info() {
  echo -e "${CYAN}ℹ️  $1${NC}"
}

# Función para confirmar acción
confirm_action() {
  local message="$1"
  echo ""
  echo -e "${YELLOW}⚠️  $message${NC}"
  read -p "¿Desea continuar? (s/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    sleep 1
    return 1
  fi
  return 0
}

# Función para pausar
pause() {
  echo ""
  read -p "Presiona ENTER para continuar..."
}

# ============================================
# FUNCIONES DE OPERACIONES
# ============================================

# 1. Ejecutar Deployment
run_deployment() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    EJECUTAR DEPLOYMENT${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  show_info "Este proceso actualizará el sistema con los últimos cambios."
  show_info "Puede tardar varios minutos."
  echo ""

  if confirm_action "Esto detendrá los servicios temporalmente"; then
    echo ""
    if [ -f "./deploy.sh" ]; then
      bash ./deploy.sh
    else
      show_error "No se encontró el script deploy.sh"
      return
    fi
  fi

  pause
}

# 2. Reset Password Admin
reset_admin_password() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    RESETEAR PASSWORD ADMIN${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  show_info "Esta operación restablecerá la contraseña del usuario admin."
  echo ""

  # Solicitar nueva contraseña
  echo -e "${CYAN}Ingrese la nueva contraseña para el usuario admin:${NC}"
  read -s NEW_PASSWORD
  echo ""

  if [ -z "$NEW_PASSWORD" ]; then
    show_error "La contraseña no puede estar vacía"
    return
  fi

  echo -e "${CYAN}Confirme la contraseña:${NC}"
  read -s CONFIRM_PASSWORD
  echo ""

  if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    show_error "Las contraseñas no coinciden"
    return
  fi

  # Hash de la contraseña con bcrypt
  echo -e "${YELLOW}Generando hash de contraseña...${NC}"

  HASH=$(docker exec euforia-api-prod bash -c "NODE_PATH=/app/node_modules node -e \"const bcrypt=require('bcrypt');console.log(bcrypt.hashSync(process.argv[1],10))\" \"$NEW_PASSWORD\"" 2>&1)

  if [ $? -ne 0 ]; then
    show_error "No se pudo generar el hash. Error: $HASH"
    return
  fi

  # Actualizar contraseña en la base de datos
  echo -e "${YELLOW}Actualizando contraseña en la base de datos...${NC}"

  docker exec euforia-api-prod npx prisma db execute \
    --stdin <<< "UPDATE users SET password = '$HASH' WHERE username = 'admin';" 2>/dev/null

  if [ $? -eq 0 ]; then
    show_success "Contraseña de admin actualizada correctamente"
  else
    show_error "Error al actualizar la contraseña"
  fi
}

# 3. Abrir Prisma Studio
open_prisma_studio() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    PRISMA STUDIO - ADMINISTRADOR BBDD${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  show_info "Prisma Studio es una interfaz gráfica para administrar la base de datos."
  show_info "Se abrirá en el puerto 5555"
  echo ""

  # Verificar si el contenedor está corriendo
  if ! docker ps | grep -q "euforia-api-prod"; then
    show_error "El contenedor API no está corriendo. Inicie los servicios primero."
    return
  fi

  echo -e "${GREEN}Iniciando Prisma Studio...${NC}"
  echo -e "${CYAN}Acceda desde su navegador en: ${YELLOW}http://localhost:5555${NC}"
  echo ""
  echo -e "${RED}Para cerrar Prisma Studio, presione Ctrl+C${NC}"
  echo ""

  docker exec -it euforia-api-prod npx prisma studio --port 5555

  pause
}

# 4. Ver logs de servicios
view_logs() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    VER LOGS DE SERVICIOS${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  echo "Seleccione el servicio:"
  echo ""
  echo "  1) API"
  echo "  2) Web Operator"
  echo "  3) Web Client"
  echo "  4) Todos los servicios"
  echo "  0) Volver"
  echo ""
  read -p "Opción: " log_option

  case $log_option in
    1)
      echo ""
      echo -e "${GREEN}Mostrando logs del API (últimas 50 líneas)...${NC}"
      echo -e "${CYAN}Presione Ctrl+C para salir${NC}"
      echo ""
      docker logs -f --tail 50 euforia-api-prod
      ;;
    2)
      echo ""
      echo -e "${GREEN}Mostrando logs de Web Operator (últimas 50 líneas)...${NC}"
      echo -e "${CYAN}Presione Ctrl+C para salir${NC}"
      echo ""
      docker logs -f --tail 50 euforia-web-operator-prod
      ;;
    3)
      echo ""
      echo -e "${GREEN}Mostrando logs de Web Client (últimas 50 líneas)...${NC}"
      echo -e "${CYAN}Presione Ctrl+C para salir${NC}"
      echo ""
      docker logs -f --tail 50 euforia-web-client-prod
      ;;
    4)
      echo ""
      echo -e "${GREEN}Mostrando logs de todos los servicios...${NC}"
      echo -e "${CYAN}Presione Ctrl+C para salir${NC}"
      echo ""
      docker compose -f docker-compose.prod.yml logs -f --tail 50
      ;;
    0)
      return
      ;;
    *)
      show_error "Opción inválida"
      ;;
  esac

  pause
}

# 5. Ver estado de servicios
view_status() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    ESTADO DE SERVICIOS${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  echo -e "${CYAN}Contenedores Docker:${NC}"
  docker ps -a --filter "name=euforia-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  echo ""

  echo -e "${CYAN}Health Check API:${NC}"
  if docker exec euforia-api-prod curl -s http://localhost:3000/health > /dev/null 2>&1; then
    API_HEALTH=$(docker exec euforia-api-prod curl -s http://localhost:3000/health 2>/dev/null)
    echo -e "${GREEN}✓ API respondiendo correctamente${NC}"
    echo "$API_HEALTH"
  else
    echo -e "${RED}✗ API no responde${NC}"
  fi
  echo ""

  echo -e "${CYAN}Espacio en disco:${NC}"
  df -h / | grep -v Filesystem
  echo ""

  echo -e "${CYAN}Uso de memoria:${NC}"
  free -h | grep -E "Mem|Swap"
  echo ""

  pause
}

# 6. Reiniciar servicios
restart_services() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    REINICIAR SERVICIOS${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  echo "Seleccione el servicio a reiniciar:"
  echo ""
  echo "  1) API"
  echo "  2) Web Operator"
  echo "  3) Web Client"
  echo "  4) Todos los servicios"
  echo "  0) Volver"
  echo ""
  read -p "Opción: " restart_option

  case $restart_option in
    1)
      if confirm_action "Se reiniciará el servicio API"; then
        echo ""
        docker restart euforia-api-prod
        show_success "API reiniciado correctamente"
      fi
      ;;
    2)
      if confirm_action "Se reiniciará el servicio Web Operator"; then
        echo ""
        docker restart euforia-web-operator-prod
        show_success "Web Operator reiniciado correctamente"
      fi
      ;;
    3)
      if confirm_action "Se reiniciará el servicio Web Client"; then
        echo ""
        docker restart euforia-web-client-prod
        show_success "Web Client reiniciado correctamente"
      fi
      ;;
    4)
      if confirm_action "Se reiniciarán TODOS los servicios"; then
        echo ""
        docker compose -f docker-compose.prod.yml restart
        show_success "Todos los servicios reiniciados correctamente"
      fi
      ;;
    0)
      return
      ;;
    *)
      show_error "Opción inválida"
      ;;
  esac
}

# 7. Backup manual de base de datos
manual_backup() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    BACKUP MANUAL DE BASE DE DATOS${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  # Crear directorio de backups
  mkdir -p backups

  BACKUP_FILE="backups/euforia.db.backup-$(date +%Y%m%d-%H%M%S)"

  show_info "Creando backup de la base de datos..."
  echo ""

  if docker exec euforia-api-prod sh -c "cat /app/prisma/euforia.db" > "$BACKUP_FILE" 2>/dev/null; then
    echo -e "${GREEN}✓ Backup creado exitosamente${NC}"
    echo ""
    echo -e "${CYAN}Archivo: ${YELLOW}$BACKUP_FILE${NC}"
    echo -e "${CYAN}Tamaño: ${YELLOW}$(ls -lh "$BACKUP_FILE" | awk '{print $5}')${NC}"
    echo ""

    # Mostrar últimos 5 backups
    echo -e "${CYAN}Últimos 5 backups:${NC}"
    ls -lht backups/*.backup* 2>/dev/null | head -5 | awk '{print "  " $9 " (" $5 ")"}'
  else
    show_error "No se pudo crear el backup. ¿Está el contenedor API corriendo?"
    return
  fi

  pause
}

# 8. Iniciar/Detener servicios
start_stop_services() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    INICIAR/DETENER SERVICIOS${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  echo "Seleccione una opción:"
  echo ""
  echo "  1) Iniciar todos los servicios"
  echo "  2) Detener todos los servicios"
  echo "  0) Volver"
  echo ""
  read -p "Opción: " startstop_option

  case $startstop_option in
    1)
      if confirm_action "Se iniciarán todos los servicios"; then
        echo ""
        docker compose -f docker-compose.prod.yml up -d
        echo ""
        show_success "Servicios iniciados correctamente"
      fi
      ;;
    2)
      if confirm_action "Se detendrán TODOS los servicios"; then
        echo ""
        docker compose -f docker-compose.prod.yml down
        echo ""
        show_success "Servicios detenidos correctamente"
      fi
      ;;
    0)
      return
      ;;
    *)
      show_error "Opción inválida"
      ;;
  esac
}

# 9. Información del sistema
system_info() {
  show_banner
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo -e "${PURPLE}    INFORMACIÓN DEL SISTEMA${NC}"
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""

  echo -e "${CYAN}Versión de la aplicación:${NC}"
  if docker exec euforia-api-prod curl -s http://localhost:3000/api 2>/dev/null; then
    API_INFO=$(docker exec euforia-api-prod curl -s http://localhost:3000/api 2>/dev/null)
    echo "$API_INFO" | grep -E "name|version|modules"
  else
    echo -e "${RED}No se pudo obtener información del API${NC}"
  fi
  echo ""

  echo -e "${CYAN}Última actualización del código:${NC}"
  git log -1 --pretty=format:"  Commit: %h%n  Autor: %an%n  Fecha: %ad%n  Mensaje: %s%n" --date=format:'%d/%m/%Y %H:%M'
  echo ""

  echo -e "${CYAN}Sistema operativo:${NC}"
  uname -a
  echo ""

  echo -e "${CYAN}Versión de Docker:${NC}"
  docker --version
  echo ""

  pause
}

# ============================================
# MENÚ PRINCIPAL
# ============================================

show_menu() {
  show_banner

  echo -e "${CYAN}Seleccione una opción:${NC}"
  echo ""
  echo -e "  ${GREEN}1)${NC} Ejecutar Deployment"
  echo -e "  ${GREEN}2)${NC} Resetear Password Admin"
  echo -e "  ${GREEN}3)${NC} Abrir Prisma Studio (Admin BBDD)"
  echo -e "  ${GREEN}4)${NC} Ver Logs de Servicios"
  echo -e "  ${GREEN}5)${NC} Ver Estado de Servicios"
  echo -e "  ${GREEN}6)${NC} Reiniciar Servicios"
  echo -e "  ${GREEN}7)${NC} Backup Manual de Base de Datos"
  echo -e "  ${GREEN}8)${NC} Iniciar/Detener Servicios"
  echo -e "  ${GREEN}9)${NC} Información del Sistema"
  echo ""
  echo -e "  ${RED}0)${NC} Salir"
  echo ""
  echo -e "${PURPLE}═══════════════════════════════════════════${NC}"
  echo ""
}

# ============================================
# LOOP PRINCIPAL
# ============================================

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
  clear
  echo -e "${RED}"
  echo "╔══════════════════════════════════════════════════╗"
  echo "║                    ERROR                         ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo -e "${NC}"
  echo ""
  echo "No estás en el directorio correcto del proyecto."
  echo "Debes estar en ~/projects/euforia-events"
  echo ""
  echo "Ejecuta:"
  echo "  cd ~/projects/euforia-events"
  echo "  ./admin.sh"
  echo ""
  exit 1
fi

# Loop del menú
while true; do
  show_menu
  read -p "Opción: " option

  case $option in
    1) run_deployment ;;
    2) reset_admin_password ;;
    3) open_prisma_studio ;;
    4) view_logs ;;
    5) view_status ;;
    6) restart_services ;;
    7) manual_backup ;;
    8) start_stop_services ;;
    9) system_info ;;
    0)
      clear
      echo -e "${GREEN}¡Hasta luego!${NC}"
      echo ""
      exit 0
      ;;
    *)
      show_error "Opción inválida. Por favor seleccione una opción del menú."
      ;;
  esac
done

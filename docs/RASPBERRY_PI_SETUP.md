# 🎉 EUFORIA EVENTS - Setup Completo en Raspberry Pi (DESDE CERO)

**Guía completa de instalación desde la instalación del sistema operativo hasta el deployment en producción**

**Configuración Final**:
- Usuario: `malcomito`
- Hostname: `euforiaevents`
- Dominio: `euforiateclog.cloud`
- IP: `192.168.80.160` (estática)

**Tiempo estimado total**: 2-3 horas

---

## 📋 ÍNDICE

1. [FASE 0: Preparación y Materiales](#fase-0-preparación-y-materiales)
2. [FASE 1: Instalación del Sistema Operativo](#fase-1-instalación-del-sistema-operativo)
3. [FASE 2: Configuración Inicial del Sistema](#fase-2-configuración-inicial-del-sistema)
4. [FASE 3: Instalación de Docker](#fase-3-instalación-de-docker)
5. [FASE 4: Instalación de CasaOS (Opcional)](#fase-4-instalación-de-casaos-opcional)
6. [FASE 5: Clonar Repositorio](#fase-5-clonar-repositorio)
7. [FASE 6: Configuración de Variables de Entorno](#fase-6-configuración-de-variables-de-entorno)
8. [FASE 7: Cloudflare Tunnel](#fase-7-cloudflare-tunnel)
9. [FASE 8: Deploy de la Aplicación](#fase-8-deploy-de-la-aplicación)
10. [FASE 9: Verificación y Testing](#fase-9-verificación-y-testing)
11. [Mantenimiento](#mantenimiento)
12. [Troubleshooting](#troubleshooting)

---

## FASE 0: Preparación y Materiales

### 🛠️ Hardware Necesario

- **Raspberry Pi 4** (4GB RAM o superior recomendado)
- **MicroSD Card** (16GB mínimo, 32GB+ recomendado) O mejor aún **SSD USB 3.0**
- **Fuente de alimentación** USB-C 5V/3A oficial
- **Cable Ethernet** (para configuración inicial, recomendado)
- **Monitor + Cable HDMI** (opcional, solo para troubleshooting)
- **Teclado USB** (opcional, solo para troubleshooting)

### 💻 Software Necesario (en tu Mac)

- **Raspberry Pi Imager**: https://www.raspberrypi.com/software/
- **Terminal** o cliente SSH (ya incluido en Mac)

### ☁️ Cuentas Necesarias

- [x] **GitHub**: Código del proyecto ya subido
- [x] **Porkbun**: Dominio `euforiateclog.cloud` ya registrado
- [x] **Cloudflare**: Cuenta creada, dominio agregado y activo
- [ ] **Spotify Developer** (opcional): Para módulo MUSICADJ

---

## FASE 1: Instalación del Sistema Operativo

### 1.1 Descargar Raspberry Pi Imager (en tu Mac)

```bash
# Opción 1: Descargar desde el sitio oficial
# https://www.raspberrypi.com/software/

# Opción 2: Instalar con Homebrew
brew install --cask raspberry-pi-imager
```

### 1.2 Preparar la MicroSD / SSD

1. **Abrir Raspberry Pi Imager**
2. **Elegir dispositivo**: Raspberry Pi 4
3. **Elegir OS**:
   - Raspberry Pi OS (64-bit) **Lite** (recomendado para servidor)
   - O Raspberry Pi OS (64-bit) **Desktop** (si querés interfaz gráfica)

4. **Elegir Storage**: Seleccionar tu microSD o SSD

### 1.3 Configuración Avanzada (IMPORTANTE)

Antes de escribir, click en **⚙️ configuración avanzada**:

```
✅ Habilitar SSH
   ○ Usar autenticación por contraseña

✅ Configurar usuario y contraseña
   Usuario: malcomito
   Contraseña: [tu-contraseña-segura]

✅ Configurar wireless LAN (si usás WiFi)
   SSID: [nombre-de-tu-wifi]
   Password: [password-wifi]
   País: AR (o tu país)

✅ Configurar opciones de localización
   Zona horaria: America/Argentina/Buenos_Aires
   Distribución de teclado: es (español)

✅ Hostname
   euforiaevents
```

### 1.4 Escribir en la SD/SSD

1. Click en **"Escribir"** / **"Write"**
2. Confirmar (se borrará todo el contenido)
3. Esperar 5-10 minutos
4. Cuando termine, expulsar la SD/SSD

### 1.5 Primer Arranque

1. **Insertar la microSD** (o conectar SSD USB) en la Raspberry Pi
2. **Conectar cable Ethernet** al router (recomendado para setup inicial)
3. **Conectar fuente de alimentación**
4. **Esperar 2-3 minutos** para que arranque

---

## FASE 2: Configuración Inicial del Sistema

### 2.1 Encontrar la IP de la Raspberry Pi

**Opción A: Usando el hostname** (si funciona mDNS)
```bash
# Desde tu Mac
ping euforiaevents.local
```

**Opción B: Escanear la red**
```bash
# Desde tu Mac (instalar nmap si no lo tenés)
brew install nmap

# Escanear tu red local (ajustar el rango según tu red)
nmap -sn 192.168.1.0/24 | grep -B 2 "Raspberry"

# O ver en el router las conexiones activas
```

Deberías encontrar la IP, por ejemplo: `192.168.80.160`

### 2.2 Conectar por SSH

```bash
# Desde tu Mac
ssh malcomito@euforiaevents.local

# O usando la IP
ssh malcomito@192.168.80.160

# Confirmar la huella digital (primera vez)
# Escribir tu contraseña
```

### 2.3 Actualizar el Sistema

```bash
# Actualizar lista de paquetes
sudo apt update

# Actualizar paquetes instalados
sudo apt upgrade -y

# Instalar paquetes esenciales
sudo apt install -y \
  git \
  curl \
  wget \
  nano \
  vim \
  htop \
  net-tools \
  ca-certificates \
  gnupg \
  lsb-release

# Reiniciar (opcional pero recomendado)
sudo reboot

# Esperar 1 minuto y reconectar
ssh malcomito@euforiaevents.local
```

### 2.4 Configurar IP Estática

**Opción A: Usando NetworkManager (Raspberry Pi OS Bookworm)**

```bash
# Ver interfaces de red
nmcli device status

# Ver conexión actual
nmcli connection show

# Configurar IP estática (ajustar según tu red)
# Nombre de conexión suele ser "Wired connection 1" o "eth0"
sudo nmcli connection modify "Wired connection 1" \
  ipv4.addresses 192.168.80.160/24 \
  ipv4.gateway 192.168.80.1 \
  ipv4.dns "8.8.8.8,8.8.4.4" \
  ipv4.method manual

# Aplicar cambios
sudo nmcli connection up "Wired connection 1"

# Verificar
ip addr show eth0
```

**Opción B: Usando dhcpcd (Raspberry Pi OS Bullseye o anterior)**

```bash
# Editar configuración
sudo nano /etc/dhcpcd.conf

# Agregar al final (ajustar según tu red):
interface eth0
static ip_address=192.168.80.160/24
static routers=192.168.80.1
static domain_name_servers=8.8.8.8 8.8.4.4

# Guardar: Ctrl+X, Y, Enter

# Reiniciar servicio
sudo systemctl restart dhcpcd

# Verificar
ip addr show eth0
```

### 2.5 Verificar Configuración

```bash
# Verificar hostname
hostname
# Debe mostrar: euforiaevents

# Verificar usuario
whoami
# Debe mostrar: malcomito

# Verificar IP
ip addr show eth0
# Debe mostrar: 192.168.80.160

# Verificar conexión a internet
ping -c 4 google.com
```

---

## FASE 3: Instalación de Docker

### 3.1 Instalar Docker

```bash
# Conectar por SSH
ssh malcomito@euforiaevents.local

# Descargar script oficial de instalación
curl -fsSL https://get.docker.com -o get-docker.sh

# Verificar el script (opcional)
cat get-docker.sh

# Ejecutar instalación
sudo sh get-docker.sh

# Limpiar
rm get-docker.sh
```

### 3.2 Configurar Permisos

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker malcomito

# Aplicar cambios (cerrar sesión y volver a entrar)
exit

# Reconectar
ssh malcomito@euforiaevents.local

# Verificar que funciona SIN sudo
docker --version
docker ps
```

Deberías ver:
```
Docker version 24.x.x
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

### 3.3 Instalar Docker Compose

```bash
# Verificar si ya está instalado (viene con Docker moderno)
docker compose version

# Si NO está instalado, instalar manualmente:
sudo apt install -y docker-compose-plugin

# O instalar versión standalone:
sudo apt install -y docker-compose

# Verificar
docker compose version
```

### 3.4 Configurar Docker para inicio automático

```bash
# Habilitar Docker para que arranque con el sistema
sudo systemctl enable docker

# Verificar estado
sudo systemctl status docker
```

---

## FASE 4: Instalación de CasaOS (Opcional)

CasaOS proporciona una interfaz web para administrar Docker. Es **opcional** pero útil.

### 4.1 Instalar CasaOS

```bash
# Ejecutar instalador oficial
curl -fsSL https://get.casaos.io | sudo bash

# Esperar 5-10 minutos
# Al finalizar mostrará la URL de acceso
```

### 4.2 Acceder a CasaOS

```
http://192.168.80.160
# O
http://euforiaevents.local
```

**Primer acceso**:
1. Crear cuenta de administrador
2. Configurar preferencias básicas

**Nota**: CasaOS no interfiere con el uso de Docker desde CLI. Podés usar ambos.

---

## FASE 5: Clonar Repositorio

### 5.1 Crear Directorio de Trabajo

```bash
# Conectar por SSH
ssh malcomito@euforiaevents.local

# Crear directorio
mkdir -p ~/projects
cd ~/projects
```

### 5.2 Clonar EUFORIA EVENTS

```bash
# Clonar repositorio (HTTPS)
git clone https://github.com/Malcomito17/EuforiaEvents.git euforia-events

# Entrar al directorio
cd euforia-events

# Verificar estructura
ls -la
```

Deberías ver:
```
apps/
docker/
scripts/
docs/
.env.example
docker-compose.prod.yml
package.json
...
```

### 5.3 Hacer Scripts Ejecutables

```bash
# Dar permisos de ejecución a todos los scripts
chmod +x scripts/*.sh

# Verificar
ls -la scripts/
```

---

## FASE 6: Configuración de Variables de Entorno

### 6.1 Generar .env Automáticamente (RECOMENDADO)

```bash
# Ejecutar generador interactivo
./scripts/generate-env-prod.sh
```

El script te preguntará:
```
Dominio: euforiateclog.cloud
SPOTIFY_CLIENT_ID (opcional): [Enter para omitir]
SPOTIFY_CLIENT_SECRET (opcional): [Enter para omitir]
```

**Resultado**: Se crea `.env` con:
- JWT_SECRET aleatorio y seguro
- PUBLIC_DOMAIN configurado
- Todas las variables necesarias

### 6.2 Crear .env Manualmente (Alternativa)

```bash
# Copiar template
cp .env.example .env

# Editar
nano .env
```

**Variables críticas a configurar**:

```bash
# ===========================================
# ENVIRONMENT
# ===========================================
NODE_ENV=production
PORT=3000

# ===========================================
# SECURITY
# ===========================================
# ¡GENERAR UN SECRETO ALEATORIO!
JWT_SECRET=
JWT_EXPIRES_IN=7d

# ===========================================
# CLOUDFLARE TUNNEL
# ===========================================
PUBLIC_DOMAIN=https://euforiateclog.cloud
OPERATOR_DOMAIN=https://euforiateclog.cloud

# ===========================================
# DATABASE
# ===========================================
DATABASE_URL=file:./prisma/data/production.db

# ===========================================
# SPOTIFY (Opcional)
# ===========================================
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# ===========================================
# MODULES
# ===========================================
ENABLED_MODULES=MUSICADJ,KARAOKEYA
```

**Generar JWT_SECRET**:
```bash
# En la Pi
openssl rand -base64 48

# Copiar el resultado y pegarlo en JWT_SECRET
```

**Guardar y salir**: `Ctrl+X`, `Y`, `Enter`

### 6.3 Verificar .env

```bash
# Verificar que existe
ls -la .env

# Ver contenido (ocultar datos sensibles al compartir)
cat .env
```

---

## FASE 7: Cloudflare Tunnel

### 7.1 Verificar Dominio en Cloudflare

**Antes de continuar**, verificá en Cloudflare Dashboard:

1. Ir a: https://dash.cloudflare.com
2. Buscar: `euforiateclog.cloud`
3. Estado debe ser: **"Active"** ✅

Si dice "Pending", esperar 10-30 minutos más.

### 7.2 Ejecutar Setup de Cloudflare Tunnel

```bash
# Asegurate de estar en el directorio correcto
cd ~/projects/euforia-events

# Ejecutar script
./scripts/setup-cloudflare-tunnel.sh
```

### 7.3 Proceso de Autenticación

El script te guiará:

**1. Autenticación con Cloudflare**
```
Se abrirá un navegador (o mostrará una URL)
→ Ir a la URL desde tu Mac/teléfono
→ Iniciar sesión en Cloudflare
→ Autorizar cloudflared
→ Volver a la terminal
```

**2. Configuración de dominio**
```
Dominio para invitados: euforiateclog.cloud
Dominio para operadores: euforiateclog.cloud
(O usar un subdominio como: operator.euforiateclog.cloud)
```

**3. El script hace automáticamente**:
- Instala `cloudflared` para ARM64
- Crea tunnel `euforia-events`
- Configura DNS en Cloudflare
- Crea servicio systemd
- Actualiza archivo `.env`
- Inicia el tunnel

**4. Verificación final**
```
✅ cloudflared instalado
✅ Tunnel creado: [UUID]
✅ DNS configurado
✅ Servicio iniciado y habilitado
✅ .env actualizado
```

### 7.4 Verificar Tunnel

```bash
# Ejecutar script de verificación
./scripts/check-tunnel-status.sh
```

Deberías ver:
```
✅ Servicio activo y corriendo
✅ DNS resolviendo correctamente
✅ Túnel conectado
```

---

## FASE 8: Deploy de la Aplicación

### 8.1 Build de Imágenes Docker

```bash
# Asegurate de estar en el directorio correcto
cd ~/projects/euforia-events

# Build de todas las imágenes
docker compose -f docker-compose.prod.yml build
```

**⏱️ TIEMPO ESTIMADO**: 15-30 minutos en Raspberry Pi 4

Durante el build verás:
```
[+] Building ...
 => [api] ...
 => [web-client] ...
 => [web-operator] ...
 => [nginx] ...
```

### 8.2 Iniciar Base de Datos

```bash
# Generar Prisma Client
cd ~/projects/euforia-events/apps/api
npx prisma generate

# Crear base de datos
npx prisma db push

# Volver al directorio raíz
cd ~/projects/euforia-events
```

### 8.3 Iniciar Servicios

```bash
# Iniciar en modo detached (background)
docker compose -f docker-compose.prod.yml up -d

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f
```

Deberías ver:
```
✅ euforia-api-prod         ... running
✅ euforia-web-client-prod  ... running
✅ euforia-web-operator-prod ... running
✅ euforia-nginx-prod       ... running
```

### 8.4 Verificar Contenedores

```bash
# Ver contenedores corriendo
docker ps

# Ver estado de salud
docker compose -f docker-compose.prod.yml ps
```

---

## FASE 9: Verificación y Testing

### 9.1 Verificar desde la Pi

```bash
# Health check local
curl http://localhost/api/health

# Debe responder:
# {"status":"ok","timestamp":"..."}
```

### 9.2 Verificar desde tu Mac/Navegador

**1. API Health**
```
https://euforiateclog.cloud/api/health
```
Debe mostrar: `{"status":"ok","timestamp":"..."}`

**2. Panel de Operador**
```
https://euforiateclog.cloud/operator
```
Debe cargar la pantalla de login

**3. Cliente (con slug de prueba)**
```
https://euforiateclog.cloud/e/test
```

### 9.3 Crear Usuario Admin

**Opción A: Via API desde tu Mac**

```bash
# Crear usuario admin
curl -X POST https://euforiateclog.cloud/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@euforiateclog.cloud",
    "password": "Admin123!",
    "role": "ADMIN"
  }'
```

**Opción B: Desde el contenedor**

```bash
# Conectar al contenedor API
docker exec -it euforia-api-prod sh

# Ejecutar Prisma Studio
npx prisma studio

# Abrir en navegador: http://192.168.80.160:5555
# Crear usuario en tabla "User"
# Salir: Ctrl+C

exit
```

### 9.4 Login en el Panel

1. Ir a: `https://euforiateclog.cloud/operator`
2. Usuario: `admin`
3. Password: `Admin123!` (o la que hayas configurado)
4. ✅ Deberías entrar al dashboard

### 9.5 Verificación Completa

```bash
# Ejecutar script de verificación
./scripts/check-tunnel-status.sh
```

**Checklist**:
- ✅ Servicio cloudflared activo
- ✅ DNS resolviendo
- ✅ HTTP 200 OK en el dominio
- ✅ Contenedores corriendo
- ✅ API respondiendo
- ✅ Panel de operador accesible

---

## Mantenimiento

### Ver Logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo API
docker logs -f euforia-api-prod

# Últimas 100 líneas
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Reiniciar solo API
docker compose -f docker-compose.prod.yml restart api
```

### Detener la Aplicación

```bash
# Detener (mantiene datos)
docker compose -f docker-compose.prod.yml stop

# Detener y eliminar contenedores
docker compose -f docker-compose.prod.yml down

# ⚠️ Eliminar TODO incluyendo datos
docker compose -f docker-compose.prod.yml down -v
```

### Actualizar la Aplicación

```bash
# 1. Backup primero
./scripts/backup-euforia.sh

# 2. Pull cambios
cd ~/projects/euforia-events
git pull origin main

# 3. Rebuild
docker compose -f docker-compose.prod.yml build

# 4. Reiniciar
docker compose -f docker-compose.prod.yml up -d

# 5. Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Backups Automáticos

```bash
# Ejecutar backup manual
./scripts/backup-euforia.sh

# Configurar cron para backup diario a las 3 AM
crontab -e

# Agregar:
0 3 * * * /home/malcomito/projects/euforia-events/scripts/backup-euforia.sh >> /home/malcomito/euforia-backups/cron.log 2>&1

# Guardar y salir
```

### Monitoreo

```bash
# CPU y RAM de contenedores
docker stats

# Temperatura de la Pi
vcgencmd measure_temp

# Espacio en disco
df -h

# Memoria
free -h
```

---

## Troubleshooting

### Docker no funciona / Permission denied

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker malcomito

# Salir y volver a entrar
exit
ssh malcomito@euforiaevents.local

# Verificar
docker ps
```

### Dominio no resuelve / 503 Error

```bash
# 1. Verificar DNS
nslookup euforiateclog.cloud

# 2. Verificar tunnel
sudo systemctl status cloudflared
./scripts/check-tunnel-status.sh

# 3. Reiniciar tunnel
sudo systemctl restart cloudflared

# 4. Ver logs del tunnel
sudo journalctl -u cloudflared -f

# 5. Verificar contenedores
docker ps
docker compose -f docker-compose.prod.yml ps
```

### Contenedores no inician

```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs

# Ver logs de un servicio específico
docker logs euforia-api-prod

# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Reconstruir desde cero
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### No puedo conectar por SSH

```bash
# Desde tu Mac, probar con IP directa
ssh malcomito@192.168.80.160

# Verificar que la Pi está en la red
ping 192.168.80.160

# Resetear conocimiento de hosts
ssh-keygen -R euforiaevents.local
ssh-keygen -R 192.168.80.160
```

### Espacio en disco lleno

```bash
# Ver uso
df -h

# Limpiar Docker
docker system prune -a
docker volume prune

# Limpiar paquetes
sudo apt autoremove
sudo apt clean
```

### Build muy lento

Es normal en Raspberry Pi. Paciencia.

```bash
# Para acelerar builds futuros, usar cache
docker compose -f docker-compose.prod.yml build

# Si hay problemas de cache
docker compose -f docker-compose.prod.yml build --no-cache
```

---

## ✅ CHECKLIST FINAL

- [ ] Raspberry Pi OS instalado y actualizado
- [ ] Usuario `malcomito` configurado
- [ ] Hostname `euforiaevents` configurado
- [ ] IP estática `192.168.80.160` configurada
- [ ] SSH funciona desde tu Mac
- [ ] Docker instalado y funcional
- [ ] Docker Compose instalado
- [ ] CasaOS instalado (opcional)
- [ ] Repositorio clonado en `~/projects/euforia-events`
- [ ] Archivo `.env` configurado con JWT_SECRET seguro
- [ ] Dominio `euforiateclog.cloud` activo en Cloudflare
- [ ] Cloudflare Tunnel instalado y corriendo
- [ ] Contenedores Docker corriendo (4 servicios)
- [ ] `https://euforiateclog.cloud/api/health` responde OK
- [ ] Panel de operador accesible
- [ ] Usuario admin creado y puede hacer login
- [ ] Backup automático configurado

---

## 🎉 ¡INSTALACIÓN COMPLETA!

Tu instalación de EUFORIA EVENTS está completa y accesible desde cualquier parte del mundo en:

**🌐 https://euforiateclog.cloud**

### Próximos Pasos

1. **Crear tu primer evento** en el panel de operador
2. **Generar QR codes** para invitados
3. **Probar todos los módulos** (MUSICADJ, KARAOKEYA)
4. **Configurar Spotify API** para MUSICADJ
5. **Configurar YouTube API** para KARAOKEYA
6. **Testear en un evento real**

### Comandos Útiles

```bash
# SSH a la Pi
ssh malcomito@euforiaevents.local

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Reiniciar servicios
docker compose -f docker-compose.prod.yml restart

# Estado del tunnel
./scripts/check-tunnel-status.sh

# Backup manual
./scripts/backup-euforia.sh

# Monitorear recursos
docker stats
```

### Documentación Adicional

- **Arquitectura y troubleshooting**: `docs/PRODUCTION_DEPLOYMENT.md`
- **Guía rápida de deploy**: `docs/QUICK_DEPLOY_PI.md`
- **Requerimientos técnicos completos**: `docs/EUFORIA_EVENTS_TECH_REQUIREMENTS_v1.3.md`

---

**¿Necesitás ayuda?**
- Ver logs: `docker compose -f docker-compose.prod.yml logs -f`
- Verificar tunnel: `./scripts/check-tunnel-status.sh`
- Docs completas: `docs/PRODUCTION_DEPLOYMENT.md`

---

**EUFORIA EVENTS v2.0** - De cero a producción en 2-3 horas 🚀

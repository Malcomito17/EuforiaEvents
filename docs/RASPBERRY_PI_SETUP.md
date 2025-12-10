# 🎉 EUFORIA EVENTS - Guía de Setup en Raspberry Pi

**Configuración Específica - euforiaevents**

Esta guía documenta el setup específico de EUFORIA EVENTS en tu Raspberry Pi con CasaOS.

**Tiempo estimado**: 1-2 horas (con CasaOS ya instalado)

---

## 📋 CONFIGURACIÓN ACTUAL

### Hardware
- **Raspberry Pi 4** (4GB RAM o superior)
- **CasaOS** ya instalado y funcional
- **Red**: IP estática configurada
- **Almacenamiento**: SSD recomendado (mejor que microSD)

### Software
- **Usuario**: `malcomito`
- **Hostname**: `euforiaevents`
- **Dominio**: `euforiateclog.cloud` (Porkbun → Cloudflare)
- **Acceso SSH**: Configurado

### Credenciales
- **Cloudflare**: Cuenta creada, dominio agregado
- **Porkbun**: Dominio registrado, nameservers apuntando a Cloudflare
- **Spotify**: Client ID y Secret (opcional para MUSICADJ)

---

## 📖 ÍNDICE

1. [Estado Actual y Prerrequisitos](#1-estado-actual-y-prerrequisitos)
2. [CasaOS y Docker](#2-casaos-y-docker)
3. [Clonar Repositorio](#3-clonar-repositorio)
4. [Configuración de Variables](#4-configuración-de-variables)
5. [Cloudflare Tunnel](#5-cloudflare-tunnel)
6. [Deploy de la Aplicación](#6-deploy-de-la-aplicación)
7. [Verificación y Testing](#7-verificación-y-testing)
8. [Mantenimiento](#8-mantenimiento)

---

## 1. ESTADO ACTUAL Y PRERREQUISITOS

### ✅ Ya Completado

- ✅ Raspberry Pi con sistema operativo instalado
- ✅ CasaOS instalado y funcionando
- ✅ Usuario `malcomito` creado
- ✅ Hostname `euforiaevents` configurado
- ✅ IP estática configurada
- ✅ SSH habilitado y accesible
- ✅ Dominio `euforiateclog.cloud` registrado en Porkbun
- ✅ Nameservers actualizados para apuntar a Cloudflare

### 🔍 Verificación de Acceso

Desde tu Mac, verificá que podés conectarte:

```bash
# Por hostname
ssh malcomito@euforiaevents.local

# O por IP estática (tu IP configurada)
ssh malcomito@192.168.1.X
```

### 📋 Pendiente

- ⏳ Verificar Docker en CasaOS
- ⏳ Clonar repositorio EUFORIA EVENTS
- ⏳ Configurar variables de entorno
- ⏳ Configurar Cloudflare Tunnel
- ⏳ Deploy de la aplicación

---

## 2. CASAOS Y DOCKER

CasaOS viene con Docker preinstalado, pero necesitamos verificar que esté accesible desde CLI.

### 2.1 Verificar Docker

```bash
# Conectar por SSH
ssh malcomito@euforiaevents.local

# Verificar Docker
docker --version
docker ps

# Si dice "permission denied", agregar usuario al grupo docker
sudo usermod -aG docker malcomito

# Salir y volver a entrar para aplicar cambios
exit
ssh malcomito@euforiaevents.local

# Probar de nuevo
docker ps
```

### 2.2 Verificar Docker Compose

```bash
# Verificar Docker Compose
docker-compose --version

# Si no está instalado, instalarlo
sudo apt update
sudo apt install -y docker-compose
```

### 2.3 Verificar Git

```bash
git --version

# Si no está instalado
sudo apt install -y git
```

---

## 3. CLONAR REPOSITORIO

### 3.1 Crear Directorio de Trabajo

```bash
# Conectar por SSH
ssh malcomito@euforiaevents.local

# Crear directorio (si no existe)
cd ~
mkdir -p projects
cd projects
```

### 3.2 Clonar EUFORIA EVENTS

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/euforia-events.git

# O si usás SSH
git clone git@github.com:tu-usuario/euforia-events.git

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
docker-compose.yml
docker-compose.prod.yml
package.json
```

---

## 4. CONFIGURACIÓN DE VARIABLES

### 4.1 Crear Archivo .env

```bash
# Copiar template
cp .env.example .env

# Editar con nano
nano .env
```

### 4.2 Variables Críticas

**Editá las siguientes variables**:

```bash
# ===========================================
# EUFORIA EVENTS - Environment Variables
# ===========================================

# General
NODE_ENV=production
PORT=3000

# URLs - Se actualizarán automáticamente con el script de Cloudflare
# Por ahora dejá estos valores, el script los modificará
CLIENT_URL=http://localhost:5173
OPERATOR_URL=http://localhost:5174
PUBLIC_DOMAIN=
OPERATOR_DOMAIN=

# Database (SQLite para producción)
DATABASE_URL="file:./prisma/data/production.db"

# Authentication - ¡¡¡CAMBIAR OBLIGATORIAMENTE!!!
JWT_SECRET=CAMBIAR-ESTE-SECRETO-POR-UNO-ALEATORIO-MINIMO-32-CARACTERES
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Spotify API (MUSICADJ module)
# Obtener en: https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID=tu-client-id-aqui
SPOTIFY_CLIENT_SECRET=tu-client-secret-aqui

# YouTube API (KARAOKEYA module)
# Obtener en: https://console.cloud.google.com/apis/credentials
YOUTUBE_API_KEY=tu-api-key-aqui

# Cloudflare Tunnel (se configura automáticamente)
PUBLIC_DOMAIN=
OPERATOR_DOMAIN=
```

**⚠️ IMPORTANTE: JWT_SECRET**

Generá un secreto aleatorio fuerte:

```bash
# Generar secreto aleatorio (en la Pi)
openssl rand -base64 32

# Copiar el resultado y pegarlo en JWT_SECRET
```

### 4.3 Guardar y Salir

```
Ctrl + X
Y (confirmar)
Enter
```

---

## 5. CLOUDFLARE TUNNEL

### 5.1 Verificar Dominio en Cloudflare

Antes de continuar, verificá que `euforiateclog.cloud` esté **"Active"** en Cloudflare:

1. Ir a https://dash.cloudflare.com
2. Buscar `euforiateclog.cloud`
3. Estado debe ser: **"Active"** ✅

Si aún está "Pending", esperá 5-30 minutos más para que los nameservers se propaguen.

### 5.2 Ejecutar Script de Setup

```bash
# Asegurate de estar en el directorio correcto
cd ~/projects/euforia-events

# Hacer ejecutable el script
chmod +x scripts/setup-cloudflare-tunnel.sh

# Ejecutar
./scripts/setup-cloudflare-tunnel.sh
```

### 5.3 Seguir el Wizard Interactivo

El script te preguntará:

**1. Autenticación con Cloudflare**
- Se abrirá un navegador (o te dará una URL)
- Iniciá sesión en Cloudflare
- Autorizá cloudflared

**2. Dominio para la aplicación (invitados)**
```
Ingresá el dominio para acceso de invitados: euforiateclog.cloud
```

**3. Dominio para operadores**
```
Ingresá el dominio para panel de operadores [euforiateclog.cloud]:
```
Presioná Enter para usar el mismo, o escribí uno diferente como `admin.euforiateclog.cloud`

**4. Configuración automática**
El script:
- Creará el tunnel `euforia-events`
- Configurará DNS en Cloudflare
- Actualizará el `.env` con los dominios
- Instalará el servicio systemd
- Iniciará cloudflared

**5. Verificación**
Al final mostrará el estado. Deberías ver:
```
✅ Servicio activo y corriendo
✅ DNS configurado correctamente
✅ Tunnel funcionando
```

### 5.4 Verificar Manualmente (Opcional)

```bash
# Ver estado del servicio
sudo systemctl status cloudflared

# Ver logs en tiempo real
sudo journalctl -u cloudflared -f

# Verificar DNS
nslookup euforiateclog.cloud
```

---

## 6. DEPLOY DE LA APLICACIÓN

### 6.1 Build de Imágenes Docker

```bash
# Asegurate de estar en el directorio correcto
cd ~/projects/euforia-events

# Build de todas las imágenes (puede tardar 15-20 min en la Pi)
docker-compose -f docker-compose.prod.yml build

# Ver progreso
# Esto construirá:
# - euforia-events-api:latest
# - euforia-events-web-client:latest
# - euforia-events-web-operator:latest
```

**⏱️ NOTA**: El primer build puede tardar 15-30 minutos en Raspberry Pi. Es normal.

### 6.2 Iniciar Servicios

```bash
# Iniciar en modo detached (background)
docker-compose -f docker-compose.prod.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Presionar Ctrl+C para salir de los logs (los servicios siguen corriendo)
```

### 6.3 Verificar Contenedores

```bash
# Ver contenedores corriendo
docker ps

# Deberías ver 4 contenedores:
# - euforia-api-prod
# - euforia-web-client-prod
# - euforia-web-operator-prod
# - euforia-nginx-prod
```

### 6.4 Crear Usuario Admin Inicial

```bash
# Conectar al contenedor API
docker exec -it euforia-api-prod sh

# Dentro del contenedor, ejecutar Prisma Studio o crear usuario via script
# (Por ahora lo haremos vía API después del deploy)

# Salir del contenedor
exit
```

---

## 7. VERIFICACIÓN Y TESTING

### 7.1 Verificar Estado del Tunnel

```bash
# Ejecutar script de verificación
chmod +x scripts/check-tunnel-status.sh
./scripts/check-tunnel-status.sh
```

Deberías ver:
```
✅ Servicio activo y corriendo
✅ DNS resolviendo correctamente
✅ HTTP 200 OK en el dominio
✅ Servicio local respondiendo en puerto 80
```

### 7.2 Probar en el Navegador

**Desde tu Mac/PC/teléfono**:

1. **API Health Check**:
   ```
   https://euforiateclog.cloud/api/health
   ```
   Debe responder:
   ```json
   {"status":"ok","timestamp":"..."}
   ```

2. **Panel de Operador**:
   ```
   https://euforiateclog.cloud/operator
   ```
   Debe cargar la pantalla de login

3. **Cliente (necesitarás slug de evento)**:
   ```
   https://euforiateclog.cloud/e/test-event
   ```

### 7.3 Crear Primer Usuario Admin

Desde tu Mac, usar curl o Postman:

```bash
# Crear usuario admin
curl -X POST https://euforiateclog.cloud/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@euforiateclog.cloud",
    "password": "tu-password-seguro",
    "role": "ADMIN"
  }'
```

**O crear desde el contenedor**:

```bash
# Conectar al contenedor API
docker exec -it euforia-api-prod sh

# Ejecutar Prisma Studio
npx prisma studio

# Abrir en navegador: http://euforiaevents.local:5555
# Crear usuario manualmente en la tabla users

# Salir
exit
```

### 7.4 Login en el Panel

1. Ir a `https://euforiateclog.cloud/operator`
2. Usuario: `admin`
3. Password: tu password
4. Deberías entrar al dashboard

---

## 8. MANTENIMIENTO

### 8.1 Ver Logs

```bash
# Logs de todos los servicios
docker-compose -f docker-compose.prod.yml logs -f

# Logs de un servicio específico
docker logs -f euforia-api-prod
docker logs -f euforia-nginx-prod

# Últimas 50 líneas
docker-compose -f docker-compose.prod.yml logs --tail=50
```

### 8.2 Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar un servicio específico
docker-compose -f docker-compose.prod.yml restart api
```

### 8.3 Detener y Eliminar

```bash
# Detener (mantiene datos)
docker-compose -f docker-compose.prod.yml stop

# Detener y eliminar contenedores
docker-compose -f docker-compose.prod.yml down

# Eliminar TODO incluyendo volúmenes (⚠️ CUIDADO: borra la DB)
docker-compose -f docker-compose.prod.yml down -v
```

### 8.4 Actualizar la Aplicación

```bash
# 1. Hacer backup primero
./scripts/backup-euforia.sh

# 2. Pull cambios
cd ~/projects/euforia-events
git pull origin main

# 3. Rebuild
docker-compose -f docker-compose.prod.yml build

# 4. Reiniciar
docker-compose -f docker-compose.prod.yml up -d

# 5. Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 8.5 Backups Automáticos

```bash
# Ejecutar backup manual
./scripts/backup-euforia.sh

# Configurar cron para backup diario a las 3 AM
crontab -e

# Agregar esta línea:
0 3 * * * /home/malcomito/projects/euforia-events/scripts/backup-euforia.sh >> /home/malcomito/euforia-backups/cron.log 2>&1

# Guardar y salir
```

### 8.6 Monitoreo de Recursos

```bash
# CPU y RAM de contenedores
docker stats

# Temperatura de la Pi
vcgencmd measure_temp

# Espacio en disco
df -h

# Memoria del sistema
free -h
```

---

## 🔧 TROUBLESHOOTING

### Problema: No puedo conectar por SSH

```bash
# Probar con IP directa
ssh malcomito@192.168.1.X

# Verificar que el hostname resuelve
ping euforiaevents.local

# Resetear conocimiento de hosts si cambió la Pi
ssh-keygen -R euforiaevents.local
```

### Problema: Docker dice "permission denied"

```bash
# Agregar usuario al grupo docker
sudo usermod -aG docker malcomito

# Salir y volver a entrar
exit
ssh malcomito@euforiaevents.local

# Verificar
docker ps
```

### Problema: "503 Bad Gateway" en el dominio

```bash
# 1. Verificar contenedores
docker ps

# 2. Verificar logs del API
docker logs euforia-api-prod

# 3. Verificar logs de Nginx
docker logs euforia-nginx-prod

# 4. Verificar Cloudflare Tunnel
./scripts/check-tunnel-status.sh

# 5. Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

### Problema: Dominio no resuelve

```bash
# Verificar DNS
nslookup euforiateclog.cloud

# Verificar estado de Cloudflare Tunnel
sudo systemctl status cloudflared

# Reiniciar Cloudflare Tunnel
sudo systemctl restart cloudflared
```

### Problema: Build muy lento

Es normal en Raspberry Pi. Para acelerar:

```bash
# Usar cached builds cuando sea posible
docker-compose -f docker-compose.prod.yml build --no-cache

# O build por servicio
docker-compose -f docker-compose.prod.yml build api
```

### Problema: Espacio en disco lleno

```bash
# Ver uso de espacio
df -h

# Limpiar imágenes y contenedores no usados
docker system prune -a

# Limpiar volúmenes huérfanos
docker volume prune
```

---

## 📚 RECURSOS ADICIONALES

### Documentación

- **Guía de Despliegue**: `docs/PRODUCTION_DEPLOYMENT.md`
- **Requerimientos Técnicos**: `docs/EUFORIA_EVENTS_TECH_REQUIREMENTS_v1.3.md`
- **Estado del Proyecto**: `PROJECT_STATUS.md`

### Scripts Útiles

- **Setup Cloudflare**: `scripts/setup-cloudflare-tunnel.sh`
- **Verificar Tunnel**: `scripts/check-tunnel-status.sh`
- **Backup**: `scripts/backup-euforia.sh`

### Comandos Rápidos

```bash
# SSH a la Pi
ssh malcomito@euforiaevents.local

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Reiniciar todo
docker-compose -f docker-compose.prod.yml restart

# Estado del tunnel
./scripts/check-tunnel-status.sh

# Backup
./scripts/backup-euforia.sh
```

---

## ✅ CHECKLIST FINAL

- [ ] SSH funciona con `malcomito@euforiaevents.local`
- [ ] Docker y Docker Compose instalados y accesibles
- [ ] Repositorio clonado en `~/projects/euforia-events`
- [ ] Archivo `.env` configurado con JWT_SECRET seguro
- [ ] Dominio `euforiateclog.cloud` activo en Cloudflare
- [ ] Cloudflare Tunnel instalado y corriendo
- [ ] Contenedores Docker corriendo (4 servicios)
- [ ] `https://euforiateclog.cloud/api/health` responde OK
- [ ] Panel de operador accesible
- [ ] Usuario admin creado
- [ ] Backup automático configurado en cron

---

## 🎉 ¡LISTO!

Tu instalación de EUFORIA EVENTS está completa y accesible desde Internet en:

**🌐 https://euforiateclog.cloud**

**Próximos pasos**:
1. Crear eventos desde el panel de operador
2. Generar QR codes para invitados
3. Testear todos los módulos
4. Configurar backups automáticos
5. Monitorear recursos y logs

**¿Necesitás ayuda?**
- Ver logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Verificar tunnel: `./scripts/check-tunnel-status.sh`
- Docs completas: `docs/PRODUCTION_DEPLOYMENT.md`

---

**EUFORIA EVENTS v2.0** - Listo para eventos memorables 🎉

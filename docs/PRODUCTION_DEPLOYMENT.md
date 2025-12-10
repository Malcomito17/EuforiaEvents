# EUFORIA EVENTS - Guía de Despliegue en Producción

**Versión**: 2.0
**Plataforma**: Raspberry Pi 4+ con Docker
**Acceso Público**: Cloudflare Tunnel
**Última actualización**: Diciembre 2024

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Producción](#arquitectura-de-producción)
3. [Prerequisitos](#prerequisitos)
4. [Guía de Instalación](#guía-de-instalación)
5. [Gestión y Mantenimiento](#gestión-y-mantenimiento)
6. [Troubleshooting](#troubleshooting)
7. [Archivos Creados](#archivos-creados)

---

## 🎯 Resumen Ejecutivo

EUFORIA EVENTS está lista para desplegarse en producción en una Raspberry Pi 4+ con acceso público mediante Cloudflare Tunnel (GRATIS).

### Características de Producción

✅ **Acceso Público Simplificado**
- Los invitados escanean QR y acceden desde cualquier lugar
- No requieren conectarse a una red específica
- URLs profesionales (ej: `eventos.tudominio.com`)

✅ **Infraestructura Optimizada**
- Docker Compose con resource limits para Pi
- Multi-stage builds para images pequeñas
- Nginx como reverse proxy
- Healthchecks automáticos

✅ **Backups Automáticos**
- Script de backup con compresión
- Retención configurable (7 días por defecto)
- Programación vía cron

✅ **Monitoreo y Logs**
- Logs centralizados con rotación
- Sistema de healthchecks
- Métricas de recursos

---

## 🏗️ Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTPS (automático)
             ▼
┌────────────────────────────┐
│    Cloudflare CDN/Tunnel   │  ← GRATIS, solo costo de dominio
└─────────────┬──────────────┘    (~$9/año)
              │
              │ Encrypted Tunnel
              ▼
┌─────────────────────────────────────────────────┐
│           RASPBERRY PI 4+ (ARM64)                │
│  ┌───────────────────────────────────────────┐  │
│  │          Docker Compose                    │  │
│  │  ┌──────────────────────────────────────┐ │  │
│  │  │  Nginx (Reverse Proxy - Port 80)     │ │  │
│  │  └──────────────┬───────────────────────┘ │  │
│  │                 │                          │  │
│  │  ┌──────────────┼────────────┐             │  │
│  │  │              │            │             │  │
│  │  ▼              ▼            ▼             │  │
│  │ ┌─────┐   ┌────────┐   ┌──────────┐       │  │
│  │ │ API │   │Client  │   │ Operator │       │  │
│  │ │Node │   │ Nginx  │   │  Nginx   │       │  │
│  │ └─────┘   └────────┘   └──────────┘       │  │
│  │                                             │  │
│  │  Data Volumes (Persistentes):               │  │
│  │  • SQLite DB                                │  │
│  │  • Uploads                                  │  │
│  │  • Logs                                     │  │
│  └─────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Flujo de Datos

1. Usuario escanea QR → URL con dominio público
2. Cloudflare CDN sirve petición con HTTPS
3. Tunnel encriptado envía tráfico a Pi (puerto 80)
4. Nginx rutea a servicio correspondiente
5. API procesa y responde
6. WebSocket mantiene conexiones real-time

---

## ✅ Prerequisitos

### Hardware

- **Raspberry Pi 4** (4GB RAM mínimo, 8GB recomendado)
- **SSD USB 3.0** (128GB+) - CRÍTICO para performance
- **Alimentación oficial** de Raspberry Pi
- **Conexión a Internet** estable

### Software

- **Raspberry Pi OS** (64-bit, Lite o Desktop)
- **Docker** y **Docker Compose**
- **Git**

### Externos

- **Dominio propio** (~$9/año) - ej: `tudominio.com`
- **Cuenta Cloudflare** (GRATIS)

---

## 🚀 Guía de Instalación

### Opción A: Instalación desde Cero (Raspberry Pi nueva)

📖 **Sigue la guía completa**: [`docs/RASPBERRY_PI_SETUP.md`](./RASPBERRY_PI_SETUP.md)

Esta guía cubre:
1. Instalación del OS
2. Configuración inicial (SSH, red, timezone)
3. Migración a SSD
4. Instalación de Docker
5. Despliegue de EUFORIA EVENTS
6. Configuración de Cloudflare Tunnel
7. Verificación completa

**Tiempo estimado**: 2-3 horas (primera vez)

### Opción B: Raspberry Pi ya Configurada

Si ya tenés la Pi con Docker instalado:

#### 1. Clonar el Repositorio

```bash
cd ~
git clone https://github.com/tu-usuario/euforia-events.git
cd euforia-events
```

#### 2. Configurar Variables de Entorno

```bash
# Copiar template
cp .env.example .env

# Editar configuración
nano .env
```

**Variables críticas**:

```bash
# Seguridad (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu-secreto-seguro-aleatorio-min-32-caracteres

# Base de datos
DATABASE_URL="file:./prisma/data/production.db"

# Dominios (se configuran automáticamente con Cloudflare Tunnel)
PUBLIC_DOMAIN=https://eventos.tudominio.com
OPERATOR_DOMAIN=https://eventos.tudominio.com

# APIs opcionales
SPOTIFY_CLIENT_ID=tu-client-id
SPOTIFY_CLIENT_SECRET=tu-client-secret
YOUTUBE_API_KEY=tu-api-key
```

#### 3. Configurar Cloudflare Tunnel

```bash
chmod +x scripts/setup-cloudflare-tunnel.sh
./scripts/setup-cloudflare-tunnel.sh
```

Este script:
- Instala cloudflared (ARM64)
- Autentica con Cloudflare
- Crea el tunnel
- Configura DNS automáticamente
- Actualiza el `.env` con los dominios
- Instala servicio systemd

#### 4. Iniciar la Aplicación

```bash
# Build y start en producción
docker-compose -f docker-compose.prod.yml up -d --build

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Verificar estado
docker ps
```

#### 5. Crear Usuario Admin Inicial

```bash
# Conectar al contenedor API
docker exec -it euforia-api-prod sh

# Ejecutar seed/script de creación de usuario
npx tsx scripts/create-admin.ts
# O manualmente vía API POST /api/users
```

#### 6. Verificar Instalación

```bash
# Script de verificación
chmod +x scripts/check-tunnel-status.sh
./scripts/check-tunnel-status.sh
```

Debería mostrar:
✅ Servicio cloudflared activo
✅ DNS resolviendo correctamente
✅ HTTP 200 OK en el dominio
✅ Servicio local respondiendo

#### 7. Acceder a la Aplicación

- **Panel Operador**: `https://tudominio.com/operator`
- **Cliente (QR)**: `https://tudominio.com/e/[evento-slug]`
- **API Health**: `https://tudominio.com/api/health`

---

## 🛠️ Gestión y Mantenimiento

### Comandos Comunes

#### Docker

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado de contenedores
docker ps

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart

# Detener todo
docker-compose -f docker-compose.prod.yml down

# Rebuild después de cambios
docker-compose -f docker-compose.prod.yml up -d --build
```

#### Cloudflare Tunnel

```bash
# Ver estado
./scripts/check-tunnel-status.sh

# Reiniciar servicio
sudo systemctl restart cloudflared

# Ver logs
sudo journalctl -u cloudflared -f

# Listar túneles
cloudflared tunnel list
```

#### Base de Datos

```bash
# Acceder a Prisma Studio (desde el contenedor API)
docker exec -it euforia-api-prod npx prisma studio

# Ejecutar migraciones
docker exec -it euforia-api-prod npx prisma migrate deploy

# Ver datos directamente (SQLite)
docker exec -it euforia-api-prod sqlite3 /app/apps/api/prisma/data/production.db
```

### Backups Automáticos

#### Configurar Cron (Diario a las 3 AM)

```bash
crontab -e

# Agregar:
0 3 * * * /home/pi/euforia-events/scripts/backup-euforia.sh >> /home/pi/euforia-backups/cron.log 2>&1
```

#### Backup Manual

```bash
chmod +x scripts/backup-euforia.sh
./scripts/backup-euforia.sh
```

El script crea:
- `~/euforia-backups/euforia_backup_TIMESTAMP.tar.gz`

Incluye:
- Base de datos SQLite
- Archivos `.env`
- Uploads/media
- Logs importantes
- Metadata del sistema

**Retención**: 7 días por defecto (configurable con `KEEP_BACKUPS=N`)

#### Restaurar Backup

```bash
# 1. Detener servicios
docker-compose -f docker-compose.prod.yml down

# 2. Extraer backup
cd ~/euforia-backups
tar -xzf euforia_backup_TIMESTAMP.tar.gz

# 3. Restaurar archivos
cp backup_TIMESTAMP/database/production.db ~/euforia-events/data/db/
cp backup_TIMESTAMP/config/.env ~/euforia-events/
# ... restaurar otros archivos según necesidad

# 4. Reiniciar
cd ~/euforia-events
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoreo

#### Recursos del Sistema

```bash
# CPU, RAM de contenedores
docker stats

# Espacio en disco
df -h

# Memoria del sistema
free -h

# Temperatura de la Pi
vcgencmd measure_temp
```

#### Healthchecks

```bash
# Estado de contenedores
docker ps

# Healthcheck manual
curl http://localhost/health
curl http://localhost/api/health
```

### Actualización de la Aplicación

```bash
# 1. Backup preventivo
./scripts/backup-euforia.sh

# 2. Pull cambios
git pull origin main

# 3. Rebuild imágenes
docker-compose -f docker-compose.prod.yml build

# 4. Aplicar migraciones de DB (si hay)
docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy

# 5. Reiniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# 6. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🔧 Troubleshooting

### Problema: "Cannot connect to Docker daemon"

```bash
# Verificar que Docker esté corriendo
sudo systemctl status docker

# Iniciar Docker
sudo systemctl start docker

# Agregar usuario al grupo docker (evitar sudo)
sudo usermod -aG docker $USER
# Luego cerrar sesión y volver a entrar
```

### Problema: "503 Bad Gateway" en el dominio

**Diagnóstico**:

```bash
# 1. Verificar que los contenedores estén corriendo
docker ps

# 2. Verificar logs del API
docker logs euforia-api-prod

# 3. Verificar Nginx
docker logs euforia-nginx-prod

# 4. Verificar tunnel
./scripts/check-tunnel-status.sh
```

**Solución común**:

```bash
# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

### Problema: Base de datos corrupta

**Síntomas**: Errores de Prisma, datos inconsistentes

**Solución**:

```bash
# 1. Restaurar desde backup
cd ~/euforia-backups
tar -xzf euforia_backup_LATEST.tar.gz

# 2. Copiar DB
cp backup_*/database/production.db ~/euforia-events/data/db/

# 3. Reiniciar
docker-compose -f docker-compose.prod.yml restart api
```

### Problema: Espacio en disco lleno

```bash
# Ver uso de espacio
df -h

# Limpiar imágenes Docker no usadas
docker system prune -a

# Limpiar logs viejos
docker-compose -f docker-compose.prod.yml logs --tail=0 -f

# Rotar logs manualmente
find ~/euforia-events/data/logs -name "*.log" -mtime +7 -delete
```

### Problema: Alta temperatura en la Pi

```bash
# Ver temperatura
vcgencmd measure_temp

# Si > 70°C:
# 1. Verificar ventilación
# 2. Reducir resource limits en docker-compose.prod.yml
# 3. Considerar heatsink/fan
```

### Problema: Cloudflare Tunnel caído

```bash
# Verificar estado
sudo systemctl status cloudflared

# Reiniciar
sudo systemctl restart cloudflared

# Ver logs
sudo journalctl -u cloudflared -n 50

# Re-autenticar (si es necesario)
cloudflared tunnel login
```

---

## 📁 Archivos Creados

### Configuración de Producción

```
euforia-events/
├── docker-compose.prod.yml          # Compose de producción
├── .env.example                      # Template de variables
│
├── docker/
│   ├── Dockerfile.api.prod           # API multi-stage
│   ├── Dockerfile.web-client.prod    # Cliente (Vite + Nginx)
│   ├── Dockerfile.web-operator.prod  # Operador (Vite + Nginx)
│   │
│   └── nginx/
│       ├── nginx.prod.conf           # Nginx principal
│       ├── conf.d/
│       │   └── euforia.conf          # Routing principal
│       ├── web-client.conf           # SPA routing cliente
│       └── web-operator.conf         # SPA routing operador
│
├── scripts/
│   ├── setup-cloudflare-tunnel.sh    # Instalador Cloudflare
│   ├── check-tunnel-status.sh        # Verificación tunnel
│   └── backup-euforia.sh              # Backup automático
│
├── apps/api/src/
│   ├── config/env.ts                  # ✏️ Actualizado: PUBLIC_DOMAIN
│   └── shared/utils/qr-generator.ts   # ✏️ Actualizado: usa PUBLIC_DOMAIN
│
└── docs/
    ├── RASPBERRY_PI_SETUP.md          # Guía completa Pi
    └── PRODUCTION_DEPLOYMENT.md       # Este documento
```

### Resumen de Cambios

#### Archivos Nuevos (13)

1. `docker-compose.prod.yml` - Compose optimizado para Pi
2. `docker/Dockerfile.api.prod` - API production build
3. `docker/Dockerfile.web-client.prod` - Cliente production
4. `docker/Dockerfile.web-operator.prod` - Operador production
5. `docker/nginx/nginx.prod.conf` - Config Nginx principal
6. `docker/nginx/conf.d/euforia.conf` - Routing principal
7. `docker/nginx/web-client.conf` - SPA routing cliente
8. `docker/nginx/web-operator.conf` - SPA routing operador
9. `scripts/setup-cloudflare-tunnel.sh` - Instalador tunnel
10. `scripts/check-tunnel-status.sh` - Verificación tunnel
11. `scripts/backup-euforia.sh` - Backup automático
12. `docs/RASPBERRY_PI_SETUP.md` - Guía completa
13. `docs/PRODUCTION_DEPLOYMENT.md` - Este documento

#### Archivos Modificados (3)

1. `.env.example` - Agregado `PUBLIC_DOMAIN` y `OPERATOR_DOMAIN`
2. `apps/api/src/config/env.ts` - Schema con `PUBLIC_DOMAIN`
3. `apps/api/src/shared/utils/qr-generator.ts` - Usa `PUBLIC_DOMAIN` para QRs

---

## 📊 Especificaciones Técnicas

### Resource Limits (docker-compose.prod.yml)

| Servicio     | CPU Limit | Memory Limit | Memory Reserved |
|-------------|-----------|--------------|-----------------|
| API         | 2 cores   | 1024M        | 512M            |
| Web Client  | 0.5 core  | 256M         | 128M            |
| Web Operator| 0.5 core  | 256M         | 128M            |
| Nginx       | 0.5 core  | 128M         | 64M             |
| **TOTAL**   | ~3.5      | ~1.6GB       | ~0.9GB          |

**Memoria disponible en Pi 4 (4GB)**: ~2GB libres para OS y cache

### Puertos Expuestos

| Servicio  | Puerto Interno | Puerto Externo | Uso                    |
|-----------|----------------|----------------|------------------------|
| Nginx     | 80             | 80             | HTTP (Cloudflare)      |
| API       | 3000           | -              | Solo interno           |
| Cliente   | 80             | -              | Solo interno (Nginx)   |
| Operador  | 80             | -              | Solo interno (Nginx)   |

**Nota**: Solo el puerto 80 de Nginx está expuesto. Cloudflare Tunnel maneja HTTPS automáticamente.

### Volúmenes Persistentes

```
./data/
├── db/
│   └── production.db        # SQLite database
├── uploads/                  # User uploads
├── logs/                     # Application logs
└── nginx-cache/              # Nginx cache
```

**Backup esencial**: `db/` y `uploads/`

---

## 🔒 Seguridad

### Checklist de Producción

- [ ] `JWT_SECRET` cambiado a valor aleatorio seguro
- [ ] Firewall configurado (solo puertos necesarios)
- [ ] SSH con autenticación por clave (deshabilitar password)
- [ ] Usuario pi renombrado o deshabilitado
- [ ] Fail2ban instalado y configurado
- [ ] Backups automáticos funcionando
- [ ] Monitoreo de logs activo
- [ ] Actualizaciones automáticas del OS

### Cloudflare Tunnel - Seguridad

✅ **Sin puertos abiertos** en el router
✅ **Tráfico encriptado** end-to-end
✅ **DDoS protection** incluida
✅ **WAF** disponible (plan Pro)
✅ **Rate limiting** configurable

---

## 📈 Monitoreo y Métricas

### Logs Importantes

```bash
# API logs
docker logs -f euforia-api-prod

# Nginx access logs
docker exec euforia-nginx-prod tail -f /var/log/nginx/access.log

# Cloudflare Tunnel
sudo journalctl -u cloudflared -f
```

### Métricas a Monitorear

1. **CPU Usage**: `docker stats` - No debe superar 80% sostenido
2. **Memory**: RAM libre > 500MB
3. **Disk Space**: Mínimo 20% libre
4. **Temperature**: < 70°C idealmente
5. **Response Time**: API < 500ms (promedio)

---

## 🎓 Próximos Pasos

### Mejoras Opcionales

1. **CI/CD con GitHub Actions**
   - Build automático en cada push
   - Deploy automático a la Pi
   - Tests antes de deploy

2. **Monitoreo Avanzado**
   - Grafana + Prometheus
   - Alertas por email/Telegram
   - Dashboard de métricas

3. **PostgreSQL en lugar de SQLite**
   - Para mayor concurrencia
   - Mejor performance en writes
   - Backups incrementales

4. **CDN para Assets Estáticos**
   - Cloudflare R2 (imágenes, videos)
   - Reduce carga en la Pi

5. **High Availability**
   - Múltiples Pis con load balancer
   - Réplica de base de datos
   - Failover automático

---

## 📞 Soporte

### Recursos

- **Documentación completa**: `docs/RASPBERRY_PI_SETUP.md`
- **Tech Requirements**: `docs/EUFORIA_EVENTS_TECH_REQUIREMENTS_v1.3.md`
- **Cloudflare Tunnel Docs**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Docker Docs**: https://docs.docker.com/

### Contacto

- **Proyecto**: EUFORIA EVENTS v2.0
- **Plataforma**: Raspberry Pi 4+ ARM64
- **Estado**: ✅ LISTO PARA PRODUCCIÓN

---

**¡Listo para eventos memorables! 🎉**

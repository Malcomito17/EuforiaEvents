# Despliegue en Raspberry Pi 4 - EUFORIA EVENTS

Este documento describe el proceso de despliegue de producción en Raspberry Pi 4 (ARM64).

## 📋 Requisitos Previos

- Raspberry Pi 4 (4GB+ RAM recomendado)
- Raspberry Pi OS (64-bit)
- Docker 20.10+
- Docker Compose v2+
- Git
- 32GB+ almacenamiento (SD o SSD recomendado)
- Conexión a internet

## 🚀 Instalación Inicial

### 1. Preparar el Sistema

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y git curl wget
```

### 2. Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión para aplicar cambios
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### 3. Clonar el Repositorio

```bash
mkdir -p ~/projects
cd ~/projects
git clone https://github.com/tu-usuario/euforia-events.git EuforiaEvents
cd EuforiaEvents
```

### 4. Configurar Variables de Entorno

```bash
# Copiar template de variables
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

**Variables importantes:**

```env
# Database
DATABASE_URL="file:./prisma/data/euforia.db"

# Security
JWT_SECRET="genera-un-secreto-seguro-aqui"
FRONTEND_URL="https://app.euforiateclog.cloud"

# Spotify (opcional)
SPOTIFY_CLIENT_ID="tu_client_id"
SPOTIFY_CLIENT_SECRET="tu_client_secret"

# CORS
ALLOWED_ORIGINS="https://app.euforiateclog.cloud,https://operador.app.euforiateclog.cloud"
```

## 🏗️ Build y Deploy

### Primera vez o después de cambios en código

```bash
# Build de todas las imágenes
docker compose -f docker-compose.prod.yml build

# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Inicializar Base de Datos (solo primera vez)

```bash
# Generar Prisma Client
docker compose -f docker-compose.prod.yml exec api npx prisma generate

# Aplicar schema a la base de datos
docker compose -f docker-compose.prod.yml exec api npx prisma db push

# Crear usuario administrador
docker compose -f docker-compose.prod.yml exec api npx tsx src/scripts/create-admin.ts
```

## 🔧 Scripts de Mantenimiento

### Diagnóstico del Sistema

Verifica el estado actual de todos los servicios:

```bash
./scripts/check-prod-status.sh
```

Este script muestra:
- Versiones de Docker
- Estado de Git
- Estado de contenedores
- Logs recientes del API
- Uso de recursos

### Reconstruir API (resolver problemas)

Si el contenedor del API no inicia correctamente:

```bash
./scripts/rebuild-api-prod.sh
```

Este script:
1. Verifica que tengas los últimos cambios de Git
2. Detiene contenedores
3. Elimina imagen anterior del API
4. Reconstruye SIN caché (fuerza reinstalación de dependencias)
5. Inicia servicios
6. Muestra logs y estado

**Nota:** El rebuild tomará 10-15 minutos en Raspberry Pi 4.

## 📊 Comandos Útiles

### Ver estado de servicios

```bash
docker compose -f docker-compose.prod.yml ps
```

### Ver logs

```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo API
docker compose -f docker-compose.prod.yml logs -f api

# Solo últimas 50 líneas del API
docker compose -f docker-compose.prod.yml logs api --tail 50
```

### Reiniciar servicios

```bash
# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Reiniciar solo API
docker compose -f docker-compose.prod.yml restart api
```

### Detener/Iniciar servicios

```bash
# Detener todo
docker compose -f docker-compose.prod.yml down

# Iniciar todo
docker compose -f docker-compose.prod.yml up -d
```

### Actualizar a última versión

```bash
# Obtener cambios
git pull origin main

# Reconstruir imágenes
docker compose -f docker-compose.prod.yml build

# Reiniciar servicios
docker compose -f docker-compose.prod.yml up -d
```

## 🐛 Troubleshooting

### Error: "libssl.so.1.1: No such file or directory"

**Causa:** Prisma requiere OpenSSL 1.1 pero Alpine Linux usa OpenSSL 3.x

**Solución:** El `Dockerfile.api.prod` ya incluye `openssl1.1-compat-libs`. Si el error persiste:

```bash
./scripts/rebuild-api-prod.sh
```

### API se reinicia constantemente

**Diagnóstico:**

```bash
docker compose -f docker-compose.prod.yml logs api --tail 100
```

**Causas comunes:**
- Error en DATABASE_URL (.env.production)
- Puerto 3000 ocupado
- Falta Prisma Client (ejecutar `prisma generate`)
- Falta schema de base de datos (ejecutar `prisma db push`)

### Contenedores no inician (dependency failed)

Los servicios web-client, web-operator y nginx dependen del API. Si el API no está "healthy", los otros no inician.

**Solución:** Primero arregla el API, los otros se iniciarán automáticamente.

### Falta espacio en disco

```bash
# Ver uso de disco
df -h

# Limpiar imágenes no usadas
docker system prune -a

# Limpiar volúmenes no usados (¡CUIDADO! elimina datos)
docker volume prune
```

### Problemas de memoria

Raspberry Pi 4 tiene recursos limitados. Si hay problemas de RAM:

```bash
# Ver uso de memoria
free -h

# Reiniciar servicios para liberar memoria
docker compose -f docker-compose.prod.yml restart
```

## 📱 Acceso a la Aplicación

Después de un despliegue exitoso:

- **Invitados:** https://app.euforiateclog.cloud
- **Operadores:** https://operador.app.euforiateclog.cloud
- **API:** https://api.euforiateclog.cloud (a través de Cloudflare Tunnel)

## 🔐 Cloudflare Tunnel

Si usas Cloudflare Tunnel para exponer los servicios:

```bash
# Instalar cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
sudo mv cloudflared /usr/local/bin/
sudo chmod +x /usr/local/bin/cloudflared

# Autenticar
cloudflared tunnel login

# Crear tunnel
cloudflared tunnel create euforia-events

# Configurar routing (ver docs de Cloudflare)
```

## 🔄 Backup de Base de Datos

```bash
# Crear backup
docker compose -f docker-compose.prod.yml exec api \
  cp /app/apps/api/prisma/data/euforia.db /app/apps/api/prisma/data/backup-$(date +%Y%m%d).db

# Copiar backup fuera del contenedor
docker cp euforia-api-prod:/app/apps/api/prisma/data/backup-$(date +%Y%m%d).db ~/backups/
```

## 📈 Monitoreo

### Health Checks

Los contenedores tienen health checks configurados:

- **API:** `wget http://localhost:3000/health`
- **Web Client:** Verifica que el contenedor esté corriendo
- **Web Operator:** Verifica que el contenedor esté corriendo

### Ver estado de salud

```bash
docker inspect euforia-api-prod | grep -A 5 Health
```

## 🎯 Checklist Post-Deploy

Después de cada deploy, verifica:

- [ ] Todos los contenedores están "Up" y healthy
- [ ] API responde en /health
- [ ] Base de datos tiene tablas (prisma studio)
- [ ] Existe usuario admin
- [ ] URLs públicas funcionan (app, operador)
- [ ] Integración Spotify funciona (si está configurada)
- [ ] Logs no muestran errores críticos

## 📞 Soporte

Si encuentras problemas:

1. Ejecuta `./scripts/check-prod-status.sh` y revisa la salida
2. Verifica logs: `docker compose -f docker-compose.prod.yml logs -f api`
3. Intenta rebuild: `./scripts/rebuild-api-prod.sh`
4. Revisa la configuración en `.env.production`

---

**Última actualización:** Diciembre 2024
**Versión:** 2.0
**Plataforma:** Raspberry Pi 4 (ARM64)

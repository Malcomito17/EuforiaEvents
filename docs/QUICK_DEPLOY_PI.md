# 🚀 EUFORIA EVENTS - Deploy Rápido en Raspberry Pi

**Para**: `euforiaevents` (malcomito@euforiateclog.cloud)
**Tiempo estimado**: 30-45 minutos
**Prerequisito**: Dominio `euforiateclog.cloud` activo en Cloudflare ✅

---

## 📋 COMANDOS PASO A PASO

### 1️⃣ Conectar por SSH

```bash
ssh malcomito@euforiaevents.local
# O usando la IP si no funciona .local
```

### 2️⃣ Verificar Docker

```bash
# Verificar versión
docker --version
docker compose version

# Test rápido
docker ps

# Si da error de permisos:
sudo usermod -aG docker malcomito
newgrp docker  # O cerrar sesión y volver a entrar
```

### 3️⃣ Clonar Repositorio

```bash
# Crear directorio
mkdir -p ~/projects
cd ~/projects

# Clonar (ajustar URL según tu repo)
# Opción 1: SSH (si tenés configurado)
git clone git@github.com:TU_USUARIO/euforia-events.git

# Opción 2: HTTPS
git clone https://github.com/TU_USUARIO/euforia-events.git

# Entrar al directorio
cd euforia-events

# Verificar que estás en la rama correcta
git branch
git status
```

**⚠️ IMPORTANTE**: Si no tenés el repo en GitHub aún, vas a necesitar:
1. Subir el código a GitHub desde tu Mac
2. O copiar los archivos directamente a la Pi con `scp` o `rsync`

### 4️⃣ Generar Archivo .env

```bash
# Dar permisos de ejecución
chmod +x scripts/*.sh

# Ejecutar generador de .env
./scripts/generate-env-prod.sh
```

**El script te va a preguntar**:
- Dominio: `euforiateclog.cloud`
- Spotify Client ID (opcional): Si tenés credenciales de Spotify
- Spotify Client Secret (opcional)

**Resultado**: Se crea el archivo `.env` con:
- JWT_SECRET seguro (generado automáticamente)
- PUBLIC_DOMAIN configurado
- OPERATOR_DOMAIN configurado
- Todas las variables necesarias

### 5️⃣ Verificar .env (Opcional)

```bash
# Ver el archivo generado
cat .env

# O editarlo si necesitás hacer ajustes
nano .env
```

### 6️⃣ Configurar Cloudflare Tunnel

```bash
# Este script hace TODO automáticamente:
# - Instala cloudflared
# - Crea el tunnel "euforia-events"
# - Configura DNS en Cloudflare
# - Crea servicio systemd
# - Actualiza .env con credenciales
./scripts/setup-cloudflare-tunnel.sh
```

**El script te va a pedir**:
1. **Cloudflare API Token**: Lo obtenés de https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"
   - Usar template "Edit zone DNS"
   - Zone: `euforiateclog.cloud`
   - Copiar el token generado

2. **Confirmar dominio**: `euforiateclog.cloud`

**Tiempo**: 2-3 minutos. El script hace todo solo.

### 7️⃣ Build de Imágenes Docker

```bash
# Build de producción (primera vez tarda ~10-15 min en Pi)
docker compose -f docker-compose.prod.yml build

# Ver progreso
# Las imágenes se construyen para ARM64 (arquitectura de Pi)
```

**⏱️ Tiempo**: 10-15 minutos en Raspberry Pi 4

### 8️⃣ Iniciar Base de Datos

```bash
# Generar Prisma Client
cd apps/api
npx prisma generate

# Crear base de datos
npx prisma db push

# Volver al directorio raíz
cd ../..
```

### 9️⃣ Iniciar Aplicación

```bash
# Iniciar todos los servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f

# Ctrl+C para salir de logs (los contenedores siguen corriendo)
```

### 🔟 Verificar Estado

```bash
# Script de verificación completa
./scripts/check-tunnel-status.sh

# O verificar manualmente:

# 1. Servicios Docker
docker compose -f docker-compose.prod.yml ps

# 2. Cloudflared service
sudo systemctl status cloudflared

# 3. Test de conectividad
curl -I https://euforiateclog.cloud/api/health

# 4. Ver logs
docker compose -f docker-compose.prod.yml logs api
```

### 1️⃣1️⃣ Crear Usuario Admin

```bash
# Acceder al contenedor de API
docker compose -f docker-compose.prod.yml exec api sh

# Crear usuario admin (dentro del contenedor)
npx tsx scripts/create-admin.ts

# Salir del contenedor
exit
```

**Datos sugeridos**:
- Username: `admin`
- Email: tu email
- Password: contraseña segura

---

## ✅ VERIFICACIONES FINALES

### Desde la Pi:

```bash
# Health check de API
curl https://euforiateclog.cloud/api/health
# Debe retornar: {"status":"ok","timestamp":"..."}

# Verificar servicios
docker compose -f docker-compose.prod.yml ps
# Todos deben estar "Up" y "healthy"

# Ver logs
docker compose -f docker-compose.prod.yml logs --tail=50
```

### Desde tu navegador:

1. **Cliente (invitados)**:
   https://euforiateclog.cloud
   - Debe cargar la página de inicio

2. **Operador (admin)**:
   https://operator.euforiateclog.cloud
   - Debe cargar el login
   - Iniciar sesión con el usuario admin que creaste

3. **API Health**:
   https://euforiateclog.cloud/api/health
   - Debe retornar JSON: `{"status":"ok"}`

---

## 🔧 COMANDOS ÚTILES

### Ver logs:
```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo API
docker compose -f docker-compose.prod.yml logs -f api

# Solo últimas 50 líneas
docker compose -f docker-compose.prod.yml logs --tail=50
```

### Reiniciar servicios:
```bash
# Reiniciar todo
docker compose -f docker-compose.prod.yml restart

# Reiniciar solo API
docker compose -f docker-compose.prod.yml restart api

# Reiniciar tunnel
sudo systemctl restart cloudflared
```

### Detener aplicación:
```bash
# Detener servicios (mantiene datos)
docker compose -f docker-compose.prod.yml down

# Detener y eliminar volúmenes (⚠️ BORRA DATOS)
docker compose -f docker-compose.prod.yml down -v
```

### Ver estado:
```bash
# Servicios Docker
docker compose -f docker-compose.prod.yml ps

# Cloudflared
sudo systemctl status cloudflared

# Espacio en disco
df -h

# Memoria
free -h
```

### Actualizar aplicación:
```bash
# Pull del repo
git pull origin main

# Rebuild si hay cambios en código
docker compose -f docker-compose.prod.yml build

# Reiniciar
docker compose -f docker-compose.prod.yml up -d
```

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot connect to Docker daemon"
```bash
# Verificar que Docker está corriendo
sudo systemctl status docker

# Reiniciar Docker
sudo systemctl restart docker

# Agregar usuario al grupo docker
sudo usermod -aG docker malcomito
newgrp docker
```

### Error: "Port 80 already in use"
```bash
# Ver qué está usando el puerto
sudo lsof -i :80

# Si es CasaOS o algo más, cambiar puerto en docker-compose.prod.yml
# O detener el servicio conflictivo
```

### Error: Cloudflare Tunnel no conecta
```bash
# Ver logs del tunnel
sudo journalctl -u cloudflared -f

# Reiniciar el tunnel
sudo systemctl restart cloudflared

# Verificar credenciales
cat ~/.cloudflared/config.yml
```

### Error: "Database locked"
```bash
# Detener servicios
docker compose -f docker-compose.prod.yml down

# Verificar que no hay procesos usando la DB
lsof | grep production.db

# Reiniciar
docker compose -f docker-compose.prod.yml up -d
```

### Sitio no carga (timeout)
```bash
# 1. Verificar DNS
nslookup euforiateclog.cloud
# Debe resolver a Cloudflare IPs (104.x.x.x o 172.x.x.x)

# 2. Verificar tunnel
./scripts/check-tunnel-status.sh

# 3. Verificar contenedores
docker compose -f docker-compose.prod.yml ps

# 4. Verificar logs
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs api
```

---

## 📦 BACKUP AUTOMÁTICO

### Configurar cron para backups diarios:

```bash
# Editar crontab
crontab -e

# Agregar esta línea (backup diario a las 3 AM)
0 3 * * * /home/malcomito/projects/euforia-events/scripts/backup-euforia.sh >> /home/malcomito/euforia-backups/cron.log 2>&1
```

### Ejecutar backup manual:

```bash
./scripts/backup-euforia.sh
```

**Ubicación de backups**: `~/euforia-backups/`

---

## 🎉 ¡LISTO!

Si todo funcionó correctamente:

✅ Aplicación corriendo en https://euforiateclog.cloud
✅ Panel de operador en https://operator.euforiateclog.cloud
✅ Cloudflare Tunnel funcionando
✅ Base de datos inicializada
✅ Usuario admin creado

**Próximos pasos**:
1. Crear tu primer evento
2. Generar QR para invitados
3. Configurar módulos (MUSICADJ, KARAOKEYA)
4. ¡Probar en un evento real!

---

## 📚 Documentación Completa

Para más detalles, ver:
- `docs/RASPBERRY_PI_SETUP.md` - Setup completo paso a paso
- `docs/PRODUCTION_DEPLOYMENT.md` - Arquitectura y troubleshooting
- `README.md` - Documentación general del proyecto

---

**¿Problemas?** Ejecutá el script de diagnóstico:
```bash
./scripts/check-tunnel-status.sh
```

# Deployment Guide - Guest Management Feature

**Feature**: Gestión de Invitados (Guest Management)
**Version**: 1.0
**Commit**: 7ea9fce
**Date**: Diciembre 2024

---

## 📋 Resumen

Este documento describe los pasos específicos para desplegar la funcionalidad de Gestión de Invitados en producción (Raspberry Pi 4).

### Archivos Modificados/Creados

**Backend (5 archivos)**:
- `apps/api/src/app.ts`
- `apps/api/src/modules/guests/guests.service.ts`
- `apps/api/src/modules/guests/guests.controller.ts`
- `apps/api/src/modules/guests/guests.routes.ts`
- `apps/api/src/modules/guests/index.ts`

**Frontend (6 archivos)**:
- `apps/web-operator/src/lib/api.ts`
- `apps/web-operator/src/pages/Events/EventGuests.tsx` (nuevo)
- `apps/web-operator/src/pages/Events/EventGuestDetail.tsx` (nuevo)
- `apps/web-operator/src/pages/Events/EventDetail.tsx`
- `apps/web-operator/src/pages/Events/index.ts`
- `apps/web-operator/src/App.tsx`

**Documentación**:
- `docs/GUEST_MANAGEMENT_FEATURE.md`

### Cambios en Base de Datos

**NINGUNO** - Esta funcionalidad utiliza las tablas existentes:
- `guests`
- `song_requests`
- `karaoke_requests`

No se requieren migraciones de base de datos.

---

## 🚀 Deployment a Raspberry Pi 4

### Pre-requisitos

- Acceso SSH a la Raspberry Pi
- Git configurado con acceso al repositorio
- Docker y Docker Compose instalados
- Servicio corriendo en producción

### Opción A: Deployment Automático (Recomendado)

#### 1. Desde tu máquina local

```bash
# Asegurarse de estar en la rama main
git checkout main

# Push de los cambios
git push origin main
```

#### 2. SSH a la Raspberry Pi

```bash
ssh pi@tu-raspberry-ip
# O si usas Tailscale:
ssh pi@100.x.x.x
```

#### 3. Actualizar y Rebuild

```bash
cd ~/projects/EuforiaEvents

# Pull cambios
git pull origin main

# Verificar que se descargó el commit correcto
git log --oneline -5
# Debe mostrar: 7ea9fce feat(guests): implement guest management feature

# Rebuild servicios (con zero-downtime)
docker compose -f docker-compose.prod.yml up -d --build --no-deps api web-operator

# Verificar que los contenedores se rebuildearon
docker ps
```

#### 4. Verificar Logs

```bash
# Ver logs del API
docker logs euforia-api-prod --tail 50

# Ver logs del frontend operator
docker logs euforia-web-operator-prod --tail 20

# Verificar que no hay errores
docker compose -f docker-compose.prod.yml logs -f
```

---

### Opción B: Quick Deploy Script

Si tienes configurado el script de quick deploy:

```bash
# Desde tu máquina local
./scripts/quick-deploy.sh

# El script automáticamente:
# 1. Hace push a origin/main
# 2. SSH a la Pi
# 3. Pull de cambios
# 4. Rebuild de servicios
# 5. Verifica deployment
```

---

## ✅ Verificación Post-Deployment

### 1. Verificar Servicios

```bash
# En la Raspberry Pi
docker ps

# Debe mostrar:
# euforia-api-prod (healthy)
# euforia-web-operator-prod (healthy)
# euforia-web-client-prod (healthy)
# euforia-nginx-prod (healthy)
```

### 2. Verificar API

```bash
# Healthcheck general
curl http://localhost/api/health

# Verificar nuevo endpoint (requiere token)
# Reemplazar EVENT_ID y TOKEN con valores reales
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost/api/events/EVENT_ID/guests
```

**Expected Response**:
```json
{
  "success": true,
  "guests": [...]
}
```

### 3. Verificar Frontend

Desde tu navegador:

1. Navegar a: `https://tu-dominio.com/operator`
2. Login con credenciales
3. Ir a "Eventos"
4. Seleccionar un evento con pedidos
5. Verificar que aparece el módulo "Invitados" (3 columnas ahora)
6. Click en "Invitados"
7. Verificar que se carga la lista de invitados
8. Click en un invitado
9. Verificar que se muestran sus pedidos

### 4. Test Funcional Completo

#### Preparación
```bash
# Crear un invitado de prueba desde el cliente
# 1. Desde navegador móvil/incógnito ir a:
#    https://tu-dominio.com/e/tu-evento-slug
# 2. Identificarse como: test-deploy@euforia.com / Test Deploy
# 3. Hacer 1-2 pedidos musicales
# 4. Hacer 1 pedido de karaoke
```

#### Verificación
```bash
# 1. Panel operador > Evento > Invitados
# - Verificar que aparece "Test Deploy"
# - Verificar contadores correctos (2 MUSICADJ, 1 KARAOKEYA)

# 2. Click en "Test Deploy"
# - Verificar que se ven los 3 pedidos
# - Probar tabs: Todos, MUSICADJ, KARAOKEYA
# - Verificar links a Spotify/YouTube

# 3. Ordenamiento
# - Volver a lista
# - Probar ordenar por: Nombre, MUSICADJ, KARAOKEYA, Total
# - Verificar que el orden cambia correctamente

# 4. Eliminación
# - Click en papelera de "Test Deploy"
# - Confirmar eliminación
# - Verificar que desaparece de la lista
# - Verificar en DB que los pedidos también se eliminaron
```

---

## 🔍 Troubleshooting

### Problema: "Cannot GET /events/:id/guests" (404)

**Causa**: El nuevo endpoint no está registrado

**Solución**:
```bash
# Verificar que el API se rebuildeó correctamente
docker logs euforia-api-prod | grep "Server running"

# Debe mostrar que el servidor se reinició después del rebuild

# Si no, forzar recreación del contenedor:
docker compose -f docker-compose.prod.yml up -d --force-recreate api
```

### Problema: Módulo "Invitados" no aparece en EventDetail

**Causa**: El frontend operator no se rebuildeó

**Solución**:
```bash
# Rebuild del frontend operator
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate web-operator

# Limpiar cache del navegador
# Shift + F5 o Ctrl + Shift + R
```

### Problema: Error 401 al cargar invitados

**Causa**: Token JWT inválido

**Solución**:
```bash
# En el navegador:
# 1. Abrir DevTools (F12)
# 2. Application > Local Storage > Limpiar
# 3. Logout
# 4. Login nuevamente
```

### Problema: Lista de invitados vacía pero hay pedidos

**Causa**: Fallo en la query de agregación

**Diagnóstico**:
```bash
# Verificar logs del API
docker logs euforia-api-prod -f

# Hacer request a la lista y ver si hay errores
```

**Verificar en DB**:
```bash
# Conectar a Prisma Studio
docker exec -it euforia-api-prod npx prisma studio

# Navegar a SongRequest y KaraokeRequest
# Verificar que hay registros con el eventId correcto
```

### Problema: Build falla con error TypeScript

**Síntomas**: `docker-compose up` falla durante build

**Solución**:
```bash
# Ver logs completos del build
docker-compose -f docker-compose.prod.yml build api

# Si hay errores de tipos, verificar que:
# 1. Los archivos están completos
# 2. No hay conflictos de merge
# 3. node_modules está actualizado

# Rebuild completo:
docker-compose -f docker-compose.prod.yml build --no-cache api web-operator
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Métricas de Deployment

### Tiempo Estimado

- **Pull + Rebuild**: 3-5 minutos
- **Verificación**: 2-3 minutos
- **Total**: 5-8 minutos

### Downtime

- **Con `--no-deps`**: ~0 segundos (zero-downtime)
- **Sin `--no-deps`**: 10-30 segundos

### Resource Usage Durante Build

- **CPU**: 80-100% (temporal durante build)
- **RAM**: +500MB (temporal)
- **Disk**: +100MB (imágenes nuevas)

---

## 🔄 Rollback (Si es necesario)

Si algo sale mal, puedes hacer rollback:

### Opción 1: Git Revert

```bash
# En la Raspberry Pi
cd ~/euforia-events

# Revertir al commit anterior
git log --oneline -5
# Copiar el hash del commit anterior a 7ea9fce

git checkout HASH_ANTERIOR

# Rebuild
docker-compose -f docker-compose.prod.yml up -d --build
```

### Opción 2: Docker Image Anterior

```bash
# Ver imágenes disponibles
docker images | grep euforia

# Si la imagen anterior existe:
docker tag euforia-api-prod:latest euforia-api-prod:backup
docker tag euforia-api-prod:HASH_ANTERIOR euforia-api-prod:latest

docker-compose -f docker-compose.prod.yml up -d
```

---

## 📝 Checklist de Deployment

Pre-Deployment:
- [ ] Código committed y pusheado a origin/main
- [ ] Backup de producción creado
- [ ] Changelog actualizado (si aplica)

Deployment:
- [ ] SSH a Raspberry Pi exitoso
- [ ] Git pull ejecutado
- [ ] Commit correcto verificado (7ea9fce)
- [ ] Docker build exitoso
- [ ] Servicios restarted
- [ ] Logs sin errores

Post-Deployment:
- [ ] Healthcheck API responde
- [ ] Frontend carga correctamente
- [ ] Módulo "Invitados" visible en EventDetail
- [ ] Lista de invitados carga correctamente
- [ ] Detalle de invitado funciona
- [ ] Tabs funcionan
- [ ] Ordenamiento funciona
- [ ] Eliminación funciona (test con guest de prueba)

Cleanup:
- [ ] Imágenes Docker antiguas eliminadas (opcional)
- [ ] Logs verificados sin warnings
- [ ] Documentación actualizada

---

## 📞 Soporte

### Logs Útiles

```bash
# API logs
docker logs euforia-api-prod --tail 100 -f

# Frontend operator logs
docker logs euforia-web-operator-prod --tail 50

# Nginx logs
docker logs euforia-nginx-prod --tail 50

# Todos los logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Archivos de Configuración

- **Docker Compose**: `docker-compose.prod.yml`
- **Nginx Config**: `docker/nginx/nginx.prod.conf`
- **API Routes**: `apps/api/src/app.ts`

### Documentación Relacionada

- **Feature Docs**: `docs/GUEST_MANAGEMENT_FEATURE.md`
- **Production Deployment**: `docs/PRODUCTION_DEPLOYMENT.md`
- **Raspberry Pi Setup**: `docs/RASPBERRY_PI_SETUP.md`

---

## ✅ Estado Post-Deployment

Después de un deployment exitoso:

- ✅ API responde en: `https://tu-dominio.com/api/health`
- ✅ Nuevo endpoint: `GET /api/events/:eventId/guests`
- ✅ Panel operador: `https://tu-dominio.com/operator`
- ✅ Módulo Invitados accesible desde EventDetail
- ✅ Funcionalidad completa: listar, ver, ordenar, eliminar
- ✅ Sin errores en logs
- ✅ Performance normal (< 500ms response time)

---

**¡Deployment completado exitosamente! 🎉**

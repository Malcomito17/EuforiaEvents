# 🚀 Deployment & Recovery - Raspberry Pi euforiaevents

**Servidor**: `euforiaevents` (192.168.80.160)
**Usuario**: `malcomito`
**Dominio**: `euforiateclog.cloud`

---

## 🔴 RECOVERY: Servicios Caídos

### 1. SSH a la Raspberry Pi

```bash
ssh malcomito@euforiaevents
# O con IP: ssh malcomito@192.168.80.160
# O con Tailscale: ssh malcomito@100.x.x.x
```

### 2. Diagnóstico rápido

```bash
# Ver estado de contenedores
docker ps -a

# Ver qué está corriendo
docker-compose -f docker-compose.prod.yml ps

# Ver logs de errores recientes
docker-compose -f docker-compose.prod.yml logs --tail 50
```

### 3. Reiniciar servicios

```bash
cd ~/euforia-events

# Detener todos los servicios
docker-compose -f docker-compose.prod.yml down

# Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# Verificar que estén corriendo
docker ps

# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f
```

**Esperar a que estén healthy** (30-60 segundos):
- `euforia-api-prod` - API running on port 3000
- `euforia-web-client-prod` - Cliente web
- `euforia-web-operator-prod` - Panel operador
- `euforia-nginx-prod` - Proxy reverso

### 4. Verificar que funciona

```bash
# Healthcheck del API
curl http://localhost/api/health

# Debería responder: {"status":"ok","timestamp":"..."}
```

Browser: `https://euforiateclog.cloud/operator`

---

## ⚙️ CONFIGURAR AUTO-START (Importante!)

Para que los servicios inicien automáticamente cuando se reinicia la Pi:

### 1. Verificar Docker habilitado

```bash
# Ver estado de Docker
sudo systemctl status docker

# Si no está habilitado, habilitarlo
sudo systemctl enable docker
```

### 2. Crear servicio systemd

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/euforia-events.service
```

**Pegar este contenido**:

```ini
[Unit]
Description=Euforia Events Docker Compose
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/malcomito/euforia-events
ExecStart=/usr/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=300
User=malcomito
Group=malcomito

[Install]
WantedBy=multi-user.target
```

**Guardar**: Ctrl+X, Y, Enter

### 3. Activar el servicio

```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar para que inicie al boot
sudo systemctl enable euforia-events.service

# Iniciar el servicio ahora
sudo systemctl start euforia-events.service

# Verificar estado
sudo systemctl status euforia-events.service
```

### 4. Probar auto-start

```bash
# Reiniciar la Pi
sudo reboot

# Esperar 2-3 minutos y volver a conectar
ssh malcomito@euforiaevents

# Verificar que los contenedores están corriendo
docker ps
```

---

## 📦 DEPLOYMENT DE CAMBIOS (Guest Management)

### 2. Actualizar código

```bash
cd ~/euforia-events
git pull origin main
```

**Verificar que se bajaron los commits correctos:**
```bash
git log --oneline -3
```

Debe mostrar:
```
9f462ae fix: remove unused Link import in EventGuestDetail
6e4ffbe docs: add deployment guide for guest management feature
7ea9fce feat(guests): implement guest management feature
```

### 3. Rebuild servicios (Zero-downtime)

```bash
docker-compose -f docker-compose.prod.yml up -d --build --no-deps api web-operator
```

Este comando:
- Rebuilde solo API y Web Operator
- No afecta otros servicios (nginx, web-client)
- Zero downtime (no interrumpe servicio)
- Tarda 3-5 minutos

### 4. Verificar logs

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ctrl+C para salir cuando veas que todo está OK
```

**Buscar estas líneas:**
- API: `Server running on port 3000`
- Sin errores de TypeScript
- Sin errores de conexión

### 5. Verificar servicios

```bash
docker ps
```

Todos los contenedores deben estar "healthy":
- euforia-api-prod
- euforia-web-operator-prod
- euforia-web-client-prod
- euforia-nginx-prod

### 6. Test del nuevo endpoint

```bash
# Healthcheck general
curl http://localhost/api/health

# Debe retornar: {"status":"ok","timestamp":"..."}
```

---

## ✅ Verificación en el Browser

1. Abrir: `https://euforiateclog.cloud/operator`
2. Login con tus credenciales
3. Ir a **Eventos**
4. Seleccionar un evento que tenga pedidos
5. Verificar que ahora hay **3 módulos** (MUSICADJ, KARAOKEYA, **Invitados**)
6. Click en **Invitados**
7. Debe cargar la lista de invitados con stats
8. Click en un invitado → Ver detalle con tabs

---

## 🐛 Si algo falla

### Logs completos
```bash
docker logs euforia-api-prod --tail 100
docker logs euforia-web-operator-prod --tail 50
```

### Rebuild forzado (si es necesario)
```bash
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Rollback (si algo sale mal)
```bash
git checkout f5f4b17
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📊 Qué cambió

**Backend:**
- Nuevo endpoint: `GET /api/events/:eventId/guests` (protegido)
- Endpoint de eliminación: `DELETE /api/guests/:guestId` (protegido)

**Frontend:**
- Nueva página: Lista de invitados (`/events/:id/guests`)
- Nueva página: Detalle de invitado (`/events/:id/guests/:guestId`)
- EventDetail ahora muestra módulo "Invitados" (grid de 3 columnas)

**Database:**
- Sin cambios (usa tablas existentes)

---

## 📚 Documentación

- Feature completo: `docs/GUEST_MANAGEMENT_FEATURE.md`
- Deployment guide: `docs/DEPLOYMENT_GUEST_MANAGEMENT.md`

---

**Tiempo estimado total: 5-8 minutos**

¡Éxito! 🎉

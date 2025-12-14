# Recuperación del Sistema - Nuevo Disco SSD

## Situación Actual

Ayer se migró Docker a un disco SSD que ahora presenta problemas y no se puede montar. Se ha instalado un **nuevo disco SSD** para reemplazarlo y recuperar el sistema.

## Datos del Sistema

- **Proyecto:** EUFORIA EVENTS
- **Plataforma:** Raspberry Pi 4 (4GB RAM)
- **SO:** Raspberry Pi OS
- **Servicios:** API, Web Client, Web Operator, Nginx
- **Base de datos:** SQLite (production.db)
- **Docker:** Contenedores en producción

## Scripts Disponibles

### Scripts de Migración/Setup
- `scripts/setup-new-ssd.sh` - **NUEVO** - Preparar disco SSD nuevo
- `scripts/restore-from-backup.sh` - **NUEVO** - Restaurar desde backup
- `scripts/move-docker-to-ssd.sh` - Script usado ayer (para referencia)
- `scripts/setup-ssd-and-docker.sh` - Script alternativo (para referencia)

### Scripts de Administración
- `admin.sh` - Menú de administración completo
- `deploy.sh` - Deployment automatizado
- `scripts/backup-euforia.sh` - Crear backups

## Plan de Recuperación

### Opción A: CON Backup Disponible (RECOMENDADO)

Si tienes un backup reciente de la base de datos:

#### 1. Preparar el nuevo SSD (en la Raspberry Pi como root)

```bash
# Conectarse a la Raspberry Pi
ssh pi@<ip-raspberry-pi>

# Verificar qué discos están disponibles
lsblk

# Preparar el nuevo SSD (AJUSTA /dev/sda1 según corresponda)
cd ~/projects/euforia-events
sudo ./scripts/setup-new-ssd.sh /dev/sda1 /mnt/ssd
```

Este script hará:
- ✅ Formatear el disco como ext4
- ✅ Montar en /mnt/ssd
- ✅ Configurar montaje automático en /etc/fstab
- ✅ Crear estructura de directorios
- ✅ Configurar Docker para usar el SSD
- ✅ Crear enlaces simbólicos para los datos

#### 2. Buscar backups disponibles

```bash
# Buscar backups en ubicaciones comunes
ls -lh ~/euforia-backups/*.tar.gz 2>/dev/null
ls -lh ~/backups/*.tar.gz 2>/dev/null
ls -lh ./backups/*.tar.gz 2>/dev/null

# O buscar archivos .db de backup
find ~ -name "*.db.backup*" 2>/dev/null
find ~ -name "production.db*" 2>/dev/null
```

#### 3. Restaurar el backup

```bash
# Opción A: Usar el script de restauración automática
./scripts/restore-from-backup.sh ~/ruta/al/backup.tar.gz

# Opción B: Restauración manual de la base de datos
sudo cp /ruta/al/backup/production.db /mnt/ssd/euforia-data/db/production.db
sudo chown pi:pi /mnt/ssd/euforia-data/db/production.db
```

#### 4. Reconstruir y levantar los servicios

```bash
cd ~/projects/euforia-events
./deploy.sh
```

#### 5. Verificar que todo funciona

```bash
./admin.sh
# Seleccionar opción 10: Verificar Producción
```

---

### Opción B: SIN Backup (Sistema Limpio)

Si NO tienes backup, se creará una base de datos nueva desde cero:

#### 1. Preparar el nuevo SSD

```bash
ssh pi@<ip-raspberry-pi>
cd ~/projects/euforia-events
sudo ./scripts/setup-new-ssd.sh /dev/sda1 /mnt/ssd
```

#### 2. Desplegar el sistema

```bash
./deploy.sh
```

Esto creará una base de datos nueva vacía.

#### 3. Inicializar la base de datos

```bash
./admin.sh
# Seleccionar opción 12: Inicializar Base de Datos
```

Esto ejecutará las migraciones de Prisma y creará:
- Usuario admin con password "admin123"
- Estructura de tablas necesaria

#### 4. (Opcional) Cambiar password del admin

```bash
./admin.sh
# Seleccionar opción 2: Resetear Password Admin
```

#### 5. Verificar que todo funciona

```bash
./admin.sh
# Seleccionar opción 10: Verificar Producción
```

---

## Comandos Útiles de Diagnóstico

### Verificar estado del disco

```bash
# Ver discos disponibles
lsblk

# Ver puntos de montaje
df -h

# Ver UUID del disco
sudo blkid /dev/sda1

# Verificar que está montado
mountpoint /mnt/ssd
```

### Verificar Docker

```bash
# Ver dónde está el root de Docker
docker info | grep "Docker Root Dir"

# Ver contenedores
docker ps -a

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### Verificar datos

```bash
# Ver estructura de datos
ls -lh /mnt/ssd/euforia-data/
ls -lh ~/projects/euforia-events/data/

# Ver si la base de datos existe
ls -lh ~/projects/euforia-events/data/db/production.db

# Verificar integridad de la base de datos (si sqlite3 está instalado)
sqlite3 ~/projects/euforia-events/data/db/production.db "PRAGMA integrity_check;"
```

---

## Problemas Comunes

### 1. El disco no se detecta

```bash
# Ver todos los dispositivos de bloque
lsblk -a

# Ver información SATA
sudo dmesg | grep -i sata
sudo dmesg | grep -i usb
```

Si no aparece:
- Verificar conexión física del disco
- Probar otro puerto USB (si es USB)
- Reiniciar la Raspberry Pi

### 2. Error al montar el disco

```bash
# Verificar errores del sistema de archivos
sudo fsck /dev/sda1

# Si persiste, reformatear
sudo mkfs.ext4 -F /dev/sda1
```

### 3. Docker no inicia

```bash
# Ver logs de Docker
sudo journalctl -u docker -n 50

# Verificar configuración
cat /etc/docker/daemon.json

# Reiniciar Docker
sudo systemctl restart docker
```

### 4. Contenedores no inician

```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs --tail 100

# Reconstruir sin cache
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

## Prevención Futura

### 1. Configurar backups automáticos

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 3 AM
0 3 * * * /home/pi/projects/euforia-events/scripts/backup-euforia.sh >> /home/pi/backups/cron.log 2>&1
```

### 2. Monitorear salud del disco

```bash
# Instalar smartmontools si no está instalado
sudo apt install smartmontools

# Verificar salud del SSD
sudo smartctl -a /dev/sda
```

### 3. Backup manual regular

```bash
cd ~/projects/euforia-events
./scripts/backup-euforia.sh
```

Los backups se guardan en `~/euforia-backups/` por defecto.

---

## Contacto y Soporte

Si encuentras problemas durante la recuperación:

1. Revisar logs detalladamente
2. Verificar cada paso del proceso
3. Conservar mensajes de error para diagnóstico

### Comandos de emergencia

```bash
# Ver estado general del sistema
./admin.sh
# Opción 5: Ver Estado de Servicios

# Reiniciar todos los servicios
./admin.sh
# Opción 6: Reiniciar Servicios

# Ver logs en tiempo real
./admin.sh
# Opción 4: Ver Logs de Servicios
```

---

## Checklist de Recuperación

- [ ] Disco SSD nuevo conectado y detectado
- [ ] Script `setup-new-ssd.sh` ejecutado exitosamente
- [ ] Disco montado en `/mnt/ssd`
- [ ] Docker configurado y usando el SSD
- [ ] Backup restaurado (si disponible) o DB inicializada
- [ ] `deploy.sh` ejecutado sin errores
- [ ] Contenedores corriendo (verificar con `docker ps`)
- [ ] API respondiendo (verificar con admin.sh opción 5)
- [ ] Servicios web accesibles
- [ ] Backups automáticos configurados

---

**Fecha de creación:** 2024-12-14
**Versión:** 1.0

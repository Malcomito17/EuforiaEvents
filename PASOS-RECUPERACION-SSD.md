# Pasos para Recuperación del SSD - EUFORIA EVENTS

## Situación Actual
- **Ubicación:** `malcomito@euforiaevents:~/projects/EuforiaEvents`
- **SSD detectado:** `/dev/sda` (111.8G)
- **Problema:** Tiene múltiples particiones antiguas que necesitan ser limpiadas
- **Objetivo:** Crear una sola partición y configurar Docker

## Estado de los Discos

```
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda           8:0    0 111.8G  0 disk          ← SSD a limpiar
|-sda1        8:1    0   100M  0 part           ← A eliminar
|-sda2        8:2    0    16M  0 part           ← A eliminar
|-sda3        8:3    0 111.1G  0 part           ← A eliminar
`-sda4        8:4    0   619M  0 part           ← A eliminar
mmcblk0     179:0    0  29.7G  0 disk          ← Tarjeta SD (NO TOCAR)
|-mmcblk0p1 179:1    0   512M  0 part /boot/firmware
`-mmcblk0p2 179:2    0  29.2G  0 part /
```

---

## PASOS A SEGUIR

### PASO 1: Dar permisos de ejecución a los scripts

```bash
cd ~/projects/EuforiaEvents
chmod +x scripts/clean-and-partition-ssd.sh
chmod +x scripts/setup-new-ssd.sh
chmod +x deploy.sh
chmod +x admin.sh
```

### PASO 2: Limpiar el SSD y crear una sola partición

```bash
sudo ./scripts/clean-and-partition-ssd.sh /dev/sda
```

**Este script hará:**
- ⚠️  Te pedirá confirmación DOS VECES (es destructivo)
- Desmontará todas las particiones existentes
- Borrará la tabla de particiones
- Creará una nueva tabla GPT
- Creará UNA sola partición que ocupe todo el disco
- Formateará la partición como ext4 con etiqueta "EUFORIA-SSD"

**Al finalizar, el disco quedará así:**
```
sda           8:0    0 111.8G  0 disk
`-sda1        8:1    0 111.8G  0 part  ← Nueva partición única
```

### PASO 3: Configurar el SSD y Docker

```bash
sudo ./scripts/setup-new-ssd.sh /dev/sda1 /mnt/ssd
```

**Este script hará:**
- Montar `/dev/sda1` en `/mnt/ssd`
- Configurar montaje automático en `/etc/fstab`
- Crear estructura de directorios para Docker y datos
- Configurar Docker para usar el SSD
- Crear enlaces simbólicos

### PASO 4: Desplegar los containers

```bash
./deploy.sh
```

**Este script hará:**
- Reconstruir las imágenes Docker
- Crear la base de datos (si no existe)
- Levantar todos los servicios (API, Web Client, Web Operator, Nginx)
- Verificar que todo funciona

### PASO 5: Verificar que todo funciona

```bash
./admin.sh
# Selecciona opción 10: Verificar Producción
```

**O manualmente:**
```bash
docker ps -a
docker compose -f docker-compose.prod.yml logs -f api
```

---

## Comandos Útiles Durante el Proceso

### Verificar estado del disco en cualquier momento
```bash
lsblk
df -h
```

### Ver dónde está Docker
```bash
docker info | grep "Docker Root Dir"
```

### Ver logs de un servicio
```bash
docker logs euforia-api-prod --tail 50
```

### Reiniciar todos los servicios
```bash
docker compose -f docker-compose.prod.yml restart
```

---

## Si Algo Sale Mal

### El script de limpieza falla
```bash
# Verificar que el disco no está montado
sudo umount /dev/sda* 2>/dev/null || true

# Volver a intentar
sudo ./scripts/clean-and-partition-ssd.sh /dev/sda
```

### Docker no inicia después del setup
```bash
# Ver logs de Docker
sudo journalctl -u docker -n 50

# Verificar configuración
cat /etc/docker/daemon.json

# Reiniciar Docker
sudo systemctl restart docker
```

### Los containers no se levantan
```bash
# Ver logs detallados
docker compose -f docker-compose.prod.yml logs --tail 100

# Reconstruir sin cache
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

---

## Checklist de Progreso

- [ ] Scripts tienen permisos de ejecución
- [ ] Ejecutado `clean-and-partition-ssd.sh` exitosamente
- [ ] Verificado que existe `/dev/sda1` (una sola partición)
- [ ] Ejecutado `setup-new-ssd.sh` exitosamente
- [ ] Disco montado en `/mnt/ssd`
- [ ] Docker configurado para usar `/mnt/ssd/docker`
- [ ] Ejecutado `deploy.sh` sin errores
- [ ] Contenedores corriendo (verificar con `docker ps`)
- [ ] API respondiendo (verificar health check)
- [ ] Servicios web accesibles

---

## Resumen de Comandos Completos

```bash
# En ~/projects/EuforiaEvents

# 1. Dar permisos
chmod +x scripts/*.sh deploy.sh admin.sh

# 2. Limpiar SSD
sudo ./scripts/clean-and-partition-ssd.sh /dev/sda

# 3. Configurar SSD y Docker
sudo ./scripts/setup-new-ssd.sh /dev/sda1 /mnt/ssd

# 4. Desplegar
./deploy.sh

# 5. Verificar
./admin.sh  # Opción 10
```

---

**Fecha:** 2024-12-14
**Usuario:** malcomito@euforiaevents
**Proyecto:** EUFORIA EVENTS
**Plataforma:** Raspberry Pi 4

# RUTINAS INTERNAS - EUFORIA EVENTS

Documentación de procedimientos internos para administración y mantenimiento del sistema.

**Última actualización**: 11 de Diciembre de 2024

---

## TABLA DE CONTENIDOS

1. [Reset de Password](#1-reset-de-password)
2. [Deployment en Producción](#2-deployment-en-producción)
3. [Backup de Base de Datos](#3-backup-de-base-de-datos)
4. [Script de Administración (admin.sh)](#4-script-de-administración-adminsh)

---

## 1. RESET DE PASSWORD

### Descripción

Procedimiento CLI para resetear el password de cualquier usuario del panel de operador sin necesidad de acceso al sistema.

### Ubicación del Script

```
apps/api/scripts/reset-password.ts
```

### Casos de Uso

- Olvido de contraseña del administrador
- Reseteo de credenciales comprometidas
- Creación de nuevas credenciales para usuarios existentes
- Recuperación de acceso en emergencias

### Uso en Desarrollo (Local)

```bash
cd apps/api
npx tsx scripts/reset-password.ts <username> <new-password>
```

**Ejemplos:**

```bash
# Resetear password del admin
npx tsx scripts/reset-password.ts admin NuevoPassword2024

# Resetear password del operador
npx tsx scripts/reset-password.ts operador OperadorPass456
```

### Uso en Producción (Raspberry Pi)

Ejecutar desde el directorio raíz del proyecto:

```bash
# Resetear password del admin
docker exec euforia-api-prod npx tsx scripts/reset-password.ts admin NuevoPassword2024

# Resetear password del operador
docker exec euforia-api-prod npx tsx scripts/reset-password.ts operador OperadorPass456
```

### Output del Script

El script muestra:
- Confirmación de actualización
- Información del usuario (username, email, rol, estado)
- Advertencia de seguridad

**Ejemplo de output exitoso:**

```
🔐 RESET DE PASSWORD
═══════════════════════════════════════
Usuario: admin

✅ Password actualizado correctamente para 'admin'

📋 Información del usuario:
   Usuario: admin
   Email: euforiateclog@gmail.com
   Rol: ADMIN
   Estado: Activo

⚠️  Asegúrate de guardar este password en un lugar seguro!
```

### Validaciones

- ✅ El usuario debe existir en la base de datos
- ✅ El password debe tener al menos 6 caracteres
- ✅ El password se hashea con bcrypt (10 salt rounds)
- ✅ Si el usuario no existe, muestra lista de usuarios disponibles

### Errores Comunes

**Error: "Usuario no encontrado"**
```
❌ Error: Usuario 'operador' no encontrado

Usuarios disponibles:
   • admin (ADMIN)
```

**Solución**: Verificar que el username esté escrito correctamente.

**Error: "Password debe tener al menos 6 caracteres"**
```
❌ Error: El password debe tener al menos 6 caracteres
```

**Solución**: Usar un password más largo (recomendado: mínimo 12 caracteres).

**Error: "Cannot connect to database"**
```
❌ Error al resetear password: PrismaClientInitializationError
```

**Solución**:
- Verificar que la variable `DATABASE_URL` esté configurada
- En Docker, verificar que el contenedor `euforia-api-prod` esté corriendo

### Notas de Seguridad

⚠️ **IMPORTANTE**:

- Este script tiene acceso directo a la base de datos
- Solo debe ser ejecutado por administradores del sistema
- En producción, ejecutar desde SSH en el servidor
- No compartir passwords por canales inseguros (email, chat, etc.)
- Usar passwords fuertes:
  - Mínimo 12 caracteres
  - Combinación de letras mayúsculas y minúsculas
  - Números y símbolos especiales
  - Evitar palabras comunes o datos personales

### Credenciales por Defecto (Seed)

Las credenciales creadas por el seed inicial son:

```
Username: admin
Password: admin123
Email: euforiateclog@gmail.com
Role: ADMIN
```

⚠️ **CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN**

### Comandos Relacionados

```bash
# Listar usuarios en la base de datos
docker exec euforia-api-prod npx prisma studio

# Verificar que el contenedor esté corriendo
docker ps | grep euforia-api

# Ver logs del API
docker logs euforia-api-prod --tail 50
```

### Historial de Cambios

- **11/12/2024**: Creación del script y documentación inicial
- **11/12/2024**: Actualización del email del admin a euforiateclog@gmail.com

---

## 2. DEPLOYMENT EN PRODUCCIÓN

### Descripción

Procedimiento automatizado para actualizar la aplicación en el Raspberry Pi.

### Script de Deployment

```
./deploy.sh
```

### Modos de Ejecución

**Modo Interactivo** (por defecto):
```bash
./deploy.sh
```
Pregunta confirmación en cada paso.

**Modo Automático**:
```bash
./deploy.sh --auto
```
Solo se detiene en errores.

### Pasos del Deployment

1. **Backup de Base de Datos**: Crea copia de seguridad automática
2. **Git Pull**: Descarga cambios del repositorio
3. **Detener Contenedores**: Para servicios existentes
4. **Rebuild Imágenes**: Reconstruye sin cache (5-10 min en Pi)
5. **Levantar Servicios**: Inicia todos los contenedores
6. **Verificar Estado**: Health checks de API y Nginx
7. **Aplicar Migraciones**: `prisma db push` + `prisma generate`
8. **Reiniciar API**: Aplica cambios finales

### Verificación Post-Deployment

```bash
# Ver estado de contenedores
docker ps

# Ver logs del API
docker logs euforia-api-prod --tail 50

# Verificar health endpoint
curl http://localhost/health
```

### Rollback en Caso de Error

```bash
# Detener todo
docker compose -f docker-compose.prod.yml down

# Restaurar backup de base de datos
# (Los backups están en ./backups/)

# Volver a commit anterior
git checkout <commit-hash>

# Re-deployar
./deploy.sh --auto
```

---

## 3. BACKUP DE BASE DE DATOS

### Descripción

El script de deployment crea backups automáticos, pero también se pueden crear manualmente.

### Backup Manual en Producción

```bash
# Desde el servidor (Raspberry Pi)
docker exec euforia-api-prod sh -c "cp /app/prisma/euforia.db /tmp/euforia.db.backup"
docker cp euforia-api-prod:/tmp/euforia.db.backup ./backups/euforia.db.backup-$(date +%Y%m%d-%H%M%S)
```

### Restaurar Backup

```bash
# Detener API
docker stop euforia-api-prod

# Copiar backup al contenedor
docker cp ./backups/euforia.db.backup-FECHA euforia-api-prod:/app/prisma/euforia.db

# Reiniciar API
docker start euforia-api-prod
```

### Ubicación de Backups

```
~/projects/EuforiaEvents/backups/
```

### Retención de Backups

- Se recomienda mantener los últimos 7 backups
- Backups más antiguos se pueden comprimir:

```bash
# Comprimir backups antiguos
gzip backups/euforia.db.backup-*

# Eliminar backups de más de 30 días
find backups/ -name "*.backup" -mtime +30 -delete
```

---

## 4. SCRIPT DE ADMINISTRACIÓN (admin.sh)

### Descripción

Menú interactivo de administración diseñado para operadores sin conocimientos técnicos de Linux. Proporciona acceso simplificado a todas las operaciones comunes del sistema en el Raspberry Pi mediante opciones numeradas.

### Ubicación del Script

```
./admin.sh
```

### Características Principales

✅ **Interfaz amigable**: Menú con opciones numeradas y códigos de color
✅ **Sin conocimientos técnicos**: No requiere saber comandos de Linux
✅ **Confirmaciones de seguridad**: Pide confirmación en operaciones destructivas
✅ **Mensajes descriptivos**: Explica qué hace cada operación
✅ **Manejo de errores**: Muestra ayuda cuando algo falla
✅ **Todo en uno**: Integra deployment, backups, logs, y administración

### Ejecutar el Script

```bash
# Desde el directorio raíz del proyecto
./admin.sh
```

**Primera vez** (si no tiene permisos de ejecución):
```bash
chmod +x admin.sh
./admin.sh
```

### Menú de Opciones

```
╔════════════════════════════════════════════════════════╗
║     EUFORIA EVENTS - MENÚ DE ADMINISTRACIÓN            ║
╔════════════════════════════════════════════════════════╗

1) Ejecutar Deployment Completo
2) Resetear Password de Admin
3) Abrir Prisma Studio
4) Ver Logs del Sistema
5) Ver Estado de Servicios
6) Reiniciar Servicios
7) Backup Manual de Base de Datos
8) Iniciar/Detener Servicios
9) Información del Sistema
0) Salir

Seleccione una opción [0-9]:
```

---

### 1️⃣ Ejecutar Deployment Completo

**Descripción**: Despliega la última versión del código desde Git.

**Cuándo usar**:
- Cuando hay actualizaciones de código disponibles
- Después de hacer cambios en desarrollo
- Para aplicar nuevas funcionalidades

**Qué hace**:
- Ejecuta el script `deploy.sh` completo
- Realiza backup automático de la base de datos
- Descarga cambios de Git
- Reconstruye imágenes Docker
- Aplica migraciones de base de datos
- Reinicia todos los servicios

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 1

═══════════════════════════════════════════
🚀 EJECUTANDO DEPLOYMENT COMPLETO
═══════════════════════════════════════════

Esta operación ejecutará el script de deployment.
¿Desea continuar? (s/n):
```

**⚠️ Precauciones**:
- El deployment puede tomar 5-10 minutos en Raspberry Pi
- Los servicios se detendrán temporalmente
- Asegurarse de que no haya eventos activos

**Ver también**: [Sección 2: Deployment en Producción](#2-deployment-en-producción)

---

### 2️⃣ Resetear Password de Admin

**Descripción**: Cambia el password del usuario administrador sin necesidad de acceder al panel.

**Cuándo usar**:
- Olvidaste el password del admin
- Necesitas cambiar credenciales comprometidas
- Primera configuración del sistema
- Recuperación de acceso de emergencia

**Qué hace**:
- Solicita el nuevo password
- Valida que tenga al menos 6 caracteres (recomendado: 12+)
- Hashea el password con bcrypt
- Actualiza la base de datos
- Muestra confirmación con datos del usuario

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 2

═══════════════════════════════════════════
🔐 RESETEAR PASSWORD DE ADMIN
═══════════════════════════════════════════

Ingrese el nuevo password para el admin: ********

⚠️  Esto cambiará el password del usuario 'admin'.
¿Desea continuar? (s/n): s

✅ Password actualizado correctamente para 'admin'

📋 Información del usuario:
   Usuario: admin
   Email: euforiateclog@gmail.com
   Rol: ADMIN
   Estado: Activo
```

**⚠️ Seguridad**:
- Usar passwords fuertes (mínimo 12 caracteres)
- Combinar letras mayúsculas, minúsculas, números y símbolos
- No compartir passwords por canales inseguros
- Cambiar el password por defecto inmediatamente en producción

**Ver también**: [Sección 1: Reset de Password](#1-reset-de-password)

---

### 3️⃣ Abrir Prisma Studio

**Descripción**: Inicia la interfaz visual de administración de base de datos.

**Cuándo usar**:
- Consultar datos de la base de datos
- Modificar registros manualmente
- Verificar el estado de eventos, usuarios, venues, etc.
- Debugging de problemas de datos

**Qué hace**:
- Inicia Prisma Studio en el puerto 5555
- Abre la interfaz web de administración
- Proporciona acceso visual a todas las tablas

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 3

═══════════════════════════════════════════
🗄️  ABRIENDO PRISMA STUDIO
═══════════════════════════════════════════

🌐 Prisma Studio iniciándose en http://localhost:5555

Para detenerlo, presione Ctrl+C
```

**Cómo acceder**:
1. Seleccionar opción 3 del menú
2. Abrir navegador en: `http://localhost:5555`
3. O desde otra máquina: `http://IP-DEL-PI:5555`

**⚠️ Precauciones**:
- Prisma Studio tiene acceso total a la base de datos
- Los cambios son inmediatos (sin confirmación)
- No exponer el puerto 5555 a internet
- Cerrar con Ctrl+C cuando termines

**Navegación en Prisma Studio**:
- Sidebar izquierdo: Lista de tablas (models)
- Vista principal: Registros de la tabla seleccionada
- Botones: Add record (crear), Edit (editar), Delete (eliminar)
- Filtros: Búsqueda y filtrado de registros

---

### 4️⃣ Ver Logs del Sistema

**Descripción**: Muestra los logs recientes de todos los servicios Docker.

**Cuándo usar**:
- Diagnosticar errores en la aplicación
- Verificar que el deployment fue exitoso
- Investigar problemas reportados por usuarios
- Monitorear actividad del sistema

**Qué hace**:
- Muestra logs de API (euforia-api-prod)
- Muestra logs de Nginx (euforia-nginx-prod)
- Muestra logs de operador (euforia-operator-prod)
- Muestra logs de cliente (euforia-client-prod)
- Muestra las últimas 50 líneas de cada servicio

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 4

═══════════════════════════════════════════
📋 LOGS DEL SISTEMA
═══════════════════════════════════════════

▶ Logs del API (euforia-api-prod):
2024-12-11T10:30:15.123Z [INFO] 🚀 Servidor iniciado en puerto 3000
2024-12-11T10:30:16.456Z [INFO] ✅ Base de datos conectada
2024-12-11T10:31:22.789Z [INFO] POST /api/auth/login 200 45ms

▶ Logs de NGINX (euforia-nginx-prod):
192.168.1.100 - - [11/Dec/2024:10:31:22] "GET / HTTP/1.1" 200

...
```

**Filtrado de logs**:
Para ver logs en tiempo real (modo seguimiento):
```bash
# Desde línea de comandos
docker logs euforia-api-prod -f
```

**Niveles de log comunes**:
- `[INFO]`: Información general
- `[WARN]`: Advertencias (no crítico)
- `[ERROR]`: Errores que requieren atención
- `[DEBUG]`: Información de debugging

---

### 5️⃣ Ver Estado de Servicios

**Descripción**: Muestra el estado de todos los contenedores Docker.

**Cuándo usar**:
- Verificar que todos los servicios estén corriendo
- Diagnosticar problemas de disponibilidad
- Comprobar uso de recursos (CPU, memoria)
- Después de un deployment

**Qué hace**:
- Ejecuta `docker ps -a`
- Muestra: nombre, estado, puertos, tiempo activo
- Indica si algún contenedor está detenido

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 5

═══════════════════════════════════════════
📊 ESTADO DE SERVICIOS
═══════════════════════════════════════════

CONTAINER ID   IMAGE                    STATUS          PORTS
a1b2c3d4e5f6   euforia-api:latest      Up 2 hours      0.0.0.0:3000->3000/tcp
b2c3d4e5f6a7   euforia-nginx:latest    Up 2 hours      0.0.0.0:80->80/tcp
c3d4e5f6a7b8   euforia-operator:latest Up 2 hours      0.0.0.0:5173->5173/tcp
d4e5f6a7b8c9   euforia-client:latest   Up 2 hours      0.0.0.0:5174->5174/tcp

✅ Todos los servicios están corriendo
```

**Estados posibles**:
- `Up`: Servicio corriendo correctamente
- `Exited`: Servicio detenido (puede indicar error)
- `Restarting`: Servicio reiniciándose continuamente (problema)
- `Created`: Contenedor creado pero no iniciado

**Troubleshooting**:
Si un servicio está detenido:
1. Usar opción 4 (Ver Logs) para investigar
2. Intentar opción 6 (Reiniciar Servicios)
3. Si persiste, ejecutar deployment completo (opción 1)

---

### 6️⃣ Reiniciar Servicios

**Descripción**: Reinicia todos los contenedores Docker sin recompilar.

**Cuándo usar**:
- Aplicar cambios de configuración
- Resolver problemas temporales de servicios
- Después de modificar variables de entorno
- Cuando un servicio está en estado de error

**Qué hace**:
- Ejecuta `docker compose restart`
- Reinicia todos los contenedores
- Mantiene los datos y configuración
- No reconstruye imágenes

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 6

═══════════════════════════════════════════
🔄 REINICIAR SERVICIOS
═══════════════════════════════════════════

⚠️  Esto reiniciará todos los contenedores Docker.
Los servicios estarán temporalmente no disponibles.
¿Desea continuar? (s/n): s

Reiniciando servicios...
[+] Running 4/4
 ✔ Container euforia-api-prod       Started
 ✔ Container euforia-nginx-prod     Started
 ✔ Container euforia-operator-prod  Started
 ✔ Container euforia-client-prod    Started

✅ Servicios reiniciados correctamente
```

**Diferencia con Deployment**:
- **Reinicio**: Rápido (~30 segundos), no actualiza código
- **Deployment**: Lento (5-10 min), actualiza código y reconstruye

---

### 7️⃣ Backup Manual de Base de Datos

**Descripción**: Crea una copia de seguridad de la base de datos SQLite.

**Cuándo usar**:
- Antes de hacer cambios importantes
- Backup preventivo antes de deployment
- Programación de backups regulares
- Antes de operaciones de mantenimiento

**Qué hace**:
- Copia el archivo `euforia.db` desde el contenedor
- Crea archivo con timestamp: `euforia.db.backup-YYYYMMDD-HHMMSS`
- Guarda en directorio `./backups/`
- Muestra confirmación con ubicación del archivo

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 7

═══════════════════════════════════════════
💾 BACKUP MANUAL DE BASE DE DATOS
═══════════════════════════════════════════

Creando backup de la base de datos...

✅ Backup creado exitosamente:
   ./backups/euforia.db.backup-20241211-103045

📁 Ubicación: /home/euforia/projects/EuforiaEvents/backups/
```

**Gestión de backups**:
```bash
# Ver backups existentes
ls -lh backups/

# Comprimir backups antiguos
gzip backups/euforia.db.backup-20241201-*

# Eliminar backups de más de 30 días
find backups/ -name "*.backup" -mtime +30 -delete
```

**Restaurar un backup**:
```bash
# 1. Detener API
docker stop euforia-api-prod

# 2. Copiar backup al contenedor
docker cp ./backups/euforia.db.backup-FECHA euforia-api-prod:/app/prisma/euforia.db

# 3. Reiniciar API
docker start euforia-api-prod
```

**⚠️ Importante**:
- El deployment automático ya crea backups
- Guardar backups en ubicación externa (USB, nube)
- Mantener al menos los últimos 7 backups

**Ver también**: [Sección 3: Backup de Base de Datos](#3-backup-de-base-de-datos)

---

### 8️⃣ Iniciar/Detener Servicios

**Descripción**: Control completo de inicio y parada de contenedores.

**Cuándo usar**:
- Mantenimiento programado del sistema
- Ahorro de recursos cuando no hay eventos
- Troubleshooting de problemas específicos
- Antes de actualizaciones del sistema operativo

**Qué hace**:
- Muestra submenú con opciones:
  - Iniciar todos los servicios
  - Detener todos los servicios
  - Volver al menú principal

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 8

═══════════════════════════════════════════
⚙️  CONTROL DE SERVICIOS
═══════════════════════════════════════════

1) Iniciar todos los servicios
2) Detener todos los servicios
3) Volver al menú principal

Seleccione una opción [1-3]: 2

⚠️  Esto detendrá TODOS los servicios.
La aplicación no estará disponible.
¿Desea continuar? (s/n): s

Deteniendo servicios...
[+] Running 4/4
 ✔ Container euforia-client-prod    Stopped
 ✔ Container euforia-operator-prod  Stopped
 ✔ Container euforia-nginx-prod     Stopped
 ✔ Container euforia-api-prod       Stopped

✅ Servicios detenidos correctamente
```

**Comandos equivalentes**:
```bash
# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# Detener servicios
docker compose -f docker-compose.prod.yml down
```

---

### 9️⃣ Información del Sistema

**Descripción**: Muestra información técnica del sistema y Docker.

**Cuándo usar**:
- Diagnosticar problemas de rendimiento
- Verificar espacio en disco disponible
- Obtener información para soporte técnico
- Monitoreo de recursos del sistema

**Qué hace**:
- Muestra versión de Docker y Docker Compose
- Información del sistema operativo
- Uso de disco
- Estadísticas de contenedores (CPU, RAM, Red)

**Ejemplo de uso**:
```
Seleccione una opción [0-9]: 9

═══════════════════════════════════════════
ℹ️  INFORMACIÓN DEL SISTEMA
═══════════════════════════════════════════

▶ Versión de Docker:
Docker version 24.0.5, build ced0996

▶ Versión de Docker Compose:
Docker Compose version v2.20.2

▶ Sistema Operativo:
Linux raspberrypi 6.1.21-v8+ #1642 SMP PREEMPT aarch64 GNU/Linux

▶ Uso de Disco:
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        29G   12G   16G  43% /

▶ Estadísticas de Contenedores:
CONTAINER        CPU %   MEM USAGE / LIMIT     MEM %   NET I/O
euforia-api      2.5%    156MiB / 3.7GiB      4.12%   1.2MB / 850kB
euforia-nginx    0.1%    12MiB / 3.7GiB       0.32%   980kB / 1.1MB
...
```

**Interpretar estadísticas**:
- **CPU %**: < 50% es normal, > 80% indica sobrecarga
- **MEM %**: < 60% es normal, > 80% considerar optimizar
- **Disk Use %**: > 85% requiere limpieza de archivos

---

### Códigos de Color del Menú

El script usa colores para mejorar la legibilidad:

- 🔴 **ROJO**: Errores y advertencias críticas
- 🟢 **VERDE**: Operaciones exitosas y confirmaciones
- 🟡 **AMARILLO**: Advertencias y confirmaciones requeridas
- 🔵 **AZUL**: Información y títulos de sección
- 🟣 **PÚRPURA**: Encabezados principales del menú
- 🔷 **CYAN**: Mensajes informativos y ayuda

---

### Errores Comunes

**Error: "docker: command not found"**
```
❌ Error: Docker no está instalado o no está en el PATH
```

**Solución**:
```bash
# Verificar instalación de Docker
which docker

# Verificar que el usuario está en el grupo docker
groups | grep docker

# Si no está, agregarlo
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar
```

---

**Error: "Cannot connect to the Docker daemon"**
```
❌ Error: Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**Solución**:
```bash
# Iniciar el servicio de Docker
sudo systemctl start docker

# Habilitar Docker al inicio
sudo systemctl enable docker
```

---

**Error: "deploy.sh: No such file or directory"**
```
❌ Error: No se encontró ./deploy.sh
```

**Solución**:
- Verificar que estás en el directorio raíz del proyecto
- El archivo debe existir: `ls -l deploy.sh`
- Si no existe, restaurar desde Git

---

**Error: "Container euforia-api-prod is not running"**
```
❌ Error: el contenedor euforia-api-prod no está corriendo
```

**Solución**:
1. Verificar estado: opción 5 del menú
2. Ver logs: opción 4 del menú
3. Intentar reiniciar: opción 6
4. Si persiste: deployment completo (opción 1)

---

### Casos de Uso Frecuentes

#### Escenario 1: Actualizar la aplicación
```
1. Opción 1: Ejecutar Deployment Completo
2. Esperar 5-10 minutos
3. Opción 5: Verificar estado de servicios
4. Opción 4: Revisar logs si hay problemas
```

#### Escenario 2: Olvidé el password de admin
```
1. Opción 2: Resetear Password de Admin
2. Ingresar nuevo password
3. Confirmar operación
4. Usar nuevas credenciales en el panel
```

#### Escenario 3: Investigar un error reportado
```
1. Opción 4: Ver Logs del Sistema
2. Buscar mensajes de error
3. Opción 5: Verificar estado de servicios
4. Opción 6: Reiniciar servicios si es necesario
```

#### Escenario 4: Consultar datos en la base de datos
```
1. Opción 3: Abrir Prisma Studio
2. Abrir navegador en http://localhost:5555
3. Explorar tablas y registros
4. Ctrl+C para cerrar cuando termines
```

#### Escenario 5: Mantenimiento preventivo
```
1. Opción 7: Backup Manual de Base de Datos
2. Opción 1: Ejecutar Deployment Completo
3. Opción 5: Verificar estado de servicios
4. Opción 4: Revisar logs
```

---

### Notas de Seguridad

⚠️ **IMPORTANTE**:

1. **Acceso SSH**: Solo personal autorizado debe tener acceso SSH al Raspberry Pi
2. **Passwords**: Usar passwords fuertes y cambiarlos regularmente
3. **Backups**: Mantener backups en ubicación externa (USB, nube)
4. **Prisma Studio**: No exponer el puerto 5555 a internet
5. **Logs**: Los logs pueden contener información sensible, no compartir públicamente
6. **Confirmaciones**: Siempre leer las advertencias antes de confirmar operaciones

---

### Atajos de Teclado

Mientras el script está corriendo:

- **Ctrl+C**: Cancelar operación actual (excepto en Prisma Studio)
- **Ctrl+D**: Salir del menú (equivalente a opción 0)
- **Enter**: Aceptar opción por defecto en confirmaciones

---

### Logs del Script

El script muestra mensajes descriptivos en cada operación:

```
[11/12/2024 10:30:15] Iniciando deployment...
[11/12/2024 10:30:20] Creando backup de base de datos...
[11/12/2024 10:30:25] Backup creado: backups/euforia.db.backup-20241211-103025
[11/12/2024 10:30:30] Ejecutando git pull...
...
```

---

### Mejoras Futuras Propuestas

Ideas para versiones futuras del script:

- [ ] Programar backups automáticos (cron)
- [ ] Notificaciones por email en errores
- [ ] Visualización de métricas del sistema (uptime, temperatura)
- [ ] Gestión de usuarios (crear, editar, listar)
- [ ] Exportar/importar configuración
- [ ] Verificación de actualizaciones disponibles
- [ ] Restauración de backups desde el menú
- [ ] Limpieza automática de logs antiguos
- [ ] Generación de reportes de uso

---

### Historial de Cambios

- **11/12/2024**: Creación del script admin.sh v1.0
  - 9 opciones de menú
  - Integración con deploy.sh
  - Reset de password de admin
  - Acceso a Prisma Studio
  - Gestión de logs y servicios
  - Backups manuales
  - Información del sistema

---

## NOTAS GENERALES

### Acceso SSH al Raspberry Pi

```bash
# Via IP local
ssh euforia@192.168.1.XXX

# Via Tailscale
ssh euforia@100.X.Y.Z
```

### Verificación de Servicios

```bash
# Estado de todos los contenedores
docker ps -a

# Logs en tiempo real
docker logs euforia-api-prod -f

# Uso de recursos
docker stats
```

### Contactos de Emergencia

- **Administrador Sistema**: [Pendiente]
- **Soporte Técnico**: [Pendiente]
- **GitHub Issues**: https://github.com/[usuario]/EuforiaEvents/issues

---

## CONTRIBUIR A ESTA DOCUMENTACIÓN

Para agregar nuevas rutinas:

1. Crear una nueva sección con numeración consecutiva
2. Incluir: Descripción, Uso, Ejemplos, Errores Comunes
3. Actualizar la Tabla de Contenidos
4. Actualizar la fecha de "Última actualización"
5. Hacer commit con mensaje descriptivo

**Formato de sección**:

```markdown
## X. NOMBRE DE LA RUTINA

### Descripción
[Breve descripción de qué hace]

### Uso
[Comandos y ejemplos]

### Errores Comunes
[Problemas frecuentes y soluciones]

### Notas de Seguridad
[Consideraciones importantes]
```

---

**Fin del documento**

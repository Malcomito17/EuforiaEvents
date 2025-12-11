# RUTINAS INTERNAS - EUFORIA EVENTS

Documentación de procedimientos internos para administración y mantenimiento del sistema.

**Última actualización**: 11 de Diciembre de 2024

---

## TABLA DE CONTENIDOS

1. [Reset de Password](#1-reset-de-password)
2. [Deployment en Producción](#2-deployment-en-producción)
3. [Backup de Base de Datos](#3-backup-de-base-de-datos)

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

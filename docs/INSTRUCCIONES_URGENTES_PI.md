# INSTRUCCIONES URGENTES - Raspberry Pi

## 🚨 ESTADO ACTUAL

- **Base de datos VACÍA** (0 usuarios)
- **Dependencias faltantes** en contenedor Docker (solo prettier y turbo)
- **No se puede acceder al sistema** (credenciales inválidas)

---

## ✅ SOLUCIÓN INMEDIATA (EN LA RASPBERRY PI)

### 1. Crear usuario admin AHORA

Ejecuta este comando en la Raspberry Pi:

```bash
docker exec euforia-api-prod node -e "const { PrismaClient } = require('@prisma/client'); const bcrypt = require('bcryptjs'); const prisma = new PrismaClient(); (async () => { const hash = bcrypt.hashSync('admin123', 10); await prisma.user.create({ data: { username: 'admin', email: 'admin@euforiaevents.com', password: hash, role: 'ADMIN' } }); console.log('✅ Usuario admin creado'); await prisma.\$disconnect(); })();"
```

**Credenciales:**
- Usuario: `admin`
- Contraseña: `admin123`

### 2. Verificar que se creó

```bash
docker exec euforia-api-prod node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const users = await prisma.user.findMany(); console.log('Usuarios en DB:', JSON.stringify(users, null, 2)); await prisma.\$disconnect(); })();"
```

Deberías ver 1 usuario con username "admin".

---

## 🔧 SOLUCIÓN PERMANENTE (DEPLOYMENT COMPLETO)

He identificado y corregido el problema raíz en el Dockerfile:

### Problema identificado:
El `Dockerfile.api.prod` estaba instalando dependencias solo del workspace ROOT (que solo tiene prettier y turbo), no del workspace API (que tiene bcryptjs, express, etc.).

### Solución aplicada:
- ✅ Modificado `docker/Dockerfile.api.prod` para instalar TODAS las dependencias de todos los workspaces
- ✅ Modificado `deploy.sh` para auto-seed si la DB está vacía
- ✅ Commits subidos a GitHub

### Para aplicar el fix en Raspberry Pi:

```bash
cd ~/projects/EuforiaEvents

# 1. Git pull
git pull origin main

# 2. Deployment completo con rebuild
./deploy.sh --auto
```

El script ahora:
1. Hará backup de la DB si tiene datos
2. Descargará cambios de GitHub
3. Rebuildeará las imágenes Docker con las correcciones
4. Levantará los servicios
5. **AUTO-SEEDERÁ** la base de datos si está vacía
6. Verificará que todo esté funcionando

---

## 📋 VERIFICACIÓN POST-DEPLOYMENT

### 1. Verificar dependencias instaladas

```bash
docker exec euforia-api-prod ls /app/node_modules | head -20
```

Deberías ver MUCHOS paquetes, incluyendo:
- bcryptjs
- express
- prisma
- socket.io
- jsonwebtoken
- etc.

### 2. Verificar usuarios en DB

```bash
docker exec euforia-api-prod node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const count = await prisma.user.count(); console.log('Total usuarios:', count); await prisma.\$disconnect(); })();"
```

Debería mostrar al menos 1 usuario.

### 3. Verificar que el API responde

```bash
curl http://localhost:3000/health
```

Debería devolver status: ok

### 4. Probar login

Accede a: `http://[IP-RASPBERRY-PI]/operator`

Credenciales:
- Usuario: `admin`
- Contraseña: `admin123`

---

## 🛠️ HERRAMIENTAS ADICIONALES

### Resetear contraseña de admin

Si en el futuro necesitas cambiar la contraseña de admin:

```bash
cd ~/projects/EuforiaEvents
./reset-admin-password.sh NUEVA_CONTRASEÑA
```

O usando el menú interactivo:

```bash
./admin.sh
# Opción 1: Resetear contraseña de admin
```

---

## 📊 DIAGNÓSTICO (si algo falla)

### Ver logs del API

```bash
docker logs euforia-api-prod --tail 50
```

### Ver estado de contenedores

```bash
docker ps -a | grep euforia
```

### Entrar al contenedor para debugging

```bash
docker exec -it euforia-api-prod bash
```

Dentro del contenedor:
```bash
# Ver dependencias instaladas
ls /app/node_modules

# Ver usuarios en DB
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); (async () => { const users = await prisma.user.findMany(); console.log(JSON.stringify(users, null, 2)); await prisma.\$disconnect(); })();"

# Verificar Prisma
npx prisma studio --browser none
```

---

## 🎯 RESUMEN EJECUTIVO

### Problemas corregidos:
1. ✅ Dockerfile ahora instala TODAS las dependencias correctamente
2. ✅ deploy.sh ahora auto-seedea la base de datos si está vacía
3. ✅ Script inmediato para crear admin sin rebuild

### Próximos pasos:
1. **INMEDIATO**: Ejecutar comando de creación de admin (sección 1 arriba)
2. **PRONTO**: Hacer deployment completo con `./deploy.sh --auto` para aplicar fix permanente
3. **VERIFICAR**: Que todo funcione correctamente después del deployment

---

## ❓ SI ALGO NO FUNCIONA

Si después de seguir estas instrucciones aún hay problemas:

1. Verifica logs: `docker logs euforia-api-prod`
2. Verifica estado: `docker ps -a | grep euforia`
3. Reinicia contenedores: `docker restart euforia-api-prod`
4. Si persiste: `./deploy.sh --auto` (deployment completo)

---

**Última actualización**: 2025-12-12
**Commits relacionados**:
- `0df1f4e` - fix(docker): properly install all workspace dependencies
- `184988f` - fix: auto-seed database if empty during deployment

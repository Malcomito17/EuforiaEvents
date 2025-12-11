# Guía de Testing y Deployment - Euforia Events

## 📋 Tabla de Contenidos
1. [Errores Comunes y Prevención](#errores-comunes)
2. [Checklist Pre-Deployment](#checklist-pre-deployment)
3. [Procedimientos de Testing Esenciales](#testing-esenciales)
4. [Buenas Prácticas de Desarrollo](#buenas-practicas)
5. [Scripts de Verificación Automática](#scripts-verificacion)

---

## 🚨 Errores Comunes y Prevención

### 1. Errores de Imports - MODULE_NOT_FOUND

**Síntoma**: `Error: Cannot find module '../../middleware/auth'`

**Causa Raíz**: Rutas relativas incorrectas en imports de TypeScript/JavaScript

**Prevención**:
```typescript
// ❌ MAL - Asume ubicación incorrecta
import { authenticate } from '../auth'
import { authenticate } from '../../middleware/auth'

// ✅ BIEN - Verifica la ruta real del módulo
import { authenticate } from '../auth/auth.middleware'
import { isAuthenticated } from '../../modules/auth/auth.middleware'
```

**Verificación Rápida**:
```bash
# Buscar todos los imports de auth para verificar
cd apps/api
grep -r "from.*auth" src/ | grep import
```

**Archivos Críticos a Revisar**:
- `apps/api/src/modules/*/routes.ts` - Rutas de módulos
- `apps/api/src/socket/handlers/*.handler.ts` - Handlers de socket

---

### 2. Servidor API No Iniciado

**Síntoma**: `AggregateError [ECONNREFUSED]` en web-operator o web-client

**Causa Raíz**: API server no está corriendo o murió silenciosamente

**Prevención**:
```bash
# Antes de trabajar, SIEMPRE verificar procesos activos
ps aux | grep "tsx.*server.ts"
lsof -i :3000  # Verificar puerto de API

# Ver logs del servidor API
cd apps/api
NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx watch src/server.ts
```

**Indicadores de Salud del Servidor**:
- ✅ Mensaje: `🚀 EUFORIA API corriendo en http://localhost:3000`
- ✅ Socket.io conectado
- ✅ Puerto 3000 ocupado

---

### 3. Variables de Entorno Faltantes

**Síntoma**: Features de Spotify no funcionan, errores de autenticación

**Causa Raíz**: Environment variables no configuradas

**Variables Requeridas**:
```bash
# apps/api/.env
DATABASE_URL="file:./prisma/euforia.db"
JWT_SECRET="tu-secret-seguro-aqui"
SPOTIFY_CLIENT_ID="4b5dd84006a74b5a88379c5d12a08335"
SPOTIFY_CLIENT_SECRET="e811dcf747e245078883fb4c654d296a"
NODE_TLS_REJECT_UNAUTHORIZED=0  # Solo en desarrollo
```

**Verificación**:
```bash
# Verificar que las vars estén cargadas
node -e "console.log(process.env.SPOTIFY_CLIENT_ID)"
```

---

### 4. Errores de TypeScript No Detectados

**Síntoma**: Código compila pero falla en runtime

**Causa Raíz**: TypeScript en modo permisivo, tipos `any` excesivos

**Prevención**:
```bash
# Compilar TypeScript ANTES de commit
cd apps/api && npx tsc --noEmit
cd apps/web-operator && npx tsc --noEmit
cd apps/web-client && npx tsc --noEmit
```

**Reglas**:
- ❌ Evitar `any` cuando sea posible
- ✅ Usar tipos específicos o interfaces
- ✅ Habilitar strict mode en `tsconfig.json`

---

### 5. Base de Datos Desactualizada

**Síntoma**: Prisma errors sobre campos faltantes

**Causa Raíz**: Schema modificado pero migrations no aplicadas

**Prevención**:
```bash
# Después de modificar schema.prisma
cd apps/api
npx prisma migrate dev --name descripcion_del_cambio
npx prisma generate

# Verificar schema actual
npx prisma studio  # Inspeccionar visualmente
```

---

## ✅ Checklist Pre-Deployment

### Paso 1: Limpieza de Código

```bash
# [ ] Eliminar console.logs innecesarios
grep -r "console.log" apps/*/src | grep -v node_modules

# [ ] Eliminar código comentado viejo
grep -r "^[[:space:]]*//.*TODO\|FIXME" apps/*/src

# [ ] Verificar no hay secrets hardcodeados
grep -ri "password\|secret\|token" apps/*/src | grep -v node_modules
```

### Paso 2: Verificación de Tipos

```bash
# [ ] Compilar TypeScript en todos los proyectos
cd apps/api && npx tsc --noEmit || exit 1
cd ../web-operator && npx tsc --noEmit || exit 1
cd ../web-client && npx tsc --noEmit || exit 1
echo "✅ TypeScript compilation passed"
```

### Paso 3: Testing de Funcionalidad

```bash
# [ ] API health check
curl -s http://localhost:3000/api/health || echo "⚠️ API down"

# [ ] Test autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# [ ] Test módulos críticos
curl http://localhost:3000/api/events
curl http://localhost:3000/api/karaokeya/display/evento-test
```

### Paso 4: Verificación de Dependencias

```bash
# [ ] Actualizar lockfile si es necesario
pnpm install

# [ ] Verificar vulnerabilidades
pnpm audit

# [ ] Build de producción prueba
cd apps/api && npm run build || exit 1
```

### Paso 5: Git Pre-Commit

```bash
# [ ] Status limpio
git status

# [ ] No hay archivos sensibles en staging
git diff --cached | grep -i "password\|secret"

# [ ] Commit message descriptivo
git commit -m "tipo(modulo): descripcion clara"
# Ejemplos:
# - feat(karaokeya): add display screen control panel
# - fix(auth): correct import paths in routes
# - docs: add deployment checklist
```

---

## 🧪 Testing Esenciales

### Test Manual de Flujo Completo (KARAOKEYA)

**Duración**: ~5 minutos

1. **Operator Login**
   ```
   URL: http://localhost:5174/operador
   User: admin / admin123
   ✅ Login exitoso
   ✅ Redirect al dashboard
   ```

2. **Crear/Seleccionar Evento**
   ```
   ✅ Evento tiene módulo KARAOKEYA habilitado
   ✅ Config inicial cargada correctamente
   ```

3. **Panel de Control Display**
   ```
   ✅ Cambiar displayMode a BREAK
   ✅ Guardar configuración
   ✅ Mensaje de éxito visible
   ✅ Botón "Abrir Display" funciona
   ```

4. **Display Screen**
   ```
   URL: http://localhost:5173/display/evento-slug
   ✅ Muestra modo BREAK con mensaje correcto
   ✅ Cambiar a QUEUE desde operator
   ✅ Display se actualiza (polling cada 5s)
   ✅ Modo fullscreen funciona (F11)
   ```

5. **Socket.io Realtime**
   ```
   ✅ Conectado (ícono verde en operator)
   ✅ Nueva solicitud aparece en tiempo real
   ✅ Cambio de estado se refleja instantáneamente
   ```

---

### Test de Regresión Rápido

**Duración**: ~2 minutos antes de cada deployment

```bash
#!/bin/bash
# test-rapido.sh

echo "🧪 Test de Regresión Rápido"

# 1. API Health
API_HEALTH=$(curl -s http://localhost:3000/api/health)
if [ -z "$API_HEALTH" ]; then
  echo "❌ API no responde"
  exit 1
fi
echo "✅ API health OK"

# 2. Auth funciona
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Auth falló"
  exit 1
fi
echo "✅ Auth OK"

# 3. Endpoint protegido funciona
EVENTS=$(curl -s http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN")
if echo "$EVENTS" | grep -q "error"; then
  echo "❌ Endpoints protegidos fallan"
  exit 1
fi
echo "✅ Protected endpoints OK"

# 4. Socket.io disponible
SOCKET=$(curl -s http://localhost:3000/socket.io/)
if echo "$SOCKET" | grep -q "Upgrade Required"; then
  echo "✅ Socket.io OK"
else
  echo "⚠️ Socket.io puede tener problemas"
fi

echo ""
echo "✅ TODOS LOS TESTS PASARON"
```

Ejecutar antes de deployment:
```bash
chmod +x test-rapido.sh
./test-rapido.sh
```

---

## 📚 Buenas Prácticas de Desarrollo

### Estructura de Branches

```
main (producción) ← solo merges desde staging
  ↑
staging (pre-producción) ← integración de features
  ↑
feature/nombre-descriptivo ← desarrollo activo
```

**Workflow**:
```bash
# Nueva feature
git checkout -b feature/display-control-panel

# Desarrollo...
git add .
git commit -m "feat(karaokeya): add display control panel"

# Antes de merge
./test-rapido.sh
git checkout staging
git merge feature/display-control-panel
./test-rapido.sh  # Re-test en staging

# Deploy a producción (solo si staging es estable)
git checkout main
git merge staging --no-ff
```

---

### Nomenclatura de Commits

**Formato**: `tipo(scope): descripción en presente`

**Tipos**:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `refactor`: Refactorización sin cambio funcional
- `test`: Agregar tests
- `chore`: Cambios de build, deps, etc.

**Ejemplos**:
```bash
feat(karaokeya): add display screen with 4 modes
fix(auth): correct import paths in socket handlers
docs: add deployment testing checklist
refactor(api): extract config validation to separate file
test: add integration tests for MUSICADJ module
chore: update dependencies and lockfile
```

---

### Code Review Checklist

Antes de aprobar un PR, verificar:

- [ ] **Tipos**: No usa `any` sin justificación
- [ ] **Imports**: Rutas relativas correctas
- [ ] **Error Handling**: Try-catch en funciones async
- [ ] **Logs**: Console.logs removidos (usar logger en producción)
- [ ] **Secrets**: No hay credenciales hardcodeadas
- [ ] **Tests**: Funcionalidad testeada manualmente
- [ ] **Database**: Migrations aplicadas si hay cambios de schema
- [ ] **Docs**: README actualizado si es feature nueva
- [ ] **Naming**: Variables y funciones con nombres descriptivos
- [ ] **Comments**: Código complejo tiene comentarios explicativos

---

## 🤖 Scripts de Verificación Automática

### Script: `verify-imports.sh`

Detecta imports incorrectos de auth middleware:

```bash
#!/bin/bash
# verify-imports.sh

echo "🔍 Verificando imports de auth middleware..."

INCORRECT_IMPORTS=$(grep -r "from.*['\"]\.\.\/auth['\"]" apps/api/src/ 2>/dev/null || true)
INCORRECT_IMPORTS2=$(grep -r "from.*middleware\/auth" apps/api/src/ 2>/dev/null || true)

if [ -n "$INCORRECT_IMPORTS" ] || [ -n "$INCORRECT_IMPORTS2" ]; then
  echo "❌ Imports incorrectos detectados:"
  echo "$INCORRECT_IMPORTS"
  echo "$INCORRECT_IMPORTS2"
  echo ""
  echo "Debe ser:"
  echo "  import { authenticate } from '../auth/auth.middleware'"
  echo "  import { isAuthenticated } from '../../modules/auth/auth.middleware'"
  exit 1
fi

echo "✅ Todos los imports de auth son correctos"
```

---

### Script: `check-servers.sh`

Verifica que todos los servidores necesarios estén corriendo:

```bash
#!/bin/bash
# check-servers.sh

echo "🔍 Verificando servidores..."

# API (puerto 3000)
if lsof -i :3000 > /dev/null 2>&1; then
  echo "✅ API Server (puerto 3000) - CORRIENDO"
else
  echo "❌ API Server (puerto 3000) - DETENIDO"
  echo "   Iniciar con: cd apps/api && npx tsx watch src/server.ts"
  exit 1
fi

# Web Client (puerto 5173)
if lsof -i :5173 > /dev/null 2>&1; then
  echo "✅ Web Client (puerto 5173) - CORRIENDO"
else
  echo "⚠️  Web Client (puerto 5173) - DETENIDO"
fi

# Web Operator (puerto 5174)
if lsof -i :5174 > /dev/null 2>&1; then
  echo "✅ Web Operator (puerto 5174) - CORRIENDO"
else
  echo "⚠️  Web Operator (puerto 5174) - DETENIDO"
fi

echo ""
echo "✅ Verificación de servidores completa"
```

---

### Script: `pre-deploy.sh`

Script completo para ejecutar antes de cada deployment:

```bash
#!/bin/bash
# pre-deploy.sh

set -e  # Exit on error

echo "🚀 Pre-Deployment Verification"
echo "=============================="
echo ""

# 1. Verificar imports
echo "1️⃣ Verificando imports..."
./docs/verify-imports.sh
echo ""

# 2. Verificar servidores
echo "2️⃣ Verificando servidores..."
./docs/check-servers.sh
echo ""

# 3. TypeScript compilation
echo "3️⃣ Compilando TypeScript..."
cd apps/api && npx tsc --noEmit
cd ../web-operator && npx tsc --noEmit
cd ../web-client && npx tsc --noEmit
cd ../..
echo "✅ TypeScript compilation passed"
echo ""

# 4. Tests de API
echo "4️⃣ Testeando API..."
./docs/test-rapido.sh
echo ""

# 5. Verificar git status
echo "5️⃣ Verificando git status..."
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Tienes cambios sin commitear"
  git status --short
  exit 1
fi
echo "✅ Git status limpio"
echo ""

echo "=============================="
echo "✅ ¡TODO LISTO PARA DEPLOYMENT!"
echo "=============================="
```

**Uso**:
```bash
chmod +x docs/*.sh
./docs/pre-deploy.sh
```

---

## 🎯 Resumen de Comandos Esenciales

### Desarrollo Diario

```bash
# Iniciar ambiente completo
cd apps/api && NODE_TLS_REJECT_UNAUTHORIZED=0 npx tsx watch src/server.ts &
cd apps/web-client && pnpm dev &
cd apps/web-operator && pnpm dev &

# Verificar que todo corre
./docs/check-servers.sh

# Aplicar cambios de DB
cd apps/api && npx prisma migrate dev --name nombre_cambio
```

### Pre-Commit

```bash
# Verificación rápida
./docs/verify-imports.sh
cd apps/api && npx tsc --noEmit

# Test manual de feature
# (seguir checklist de testing manual)
```

### Pre-Deployment

```bash
# Verificación completa
./docs/pre-deploy.sh

# Si pasa, proceder con deployment
git push origin main
```

---

## 📞 Troubleshooting Rápido

**Problema**: API no inicia
```bash
# Verificar puerto libre
lsof -i :3000
kill -9 <PID>  # Si está ocupado

# Ver error exacto
cd apps/api && npx tsx src/server.ts
```

**Problema**: Frontend no conecta a API
```bash
# Verificar proxy en vite.config.ts
# Debe apuntar a http://localhost:3000

# Verificar CORS en apps/api/src/app.ts
# Debe permitir origin del frontend
```

**Problema**: Socket.io desconectado
```bash
# Verificar handler registrado
grep -r "registerKaraokeyaHandlers\|registerMusicadjHandlers" apps/api/src/

# Verificar cliente conecta a room correcto
# Frontend debe emitir 'karaokeya:join' con eventId
```

**Problema**: Prisma errors
```bash
# Regenerar cliente
cd apps/api && npx prisma generate

# Reset DB (CUIDADO: borra datos)
npx prisma migrate reset

# Ver DB actual
npx prisma studio
```

---

## 📅 Mantenimiento Periódico

### Semanal
- [ ] Revisar logs de producción
- [ ] Actualizar dependencies (`pnpm update`)
- [ ] Revisar issues/bugs reportados

### Mensual
- [ ] Audit de seguridad (`pnpm audit`)
- [ ] Review de performance (DB queries, bundle size)
- [ ] Backup de base de datos

### Antes de Release Mayor
- [ ] Tests end-to-end completos
- [ ] Load testing (si aplica)
- [ ] Actualizar documentación
- [ ] Changelog actualizado

---

## 🔗 Referencias

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Prisma Migration Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Git Commit Message Convention](https://www.conventionalcommits.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Última actualización**: 2025-12-11
**Mantenido por**: Equipo Euforia Events

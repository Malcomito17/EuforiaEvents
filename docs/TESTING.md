# EUFORIA EVENTS - Guía de Testing Completo
## Actualizado: 2025-12-04

---

## 1. SETUP DEL ENTORNO

### 1.1 Clonar y Preparar

```bash
# Clonar repositorio
git clone https://github.com/Malcomito17/EuforiaEvents.git
cd EuforiaEvents

# Instalar dependencias (usar npx si pnpm no está en PATH)
npx pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar .env con JWT_SECRET y credenciales si es necesario
```

### 1.2 Iniciar Servicios

```bash
# Terminal 1: Backend API (puerto 3000)
cd apps/api
npx pnpm dev

# Terminal 2: Frontend Operador (puerto 5174)
cd apps/web-operator
npx pnpm dev

# Terminal 3: Frontend Cliente (puerto 5173)
cd apps/web-client
npx pnpm dev
```

### 1.3 Seed de Base de Datos

```bash
cd apps/api
npx pnpm db:push    # Crear tablas
npx pnpm db:seed    # Crear usuarios admin/operator
```

---

## 2. CREDENCIALES DE PRUEBA

| Usuario | Password | Rol | Acceso |
|---------|----------|-----|--------|
| admin | admin123 | ADMIN | Todo el sistema |
| operator | operator123 | OPERATOR | MUSICADJ + KARAOKEYA |

---

## 3. TESTING POR MÓDULO

### 3.1 Autenticación (Fase 0)

| Test | Endpoint/Acción | Resultado Esperado |
|------|-----------------|-------------------|
| Login admin | POST /api/auth/login | Token JWT válido |
| Login operador | POST /api/auth/login | Token JWT válido |
| Login inválido | POST /api/auth/login (password mal) | Error 401 |
| Ver perfil | GET /api/auth/me (con token) | Datos del usuario |
| Acceso sin token | GET /api/events | Error 401 |

```bash
# Test rápido de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

### 3.2 Gestión de Eventos (Fase 1)

**Frontend:** http://localhost:5174

| Test | Acción | Resultado Esperado |
|------|--------|-------------------|
| Crear evento | Dashboard → + Nuevo Evento | Formulario de creación |
| Llenar datos | Nombre, fechas, venue, cliente | Evento creado con slug |
| Ver lista | Dashboard | Lista de eventos con filtros |
| Editar evento | Click en evento → Editar | Formulario con datos |
| Cambiar estado | Botón de estado | DRAFT → ACTIVE → PAUSED → FINISHED |
| Duplicar evento | Menú → Duplicar | Copia con "-copia" en slug |
| Ver QR | Evento activo | QR con URL del evento |

---

### 3.3 Módulo MUSICADJ (Fase 2)

**Operador:** http://localhost:5174/events/{eventId}/musicadj
**Cliente:** http://localhost:5173/e/{slug}/musicadj

| Test | Rol | Acción | Resultado Esperado |
|------|-----|--------|-------------------|
| Config inicial | Operador | Acceder a MUSICADJ | Módulo habilitado por defecto |
| Buscar tema | Cliente | Escribir en búsqueda | Resultados de Spotify |
| Pedir tema | Cliente | Seleccionar y enviar | Pedido confirmado |
| Ver pedido | Operador | Lista de pedidos | Pedido aparece en tiempo real |
| Cambiar estado | Operador | Click en estados | PENDING → HIGHLIGHTED → PLAYED |
| Descartar | Operador | Marcar como descartado | Pasa a pestaña Descartados |
| Drag & drop | Operador | Arrastrar pedido | Reordenar prioridad |
| Export CSV | Operador | Botón descargar | CSV con todos los pedidos |
| Cooldown | Cliente | Pedir segundo tema rápido | Mensaje de espera |

---

### 3.4 Módulo KARAOKEYA (Fase 3)

**Operador:** http://localhost:5174/events/{eventId}/karaokeya
**Cliente:** http://localhost:5173/e/{slug}/karaokeya
**Display:** http://localhost:5173/e/{slug}/karaokeya/display

#### 3.4.1 Flujo de Anotación (Cliente)

| Paso | Acción | Resultado |
|------|--------|-----------|
| 1 | Acceder a /e/{slug}/karaokeya | Formulario de anotación |
| 2 | Llenar nombre, canción, contacto | Validación OK |
| 3 | Click "Anotarme" | Redirige a success con turno |
| 4 | Click "Ver mi turno" | Página de estado del turno |

#### 3.4.2 Gestión de Cola (Operador)

| Test | Acción | Resultado |
|------|--------|-----------|
| Ver cola | Acceder a KARAOKEYA | Lista de turnos |
| Llamar siguiente | Botón "Llamar" | Status → CALLED |
| Subir al escenario | Click ON_STAGE | Status → ON_STAGE |
| Completar | Click COMPLETED | Status → COMPLETED |
| No presente | Click NO_SHOW | Status → NO_SHOW |
| Cancelar | Click CANCELLED | Status → CANCELLED |
| Reordenar | Drag & drop | Nueva posición en cola |
| Configurar | Botón Settings | Modal de configuración |
| Export CSV | Botón Download | CSV con todos los turnos |

#### 3.4.3 Display Público

| Test | Acción | Resultado |
|------|--------|-----------|
| Acceder | /e/{slug}/karaokeya/display | Pantalla de proyección |
| Cantante actual | Turno en ON_STAGE | Nombre grande, canción visible |
| Próximo | Primer QUEUED o CALLED | Tarjeta "Siguiente" |
| Cola | QUEUED restantes | Lista lateral |
| Auto-refresh | Esperar 5 segundos | Se actualiza solo |
| Sin turnos | Cola vacía | "Escenario libre" |

#### 3.4.4 Tiempo Real

| Test | Acción | Resultado |
|------|--------|-----------|
| Nuevo turno | Cliente anota | Aparece en operador sin refresh |
| Cambio estado | Operador cambia | Display y cliente se actualizan |
| Llamar turno | Operador llama | Cliente ve "¡Es tu turno!" |

---

## 4. TESTS DE INTEGRACIÓN

### 4.1 Flujo Completo de Evento

```
1. Admin crea evento "Fiesta Test 2025"
   → Slug generado: fiesta-test-2025-XXXX

2. Admin activa MUSICADJ y KARAOKEYA
   → Ambos módulos habilitados

3. Compartir URL del QR a clientes
   → http://localhost:5173/e/fiesta-test-2025-XXXX

4. Cliente A pide "Despacito" en MUSICADJ
   → Operador ve pedido en tiempo real

5. Cliente B se anota para karaoke "Bohemian Rhapsody"
   → Turno #1 asignado

6. Cliente C se anota para karaoke "Sweet Child O'Mine"
   → Turno #2 asignado

7. Operador abre display en pantalla del salón
   → http://localhost:5173/e/fiesta-test-2025-XXXX/karaokeya/display

8. Operador llama Turno #1
   → Cliente B ve "¡Es tu turno!" en su celular
   → Display muestra Cliente B como próximo

9. Operador marca ON_STAGE
   → Display muestra Cliente B cantando

10. Operador marca COMPLETED
    → Cliente B ve "Completado"
    → Turno #2 pasa a ser próximo

11. Al finalizar, operador exporta CSVs
    → Registro de todos los pedidos y turnos
```

---

## 5. TESTS DE EDGE CASES

| Escenario | Test | Comportamiento Esperado |
|-----------|------|------------------------|
| Sin internet | Cortar conexión | Mensaje de error, reintento automático |
| Evento pausado | Pausar evento | Clientes ven "Evento pausado" |
| Módulo deshabilitado | Deshabilitar KARAOKEYA | Display muestra "Karaoke pausado" |
| Cooldown activo | Intentar anotar antes del tiempo | Mensaje con tiempo restante |
| Turno duplicado | Mismo email intenta anotarse | Depende de config maxPerPerson |
| Slug inválido | Acceder a /e/no-existe | Página 404 |

---

## 6. COMANDOS DE TESTING

### 6.1 API con cURL

```bash
# Obtener token
TOKEN=$(curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | \
  python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Listar eventos
curl -s http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Ver config de KARAOKEYA
curl -s http://localhost:3000/api/events/{EVENT_ID}/karaokeya/config \
  -H "Authorization: Bearer $TOKEN"

# Ver cola de karaoke
curl -s http://localhost:3000/api/events/{EVENT_ID}/karaokeya/queue \
  -H "Authorization: Bearer $TOKEN"

# Crear turno de karaoke
curl -X POST http://localhost:3000/api/events/{EVENT_ID}/karaokeya/requests \
  -H "Content-Type: application/json" \
  -d '{
    "singerName": "Test",
    "singerLastname": "User",
    "singerEmail": "test@test.com",
    "title": "Test Song",
    "artist": "Test Artist"
  }'

# Exportar CSV
curl -s http://localhost:3000/api/events/{EVENT_ID}/karaokeya/export \
  -H "Authorization: Bearer $TOKEN" \
  --output karaoke_export.csv
```

### 6.2 Prisma Studio (GUI de DB)

```bash
cd apps/api
npx pnpm db:studio
# Abre http://localhost:5555 con GUI de la base de datos
```

---

## 7. CHECKLIST DE RELEASE

### Pre-release

- [ ] Todos los tests manuales pasan
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del servidor
- [ ] CSVs se exportan correctamente
- [ ] Display se actualiza en tiempo real
- [ ] QR del evento lleva a la URL correcta
- [ ] Cooldowns funcionan correctamente
- [ ] Estados de turno se guardan correctamente

### Post-release

- [ ] Backup de base de datos
- [ ] Verificar logs de producción
- [ ] Monitorear uso de memoria
- [ ] Verificar funcionamiento offline (si aplica)

---

## 8. TROUBLESHOOTING

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| "Cannot connect to server" | API no está corriendo | Iniciar `npx pnpm dev` en apps/api |
| Token expirado | JWT venció | Volver a hacer login |
| Evento no aparece | No está ACTIVE | Cambiar estado a ACTIVE |
| QR no funciona | URL incorrecta | Verificar VITE_API_URL en .env |
| Display vacío | No hay turnos | Crear turnos de prueba |
| CSV vacío | No hay datos | Verificar que hay pedidos/turnos |

---

*Documento generado para EUFORIA EVENTS*
*Última actualización: 2025-12-04*

# Testing Guide - Euforia Events

Guía completa de testing para las funcionalidades de **KARAOKEYA** y **MUSICADJ**.

## Índice

- [Testing Automatizado](#testing-automatizado)
- [Testing Manual](#testing-manual)
- [Checklist de Funcionalidades](#checklist-de-funcionalidades)

---

## Testing Automatizado

### Pre-requisitos

1. **Servidor API corriendo**:
   ```bash
   cd apps/api
   pnpm dev
   ```
   Debe estar corriendo en `http://localhost:3000`

2. **Variables de entorno configuradas** en `apps/api/.env`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - Twilio (opcional para notificaciones WhatsApp/SMS)

### Scripts de Testing E2E

#### 1. Test KARAOKEYA (Completo)

```bash
cd /Users/malcomito/Projects/euforia-events
./docs/test-e2e-karaokeya.sh
```

**Qué prueba:**
- ✅ Get event by slug
- ✅ Get KARAOKEYA config (verificar que esté enabled)
- ✅ Identificación de guest
- ✅ Creación de solicitud de karaoke
- ✅ Obtener cola del guest
- ✅ Validación de datos inválidos
- ✅ Obtener estadísticas
- ✅ Cooldown entre solicitudes

**Nota**: Status updates, reorder queue y notificaciones requieren autenticación y deben testearse manualmente.

#### 2. Test MUSICADJ (Completo)

```bash
cd /Users/malcomito/Projects/euforia-events
./docs/test-e2e-client.sh
```

**Qué prueba:**
- ✅ Get event by slug
- ✅ Get MUSICADJ config
- ✅ Identificación de guest
- ✅ Creación de pedido de música
- ✅ Obtener pedidos del guest
- ✅ Cooldown entre pedidos

---

## Testing Manual

### Setup Inicial

1. **Iniciar todos los servicios**:

   ```bash
   # Terminal 1 - API
   cd apps/api
   pnpm dev

   # Terminal 2 - Web Client (Guest)
   cd apps/web-client
   pnpm dev

   # Terminal 3 - Web Operator
   cd apps/web-operator
   pnpm dev
   ```

2. **URLs de acceso**:
   - API: http://localhost:3000
   - Web Client (Guest): http://localhost:5173
   - Web Operator: http://localhost:5174

3. **Login Operator**:
   - Usuario: `admin`
   - Password: `euforia2025`

---

### Flujos de Testing Manual

#### A. KARAOKEYA - Flujo Completo

##### 1. Guest: Solicitar Karaoke

1. Abrir: `http://localhost:5173/e/evento-demo-2501/karaokeya`
2. Ingresar datos:
   - Email: `test-$(date +%s)@example.com`
   - Nombre: `Test User`
   - WhatsApp: `+54 9 2901 555000`
3. Buscar canción: `Bohemian Rhapsody`
4. Click "Pedir este tema"
5. **Verificar**:
   - ✅ Confirmación de solicitud
   - ✅ Redirección a "Mi Cola"
   - ✅ Solicitud aparece con status "En Cola"

##### 2. Operator: Ver y Gestionar Solicitudes

1. Abrir: `http://localhost:5174/events/{EVENT_ID}/karaokeya`
2. **Verificar**:
   - ✅ Solicitud aparece en tiempo real (sin refresh)
   - ✅ Stats actualizados (Total, En Cola)
   - ✅ Drag handle visible (icono ⋮⋮)
   - ✅ Estado actual: "En Cola"

##### 3. Operator: Cambiar Estado a "CALLED"

1. Click en botón "Llamado"
2. **Verificar**:
   - ✅ Status cambia a "Llamado" (amarillo)
   - ✅ Stats actualizados
   - ✅ Socket.io emite evento

##### 4. Guest: Recibir Notificación

1. En la vista "Mi Cola" (`/karaokeya/mi-cola`)
2. **Verificar**:
   - ✅ Banner "¡ES TU TURNO!" aparece (verde, animado)
   - ✅ Browser notification (si permisos habilitados)
   - ✅ Sonido de alerta
   - ✅ Vibración (en móvil)
   - ✅ WhatsApp/SMS (si Twilio configurado)

##### 5. Operator: Drag & Drop Reordering

1. En tab "En Cola"
2. Crear 2-3 solicitudes más
3. Arrastrar solicitud por el handle ⋮⋮
4. **Verificar**:
   - ✅ Cursor cambia a "grab"
   - ✅ Elemento se arrastra
   - ✅ Posición se actualiza
   - ✅ Socket.io emite evento de reorder
   - ✅ Guest ve el cambio en tiempo real

##### 6. Operator: Completar Flujo

1. Estado: CALLED → "En Escenario"
2. Estado: EN_STAGE → "Completado"
3. **Verificar**:
   - ✅ Stats actualizados en cada cambio
   - ✅ Guest ve cambios en tiempo real
   - ✅ Historial correcto en "Mi Cola"

---

#### B. MUSICADJ - Flujo Completo

##### 1. Guest: Pedir Música

1. Abrir: `http://localhost:5173/e/evento-demo-2501/musicadj`
2. Ingresar datos de guest
3. Buscar canción en Spotify: `Don't Stop Me Now`
4. Click "Pedir este tema"
5. **Verificar**:
   - ✅ Confirmación
   - ✅ Aparece en "Mis Pedidos"
   - ✅ Status inicial: "Pendiente"

##### 2. Operator: Gestionar Prioridades

1. Abrir: `http://localhost:5174/events/{EVENT_ID}/musicadj`
2. **Verificar**:
   - ✅ Pedido aparece en tiempo real
   - ✅ Drag handle visible en tab "Activos"
3. Cambiar prioridad:
   - Click "Destacado" (azul)
   - Click "Urgente" (rojo)
4. **Verificar**:
   - ✅ Color cambia
   - ✅ Guest ve el cambio en tiempo real

##### 3. Operator: Drag & Drop

1. Crear 2-3 pedidos más
2. Arrastrar por handle en tab "Activos"
3. **Verificar**:
   - ✅ Reordenamiento funciona
   - ✅ API actualizada
   - ✅ Real-time sync

##### 4. Operator: Marcar como Reproducido

1. Click "Reproducido"
2. **Verificar**:
   - ✅ Mueve a tab "Reproducidos"
   - ✅ Stats actualizados
   - ✅ Guest lo ve en historial

---

## Checklist de Funcionalidades

### KARAOKEYA

#### Backend (API)
- [x] Validación con Zod schemas
- [x] Endpoint: POST `/karaokeya/requests` (crear solicitud)
- [x] Endpoint: GET `/karaokeya/queue` (obtener cola)
- [x] Endpoint: PATCH `/karaokeya/requests/:id` (actualizar status)
- [x] Endpoint: POST `/karaokeya/reorder` (reordenar cola)
- [x] Endpoint: GET `/karaokeya/stats` (estadísticas)
- [x] Socket.io: emit `karaokeya:request:new`
- [x] Socket.io: emit `karaokeya:request:updated`
- [x] Socket.io: emit `karaokeya:queue:reordered`
- [x] Cooldown validation
- [x] Max per person validation
- [x] Twilio notifications (WhatsApp/SMS) - opcional

#### Frontend Cliente
- [x] Vista: Solicitar Karaoke (`/karaokeya`)
- [x] Vista: Mi Cola (`/karaokeya/mi-cola`)
- [x] Socket.io: listen `karaokeya:request:updated`
- [x] Socket.io: listen `karaokeya:request:new`
- [x] Browser notifications (permisos)
- [x] Audio alerts
- [x] Vibración (móvil)
- [x] Banner "¡ES TU TURNO!" cuando CALLED
- [x] Stats en tiempo real
- [x] Historial de solicitudes

#### Frontend Operador
- [x] Vista: Panel KARAOKEYA (`/events/:id/karaokeya`)
- [x] Drag & Drop con @dnd-kit
- [x] Drag handle (⋮⋮)
- [x] Tabs de filtrado (Todos, En Cola, En Escenario, etc.)
- [x] Status transitions (QUEUED → CALLED → ON_STAGE → COMPLETED)
- [x] Socket.io real-time updates
- [x] Stats cards
- [x] Search/filter

### MUSICADJ

#### Backend (API)
- [x] Validación con Zod schemas
- [x] Endpoint: POST `/musicadj/requests`
- [x] Endpoint: GET `/musicadj/requests`
- [x] Endpoint: PATCH `/musicadj/requests/:id`
- [x] Endpoint: POST `/musicadj/reorder`
- [x] Socket.io events
- [x] Cooldown validation

#### Frontend Cliente
- [x] Vista: Pedir Música (`/musicadj`)
- [x] Vista: Mis Pedidos (`/musicadj/mis-pedidos`)
- [x] Socket.io real-time
- [x] Spotify search integration

#### Frontend Operador
- [x] Vista: Panel MUSICADJ (`/events/:id/musicadj`)
- [x] Drag & Drop reordering
- [x] Priority management (Pendiente/Destacado/Urgente)
- [x] Socket.io real-time
- [x] Stats tracking

---

## Testing de Integraciones

### Socket.io Real-time

**Cómo testear**:
1. Abrir 2 ventanas: Guest + Operator
2. Crear solicitud en Guest
3. **Verificar**: Aparece en Operator sin refresh
4. Cambiar status en Operator
5. **Verificar**: Guest ve el cambio sin refresh

### Browser Notifications

**Cómo testear**:
1. Abrir "Mi Cola" en Guest
2. Click "Permitir notificaciones"
3. En Operator, cambiar status a CALLED
4. **Verificar**:
   - Notification aparece en browser
   - Sonido se reproduce
   - Dispositivo vibra (móvil)

### Twilio (Opcional)

**Cómo testear**:
1. Configurar `.env` con credenciales Twilio
2. Guest con WhatsApp válido en sandbox
3. Cambiar status a CALLED
4. **Verificar**:
   - Mensaje de WhatsApp recibido
   - SMS fallback (si WhatsApp falla)

**Script de test**:
```bash
cd apps/api
node test-twilio.js
# Ingresar número de WhatsApp
```

---

## Troubleshooting

### Socket.io no funciona
- Verificar CORS en API
- Verificar que Socket.io server esté corriendo
- Check browser console: `[Socket] Connected`

### Drag & Drop no funciona
- Verificar que @dnd-kit esté instalado
- Solo funciona en tab "Activos" / "En Cola"
- Requiere 8px de movimiento para activar

### Notificaciones no aparecen
- Verificar permisos del browser
- Verificar que página esté activa
- Check console para errors

### Twilio no envía mensajes
- Verificar credenciales en `.env`
- Número debe estar en sandbox (development)
- Enviar `join <palabra>` al sandbox primero
- Verificar logs en API console

---

## Próximos Pasos

### Testing Adicional Recomendado

1. **Load Testing**:
   - Múltiples guests simultáneos
   - Socket.io con 100+ conexiones
   - Drag & drop con 50+ items

2. **Mobile Testing**:
   - Notificaciones en iOS/Android
   - Vibración
   - Drag & drop táctil

3. **Edge Cases**:
   - Socket.io desconexión/reconexión
   - Offline mode
   - Rate limiting

4. **Security Testing**:
   - CSRF protection
   - Input sanitization
   - Auth bypass attempts

---

## Contacto

Para reportar bugs o sugerencias de testing:
- GitHub Issues: [repositorio]
- Email: [contacto]

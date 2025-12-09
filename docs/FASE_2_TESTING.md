# FASE 2 - MUSICADJ - TESTING GUIDE

**Fecha:** 2025-12-09
**Backend:** 100% Complete ✅ (v1.3 Guest model)
**Endpoints Tested:** All working ✅

---

## 📋 Estado del Backend

### ✅ Completado:
- Service layer con Guest model (v1.3)
- Controller con validación Zod
- Routes públicas + protegidas
- Socket.io integration
- Cooldown validation
- Spotify integration (opcional)
- Config management
- Stats aggregation

### 🔑 Arquitectura v1.3
Los requests ahora usan el **Guest model** en lugar de campos duplicados:

```typescript
// ✅ v1.3 Schema
{
  guestId: string,           // FK a Guest
  title: string,
  artist: string,
  spotifyId?: string,
  // ...
  guest: {                   // Relation incluida en responses
    id: string,
    displayName: string,
    email: string
  }
}
```

---

## 🧪 Testing Manual

### Setup Inicial

```bash
# Base URL
API_URL="http://localhost:3000"

# Credenciales de testing
USERNAME="admin"
PASSWORD="admin123"

# Login y obtener token
TOKEN=$(curl -s -X POST $API_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# IDs de prueba (del seed)
EVENT_ID="cmiy78sge0005jqvd8duq13yf"  # evento-demo-2501
```

---

## 📌 Endpoints Públicos (Cliente QR)

### 1. Identificar Guest

**Endpoint:** `POST /api/guests/identify`
**Auth:** None (público)

```bash
curl -X POST $API_URL/api/guests/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invitado@test.com",
    "displayName": "Pedro Test",
    "whatsapp": "+5492901555666"
  }'
```

**Response 200:**
```json
{
  "success": true,
  "guest": {
    "id": "cmiyiqtbr0000natja73jon0o",
    "email": "invitado@test.com",
    "displayName": "Pedro Test",
    "whatsapp": "+5492901555666",
    "createdAt": "2025-12-09T11:50:26.291Z"
  }
}
```

**Comportamiento:**
- Si el email existe, retorna el guest existente
- Si no existe, crea uno nuevo
- Actualiza `displayName` y `whatsapp` si cambió
- Actualiza `lastSeenAt`

---

### 2. Obtener Config del Módulo

**Endpoint:** `GET /api/events/:eventId/musicadj/config`
**Auth:** None (público)

```bash
curl "$API_URL/api/events/$EVENT_ID/musicadj/config"
```

**Response 200:**
```json
{
  "eventId": "cmiy78sge0005jqvd8duq13yf",
  "enabled": true,
  "cooldownSeconds": 60,
  "allowWithoutSpotify": true,
  "welcomeMessage": "¡Bienvenido! Pedí tu tema favorito 🎵",
  "showQueueToClient": false,
  "spotifyAvailable": true
}
```

**Uso:**
- Cliente verifica si el módulo está `enabled`
- Muestra `welcomeMessage` al usuario
- Valida `cooldownSeconds` en UI
- Verifica `spotifyAvailable` para habilitar búsqueda

---

### 3. Buscar Tracks en Spotify

**Endpoint:** `GET /api/events/:eventId/musicadj/search`
**Auth:** None (público)
**Query Params:**
- `q` (string, required): Búsqueda
- `limit` (number, optional): Límite de resultados (default: 10, max: 20)

```bash
curl "$API_URL/api/events/$EVENT_ID/musicadj/search?q=despacito&limit=5"
```

**Response 200 (si Spotify configurado):**
```json
{
  "tracks": [
    {
      "id": "6habFhsOp2NvshLv26DqMb",
      "name": "Despacito - Remix",
      "artists": ["Luis Fonsi", "Daddy Yankee", "Justin Bieber"],
      "album": "Despacito (Remix)",
      "albumArt": "https://i.scdn.co/image/ab67616d0000b273...",
      "spotifyUrl": "https://open.spotify.com/track/6habFhsOp2NvshLv26DqMb"
    }
  ]
}
```

**Response 503 (si Spotify NO configurado):**
```json
{
  "error": "Búsqueda de Spotify no disponible",
  "spotifyAvailable": false
}
```

---

### 4. Crear Solicitud de Canción

**Endpoint:** `POST /api/events/:eventId/musicadj/requests`
**Auth:** None (público)

```bash
GUEST_ID="cmiyiqtbr0000natja73jon0o"

# Con Spotify
curl -X POST "$API_URL/api/events/$EVENT_ID/musicadj/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"spotifyId\": \"6habFhsOp2NvshLv26DqMb\",
    \"title\": \"Despacito - Remix\",
    \"artist\": \"Luis Fonsi, Daddy Yankee\",
    \"albumArtUrl\": \"https://i.scdn.co/image/ab67616d0000b273...\"
  }"

# Sin Spotify (manual)
curl -X POST "$API_URL/api/events/$EVENT_ID/musicadj/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"title\": \"Bohemian Rhapsody\",
    \"artist\": \"Queen\"
  }"
```

**Response 201:**
```json
{
  "id": "cmiyirgbq0002natj9a7mezpo",
  "eventId": "cmiy78sge0005jqvd8duq13yf",
  "guestId": "cmiyiqtbr0000natja73jon0o",
  "spotifyId": null,
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "albumArtUrl": null,
  "status": "PENDING",
  "priority": 0,
  "createdAt": "2025-12-09T11:50:56.100Z",
  "updatedAt": "2025-12-09T11:50:56.100Z",
  "guest": {
    "id": "cmiyiqtbr0000natja73jon0o",
    "displayName": "Pedro Test",
    "email": "invitado@test.com"
  }
}
```

**Response 429 (Cooldown):**
```json
{
  "error": "Debes esperar 54 segundos antes de pedir otro tema"
}
```

**Response 400 (Validación):**
```json
{
  "error": "El evento no está activo"
}
// O
{
  "error": "El módulo de pedidos no está habilitado"
}
// O
{
  "error": "Guest no encontrado"
}
// O
{
  "error": "Debes seleccionar una canción de Spotify"
}
```

**Validaciones:**
- ✅ Evento debe existir y estar ACTIVE
- ✅ Módulo debe estar enabled
- ✅ Guest debe existir
- ✅ Cooldown (si configurado)
- ✅ spotifyId requerido si `allowWithoutSpotify: false`

---

### 5. Ver Requests del Guest

**Endpoint:** `GET /api/guests/:guestId/requests`
**Auth:** None (público)
**Query Params:**
- `eventId` (string, optional): Filtrar por evento

```bash
GUEST_ID="cmiyiqtbr0000natja73jon0o"

# Todos los requests del guest
curl "$API_URL/api/guests/$GUEST_ID/requests"

# Solo de un evento específico
curl "$API_URL/api/guests/$GUEST_ID/requests?eventId=$EVENT_ID"
```

**Response 200:**
```json
{
  "success": true,
  "requests": {
    "songs": [
      {
        "id": "cmiyirgbq0002natj9a7mezpo",
        "eventId": "cmiy78sge0005jqvd8duq13yf",
        "guestId": "cmiyiqtbr0000natja73jon0o",
        "title": "Bohemian Rhapsody",
        "artist": "Queen",
        "status": "HIGHLIGHTED",
        "priority": 0,
        "createdAt": "2025-12-09T11:50:56.100Z",
        "event": {
          "id": "cmiy78sge0005jqvd8duq13yf",
          "slug": "evento-demo-2501",
          "status": "ACTIVE",
          "eventData": {
            "eventName": "Evento Demo EUFORIA",
            "eventType": "CORPORATE",
            "startDate": "2025-12-09T06:28:29.575Z"
          }
        }
      }
    ],
    "karaoke": []
  }
}
```

**Uso:**
- Cliente ve "Mis Pedidos" con estado en tiempo real
- Incluye info del evento para contexto
- Separado: `songs` (MUSICADJ) y `karaoke` (KARAOKEYA)

---

## 🔐 Endpoints Protegidos (Operador)

**Requieren:**
- Header: `Authorization: Bearer <token>`
- Permisos: Usuario con acceso al módulo MUSICADJ

### 6. Actualizar Config

**Endpoint:** `PATCH /api/events/:eventId/musicadj/config`
**Auth:** Required (MUSICADJ module)

```bash
curl -X PATCH "$API_URL/api/events/$EVENT_ID/musicadj/config" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "cooldownSeconds": 120,
    "allowWithoutSpotify": false,
    "welcomeMessage": "Pedí tu canción favorita!",
    "showQueueToClient": true
  }'
```

**Response 200:**
```json
{
  "eventId": "cmiy78sge0005jqvd8duq13yf",
  "enabled": true,
  "cooldownSeconds": 120,
  "allowWithoutSpotify": false,
  "welcomeMessage": "Pedí tu canción favorita!",
  "showQueueToClient": true
}
```

**Socket.io Emission:**
```typescript
io.to(`event:${eventId}`).emit('musicadj:configUpdated', config)
```

---

### 7. Listar Requests

**Endpoint:** `GET /api/events/:eventId/musicadj/requests`
**Auth:** Required
**Query Params:**
- `status` (SongRequestStatus, optional): Filtrar por estado
- `search` (string, optional): Buscar en título, artista, guest
- `limit` (number, optional): Límite (default: 50, max: 100)
- `offset` (number, optional): Offset para paginación

```bash
# Todos
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/requests"

# Solo PENDING
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/requests?status=PENDING"

# Buscar "queen"
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/requests?search=queen"

# Con paginación
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/requests?limit=20&offset=0"
```

**Response 200:**
```json
{
  "requests": [
    {
      "id": "cmiyirgbq0002natj9a7mezpo",
      "eventId": "cmiy78sge0005jqvd8duq13yf",
      "guestId": "cmiyiqtbr0000natja73jon0o",
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "status": "HIGHLIGHTED",
      "priority": 0,
      "createdAt": "2025-12-09T11:50:56.100Z",
      "updatedAt": "2025-12-09T11:52:34.541Z",
      "guest": {
        "id": "cmiyiqtbr0000natja73jon0o",
        "displayName": "Pedro Test",
        "email": "invitado@test.com"
      }
    }
  ],
  "total": 1,
  "stats": {
    "total": 1,
    "pending": 0,
    "highlighted": 1,
    "urgent": 0,
    "played": 0,
    "discarded": 0
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

**Ordenamiento:**
1. Por `priority` (desc) - Mayor prioridad primero
2. Por `createdAt` (asc) - Más antiguo primero

---

### 8. Obtener Request por ID

**Endpoint:** `GET /api/events/:eventId/musicadj/requests/:requestId`
**Auth:** Required

```bash
REQUEST_ID="cmiyirgbq0002natj9a7mezpo"

curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/requests/$REQUEST_ID"
```

**Response 200:**
```json
{
  "id": "cmiyirgbq0002natj9a7mezpo",
  "eventId": "cmiy78sge0005jqvd8duq13yf",
  "guestId": "cmiyiqtbr0000natja73jon0o",
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "status": "HIGHLIGHTED",
  "priority": 0,
  "createdAt": "2025-12-09T11:50:56.100Z",
  "updatedAt": "2025-12-09T11:52:34.541Z",
  "guest": {
    "id": "cmiyiqtbr0000natja73jon0o",
    "displayName": "Pedro Test",
    "email": "invitado@test.com"
  }
}
```

**Response 404:**
```json
{
  "error": "Solicitud no encontrada"
}
```

---

### 9. Actualizar Request (Cambiar Estado)

**Endpoint:** `PATCH /api/events/:eventId/musicadj/requests/:requestId`
**Auth:** Required

```bash
REQUEST_ID="cmiyirgbq0002natj9a7mezpo"

# Marcar como destacado
curl -X PATCH "$API_URL/api/events/$EVENT_ID/musicadj/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "HIGHLIGHTED"}'

# Marcar como reproducido
curl -X PATCH "$API_URL/api/events/$EVENT_ID/musicadj/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "PLAYED"}'

# Cambiar prioridad (para drag & drop manual)
curl -X PATCH "$API_URL/api/events/$EVENT_ID/musicadj/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priority": 100}'
```

**Response 200:**
```json
{
  "id": "cmiyirgbq0002natj9a7mezpo",
  "status": "HIGHLIGHTED",
  "priority": 0,
  "updatedAt": "2025-12-09T11:52:34.541Z",
  "guest": { ... }
}
```

**Socket.io Emission:**
```typescript
io.to(`event:${eventId}`).emit('musicadj:requestUpdated', request)
```

**Estados disponibles:**
- `PENDING`: En cola normal
- `HIGHLIGHTED`: Destacado (aparece en color especial)
- `URGENT`: Urgente (prioridad alta)
- `PLAYED`: Ya reproducido
- `DISCARDED`: Descartado/rechazado

---

### 10. Eliminar Request

**Endpoint:** `DELETE /api/events/:eventId/musicadj/requests/:requestId`
**Auth:** Required

```bash
REQUEST_ID="cmiyirgbq0002natj9a7mezpo"

curl -X DELETE "$API_URL/api/events/$EVENT_ID/musicadj/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Response 204:** (No content)

**Socket.io Emission:**
```typescript
io.to(`event:${eventId}`).emit('musicadj:requestDeleted', { requestId })
```

---

### 11. Reordenar Cola (Drag & Drop)

**Endpoint:** `POST /api/events/:eventId/musicadj/requests/reorder`
**Auth:** Required

```bash
curl -X POST "$API_URL/api/events/$EVENT_ID/musicadj/requests/reorder" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestIds": [
      "cmiyitrfz0004natjhg4z96so",
      "cmiyirgbq0002natj9a7mezpo"
    ]
  }'
```

**Response 200:**
```json
{
  "success": true,
  "order": [
    "cmiyitrfz0004natjhg4z96so",
    "cmiyirgbq0002natj9a7mezpo"
  ]
}
```

**Comportamiento:**
- Actualiza `priority` de cada request según el orden
- Primer ID = mayor prioridad
- Se ejecuta en transacción

**Socket.io Emission:**
```typescript
io.to(`event:${eventId}`).emit('musicadj:queueReordered', { order: requestIds })
```

---

### 12. Obtener Estadísticas

**Endpoint:** `GET /api/events/:eventId/musicadj/stats`
**Auth:** Required

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/stats"
```

**Response 200:**
```json
{
  "total": 10,
  "pending": 5,
  "highlighted": 2,
  "urgent": 1,
  "played": 2,
  "discarded": 0
}
```

**Uso:**
- Dashboard de operador
- Contadores en tiempo real
- Métricas del evento

---

## 🔄 Socket.io Events

### Client → Server

```typescript
// Autenticación
socket.auth = { token: 'jwt-token' }

// Unirse a room del evento
socket.emit('join', { eventId })
```

### Server → Client

```typescript
// Nuevo request creado
socket.on('musicadj:newRequest', (request: SongRequest) => {
  // Actualizar UI
})

// Request actualizado (status, priority)
socket.on('musicadj:requestUpdated', (request: SongRequest) => {
  // Actualizar en lista
})

// Request eliminado
socket.on('musicadj:requestDeleted', ({ requestId }) => {
  // Remover de lista
})

// Cola reordenada
socket.on('musicadj:queueReordered', ({ order: string[] }) => {
  // Reordenar lista en UI
})

// Config actualizada
socket.on('musicadj:configUpdated', (config: MusicadjConfig) => {
  // Actualizar settings
})
```

---

## 🧪 Test Flow Completo

### 1. Guest se identifica
```bash
curl -X POST $API_URL/api/guests/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Juan"}'
```

### 2. Guest obtiene config
```bash
curl "$API_URL/api/events/$EVENT_ID/musicadj/config"
```

### 3. Guest busca en Spotify (si disponible)
```bash
curl "$API_URL/api/events/$EVENT_ID/musicadj/search?q=bohemian%20rhapsody"
```

### 4. Guest crea request
```bash
curl -X POST "$API_URL/api/events/$EVENT_ID/musicadj/requests" \
  -H "Content-Type: application/json" \
  -d "{\"guestId\":\"$GUEST_ID\",\"title\":\"Song\",\"artist\":\"Artist\"}"
```

### 5. Operador ve el request
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "$API_URL/api/events/$EVENT_ID/musicadj/requests"
```

### 6. Operador marca como PLAYED
```bash
curl -X PATCH "$API_URL/api/events/$EVENT_ID/musicadj/requests/$REQUEST_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PLAYED"}'
```

### 7. Guest ve su pedido reproducido
```bash
curl "$API_URL/api/guests/$GUEST_ID/requests"
```

---

## ✅ Validaciones Implementadas

### En createRequest:
1. ✅ Evento debe existir
2. ✅ Evento debe estar ACTIVE
3. ✅ Módulo debe estar enabled
4. ✅ Guest debe existir
5. ✅ Cooldown validation (configurable)
6. ✅ Spotify required check (si allowWithoutSpotify: false)

### En updateRequest:
1. ✅ Request debe existir
2. ✅ Request debe pertenecer al evento
3. ✅ Status debe ser válido (Zod validation)
4. ✅ Priority debe ser 0-999

### En deleteRequest:
1. ✅ Request debe existir
2. ✅ Request debe pertenecer al evento

---

## 🎯 Decisiones de Diseño

### Cooldown per Guest, per Event
- El cooldown se valida por guest en cada evento
- Configurable por evento (0 = sin límite)
- Mensaje claro al usuario con segundos restantes

### Priority System
- Permite drag & drop manual
- Compatible con estados (HIGHLIGHTED/URGENT pueden tener priority baja)
- Default: 0 (orden por createdAt)

### Guest Model (v1.3)
- Cross-evento: un guest puede participar en múltiples eventos
- Email único global
- displayName actualizable
- Sin password (identificación simple)

### Socket.io Rooms
- Pattern: `event:{eventId}`
- Auth con JWT token
- Eventos granulares (new, updated, deleted, reordered, configUpdated)

### Spotify Integration
- Opcional (allowWithoutSpotify)
- Client Credentials Flow (backend-only)
- Token caching (expires 5 min before)
- Graceful degradation si no está configurado

---

## 📊 Response Times (Testing Local)

- GET config: ~5-10ms
- POST request (sin cooldown): ~15-20ms
- POST request (con cooldown violation): ~8-12ms (fast fail)
- GET requests (lista): ~20-30ms
- PATCH request: ~15-20ms
- Socket.io emit: ~1-2ms

---

## 🚀 Próximos Pasos

### Backend:
- ✅ Service layer completo
- ✅ Controller validado
- ✅ Routes configuradas
- ✅ Socket.io integrado
- ✅ Testing manual completo

### Frontend Cliente (web-client):
- [ ] T2.4: Pantalla identificación Guest
- [ ] T2.5: Búsqueda + pedido de tema
- [ ] T2.8: "Mis pedidos" con Socket.io

### Frontend Operador (web-operator):
- ✅ T2.6: Panel DJ (MusicaDJPage.tsx)
- [ ] T2.7: Config MUSICADJ form

### Testing E2E:
- [ ] T2.9: Flow completo con Socket.io

---

**Última actualización:** 2025-12-09
**Backend Status:** ✅ 100% Complete
**API Version:** v0.4.0
**Schema Version:** v1.3 (Guest model)

# FASE 1 - EVENT MANAGEMENT - TESTING GUIDE

## Estado: Backend 100% Completo ✅

### Backend Endpoints Disponibles

#### Auth
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Guardar token en variable
TOKEN="tu-token-aqui"
```

#### Venues
```bash
# List venues
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/venues

# Create venue
curl -X POST http://localhost:3000/api/venues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salón Test",
    "type": "SALON",
    "city": "Ushuaia",
    "capacity": 150
  }'

# Get venue by ID
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/venues/{venueId}

# Update venue
curl -X PATCH http://localhost:3000/api/venues/{venueId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"capacity": 200}'

# Delete (soft) venue
curl -X DELETE http://localhost:3000/api/venues/{venueId} \
  -H "Authorization: Bearer $TOKEN"
```

#### Clients
```bash
# List clients
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/clients

# Create client
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "company": "Eventos SA",
    "phone": "+5492901123456",
    "email": "juan@eventos.com"
  }'

# Get client by ID
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/clients/{clientId}

# Update client
curl -X PATCH http://localhost:3000/api/clients/{clientId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5492901999999"}'
```

#### Events
```bash
# List events
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/events?status=ACTIVE"

# Create event
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": "venue-demo-001",
    "clientId": "client-demo-001",
    "eventData": {
      "eventName": "Martina 15",
      "eventType": "QUINCEANERA",
      "startDate": "2025-01-25T20:00:00Z",
      "guestCount": 120,
      "hashtag": "#Martina15"
    }
  }'

# Get event by ID
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events/{eventId}

# Get event by slug (público, sin auth)
curl http://localhost:3000/api/events/slug/martina-15-0125

# Update event
curl -X PATCH http://localhost:3000/api/events/{eventId} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'

# Update event data
curl -X PATCH http://localhost:3000/api/events/{eventId}/data \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"guestCount": 150}'

# Update status
curl -X PATCH http://localhost:3000/api/events/{eventId}/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "ACTIVE"}'

# Duplicate event
curl -X POST http://localhost:3000/api/events/{eventId}/duplicate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newStartDate": "2025-02-15T20:00:00Z"}'

# Delete event (soft)
curl -X DELETE http://localhost:3000/api/events/{eventId} \
  -H "Authorization: Bearer $TOKEN"
```

#### QR Code Generation
```bash
# Get QR data (JSON con dataUrl, svg, url)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events/{eventId}/qr

# Get QR preview (PNG inline)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events/{eventId}/qr/preview > qr-preview.png

# Download QR (PNG con Content-Disposition)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/events/{eventId}/qr/download > qr-download.png

# QR con opciones
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/events/{eventId}/qr?width=500&darkColor=%23FF0000"
```

#### Guests (v1.3)
```bash
# Identify guest (sin password)
curl -X POST http://localhost:3000/api/guests/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invitado@example.com",
    "displayName": "Juancho",
    "whatsapp": "+5492901123456"
  }'

# Get guest by ID
curl http://localhost:3000/api/guests/{guestId}

# Get guest requests (songs + karaoke)
curl http://localhost:3000/api/guests/{guestId}/requests

# Filter by event
curl "http://localhost:3000/api/guests/{guestId}/requests?eventId={eventId}"
```

---

## Funcionalidades Completadas ✅

### T1.1 - CRUD Venues ✅
- Create, Read, Update, Delete (soft)
- Filtros: type, city, search, includeInactive
- Validación con Zod
- Soft delete con verificación de eventos activos
- Reactivate endpoint

### T1.2 - CRUD Clients ✅
- Create, Read, Update, Delete (soft)
- Búsqueda por name, company, email
- Validación email y CUIT únicos
- Soft delete con verificación
- Reactivate endpoint

### T1.3 - CRUD Events ✅
- Create con auto-slug generation
- FindById, FindBySlug (público)
- FindAll con filtros avanzados
- Update, UpdateEventData, UpdateStatus
- Validación de transiciones de estado
- Soft delete (status = FINISHED)

### T1.7 - Duplicación de Eventos ✅
- POST /events/:id/duplicate
- Copia: venue, client, eventData, configs módulos
- NO copia: requests, datos operativos
- Auto-genera nuevo slug
- Marca clonedFromId para trazabilidad

### T1.5 - Generación QR ✅
- GET /events/:id/qr - JSON con múltiples formatos
- GET /events/:id/qr/download - Descarga PNG
- GET /events/:id/qr/preview - Preview inline
- Customizable: width, darkColor, lightColor
- URL generada: `http://[IP]/e/{slug}`

### Extra - Modelo Guest v1.3 ✅
- Identificación por email sin password
- Cross-evento (un guest participa en múltiples eventos)
- GET /guests/:id/requests unifica song + karaoke requests

---

## Frontend: API Client Completo ✅

El archivo `apps/web-operator/src/lib/api.ts` contiene:

- ✅ `authApi` - Login, me, changePassword
- ✅ `venuesApi` - CRUD completo
- ✅ `clientsApi` - CRUD completo
- ✅ `eventsApi` - CRUD + duplicate + getQR
- ✅ `musicadjApi` - Gestión de pedidos (ready para Fase 2)

Tipos TypeScript completos para todas las entidades.

---

## Frontend UI: Pendiente (Trivial con API client listo)

Las páginas base existen en `apps/web-operator/src/pages/`:
- Dashboard.tsx
- Login.tsx
- Events/
- Venues/
- Clients/
- MusicaDJ/

**Falta:**
- Conectar forms a API (react-hook-form ya instalado)
- Tablas de listados (todos los endpoints list() están listos)
- Botones de acciones (update, delete, duplicate)
- Modal/page para mostrar QR con preview + download

**Estimación:** 4-6 horas de trabajo de UI, toda la lógica está lista.

---

## Testing Manual Rápido

```bash
# 1. Verificar API funcionando
curl http://localhost:3000/health

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 3. Crear venue
TOKEN="tu-token"
curl -X POST http://localhost:3000/api/venues \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mi Salón","type":"SALON","city":"Ushuaia"}'

# 4. Crear evento
VENUE_ID="venue-demo-001"
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"venueId\":\"$VENUE_ID\",\"eventData\":{\"eventName\":\"Test Event\",\"eventType\":\"OTHER\",\"startDate\":\"2025-01-20T20:00:00Z\"}}"

# 5. Obtener QR
EVENT_ID="cmiy78sge0005jqvd8duq13yf"
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/events/$EVENT_ID/qr" | python3 -m json.tool

# 6. Descargar QR
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/events/$EVENT_ID/qr/download" > test-qr.png
open test-qr.png  # macOS

# 7. Duplicar evento
curl -X POST "http://localhost:3000/api/events/$EVENT_ID/duplicate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newStartDate":"2025-02-20T20:00:00Z"}'

# 8. Listar eventos
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/events?limit=10"
```

---

## Base de Datos: Schema v1.3 ✅

### Modelos Implementados:
- User (auth)
- UserPermission (permisos por módulo)
- Venue
- Client
- **Guest** (nuevo en v1.3)
- Event
- EventData
- MusicadjConfig
- SongRequest (con guestId)
- KaraokeyaConfig
- **KaraokeSong** (catálogo maestro, nuevo)
- KaraokeRequest (con guestId + songId opcional)

### Seed Data:
```
admin / admin123 (ADMIN)
operador / admin123 (OPERATOR con permisos MUSICADJ y KARAOKEYA)
Venue demo: Salón Demo
Client demo: María Demo
Event demo activo: evento-demo-2501
```

---

## Próximos Pasos (Fase 2)

- **T2.1** - Setup Socket.io (ya instalado)
- **T2.2** - Guest identification UI (backend listo)
- **T2.3** - Integración Spotify API
- **T2.4** - Pantalla pedido tema (cliente)
- **T2.5** - Backend pedidos MUSICADJ
- **T2.6** - Pantalla operador MUSICADJ

---

## Notas Técnicas

- SQLite con WAL mode optimizado
- Soft deletes en Venues, Clients
- Status transitions validadas en Events
- Slugs únicos auto-generados
- QR generation con librería `qrcode`
- Guest model cross-evento (v1.3)
- Todos los endpoints con auth middleware
- ADMIN/MANAGER/OPERATOR roles
- Permisos por módulo (MUSICADJ, KARAOKEYA)

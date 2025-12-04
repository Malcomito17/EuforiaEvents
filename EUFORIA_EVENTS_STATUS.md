# EUFORIA EVENTS - Estado del Proyecto
## Actualizado: 2025-12-04

---

## RESUMEN EJECUTIVO

| Fase | Progreso | Estado |
|------|----------|--------|
| Fase 0: Foundation | 100% | ✅ Completada |
| Fase 1: Event Management | 80% | 🔄 En progreso |
| Fase 2: MUSICADJ | 0% | ⏳ Pendiente |
| Fase 3: KARAOKEYA | 0% | ⏳ Pendiente |

---

## ROADMAP DETALLADO

### ✅ Fase 0: Foundation (COMPLETADA)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T0.1 | Setup proyecto (monorepo structure) | ✅ DONE | 2025-11 |
| T0.2 | Configuración Docker Compose | ✅ DONE | 2025-11 |
| T0.3 | Setup base de datos SQLite + migraciones | ✅ DONE | 2025-11 |
| T0.4 | API base con Express + estructura de rutas | ✅ DONE | 2025-11 |
| T0.5 | Sistema de autenticación JWT | ✅ DONE | 2025-12-01 |
| T0.6 | Middleware de permisos por módulo | ✅ DONE | 2025-12-01 |
| T0.7 | Setup Socket.io para realtime | ⏳ PENDIENTE | - |
| T0.8 | Frontend base React + routing | ✅ DONE | 2025-11 |

### 🔄 Fase 1: Event Management (EN PROGRESO - 80%)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T1.1 | CRUD de eventos | ✅ DONE | 2025-12-03 |
| T1.2 | CRUD de venues | ✅ DONE | 2025-12-03 |
| T1.3 | CRUD de clients | ✅ DONE | 2025-12-03 |
| T1.4 | Formularios frontend | ⏳ PENDIENTE | - |
| T1.5 | Generación código QR | ✅ DONE | 2025-12-04 |
| T1.6 | Estados de evento | ✅ DONE (en T1.1) | 2025-12-03 |
| T1.7 | Listado con filtros | ✅ DONE (en T1.1) | 2025-12-03 |
| T1.8 | Duplicación de eventos | ✅ DONE (en T1.1) | 2025-12-03 |

---

## ARQUITECTURA ACTUAL

```
apps/api/src/
├── config/
│   ├── env.ts              # Variables de entorno (Zod)
│   └── database.ts         # Cliente Prisma singleton
├── modules/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.routes.ts
│   │   └── auth.middleware.ts
│   ├── events/
│   │   ├── index.ts
│   │   ├── events.types.ts
│   │   ├── events.service.ts
│   │   ├── events.controller.ts  # Incluye endpoints QR
│   │   └── events.routes.ts
│   ├── venues/
│   │   ├── index.ts
│   │   ├── venues.service.ts
│   │   ├── venues.controller.ts
│   │   └── venues.routes.ts
│   └── clients/
│       ├── index.ts
│       ├── clients.service.ts
│       ├── clients.controller.ts
│       └── clients.routes.ts
├── shared/
│   ├── types/
│   │   └── index.ts
│   ├── middleware/
│   │   └── error.middleware.ts
│   └── utils/
│       ├── index.ts
│       ├── password.ts
│       └── qr-generator.ts     # ✨ NUEVO - Generador QR
├── app.ts
└── server.ts
```

---

## ENDPOINTS DISPONIBLES

### Auth (`/api/auth`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| POST | `/login` | No | - | Login (devuelve JWT) |
| GET | `/me` | Sí | - | Usuario actual |
| POST | `/register` | Sí | ADMIN | Crear usuario |
| POST | `/change-password` | Sí | - | Cambiar password |

### Events (`/api/events`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/slug/:slug` | No | - | Acceso público (QR) |
| GET | `/` | Sí | - | Listar con filtros |
| GET | `/:id` | Sí | - | Obtener por ID |
| POST | `/` | Sí | ADMIN/MANAGER | Crear evento |
| PATCH | `/:id` | Sí | ADMIN/MANAGER | Actualizar evento |
| PATCH | `/:id/data` | Sí | ADMIN/MANAGER | Actualizar eventData |
| PATCH | `/:id/status` | Sí | ADMIN/MANAGER | Cambiar estado |
| POST | `/:id/duplicate` | Sí | ADMIN/MANAGER | Duplicar evento |
| GET | `/:id/qr` | Sí | - | QR data (JSON) |
| GET | `/:id/qr/download` | Sí | - | Descargar QR (PNG) |
| GET | `/:id/qr/preview` | Sí | - | Preview QR (imagen) |
| DELETE | `/:id` | Sí | ADMIN | Eliminar evento |

### Venues (`/api/venues`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | Sí | - | Listar venues |
| GET | `/:id` | Sí | - | Obtener por ID |
| POST | `/` | Sí | ADMIN/MANAGER | Crear venue |
| PATCH | `/:id` | Sí | ADMIN/MANAGER | Actualizar venue |
| POST | `/:id/reactivate` | Sí | ADMIN | Reactivar venue |
| DELETE | `/:id` | Sí | ADMIN | Desactivar venue |

### Clients (`/api/clients`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | Sí | - | Listar clientes |
| GET | `/:id` | Sí | - | Obtener por ID |
| POST | `/` | Sí | ADMIN/MANAGER | Crear cliente |
| PATCH | `/:id` | Sí | ADMIN/MANAGER | Actualizar cliente |
| POST | `/:id/reactivate` | Sí | ADMIN | Reactivar cliente |
| DELETE | `/:id` | Sí | ADMIN | Desactivar cliente |

---

## FUNCIONALIDAD QR (T1.5) ✨

### Endpoints

```bash
# Obtener QR data (JSON con dataUrl, svg, url)
GET /api/events/:id/qr
GET /api/events/:id/qr?width=500&darkColor=%23ff0000

# Descargar QR como PNG (para imprimir)
GET /api/events/:id/qr/download
GET /api/events/:id/qr/download?width=800

# Preview QR inline (para mostrar en browser)
GET /api/events/:id/qr/preview
```

### Opciones de Personalización

| Parámetro | Default | Rango | Descripción |
|-----------|---------|-------|-------------|
| `width` | 300 (400 para download) | 100-2000 | Ancho en pixels |
| `darkColor` | #000000 | Hex color | Color del código |
| `lightColor` | #ffffff | Hex color | Color de fondo |

### Respuesta JSON (`/:id/qr`)

```json
{
  "eventId": "clxxx...",
  "slug": "fiesta-martina-0125",
  "eventName": "Fiesta de Martina",
  "qr": {
    "url": "http://localhost:5173/e/fiesta-martina-0125",
    "dataUrl": "data:image/png;base64,iVBORw0KGgo...",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"..."
  }
}
```

---

## MODELO DE DATOS

### Entidades Principales

```
User (usuarios del sistema)
├── id, username, email, password, role
├── isActive, createdAt, updatedAt
└── → UserPermission[], Event[]

Event (eventos)
├── id, slug (único), status
├── venueId?, clientId?, clonedFromId?
├── createdById, createdAt, updatedAt
└── → EventData, Venue?, Client?, MusicadjConfig?, KaraokeyaConfig?

EventData (datos del evento)
├── id, eventId
├── eventName, eventType, startDate, endDate
├── guestCount, instagramUrl, instagramUser
├── hashtag, spotifyPlaylist, notes, customFields
└── → Event

Venue (salones/lugares)
├── id, name, type, address, city
├── capacity, contactName, contactPhone
├── instagramUrl, notes, isActive
└── → Event[]

Client (clientes)
├── id, name, company, phone, email
├── cuit, notes, isActive
└── → Event[]
```

### Estados de Evento

```
DRAFT → ACTIVE → FINISHED
  │       │
  │       ↓
  │    PAUSED → ACTIVE
  │       │
  ↓       ↓
FINISHED ←┘
```

---

## PRÓXIMOS PASOS

### Inmediato (Fase 1)
- [ ] T1.4: Formularios frontend React para crear/editar eventos

### Fase 2: MUSICADJ
- [ ] T2.1: API endpoints CRUD song requests
- [ ] T2.2: Integración Spotify Web API
- [ ] T2.3-T2.15: Interfaces cliente y operador

### Fase 3: KARAOKEYA
- [ ] T3.1-T3.12: Sistema de turnos y cola

---

## COMANDOS ÚTILES

```bash
# Desarrollo
cd ~/Projects/euforia-events/apps/api
npx pnpm dev

# Instalar dependencia qrcode (después de pull)
npx pnpm install

# Base de datos
npx pnpm db:generate
npx pnpm db:push
npx pnpm db:seed
npx pnpm db:studio

# Test endpoints
TOKEN=$(curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Crear evento y obtener QR
curl -s http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"eventData":{"eventName":"Test QR","eventType":"BIRTHDAY","startDate":"2025-03-15T20:00:00Z"}}'

# Obtener QR (cambiar EVENT_ID)
curl -s "http://localhost:3000/api/events/EVENT_ID/qr" \
  -H "Authorization: Bearer $TOKEN"

# Descargar QR como PNG
curl -s "http://localhost:3000/api/events/EVENT_ID/qr/download" \
  -H "Authorization: Bearer $TOKEN" \
  -o qr-evento.png
```

---

## NOTAS TÉCNICAS

- **Node:** v20.x
- **Package Manager:** pnpm
- **Dependencia QR:** qrcode v1.5.3 + @types/qrcode
- **Base de datos:** SQLite en `apps/api/dev.db`
- **JWT Secret:** Configurado en `apps/api/.env`

---

## GITHUB

- **Repo:** https://github.com/Malcomito17/EuforiaEvents
- **Último commit:** feat(events): implementar generación de códigos QR (T1.5)

---

*Documento actualizado automáticamente - EUFORIA EVENTS*

# EUFORIA EVENTS - Estado del Proyecto
## Actualizado: 2025-12-04

---

## ROADMAP ACTUALIZADO

### ✅ Fase 0: Foundation (COMPLETADA)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T0.1 | Setup proyecto (monorepo structure) | ✅ DONE | - |
| T0.2 | Configuración Docker Compose | ✅ DONE | - |
| T0.3 | Setup base de datos SQLite + migraciones | ✅ DONE | - |
| T0.4 | API base con Express + estructura de rutas | ✅ DONE | - |
| T0.5 | Sistema de autenticación JWT | ✅ DONE | 2025-12-01 |
| T0.6 | Middleware de permisos por módulo | ✅ DONE | 2025-12-01 |
| T0.7 | Setup Socket.io para realtime | ✅ DONE | 2025-12-04 |
| T0.8 | Frontend base React + routing | ✅ DONE | - |

### ✅ Fase 1: Event Management (COMPLETADA)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T1.1 | CRUD de eventos | ✅ DONE | - |
| T1.2 | Formulario datos venue | ✅ DONE | - |
| T1.3 | Formulario datos cliente | ✅ DONE | - |
| T1.4 | Formulario datos evento | ✅ DONE | - |
| T1.5 | Generación código QR por evento | ✅ DONE | - |
| T1.6 | Estados de evento (draft/activo/finalizado) | ✅ DONE | - |
| T1.7 | Listado de eventos con filtros | ✅ DONE | - |
| T1.8 | Duplicación de eventos | ✅ DONE | - |

### ✅ Fase 2: Módulo MUSICADJ (COMPLETADA)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T2.1 | API endpoints CRUD song requests | ✅ DONE | 2025-12-04 |
| T2.2 | Integración Spotify Web API (búsqueda) | ✅ DONE | 2025-12-04 |
| T2.3 | Fallback búsqueda offline (base local) | ⏳ PENDIENTE | - |
| T2.4 | Interfaz cliente: landing QR | ✅ DONE | 2025-12-04 |
| T2.5 | Interfaz cliente: formulario pedido | ✅ DONE | 2025-12-04 |
| T2.6 | Interfaz cliente: búsqueda temas | ✅ DONE | 2025-12-04 |
| T2.7 | Interfaz cliente: confirmación envío | ✅ DONE | 2025-12-04 |
| T2.8 | Interfaz operador: lista de pedidos | ✅ DONE | 2025-12-04 |
| T2.9 | Interfaz operador: cambio de estados | ✅ DONE | 2025-12-04 |
| T2.10 | Interfaz operador: drag&drop reordenar | ⏳ PENDIENTE | - |
| T2.11 | Interfaz operador: filtros y búsqueda | ✅ DONE | 2025-12-04 |
| T2.12 | Notificaciones realtime (Socket.io) | ✅ DONE | 2025-12-04 |
| T2.13 | Control de cooldown por cliente | ⏳ PENDIENTE | - |
| T2.14 | Exportación CSV | ⏳ PENDIENTE | - |
| T2.15 | Configuración módulo por evento | ⏳ PENDIENTE | - |

---

## ARQUITECTURA ACTUAL

```
euforia-events/
├── apps/
│   ├── api/                    # Backend Express + Socket.io + Prisma
│   │   ├── src/
│   │   │   ├── config/         # env.ts, database.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Login, JWT, permisos
│   │   │   │   ├── events/     # CRUD eventos, QR
│   │   │   │   ├── musicadj/   # Song requests, Spotify
│   │   │   │   ├── venues/     # CRUD venues
│   │   │   │   └── clients/    # CRUD clientes
│   │   │   ├── socket/         # WebSocket handlers
│   │   │   │   ├── index.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── handlers/musicadj.handler.ts
│   │   │   └── shared/         # Types, middleware, utils
│   │   └── prisma/             # Schema + seed
│   │
│   ├── web-client/             # Frontend Cliente (Puerto 5173)
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── EventLanding.tsx
│   │   │   │   ├── MusicaDJRequest.tsx
│   │   │   │   ├── RequestSuccess.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   ├── services/api.ts
│   │   │   ├── stores/eventStore.ts
│   │   │   └── types/index.ts
│   │   └── package.json
│   │
│   └── web-operator/           # Frontend Operador (Puerto 5174)
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Events/     # List, Detail, Form, QR
│       │   │   ├── MusicaDJ/   # MusicaDJPage.tsx ← NUEVO
│       │   │   ├── Venues/
│       │   │   ├── Clients/
│       │   │   ├── Dashboard.tsx
│       │   │   └── Login.tsx
│       │   ├── lib/
│       │   │   ├── api.ts      # API + MUSICADJ functions
│       │   │   └── socket.ts   # Socket.io client ← NUEVO
│       │   └── stores/
│       └── package.json        # +socket.io-client
│
└── package.json                # Monorepo root
```

---

## ENDPOINTS DISPONIBLES

### Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | No | Login (devuelve JWT) |
| GET | `/me` | Sí | Usuario actual |
| POST | `/register` | Sí (ADMIN) | Crear usuario |
| POST | `/change-password` | Sí | Cambiar password |

### Events (`/api/events`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/` | Sí | Listar eventos |
| POST | `/` | Sí | Crear evento |
| GET | `/:id` | Sí | Obtener evento |
| PATCH | `/:id` | Sí | Actualizar evento |
| DELETE | `/:id` | Sí | Eliminar evento |
| PATCH | `/:id/status` | Sí | Cambiar estado |
| POST | `/:id/duplicate` | Sí | Duplicar evento |
| GET | `/:id/qr` | Sí | Obtener QR (JSON) |
| GET | `/slug/:slug` | No | Obtener por slug (público) |

### MUSICADJ (`/api/events/:eventId/musicadj`)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/config` | No | Configuración del módulo |
| PATCH | `/config` | Sí | Actualizar config |
| GET | `/requests` | Sí | Listar pedidos |
| POST | `/requests` | No | Crear pedido (cliente) |
| GET | `/requests/:id` | Sí | Obtener pedido |
| PATCH | `/requests/:id` | Sí | Actualizar pedido |
| DELETE | `/requests/:id` | Sí | Eliminar pedido |
| GET | `/search` | No | Buscar en Spotify |
| GET | `/track/:trackId` | No | Obtener track de Spotify |

---

## SOCKET.IO EVENTS

### MUSICADJ Events

| Event | Dirección | Payload | Descripción |
|-------|-----------|---------|-------------|
| `musicadj:new-request` | Server → Client | `SongRequest` | Nuevo pedido creado |
| `musicadj:request-updated` | Server → Client | `SongRequest` | Pedido actualizado |
| `musicadj:request-deleted` | Server → Client | `{ requestId }` | Pedido eliminado |
| `musicadj:queue-reordered` | Server → Client | `{ requests }` | Cola reordenada |

---

## COMANDOS ÚTILES

```bash
# Actualizar código
cd ~/Projects/euforia-events
git pull origin main
npx pnpm install

# Terminal 1 - API (puerto 3000)
cd apps/api
NODE_TLS_REJECT_UNAUTHORIZED=0 npx pnpm dev

# Terminal 2 - Frontend Cliente (puerto 5173)
cd apps/web-client
npx pnpm dev

# Terminal 3 - Frontend Operador (puerto 5174)
cd apps/web-operator
npx pnpm dev

# URLs de prueba
# Landing Cliente: http://localhost:5173/e/evento-demo-2501
# MUSICADJ Cliente: http://localhost:5173/e/evento-demo-2501/musicadj
# Operador Login: http://localhost:5174/login
# Operador MUSICADJ: http://localhost:5174/events/{eventId}/musicadj
```

---

## CREDENCIALES

### Usuarios

| Usuario | Password | Rol |
|---------|----------|-----|
| admin | admin123 | ADMIN |
| operador | admin123 | OPERATOR |

### Spotify API

- Client ID: `4b5dd84006a74b5a88379c5d12a08335`
- Client Secret: `e811dcf747e245078883fb4c654d296a`

### GitHub

- Repo: https://github.com/Malcomito17/EuforiaEvents
- Token PAT: `github_pat_11A6DBHQQ09ZKAr5SSy2Sr_...`

---

## PRÓXIMAS TAREAS

### Pendientes MUSICADJ
- T2.3: Fallback búsqueda offline
- T2.10: Drag & drop para reordenar
- T2.13: Control de cooldown
- T2.14: Exportación CSV
- T2.15: Página de configuración del módulo

### Fase 3: KARAOKEYA (Próxima)
- T3.1: API endpoints CRUD karaoke requests
- T3.2: Sistema de turnos y cola
- T3.3-T3.12: Interfaces cliente y operador

---

## NOTAS TÉCNICAS

- **Node:** v20.x
- **Package Manager:** pnpm (ejecutar con `npx pnpm`)
- **SSL npm:** `npm config set strict-ssl false`
- **SSL Node:** `NODE_TLS_REJECT_UNAUTHORIZED=0` (para Spotify API en macOS)
- **Base de datos:** SQLite en `apps/api/dev.db`

---

*Documento generado automáticamente - EUFORIA EVENTS*

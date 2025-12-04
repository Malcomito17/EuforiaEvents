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

---

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

---

### ✅ Fase 2: Módulo MUSICADJ (COMPLETADA)

| ID | Tarea | Estado |
|----|-------|--------|
| T2.1 | API endpoints CRUD song requests | ✅ DONE |
| T2.2 | Integración Spotify Web API | ✅ DONE |
| T2.3 | Fallback búsqueda offline | ✅ DONE |
| T2.4-T2.7 | Interfaz cliente completa | ✅ DONE |
| T2.8-T2.11 | Interfaz operador completa | ✅ DONE |
| T2.12 | Notificaciones realtime (Socket.io) | ✅ DONE |
| T2.13 | Control de cooldown | ✅ DONE |
| T2.14 | Exportación CSV | ✅ DONE |
| T2.15 | Configuración módulo por evento | ✅ DONE |

---

### 🔄 Fase 3: Módulo KARAOKEYA (EN PROGRESO)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T3.1 | API endpoints CRUD karaoke requests | ✅ DONE | 2025-12-04 |
| T3.2 | Sistema de turnos y cola | ✅ DONE | 2025-12-04 |
| T3.3 | Interfaz cliente: anotarse | ✅ DONE | 2025-12-04 |
| T3.4 | Interfaz cliente: ver mi turno | ✅ DONE | 2025-12-04 |
| T3.5 | Interfaz operador: cola de turnos | ✅ DONE | 2025-12-04 |
| T3.6 | Interfaz operador: llamar siguiente | ✅ DONE | 2025-12-04 |
| T3.7 | Interfaz operador: reordenar cola | ⏳ PENDIENTE | - |
| T3.8 | Interfaz operador: marcar estados | ✅ DONE | 2025-12-04 |
| T3.9 | Display público (pantalla sala) | ⏳ PENDIENTE | - |
| T3.10 | Notificaciones realtime | ✅ DONE | 2025-12-04 |
| T3.11 | Exportación CSV | ⏳ PENDIENTE | - |
| T3.12 | Configuración módulo por evento | ⏳ PENDIENTE | - |

---

## ARQUITECTURA ACTUAL

### Backend (apps/api/src/)

```
├── config/
│   ├── env.ts              # Variables de entorno tipadas (Zod)
│   └── database.ts         # Cliente Prisma singleton
├── modules/
│   ├── auth/               # Autenticación JWT
│   ├── events/             # CRUD eventos
│   ├── venues/             # CRUD venues
│   ├── clients/            # CRUD clientes
│   ├── musicadj/           # Módulo pedidos musicales
│   │   ├── index.ts
│   │   ├── musicadj.types.ts
│   │   ├── musicadj.service.ts
│   │   ├── musicadj.controller.ts
│   │   └── musicadj.routes.ts
│   └── karaokeya/          # Módulo karaoke ✨ NUEVO
│       ├── index.ts
│       ├── karaokeya.types.ts
│       ├── karaokeya.service.ts
│       ├── karaokeya.controller.ts
│       └── karaokeya.routes.ts
├── socket/
│   ├── index.ts            # Setup Socket.io
│   └── handlers/
│       ├── musicadj.handler.ts
│       └── karaokeya.handler.ts  # ✨ NUEVO
├── shared/
│   ├── types/
│   ├── middleware/
│   └── utils/
├── app.ts                  # v0.5.0
└── server.ts
```

### Frontend Cliente (apps/web-client/src/)

```
├── pages/
│   ├── EventLanding.tsx        # Landing QR
│   ├── MusicaDJRequest.tsx     # Pedido musical
│   ├── RequestSuccess.tsx      # Confirmación MUSICADJ
│   ├── KaraokeyaSignup.tsx     # ✨ Formulario anotarse
│   ├── KaraokeyaSuccess.tsx    # ✨ Confirmación turno
│   ├── KaraokeyaMyTurn.tsx     # ✨ Ver estado turno
│   └── NotFound.tsx
├── lib/
│   └── api.ts                  # Endpoints cliente
└── App.tsx                     # Rutas
```

### Frontend Operador (apps/web-operator/src/)

```
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Events/
│   │   ├── EventList.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventDetail.tsx     # Link a Karaokeya habilitado
│   │   └── EventQR.tsx
│   ├── MusicaDJ/
│   │   └── MusicaDJPage.tsx
│   ├── KaraokeYa/              # ✨ NUEVO
│   │   ├── KaraokeyaPage.tsx   # Cola de turnos
│   │   └── index.ts
│   ├── Venues/
│   └── Clients/
├── lib/
│   ├── api.ts                  # Endpoints + karaokeyaApi
│   └── socket.ts               # Eventos + subscribeKaraokeya
└── App.tsx                     # Ruta /events/:eventId/karaokeya
```

---

## ENDPOINTS API KARAOKEYA

### Públicos (sin auth)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/events/:eventId/karaokeya/config` | Config del módulo |
| GET | `/events/:eventId/karaokeya/queue` | Cola actual |
| GET | `/events/:eventId/karaokeya/stats` | Estadísticas |
| POST | `/events/:eventId/karaokeya/requests` | Crear turno |
| GET | `/events/:eventId/karaokeya/requests/:id` | Ver turno |

### Protegidos (auth + KARAOKEYA access)

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/events/:eventId/karaokeya/config` | Actualizar config |
| GET | `/events/:eventId/karaokeya/requests` | Listar todos |
| PATCH | `/events/:eventId/karaokeya/requests/:id` | Cambiar estado |
| DELETE | `/events/:eventId/karaokeya/requests/:id` | Eliminar |
| POST | `/events/:eventId/karaokeya/requests/call-next` | Llamar siguiente |
| POST | `/events/:eventId/karaokeya/queue/reorder` | Reordenar cola |

---

## EVENTOS SOCKET.IO KARAOKEYA

| Evento | Dirección | Payload |
|--------|-----------|---------|
| `karaokeya:join` | Client → Server | `{ eventId }` |
| `karaokeya:leave` | Client → Server | `{ eventId }` |
| `karaokeya:new-request` | Server → Room | `KaraokeRequest` |
| `karaokeya:status-changed` | Server → Room | `KaraokeRequest` |
| `karaokeya:queue-reordered` | Server → Room | `{ queue: KaraokeRequest[] }` |
| `karaokeya:config-updated` | Server → Room | `KaraokeyaConfig` |

---

## FLUJOS IMPLEMENTADOS

### Cliente Karaoke
```
QR → /e/{slug} → EventLanding → "Karaoke"
    → /e/{slug}/karaokeya → KaraokeyaSignup (formulario)
    → Submit → /e/{slug}/karaokeya/success → KaraokeyaSuccess
    → "Ver estado" → /e/{slug}/karaokeya/turn?id={requestId} → KaraokeyaMyTurn
        (auto-refresh cada 10s, muestra posición y estado)
```

### Operador Karaoke
```
Login → Dashboard → Eventos → EventDetail → "KARAOKEYA"
    → /events/{eventId}/karaokeya → KaraokeyaPage
        - Stats en tiempo real
        - Panel de control (llamar/al escenario/completado)
        - Lista de turnos con filtros
        - Acciones rápidas por estado
        - Socket.io para updates en vivo
```

---

## PRÓXIMAS TAREAS

### T3.7: Reordenar cola (drag & drop)
- Implementar `@dnd-kit/core` o similar
- Endpoint POST `/queue/reorder` ya existe
- Emit `karaokeya:queue-reordered`

### T3.9: Display público (opcional)
- Pantalla para proyectar en el salón
- Muestra: actual cantando, próximos 3-5, cola total
- Solo lectura, sin controles

### T3.11: Exportación CSV
- Endpoint GET `/requests/export`
- Campos: turno, nombre, canción, estado, hora

### T3.12: Modal configuración
- Editar: enabled, cooldownSeconds, maxPerPerson, showQueueToClient

---

## COMANDOS ÚTILES

```bash
# Desarrollo
cd ~/Projects/euforia-events/apps/api
npx pnpm dev

# Base de datos
npx pnpm db:generate   # Regenerar cliente Prisma
npx pnpm db:push       # Aplicar schema
npx pnpm db:seed       # Seed inicial
npx pnpm db:studio     # GUI de Prisma

# Test endpoints
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## NOTAS TÉCNICAS

- **Node:** v20.x
- **Package Manager:** pnpm (ejecutar con `npx pnpm` si no está en PATH)
- **SSL npm:** `npm config set strict-ssl false` (por problemas de red)
- **Base de datos:** SQLite en `apps/api/dev.db`
- **JWT Secret:** Configurado en `apps/api/.env`

---

## GITHUB

- **Repo:** https://github.com/Malcomito17/EuforiaEvents
- **Commits hoy (2025-12-04):** 14+ commits para KARAOKEYA

---

*Documento actualizado - EUFORIA EVENTS v0.5.0*

# EUFORIA EVENTS - Estado del Proyecto
## Actualizado: 2025-12-04

---

## RESUMEN EJECUTIVO

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 0: Foundation | ✅ COMPLETADA | 100% |
| Fase 1: Event Management | ✅ COMPLETADA | 100% |
| Fase 2: MUSICADJ | ✅ COMPLETADA | 100% |
| Fase 3: KARAOKEYA | 🔄 EN PROGRESO | 80% |
| Fase 4: Users & Permissions | ⏳ PENDIENTE | 0% |
| Fase 5: Offline Mode | ⏳ PENDIENTE | 0% |

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
| T0.7 | Setup Socket.io para realtime | ✅ DONE | 2025-12-02 |
| T0.8 | Frontend base React + routing | ✅ DONE | 2025-11 |

---

### ✅ Fase 1: Event Management (COMPLETADA)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T1.1 | CRUD de eventos | ✅ DONE | 2025-12-01 |
| T1.2 | Formulario datos venue | ✅ DONE | 2025-12-01 |
| T1.3 | Formulario datos cliente | ✅ DONE | 2025-12-01 |
| T1.4 | Formulario datos evento | ✅ DONE | 2025-12-01 |
| T1.5 | Generación código QR por evento | ✅ DONE | 2025-12-01 |
| T1.6 | Estados de evento (draft/activo/finalizado) | ✅ DONE | 2025-12-01 |
| T1.7 | Listado de eventos con filtros | ✅ DONE | 2025-12-01 |
| T1.8 | Duplicación de eventos | ✅ DONE | 2025-12-01 |

---

### ✅ Fase 2: MUSICADJ (COMPLETADA)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T2.1 | API endpoints CRUD song requests | ✅ DONE | 2025-12-02 |
| T2.2 | Integración Spotify Web API (búsqueda) | ✅ DONE | 2025-12-02 |
| T2.3 | Fallback búsqueda offline (base local) | ⏭️ SKIP | - |
| T2.4 | Interfaz cliente: landing QR | ✅ DONE | 2025-12-02 |
| T2.5 | Interfaz cliente: formulario pedido | ✅ DONE | 2025-12-02 |
| T2.6 | Interfaz cliente: búsqueda temas | ✅ DONE | 2025-12-02 |
| T2.7 | Interfaz cliente: confirmación envío | ✅ DONE | 2025-12-02 |
| T2.8 | Interfaz operador: lista de pedidos | ✅ DONE | 2025-12-02 |
| T2.9 | Interfaz operador: cambio de estados | ✅ DONE | 2025-12-02 |
| T2.10 | Interfaz operador: drag&drop reordenar | ✅ DONE | 2025-12-02 |
| T2.11 | Interfaz operador: filtros y búsqueda | ✅ DONE | 2025-12-02 |
| T2.12 | Notificaciones realtime (Socket.io) | ✅ DONE | 2025-12-02 |
| T2.13 | Control de cooldown por cliente | ✅ DONE | 2025-12-02 |
| T2.14 | Exportación CSV | ⏭️ SKIP | - |
| T2.15 | Configuración módulo por evento | ✅ DONE | 2025-12-02 |

---

### 🔄 Fase 3: KARAOKEYA (EN PROGRESO - 80%)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T3.1 | API endpoints CRUD karaoke requests | ✅ DONE | 2025-12-03 |
| T3.2 | Sistema de turnos y cola | ✅ DONE | 2025-12-03 |
| T3.3 | Interfaz cliente: anotarse | ✅ DONE | 2025-12-03 |
| T3.4 | Interfaz cliente: ver mi turno | ✅ DONE | 2025-12-04 |
| T3.5 | Interfaz operador: cola de turnos | ✅ DONE | 2025-12-04 |
| T3.6 | Interfaz operador: llamar siguiente | ✅ DONE | 2025-12-04 |
| T3.7 | Interfaz operador: reordenar cola | 🔄 NEXT | - |
| T3.8 | Interfaz operador: marcar estados | ✅ DONE | 2025-12-04 |
| T3.9 | Display público (pantalla sala) | ⏳ PENDIENTE | - |
| T3.10 | Notificaciones realtime | ✅ DONE | 2025-12-04 |
| T3.11 | Exportación CSV | ⏳ PENDIENTE | - |
| T3.12 | Configuración módulo por evento | ⏳ PENDIENTE | - |

**Notas T3.5-T3.8:**
- T3.6 y T3.8 integrados en KaraokeyaPage.tsx
- Botón "Llamar siguiente" funcional
- Cambio de estados con botones de acción rápida
- Socket.io integrado para real-time

---

### ⏳ Fase 4: Users & Permissions (PENDIENTE)

| ID | Tarea | Estado |
|----|-------|--------|
| T4.1 | CRUD usuarios (admin) | ⏳ PENDIENTE |
| T4.2 | Asignación de roles | ⏳ PENDIENTE |
| T4.3 | Asignación de permisos por módulo | ⏳ PENDIENTE |
| T4.4 | Cambio de contraseña | ⏳ PENDIENTE |
| T4.5 | Login/logout con sesión | ✅ DONE |
| T4.6 | Recuperación de contraseña (email) | ⏳ PENDIENTE |

---

### ⏳ Fase 5: Offline Mode (PENDIENTE)

| ID | Tarea | Estado |
|----|-------|--------|
| T5.1 | Service Worker para PWA | ⏳ PENDIENTE |
| T5.2 | IndexedDB para cache local | ⏳ PENDIENTE |
| T5.3 | Detección online/offline | ⏳ PENDIENTE |
| T5.4 | Cola de sincronización | ⏳ PENDIENTE |
| T5.5 | Resolución de conflictos | ⏳ PENDIENTE |
| T5.6 | Base de datos de temas offline | ⏳ PENDIENTE |

---

## ARQUITECTURA ACTUAL

```
apps/
├── api/src/
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── index.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.middleware.ts
│   │   ├── events/
│   │   │   ├── index.ts
│   │   │   ├── events.service.ts
│   │   │   ├── events.controller.ts
│   │   │   ├── events.routes.ts
│   │   │   └── events.types.ts
│   │   ├── musicadj/
│   │   │   ├── index.ts
│   │   │   ├── musicadj.service.ts
│   │   │   ├── musicadj.controller.ts
│   │   │   ├── musicadj.routes.ts
│   │   │   └── musicadj.types.ts
│   │   ├── karaokeya/
│   │   │   ├── index.ts
│   │   │   ├── karaokeya.service.ts
│   │   │   ├── karaokeya.controller.ts
│   │   │   ├── karaokeya.routes.ts
│   │   │   └── karaokeya.types.ts
│   │   ├── venues/
│   │   └── clients/
│   ├── socket/
│   │   ├── index.ts
│   │   └── handlers/
│   │       ├── musicadj.handler.ts
│   │       └── karaokeya.handler.ts
│   ├── shared/
│   │   ├── middleware/
│   │   ├── types/
│   │   └── utils/
│   ├── app.ts
│   └── server.ts
│
├── web-client/src/
│   ├── pages/
│   │   ├── EventLanding.tsx
│   │   ├── MusicaDJRequest.tsx
│   │   ├── RequestSuccess.tsx
│   │   ├── KaraokeyaSignup.tsx
│   │   ├── KaraokeyaSuccess.tsx
│   │   ├── KaraokeyaMyTurn.tsx    # T3.4
│   │   └── NotFound.tsx
│   ├── lib/
│   │   └── api.ts
│   └── App.tsx
│
└── web-operator/src/
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Login.tsx
    │   ├── Events/
    │   │   ├── EventList.tsx
    │   │   ├── EventForm.tsx
    │   │   ├── EventDetail.tsx   # Link a Karaokeya
    │   │   └── EventQR.tsx
    │   ├── MusicaDJ/
    │   │   └── MusicaDJPage.tsx
    │   ├── KaraokeYa/            # T3.5
    │   │   ├── KaraokeyaPage.tsx
    │   │   └── index.ts
    │   ├── Venues/
    │   └── Clients/
    ├── lib/
    │   ├── api.ts               # + karaokeya endpoints
    │   └── socket.ts            # + karaokeya events
    └── App.tsx                  # + karaokeya route
```

---

## ENDPOINTS API

### Auth (`/api/auth`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/login` | No | Login |
| GET | `/me` | Sí | Usuario actual |
| POST | `/register` | Admin | Crear usuario |
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
| GET | `/:id/qr` | Sí | Generar QR |

### MUSICADJ (`/api/events/:eventId/musicadj`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/config` | No | Obtener config |
| PATCH | `/config` | Sí | Actualizar config |
| GET | `/requests` | No | Listar pedidos |
| POST | `/requests` | No | Crear pedido |
| GET | `/requests/:id` | No | Obtener pedido |
| PATCH | `/requests/:id` | Sí | Actualizar pedido |
| DELETE | `/requests/:id` | Sí | Eliminar pedido |
| POST | `/requests/reorder` | Sí | Reordenar |
| GET | `/spotify/search` | No | Buscar en Spotify |

### KARAOKEYA (`/api/events/:eventId/karaokeya`)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/config` | No | Obtener config |
| PATCH | `/config` | Sí | Actualizar config |
| GET | `/requests` | No/Sí | Listar turnos |
| POST | `/requests` | No | Crear turno |
| GET | `/requests/:id` | No | Obtener turno |
| PATCH | `/requests/:id` | Sí | Actualizar turno |
| DELETE | `/requests/:id` | Sí | Eliminar turno |
| GET | `/queue` | No | Cola activa |
| GET | `/stats` | No | Estadísticas |
| POST | `/requests/call-next` | Sí | Llamar siguiente |
| POST | `/queue/reorder` | Sí | Reordenar cola |

---

## SOCKET.IO EVENTS

### MUSICADJ
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `musicadj:join` | Client → Server | Unirse a sala |
| `musicadj:leave` | Client → Server | Salir de sala |
| `musicadj:new-request` | Server → Client | Nuevo pedido |
| `musicadj:request-updated` | Server → Client | Pedido actualizado |
| `musicadj:request-deleted` | Server → Client | Pedido eliminado |
| `musicadj:queue-reordered` | Server → Client | Cola reordenada |

### KARAOKEYA
| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `karaokeya:join` | Client → Server | Unirse a sala |
| `karaokeya:leave` | Client → Server | Salir de sala |
| `karaokeya:new-request` | Server → Client | Nuevo turno |
| `karaokeya:status-changed` | Server → Client | Estado cambiado |
| `karaokeya:queue-reordered` | Server → Client | Cola reordenada |
| `karaokeya:config-updated` | Server → Client | Config actualizada |

---

## PRÓXIMA TAREA: T3.7 - Reordenar Cola

### Objetivo
Implementar drag & drop para reordenar turnos en la cola de karaoke.

### Archivos a modificar
1. `KaraokeyaPage.tsx` - Agregar @dnd-kit
2. Backend ya tiene endpoint `/queue/reorder`

### Dependencias
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## COMANDOS ÚTILES

```bash
# Desarrollo
cd ~/Projects/euforia-events/apps/api
npx pnpm dev

# Base de datos
npx pnpm db:generate
npx pnpm db:push
npx pnpm db:seed
npx pnpm db:studio

# Test endpoints
curl -s http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## NOTAS TÉCNICAS

- **Node:** v20.x
- **Package Manager:** pnpm
- **Base de datos:** SQLite en `apps/api/dev.db`
- **Puertos:** API 3000, Client 5173, Operator 5174

---

## GITHUB

- **Repo:** https://github.com/Malcomito17/EuforiaEvents
- **Branch:** main

---

*Documento actualizado automáticamente - EUFORIA EVENTS*

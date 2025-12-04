# EUFORIA EVENTS - Estado del Proyecto
## Actualizado: 2025-12-04

---

## RESUMEN EJECUTIVO

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 0: Foundation | ✅ COMPLETADA | 100% |
| Fase 1: Event Management | ✅ COMPLETADA | 100% |
| Fase 2: MUSICADJ | ✅ COMPLETADA | 100% |
| Fase 3: KARAOKEYA | 🔄 EN PROGRESO | 60% |

---

## ROADMAP ACTUALIZADO

### ✅ Fase 0: Foundation (COMPLETADA)

| ID | Tarea | Estado |
|----|-------|--------|
| T0.1 | Setup proyecto (monorepo structure) | ✅ DONE |
| T0.2 | Configuración Docker Compose | ✅ DONE |
| T0.3 | Setup base de datos SQLite + migraciones | ✅ DONE |
| T0.4 | API base con Express + estructura de rutas | ✅ DONE |
| T0.5 | Sistema de autenticación JWT | ✅ DONE |
| T0.6 | Middleware de permisos por módulo | ✅ DONE |
| T0.7 | Setup Socket.io para realtime | ✅ DONE |
| T0.8 | Frontend base React + routing | ✅ DONE |

---

### ✅ Fase 1: Event Management (COMPLETADA)

| ID | Tarea | Estado |
|----|-------|--------|
| T1.1 | CRUD de eventos | ✅ DONE |
| T1.2 | Formulario datos venue | ✅ DONE |
| T1.3 | Formulario datos cliente | ✅ DONE |
| T1.4 | Formulario datos evento | ✅ DONE |
| T1.5 | Generación código QR por evento | ✅ DONE |
| T1.6 | Estados de evento (draft/activo/finalizado) | ✅ DONE |
| T1.7 | Listado de eventos con filtros | ✅ DONE |
| T1.8 | Duplicación de eventos | ✅ DONE |

---

### ✅ Fase 2: MUSICADJ (COMPLETADA)

| ID | Tarea | Estado |
|----|-------|--------|
| T2.1 | API endpoints CRUD song requests | ✅ DONE |
| T2.2 | Integración Spotify Web API | ✅ DONE |
| T2.3 | Fallback búsqueda offline | ⏳ PENDIENTE |
| T2.4-T2.7 | Interfaz cliente completa | ✅ DONE |
| T2.8-T2.11 | Interfaz operador completa | ✅ DONE |
| T2.12 | Notificaciones realtime (Socket.io) | ✅ DONE |
| T2.13 | Control de cooldown | ✅ DONE |
| T2.14 | Exportación CSV | ✅ DONE |
| T2.15 | Configuración módulo por evento | ✅ DONE |

---

### 🔄 Fase 3: KARAOKEYA (EN PROGRESO)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T3.1 | API endpoints CRUD karaoke requests | ✅ DONE | 2025-12-04 |
| T3.2 | Sistema de turnos y cola | ✅ DONE | 2025-12-04 |
| T3.3 | Interfaz cliente: anotarse | ✅ DONE | 2025-12-04 |
| T3.4 | Interfaz cliente: ver mi turno | ✅ DONE | 2025-12-04 |
| T3.5 | Interfaz operador: cola de turnos | ⏳ PENDIENTE | - |
| T3.6 | Interfaz operador: llamar siguiente | ⏳ PENDIENTE | - |
| T3.7 | Interfaz operador: reordenar cola | ⏳ PENDIENTE | - |
| T3.8 | Interfaz operador: marcar estados | ⏳ PENDIENTE | - |
| T3.9 | Display público (pantalla sala) | ⏳ PENDIENTE | - |
| T3.10 | Notificaciones realtime | ✅ DONE | 2025-12-04 |
| T3.11 | Exportación CSV | ⏳ PENDIENTE | - |
| T3.12 | Configuración módulo por evento | ✅ DONE | 2025-12-04 |

---

## ESTRUCTURA ACTUAL DEL PROYECTO

```
apps/api/src/
├── config/
│   ├── env.ts
│   └── database.ts
├── modules/
│   ├── auth/
│   ├── events/
│   ├── venues/
│   ├── clients/
│   ├── musicadj/
│   └── karaokeya/          # NUEVO
│       ├── index.ts
│       ├── karaokeya.types.ts
│       ├── karaokeya.service.ts
│       ├── karaokeya.controller.ts
│       └── karaokeya.routes.ts
├── socket/
│   ├── index.ts
│   ├── auth.ts
│   └── handlers/
│       ├── musicadj.handler.ts
│       └── karaokeya.handler.ts  # NUEVO
├── shared/
├── app.ts
└── server.ts

apps/web-client/src/
├── pages/
│   ├── EventLanding.tsx     # ACTUALIZADO con karaokeya
│   ├── MusicaDJRequest.tsx
│   ├── RequestSuccess.tsx
│   ├── KaraokeyaSignup.tsx  # NUEVO
│   ├── KaraokeyaSuccess.tsx # NUEVO
│   └── NotFound.tsx
├── services/
│   └── api.ts               # ACTUALIZADO con endpoints karaokeya
├── stores/
│   └── eventStore.ts        # ACTUALIZADO con karaokeyaConfig
├── types/
│   └── index.ts             # ACTUALIZADO con tipos karaokeya
└── App.tsx                  # ACTUALIZADO con rutas karaokeya
```

---

## ENDPOINTS KARAOKEYA

### Rutas Públicas (Cliente QR)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/events/:eventId/karaokeya/config` | Obtener configuración |
| GET | `/api/events/:eventId/karaokeya/queue` | Ver cola actual |
| GET | `/api/events/:eventId/karaokeya/stats` | Estadísticas de la cola |
| POST | `/api/events/:eventId/karaokeya/requests` | Anotarse para cantar |
| GET | `/api/events/:eventId/karaokeya/requests/:requestId` | Ver mi turno |

### Rutas Protegidas (Operador)

| Método | Ruta | Descripción |
|--------|------|-------------|
| PATCH | `/api/events/:eventId/karaokeya/config` | Actualizar configuración |
| GET | `/api/events/:eventId/karaokeya/requests` | Listar todos los turnos |
| PATCH | `/api/events/:eventId/karaokeya/requests/:requestId` | Cambiar estado |
| DELETE | `/api/events/:eventId/karaokeya/requests/:requestId` | Eliminar turno |
| POST | `/api/events/:eventId/karaokeya/call-next` | Llamar al siguiente |
| POST | `/api/events/:eventId/karaokeya/requests/reorder` | Reordenar cola |

---

## EVENTOS SOCKET.IO - KARAOKEYA

### Cliente → Servidor
- `karaokeya:join` - Unirse al room del evento
- `karaokeya:leave` - Salir del room

### Servidor → Cliente
- `karaokeya:request:new` - Nuevo turno creado
- `karaokeya:request:status` - Cambio de estado
- `karaokeya:queue:reordered` - Cola reordenada
- `karaokeya:config:updated` - Config actualizada
- `karaokeya:stats:updated` - Stats actualizadas

---

## PRÓXIMOS PASOS

### Inmediato (T3.5-T3.8)
1. Crear interfaz de operador para KARAOKEYA
2. Panel de gestión de cola con drag & drop
3. Botón "Llamar siguiente"
4. Cambio de estados (ON_STAGE, COMPLETED, NO_SHOW)

### Después
- T3.9: Display público para pantalla del venue
- T3.11: Exportación CSV de participantes
- Fase 4: Gestión de usuarios
- Fase 5: Modo offline

---

## COMANDOS ÚTILES

```bash
# Desarrollo
cd ~/Projects/euforia-events
git pull origin main
cd apps/api && NODE_TLS_REJECT_UNAUTHORIZED=0 npx pnpm dev

# Probar karaokeya
curl -s http://localhost:3000/api/events/{eventId}/karaokeya/config
curl -s http://localhost:3000/api/events/{eventId}/karaokeya/stats

# Crear turno
curl -s -X POST http://localhost:3000/api/events/{eventId}/karaokeya/requests \
  -H "Content-Type: application/json" \
  -d '{"title":"Bohemian Rhapsody","artist":"Queen","singerName":"Juan"}'
```

---

## NOTAS TÉCNICAS

- **Node:** v20.x
- **Package Manager:** pnpm
- **Base de datos:** SQLite en `apps/api/dev.db`
- **GitHub:** https://github.com/Malcomito17/EuforiaEvents

---

*Documento actualizado automáticamente - EUFORIA EVENTS*

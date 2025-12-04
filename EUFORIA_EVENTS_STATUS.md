# EUFORIA EVENTS - Estado del Proyecto
## Actualizado: 2025-12-03

---

## RESUMEN EJECUTIVO

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 0: Foundation | ✅ COMPLETADA | 100% |
| Fase 1: Event Management | 🔄 EN PROGRESO | 60% |
| Fase 2: MUSICADJ | ⏳ PENDIENTE | 0% |
| Fase 3: KARAOKEYA | ⏳ PENDIENTE | 0% |

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

---

### 🔄 Fase 1: Event Management (EN PROGRESO)

| ID | Tarea | Estado | Fecha |
|----|-------|--------|-------|
| T1.1 | CRUD de eventos | ✅ DONE | 2025-12-03 |
| T1.2 | CRUD de venues | ✅ DONE | 2025-12-03 |
| T1.3 | CRUD de clients | ✅ DONE | 2025-12-03 |
| T1.4 | Formulario datos evento (frontend) | ⏳ PENDIENTE | - |
| T1.5 | Generación código QR por evento | ⏳ PENDIENTE | - |
| T1.6 | Estados de evento (transiciones) | ✅ DONE | 2025-12-03 |
| T1.7 | Listado de eventos con filtros | ✅ DONE | 2025-12-03 |
| T1.8 | Duplicación de eventos | ✅ DONE | 2025-12-03 |

**Entregables T1.1-T1.3:**
- CRUD completo de eventos con validación Zod
- Generación automática de slug (formato: nombre-MMYY)
- Transiciones de estado controladas (DRAFT → ACTIVE → PAUSED → FINISHED)
- Duplicación de eventos con copia de configs (sin datos operativos)
- Filtros: status, tipo, venue, client, fechas, búsqueda
- Paginación en listados
- CRUD de venues (salones, hoteles, quintas, etc.)
- CRUD de clients (datos de contratantes)
- Entidades reutilizables entre eventos

---

### ⏳ Fase 2: MUSICADJ (PENDIENTE)

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T2.1 | API endpoints CRUD song requests | CRÍTICA | 4h |
| T2.2 | Integración Spotify Web API (búsqueda) | CRÍTICA | 6h |
| T2.3 | Fallback búsqueda offline (base local) | ALTA | 4h |
| T2.4 | Interfaz cliente: landing QR | CRÍTICA | 3h |
| T2.5 | Interfaz cliente: formulario pedido | CRÍTICA | 4h |
| T2.6 | Interfaz cliente: búsqueda temas | CRÍTICA | 4h |
| T2.7 | Interfaz cliente: confirmación envío | ALTA | 2h |
| T2.8 | Interfaz operador: lista de pedidos | CRÍTICA | 6h |
| T2.9 | Interfaz operador: cambio de estados | CRÍTICA | 3h |
| T2.10 | Interfaz operador: drag&drop reordenar | ALTA | 4h |
| T2.11 | Interfaz operador: filtros y búsqueda | ALTA | 3h |
| T2.12 | Notificaciones realtime (Socket.io) | CRÍTICA | 4h |
| T2.13 | Control de cooldown por cliente | ALTA | 3h |
| T2.14 | Exportación CSV | ALTA | 2h |
| T2.15 | Configuración módulo por evento | ALTA | 3h |

---

### ⏳ Fase 3: KARAOKEYA (PENDIENTE)

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T3.1 | API endpoints CRUD karaoke requests | CRÍTICA | 4h |
| T3.2 | Sistema de turnos y cola | CRÍTICA | 4h |
| T3.3 | Interfaz cliente: anotarse | CRÍTICA | 4h |
| T3.4 | Interfaz cliente: ver mi turno | ALTA | 3h |
| T3.5 | Interfaz operador: cola de turnos | CRÍTICA | 5h |
| T3.6 | Interfaz operador: llamar siguiente | CRÍTICA | 2h |
| T3.7 | Interfaz operador: reordenar cola | ALTA | 3h |
| T3.8 | Interfaz operador: marcar estados | ALTA | 2h |
| T3.9 | Display público (pantalla sala) | MEDIA | 4h |
| T3.10 | Notificaciones realtime | CRÍTICA | 3h |
| T3.11 | Exportación CSV | ALTA | 2h |
| T3.12 | Configuración módulo por evento | ALTA | 3h |

---

## ARQUITECTURA ACTUAL

```
apps/api/src/
├── config/
│   ├── env.ts              # Variables de entorno tipadas (Zod)
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
│   │   ├── events.controller.ts
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
│       └── password.ts
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
| GET | `/` | Sí | Any | Listar con filtros |
| GET | `/:id` | Sí | Any | Obtener por ID |
| POST | `/` | Sí | ADMIN/MANAGER | Crear evento |
| PATCH | `/:id` | Sí | ADMIN/MANAGER | Actualizar evento |
| PATCH | `/:id/data` | Sí | ADMIN/MANAGER | Actualizar eventData |
| PATCH | `/:id/status` | Sí | ADMIN/MANAGER | Cambiar estado |
| POST | `/:id/duplicate` | Sí | ADMIN/MANAGER | Duplicar evento |
| DELETE | `/:id` | Sí | ADMIN | Eliminar (soft) |

### Venues (`/api/venues`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | Sí | Any | Listar venues |
| GET | `/:id` | Sí | Any | Obtener por ID |
| POST | `/` | Sí | ADMIN/MANAGER | Crear venue |
| PATCH | `/:id` | Sí | ADMIN/MANAGER | Actualizar venue |
| DELETE | `/:id` | Sí | ADMIN | Desactivar venue |

### Clients (`/api/clients`)

| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/` | Sí | Any | Listar clientes |
| GET | `/:id` | Sí | Any | Obtener por ID |
| POST | `/` | Sí | ADMIN/MANAGER | Crear cliente |
| PATCH | `/:id` | Sí | ADMIN/MANAGER | Actualizar cliente |
| DELETE | `/:id` | Sí | ADMIN | Desactivar cliente |

---

## MODELO DE DATOS (RESUMEN)

### Entidades Core
- **User**: Usuarios del sistema (admin, manager, operator)
- **UserPermission**: Permisos por módulo
- **Event**: Contenedor principal de evento
- **EventData**: Datos específicos del evento (nombre, fecha, tipo, etc.)
- **Venue**: Salones/lugares (reutilizables)
- **Client**: Clientes/contratantes (reutilizables)

### Módulo MUSICADJ
- **MusicadjConfig**: Configuración por evento
- **SongRequest**: Pedidos de canciones

### Módulo KARAOKEYA
- **KaraokeyaConfig**: Configuración por evento
- **KaraokeRequest**: Inscripciones de karaoke

---

## PRÓXIMOS PASOS

### Inmediato (T1.4-T1.5)
1. **T1.4**: Formularios frontend para crear/editar eventos
2. **T1.5**: Generación y visualización de QR

### Corto plazo (Fase 2)
1. Setup Socket.io (T0.7)
2. Iniciar módulo MUSICADJ
3. Integración Spotify API

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

# Git
git pull origin main   # Actualizar desde remoto
```

---

## GITHUB

- **Repo:** https://github.com/Malcomito17/EuforiaEvents
- **Último commit:** feat(events): implementar CRUD completo de eventos (T1.1)

---

*Documento actualizado automáticamente - EUFORIA EVENTS*

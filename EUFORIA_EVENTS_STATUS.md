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
| T2.3 | Fallback búsqueda offline (base local) | ⏳ BACKLOG | - |
| T2.4 | Interfaz cliente: landing QR | ✅ DONE | 2025-12-04 |
| T2.5 | Interfaz cliente: formulario pedido | ✅ DONE | 2025-12-04 |
| T2.6 | Interfaz cliente: búsqueda temas | ✅ DONE | 2025-12-04 |
| T2.7 | Interfaz cliente: confirmación envío | ✅ DONE | 2025-12-04 |
| T2.8 | Interfaz operador: lista de pedidos | ✅ DONE | 2025-12-04 |
| T2.9 | Interfaz operador: cambio de estados | ✅ DONE | 2025-12-04 |
| T2.10 | Interfaz operador: drag&drop reordenar | ⏳ BACKLOG | - |
| T2.11 | Interfaz operador: filtros y búsqueda | ✅ DONE | 2025-12-04 |
| T2.12 | Notificaciones realtime (Socket.io) | ✅ DONE | 2025-12-04 |
| T2.13 | Control de cooldown por cliente | ⏳ BACKLOG | - |
| T2.14 | Exportación CSV | ⏳ BACKLOG | - |
| T2.15 | Configuración módulo por evento | ⏳ BACKLOG | - |

### 🔄 Fase 3: Módulo KARAOKEYA (PRÓXIMA)

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T3.1 | API endpoints CRUD karaoke requests | CRÍTICA | 4h |
| T3.2 | Sistema de turnos y cola | CRÍTICA | 4h |
| T3.3 | Interfaz cliente: formulario anotarse | CRÍTICA | 4h |
| T3.4 | Interfaz cliente: ver mi turno | ALTA | 3h |
| T3.5 | Interfaz operador: cola de turnos | CRÍTICA | 5h |
| T3.6 | Interfaz operador: llamar siguiente | CRÍTICA | 2h |
| T3.7 | Interfaz operador: reordenar cola | ALTA | 3h |
| T3.8 | Interfaz operador: marcar estados | ALTA | 2h |
| T3.9 | Display público (pantalla sala) | MEDIA | 4h |
| T3.10 | Notificaciones realtime | CRÍTICA | 3h |
| T3.11 | Exportación CSV | ALTA | 2h |
| T3.12 | Configuración módulo por evento | ALTA | 3h |

### ⏳ Fase 4: Gestión de Usuarios (PENDIENTE)

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T4.1 | CRUD usuarios (admin) | CRÍTICA | 4h |
| T4.2 | Asignación de roles | CRÍTICA | 3h |
| T4.3 | Asignación de permisos por módulo | CRÍTICA | 4h |
| T4.4 | Cambio de contraseña (UI) | ALTA | 2h |
| T4.5 | Perfil de usuario | MEDIA | 2h |

### ⏳ Fase 5: Modo Offline (PENDIENTE)

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T5.1 | Service Worker para PWA | ALTA | 4h |
| T5.2 | IndexedDB para cache local | ALTA | 6h |
| T5.3 | Detección online/offline | ALTA | 2h |
| T5.4 | Cola de sincronización | ALTA | 6h |
| T5.5 | Resolución de conflictos | MEDIA | 4h |

### ⏳ Fase 6: Deployment Raspberry Pi / CasaOS (PENDIENTE)

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T6.1 | Dockerfiles producción (multi-stage ARM64) | CRÍTICA | 4h |
| T6.2 | Build multi-arquitectura con buildx | CRÍTICA | 2h |
| T6.3 | docker-compose.prod.yml optimizado | CRÍTICA | 2h |
| T6.4 | Push imágenes a GitHub Container Registry | ALTA | 2h |
| T6.5 | Setup Raspberry Pi + CasaOS | CRÍTICA | 3h |
| T6.6 | Deploy y configuración en CasaOS | CRÍTICA | 2h |
| T6.7 | Configuración Nginx (reverse proxy) | ALTA | 2h |
| T6.8 | Volúmenes persistentes (SQLite + logs) | ALTA | 1h |
| T6.9 | Script de backup automático | MEDIA | 2h |
| T6.10 | Configuración red local/Tailscale | MEDIA | 2h |
| T6.11 | Testing en entorno real | CRÍTICA | 4h |
| T6.12 | Documentación de deployment | ALTA | 2h |

**Notas Fase 6:**
- Hardware target: Raspberry Pi 4 (4GB+ RAM)
- Storage: SSD USB 3.0 recomendado (no microSD)
- OS: Raspberry Pi OS 64-bit o Debian 12
- Gestión: CasaOS para UI de contenedores
- Red: Tailscale recomendado para acceso remoto seguro
- Ver EUFORIA_EVENTS_TECH_REQUIREMENTS.md para detalles técnicos

---

## BACKLOG - Mejoras Pendientes

### 🎨 Eventos - Mejoras de UX

| ID | Tarea | Prioridad | Notas |
|----|-------|-----------|-------|
| B1.1 | **Imagen/Flyer del evento** | ALTA | Campo `imageUrl` en Event para identificar visualmente (flyers de bares/comerciales). Requiere: schema Prisma, upload, preview en listados. |
| B1.2 | Thumbnails en listado de eventos | MEDIA | Mostrar miniatura del flyer en lista |

### 🔧 MUSICADJ - Pendientes

| ID | Tarea | Prioridad | Notas |
|----|-------|-----------|-------|
| B2.1 | Drag & drop para reordenar cola | MEDIA | T2.10 - react-beautiful-dnd |
| B2.2 | Cooldown por cliente | BAJA | T2.13 - localStorage |
| B2.3 | Export CSV de pedidos | BAJA | T2.14 |
| B2.4 | Página config MUSICADJ | MEDIA | T2.15 |
| B2.5 | Búsqueda offline/fallback | BAJA | T2.3 |

---

## CONTEXTO PARA KARAOKEYA (Fase 3)

### Modelo de Datos (ya en schema.prisma)

```prisma
model KaraokeyaConfig {
  eventId           String  @id
  enabled           Boolean @default(true)
  cooldownSeconds   Int     @default(600)
  maxPerPerson      Int     @default(0)  // 0 = sin límite
  showQueueToClient Boolean @default(true)
  showNextSinger    Boolean @default(true)
  
  event Event @relation(...)
}

model KaraokeRequest {
  id              String               @id @default(cuid())
  eventId         String
  title           String               // Canción a cantar
  artist          String?
  singerName      String               // Nombre del cantante
  singerLastname  String?
  singerEmail     String?
  singerWhatsapp  String?
  turnNumber      Int                  // Número de turno asignado
  queuePosition   Int                  // Posición actual en cola
  status          KaraokeRequestStatus @default(QUEUED)
  createdAt       DateTime             @default(now())
  calledAt        DateTime?            // Cuando fue llamado
  
  event Event @relation(...)
}

enum KaraokeRequestStatus {
  QUEUED      // En cola esperando
  CALLED      // Llamado (anunciado)
  ON_STAGE    // En escenario cantando
  COMPLETED   // Terminó de cantar
  NO_SHOW     // No se presentó cuando lo llamaron
  CANCELLED   // Cancelado por el usuario/operador
}
```

### Flujo de Estados

```
QUEUED → CALLED → ON_STAGE → COMPLETED
                ↘ NO_SHOW
        ↘ CANCELLED
```

### Diferencias clave vs MUSICADJ

| Aspecto | MUSICADJ | KARAOKEYA |
|---------|----------|-----------|
| Propósito | Pedir temas al DJ | Anotarse para cantar |
| Búsqueda | Spotify API | Input libre (título/artista) |
| Cola | Prioridad/destacados | Turnos secuenciales |
| Estados | 5 (PENDING→PLAYED) | 6 (QUEUED→COMPLETED) |
| Display | Solo operador | Pantalla pública opcional |
| Timing | calledAt no aplica | calledAt importante |

### Estructura de Módulo a Crear

```
apps/api/src/modules/karaokeya/
├── index.ts
├── karaokeya.service.ts
├── karaokeya.controller.ts
├── karaokeya.routes.ts
└── karaokeya.types.ts

apps/api/src/socket/handlers/
└── karaokeya.handler.ts  (nuevo)

apps/web-client/src/pages/
└── KaraokeyaSignup.tsx   (nuevo)

apps/web-operator/src/pages/KaraokeYa/
├── index.ts
└── KaraokeYaPage.tsx     (nuevo)
```

### Endpoints a Implementar

```
GET    /api/events/:eventId/karaokeya/config
PATCH  /api/events/:eventId/karaokeya/config
GET    /api/events/:eventId/karaokeya/requests
POST   /api/events/:eventId/karaokeya/requests
GET    /api/events/:eventId/karaokeya/requests/:id
PATCH  /api/events/:eventId/karaokeya/requests/:id
DELETE /api/events/:eventId/karaokeya/requests/:id
POST   /api/events/:eventId/karaokeya/requests/:id/call    (llamar)
POST   /api/events/:eventId/karaokeya/requests/:id/on-stage
POST   /api/events/:eventId/karaokeya/requests/:id/complete
POST   /api/events/:eventId/karaokeya/requests/reorder
GET    /api/events/:eventId/karaokeya/display  (para pantalla pública)
```

### Socket Events a Implementar

```
karaokeya:new-request      → Nueva inscripción
karaokeya:request-updated  → Cambio de estado
karaokeya:request-deleted  → Inscripción eliminada
karaokeya:queue-reordered  → Cola reordenada
karaokeya:singer-called    → Cantante llamado (para display)
karaokeya:singer-on-stage  → Cantante en escenario
```

---

## COMANDOS ÚTILES

```bash
# Desarrollo
cd ~/Projects/euforia-events
git pull origin main

# API (puerto 3000)
cd apps/api && NODE_TLS_REJECT_UNAUTHORIZED=0 npx pnpm dev

# Cliente (puerto 5173)
cd apps/web-client && npx pnpm dev

# Operador (puerto 5174)
cd apps/web-operator && npx pnpm dev
```

---

## CREDENCIALES

| Recurso | Valor |
|---------|-------|
| Usuario Admin | admin / admin123 |
| Usuario Operador | operador / admin123 |
| Evento Demo | slug: `evento-demo-2501` |
| Spotify Client ID | `4b5dd84006a74b5a88379c5d12a08335` |
| GitHub Repo | https://github.com/Malcomito17/EuforiaEvents |

---

*Documento actualizado - EUFORIA EVENTS*

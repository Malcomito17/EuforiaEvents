# EUFORIA EVENTS - ROADMAP DE DESARROLLO
## Versión 2.0 - Actualizado: 2025-12-06
## Desarrollo desde Cero

---

## INFORMACIÓN DEL PROYECTO

**Repositorio:** https://github.com/Malcomito17/EuforiaEvents  
**Documentación:**
- [SPEC v1.3](EUFORIA_EVENTS_SPEC_v1_3.md)
- [TECH v1.3](EUFORIA_EVENTS_TECH_REQUIREMENTS_v1_3.md)  
**Stack:** Node.js 20 + Express + React + Prisma + SQLite + Socket.io  
**Entorno Dev:** macOS  
**Entorno Prod:** Raspberry Pi 4 + Docker

---

## ESTADO ACTUAL DEL PROYECTO

```
┌────────────────────────────────────────────────────────────┐
│  FASE ACTUAL: ⏸️  REINICIO DESDE CERO                      │
│  Última actualización: 2025-12-06                          │
│  Progreso global: 0%                                       │
└────────────────────────────────────────────────────────────┘
```

**Decisión:** Empezar desarrollo desde cero, descartando código anterior.  
**Motivo:** Refactorización completa con modelo Guest (v1.3).  
**Objetivo:** MVP funcional en 10 semanas (part-time).

---

## FASES DEL PROYECTO

```
FASE 0: Foundation          ⏳ PRÓXIMA  (16-20h, Semana 1)
FASE 1: Event Management    📋 PENDIENTE (28-32h, Semana 2-3)
FASE 2: MUSICADJ MVP        📋 PENDIENTE (50-60h, Semana 4-5)
FASE 3: KARAOKEYA MVP       📋 PENDIENTE (45-50h, Semana 6-7)
FASE 4: Users & Auth        📋 PENDIENTE (15-20h, Semana 8)
FASE 5: Testing & Polish    📋 PENDIENTE (20-25h, Semana 9-10)
FASE 6: Offline Mode        🔮 FUTURO   (Post-MVP)
```

---

## 📍 FASE 0: FOUNDATION (PRÓXIMA)

### Objetivo
Infraestructura básica funcional: monorepo, API respondiendo, frontends básicos, DB configurada, auth JWT.

### Estimación
- **Original:** Ya completada (erróneo)
- **Real:** 16-20 horas
- **Duración:** Semana 1 (5 días laborables)

### Tareas

| ID | Descripción | Prioridad | Est. | Estado |
|----|-------------|-----------|------|--------|
| **T0.1** | Setup monorepo (pnpm + turbo) | CRÍTICA | 2h | ⏳ TODO |
| T0.1.1 | Inicializar proyecto, configurar pnpm workspace | | | ⏳ TODO |
| T0.1.2 | Configurar turbo.json para builds paralelos | | | ⏳ TODO |
| T0.1.3 | Crear estructura de carpetas (apps/, packages/) | | | ⏳ TODO |
| **T0.2** | Setup API (Express + TypeScript) | CRÍTICA | 3h | ⏳ TODO |
| T0.2.1 | Inicializar apps/api con Express | | | ⏳ TODO |
| T0.2.2 | Configurar TypeScript, ESLint, Prettier | | | ⏳ TODO |
| T0.2.3 | Crear app.ts y server.ts base | | | ⏳ TODO |
| T0.2.4 | Configurar CORS, body-parser, helmet | | | ⏳ TODO |
| **T0.3** | Setup Prisma + SQLite | CRÍTICA | 3h | ⏳ TODO |
| T0.3.1 | Instalar Prisma, inicializar en apps/api | | | ⏳ TODO |
| T0.3.2 | Crear schema.prisma con modelo completo v1.3 | | | ⏳ TODO |
| T0.3.3 | Generar cliente Prisma, aplicar schema | | | ⏳ TODO |
| T0.3.4 | Crear seed.ts con usuarios y datos de prueba | | | ⏳ TODO |
| **T0.4** | Setup Frontend Cliente (React + Vite) | ALTA | 2h | ⏳ TODO |
| T0.4.1 | Inicializar apps/web-client con Vite + React | | | ⏳ TODO |
| T0.4.2 | Configurar Tailwind CSS | | | ⏳ TODO |
| T0.4.3 | Crear estructura básica de rutas (React Router) | | | ⏳ TODO |
| **T0.5** | Setup Frontend Operador (React + Vite) | ALTA | 2h | ⏳ TODO |
| T0.5.1 | Inicializar apps/web-operator | | | ⏳ TODO |
| T0.5.2 | Configurar Tailwind CSS | | | ⏳ TODO |
| T0.5.3 | Crear estructura de rutas + layout básico | | | ⏳ TODO |
| **T0.6** | Sistema de autenticación JWT | CRÍTICA | 4h | ⏳ TODO |
| T0.6.1 | Crear módulo auth/ en backend | | | ⏳ TODO |
| T0.6.2 | Implementar login, register, JWT generation | | | ⏳ TODO |
| T0.6.3 | Middleware authenticate() para rutas protegidas | | | ⏳ TODO |
| T0.6.4 | Hash de passwords con bcrypt | | | ⏳ TODO |
| **T0.7** | Middleware de permisos por módulo | ALTA | 3h | ⏳ TODO |
| T0.7.1 | Middleware requireRole(role) | | | ⏳ TODO |
| T0.7.2 | Middleware requireModuleAccess(module) | | | ⏳ TODO |
| T0.7.3 | Integrar con rutas de módulos | | | ⏳ TODO |
| **T0.8** | Docker Compose para desarrollo | MEDIA | 2h | ⏳ TODO |
| T0.8.1 | Crear docker-compose.yml (api + frontends) | | | ⏳ TODO |
| T0.8.2 | Dockerfiles optimizados | | | ⏳ TODO |
| T0.8.3 | Probar levantamiento completo con Docker | | | ⏳ TODO |

### Entregables
- [x] Monorepo funcionando con turbo
- [ ] API respondiendo en :3000 con /health endpoint
- [ ] Frontend cliente en :5173
- [ ] Frontend operador en :5174
- [ ] DB SQLite con schema v1.3 aplicado
- [ ] Seed con usuarios admin/operador
- [ ] Login funcional en frontend operador
- [ ] JWT funcionando en requests protegidos

### Criterios de Cierre Fase 0
```bash
# Debe funcionar:
pnpm dev                # Levanta todo
curl http://localhost:3000/health   # Responde OK
# Login en http://localhost:5174
# Frontend cliente carga sin errores en http://localhost:5173
```

### Notas
- NO incluir Socket.io todavía (Fase 2)
- Usar validación Zod desde el inicio
- Logger básico (Winston) desde T0.2
- Configurar .env.example con todas las variables

---

## 📋 FASE 1: EVENT MANAGEMENT

### Objetivo
CRUD completo de eventos, venues, clients. QR generation. Formularios funcionando.

### Estimación
- **Original:** 22 horas
- **Real:** 28-32 horas
- **Duración:** Semanas 2-3

### Tareas

| ID | Descripción | Prioridad | Est. | Estado |
|----|-------------|-----------|------|--------|
| **T1.1** | Módulo Venues | CRÍTICA | 4h | 📋 TODO |
| T1.1.1 | CRUD backend (service + controller + routes) | | | 📋 TODO |
| T1.1.2 | Validación Zod (name, type, address, etc.) | | | 📋 TODO |
| T1.1.3 | Frontend: listado + formulario create/edit | | | 📋 TODO |
| **T1.2** | Módulo Clients | CRÍTICA | 4h | 📋 TODO |
| T1.2.1 | CRUD backend | | | 📋 TODO |
| T1.2.2 | Validación Zod (name, email, cuit, etc.) | | | 📋 TODO |
| T1.2.3 | Frontend: listado + formulario | | | 📋 TODO |
| **T1.3** | Módulo Events (CRUD básico) | CRÍTICA | 6h | 📋 TODO |
| T1.3.1 | CRUD backend (service + controller + routes) | | | 📋 TODO |
| T1.3.2 | Generación de slug automático | | | 📋 TODO |
| T1.3.3 | Estados: DRAFT, ACTIVE, PAUSED, FINISHED | | | 📋 TODO |
| **T1.4** | Formulario creación evento | ALTA | 5h | 📋 TODO |
| T1.4.1 | Step 1: Datos básicos (nombre, fecha, tipo) | | | 📋 TODO |
| T1.4.2 | Step 2: Seleccionar/crear venue | | | 📋 TODO |
| T1.4.3 | Step 3: Seleccionar/crear cliente | | | 📋 TODO |
| T1.4.4 | Step 4: Configuración módulos (MUSICADJ/KARAOKEYA) | | | 📋 TODO |
| **T1.5** | Generación QR por evento | ALTA | 3h | 📋 TODO |
| T1.5.1 | Backend: endpoint /events/:id/qr | | | 📋 TODO |
| T1.5.2 | Generar QR con qrcode (PNG base64) | | | 📋 TODO |
| T1.5.3 | Frontend operador: ver QR, descargar, imprimir | | | 📋 TODO |
| **T1.6** | Listado y gestión de eventos | ALTA | 3h | 📋 TODO |
| T1.6.1 | Frontend: tabla con filtros (status, fecha) | | | 📋 TODO |
| T1.6.2 | Acciones: editar, duplicar, cambiar status | | | 📋 TODO |
| T1.6.3 | Vista detalle de evento | | | 📋 TODO |
| **T1.7** | Duplicación de eventos | MEDIA | 3h | 📋 TODO |
| T1.7.1 | Backend: POST /events/:id/duplicate | | | 📋 TODO |
| T1.7.2 | Copiar config módulos, NO copiar pedidos | | | 📋 TODO |
| T1.7.3 | Asignar nuevo slug automático | | | 📋 TODO |

### Entregables
- [ ] Operador puede crear venue/client/evento
- [ ] Formulario multi-step funcional
- [ ] QR se genera y descarga correctamente
- [ ] Listado de eventos con filtros
- [ ] Duplicar evento funciona
- [ ] Navegación entre pantallas fluida

### Criterios de Cierre Fase 1
- Operador puede crear evento completo end-to-end
- QR se escanea y redirige a `https://euforia.events/e/{slug}` (aunque aún no haga nada)
- DB tiene venues, clients, events relacionados correctamente

---

## 📋 FASE 2: MUSICADJ MVP

### Objetivo
Módulo de pedidos de música funcional. Clientes piden temas, DJ los ve en tiempo real.

### Estimación
- **Original:** ~40 horas
- **Real:** 50-60 horas
- **Duración:** Semanas 4-5

### Tareas

| ID | Descripción | Prioridad | Est. | Estado |
|----|-------------|-----------|------|--------|
| **T2.1** | Setup Socket.io | CRÍTICA | 3h | 📋 TODO |
| T2.1.1 | Configurar Socket.io en backend | | | 📋 TODO |
| T2.1.2 | Rooms por evento (event:{eventId}) | | | 📋 TODO |
| T2.1.3 | Frontend: conexión y eventos básicos | | | 📋 TODO |
| **T2.2** | Módulo Guest (identificación) | CRÍTICA | 4h | 📋 TODO |
| T2.2.1 | Backend: POST /guests/identify | | | 📋 TODO |
| T2.2.2 | Crear o recuperar Guest por email | | | 📋 TODO |
| T2.2.3 | localStorage en frontend para recordar | | | 📋 TODO |
| T2.2.4 | Pantalla identificación en web-client | | | 📋 TODO |
| **T2.3** | Integración Spotify API | CRÍTICA | 6h | 📋 TODO |
| T2.3.1 | Setup OAuth2 Client Credentials Flow | | | 📋 TODO |
| T2.3.2 | Service: searchTracks(query) | | | 📋 TODO |
| T2.3.3 | Implementar cache (node-cache, TTL 1h) | | | 📋 TODO |
| T2.3.4 | Rate limiting interno (max 10 req/s) | | | 📋 TODO |
| **T2.4** | Pantalla pedido tema (cliente) | ALTA | 6h | 📋 TODO |
| T2.4.1 | Input de búsqueda con autocomplete | | | 📋 TODO |
| T2.4.2 | Resultados Spotify con álbum art | | | 📋 TODO |
| T2.4.3 | Opción manual (sin Spotify) | | | 📋 TODO |
| T2.4.4 | POST /events/:eventId/song-requests | | | 📋 TODO |
| T2.4.5 | Validar cooldown (300s default) | | | 📋 TODO |
| **T2.5** | Backend pedidos MUSICADJ | CRÍTICA | 5h | 📋 TODO |
| T2.5.1 | Service: createSongRequest() | | | 📋 TODO |
| T2.5.2 | Validaciones: cooldown, evento activo, módulo enabled | | | 📋 TODO |
| T2.5.3 | Socket emit: new-song-request | | | 📋 TODO |
| **T2.6** | Pantalla operador MUSICADJ | CRÍTICA | 8h | 📋 TODO |
| T2.6.1 | Listado en tiempo real (Socket.io) | | | 📋 TODO |
| T2.6.2 | Filtros por status (PENDING, PLAYED, etc.) | | | 📋 TODO |
| T2.6.3 | Búsqueda de pedidos | | | 📋 TODO |
| T2.6.4 | Acciones: marcar PLAYED, HIGHLIGHTED, URGENT, DISCARDED | | | 📋 TODO |
| T2.6.5 | Drag & drop para reordenar (opcional) | | | 📋 TODO |
| **T2.7** | Config MUSICADJ por evento | MEDIA | 3h | 📋 TODO |
| T2.7.1 | Frontend: formulario config en creación evento | | | 📋 TODO |
| T2.7.2 | Backend: PATCH /events/:id/musicadj-config | | | 📋 TODO |
| T2.7.3 | Parámetros: cooldown, allowWithoutSpotify, showQueueToClient | | | 📋 TODO |
| **T2.8** | Pantalla "Mis pedidos" (cliente) | MEDIA | 4h | 📋 TODO |
| T2.8.1 | GET /guests/me/requests (song + karaoke) | | | 📋 TODO |
| T2.8.2 | UI: lista de pedidos con estados | | | 📋 TODO |
| T2.8.3 | Actualización en tiempo real | | | 📋 TODO |
| **T2.9** | Testing E2E MUSICADJ | ALTA | 4h | 📋 TODO |
| T2.9.1 | Cliente hace pedido con Spotify | | | 📋 TODO |
| T2.9.2 | DJ ve pedido en tiempo real | | | 📋 TODO |
| T2.9.3 | DJ marca como PLAYED | | | 📋 TODO |
| T2.9.4 | Cliente ve cambio de estado | | | 📋 TODO |

### Entregables
- [ ] Guest puede identificarse con email
- [ ] Búsqueda Spotify funciona (con cache)
- [ ] Cliente puede pedir tema con/sin Spotify
- [ ] DJ ve pedidos en tiempo real
- [ ] DJ puede cambiar estados de pedidos
- [ ] Cooldown se respeta
- [ ] Pantalla "Mis pedidos" funciona

### Criterios de Cierre Fase 2
- Flujo completo funciona: Guest → identifica → busca tema → pide → DJ ve → marca PLAYED → Guest ve cambio
- Socket.io no tiene lag perceptible (< 500ms)
- Spotify API no da rate limit errors en testing normal

---

## 📋 FASE 3: KARAOKEYA MVP

### Objetivo
Sistema de turnos de karaoke. Clientes se anotan, operador gestiona cola, display público muestra siguiente.

### Estimación
- **Original:** ~35 horas
- **Real:** 45-50 horas
- **Duración:** Semanas 6-7

### Tareas

| ID | Descripción | Prioridad | Est. | Estado |
|----|-------------|-----------|------|--------|
| **T3.1** | Catálogo básico de canciones | CRÍTICA | 3h | 📋 TODO |
| T3.1.1 | Crear CSV con ~100 temas populares | | | 📋 TODO |
| T3.1.2 | Script para importar CSV a tabla KaraokeSong | | | 📋 TODO |
| T3.1.3 | Campos: title, artist, language, difficulty | | | 📋 TODO |
| **T3.2** | Búsqueda de canciones (cliente) | ALTA | 4h | 📋 TODO |
| T3.2.1 | GET /karaoke-songs/search?q=query | | | 📋 TODO |
| T3.2.2 | Búsqueda fuzzy (Fuse.js) | | | 📋 TODO |
| T3.2.3 | Filtros: idioma, dificultad | | | 📋 TODO |
| T3.2.4 | Frontend: input búsqueda con resultados | | | 📋 TODO |
| **T3.3** | Anotación de turno (cliente) | CRÍTICA | 5h | 📋 TODO |
| T3.3.1 | POST /events/:eventId/karaoke-requests | | | 📋 TODO |
| T3.3.2 | Seleccionar canción del catálogo o manual | | | 📋 TODO |
| T3.3.3 | Asignación automática de turnNumber y queuePosition | | | 📋 TODO |
| T3.3.4 | Validar cooldown (600s default) | | | 📋 TODO |
| T3.3.5 | Socket emit: new-karaoke-request | | | 📋 TODO |
| **T3.4** | Pantalla operador KARAOKEYA | CRÍTICA | 8h | 📋 TODO |
| T3.4.1 | Listado en tiempo real (Socket.io) | | | 📋 TODO |
| T3.4.2 | Vista cola: QUEUED → CALLED → ON_STAGE | | | 📋 TODO |
| T3.4.3 | Botón "Llamar siguiente" (CALLED) | | | 📋 TODO |
| T3.4.4 | Botón "Subió" (ON_STAGE) | | | 📋 TODO |
| T3.4.5 | Botón "Completó" (COMPLETED) | | | 📋 TODO |
| T3.4.6 | Botón "No apareció" (NO_SHOW) | | | 📋 TODO |
| T3.4.7 | Reordenar cola (drag & drop) | | | 📋 TODO |
| **T3.5** | Display público siguiente cantante | ALTA | 4h | 📋 TODO |
| T3.5.1 | Pantalla /e/:slug/karaokeya/display | | | 📋 TODO |
| T3.5.2 | Muestra: turno actual (ON_STAGE) + siguiente (QUEUED) | | | 📋 TODO |
| T3.5.3 | Actualización en tiempo real | | | 📋 TODO |
| T3.5.4 | Fullscreen, fuente grande, legible a distancia | | | 📋 TODO |
| **T3.6** | Pantalla "Mi turno" (cliente) | MEDIA | 3h | 📋 TODO |
| T3.6.1 | GET /guests/me/requests (filtrado karaoke) | | | 📋 TODO |
| T3.6.2 | Muestra turno, posición en cola, status | | | 📋 TODO |
| T3.6.3 | Notificación cuando es CALLED | | | 📋 TODO |
| **T3.7** | Config KARAOKEYA por evento | MEDIA | 3h | 📋 TODO |
| T3.7.1 | Frontend: formulario config | | | 📋 TODO |
| T3.7.2 | Backend: PATCH /events/:id/karaokeya-config | | | 📋 TODO |
| T3.7.3 | Parámetros: cooldown, maxPerPerson, showQueueToClient, showNextSinger | | | 📋 TODO |
| **T3.8** | Testing E2E KARAOKEYA | ALTA | 4h | 📋 TODO |
| T3.8.1 | Cliente busca canción y se anota | | | 📋 TODO |
| T3.8.2 | Operador ve solicitud en cola | | | 📋 TODO |
| T3.8.3 | Operador llama siguiente → estado CALLED | | | 📋 TODO |
| T3.8.4 | Display público muestra cantante actual | | | 📋 TODO |
| T3.8.5 | Operador marca COMPLETED | | | 📋 TODO |

### Entregables
- [ ] Catálogo de 100 canciones cargado
- [ ] Cliente puede buscar y anotar turno
- [ ] Operador gestiona cola completa
- [ ] Display público funciona y se actualiza
- [ ] Estados de turno fluyen correctamente
- [ ] Cooldown se respeta

### Criterios de Cierre Fase 3
- Flujo completo funciona: Guest → busca canción → anota turno → operador llama → display muestra → operador marca completado
- Reordenar cola funciona sin bugs
- Display legible desde 5+ metros

---

## 📋 FASE 4: USERS & PERMISSIONS

### Objetivo
CRUD de usuarios, asignación de roles y permisos por módulo.

### Estimación
- **Original:** 16 horas
- **Real:** 15-20 horas
- **Duración:** Semana 8

### Tareas

| ID | Descripción | Prioridad | Est. | Estado |
|----|-------------|-----------|------|--------|
| **T4.1** | CRUD usuarios (admin) | CRÍTICA | 5h | 📋 TODO |
| T4.1.1 | Backend: GET/POST/PATCH/DELETE /users | | | 📋 TODO |
| T4.1.2 | Validación: solo ADMIN puede gestionar usuarios | | | 📋 TODO |
| T4.1.3 | Frontend: listado + formulario create/edit | | | 📋 TODO |
| **T4.2** | Asignación de roles | ALTA | 3h | 📋 TODO |
| T4.2.1 | Dropdown: ADMIN / MANAGER / OPERATOR | | | 📋 TODO |
| T4.2.2 | Validar: al menos 1 ADMIN siempre | | | 📋 TODO |
| **T4.3** | Asignación de permisos por módulo | ALTA | 4h | 📋 TODO |
| T4.3.1 | Tabla permisos: módulo, canView, canOperate, canExport | | | 📋 TODO |
| T4.3.2 | Frontend: checkboxes por módulo | | | 📋 TODO |
| T4.3.3 | Backend: PATCH /users/:id/permissions | | | 📋 TODO |
| **T4.4** | Cambio de contraseña | MEDIA | 2h | 📋 TODO |
| T4.4.1 | POST /auth/change-password | | | 📋 TODO |
| T4.4.2 | Validar password antigua correcta | | | 📋 TODO |
| T4.4.3 | Frontend: formulario cambio password | | | 📋 TODO |
| **T4.5** | Testing permisos | ALTA | 3h | 📋 TODO |
| T4.5.1 | OPERATOR sin permiso MUSICADJ → no ve pantalla | | | 📋 TODO |
| T4.5.2 | MANAGER con permiso KARAOKEYA → puede operar | | | 📋 TODO |
| T4.5.3 | ADMIN → acceso total | | | 📋 TODO |

### Entregables
- [ ] Admin puede crear/editar usuarios
- [ ] Roles funcionan correctamente
- [ ] Permisos por módulo se respetan
- [ ] Cambio de contraseña funciona

---

## 📋 FASE 5: TESTING & POLISH

### Objetivo
Preparar MVP para uso real. Testing exhaustivo, deploy a Raspberry Pi, manual de usuario.

### Estimación
- **Original:** N/A
- **Real:** 20-25 horas
- **Duración:** Semanas 9-10

### Tareas

| ID | Descripción | Prioridad | Est. | Estado |
|----|-------------|-----------|------|--------|
| **T5.1** | Testing manual exhaustivo | CRÍTICA | 6h | 📋 TODO |
| T5.1.1 | Crear planilla de test cases | | | 📋 TODO |
| T5.1.2 | Ejecutar cada flujo 3 veces | | | 📋 TODO |
| T5.1.3 | Documentar bugs encontrados | | | 📋 TODO |
| **T5.2** | Corrección de bugs críticos | CRÍTICA | 6h | 📋 TODO |
| T5.2.1 | Priorizar por impacto | | | 📋 TODO |
| T5.2.2 | Fix uno por uno | | | 📋 TODO |
| T5.2.3 | Re-test después de cada fix | | | 📋 TODO |
| **T5.3** | Deploy a Raspberry Pi | CRÍTICA | 4h | 📋 TODO |
| T5.3.1 | Build imágenes Docker ARM64 | | | 📋 TODO |
| T5.3.2 | docker-compose up en Raspberry Pi | | | 📋 TODO |
| T5.3.3 | Configurar nginx reverse proxy | | | 📋 TODO |
| T5.3.4 | Probar acceso desde red local | | | 📋 TODO |
| **T5.4** | Manual de usuario | ALTA | 3h | 📋 TODO |
| T5.4.1 | Guía operador: crear evento, configurar módulos | | | 📋 TODO |
| T5.4.2 | Guía cliente: cómo usar QR, pedir tema, anotar turno | | | 📋 TODO |
| T5.4.3 | Screenshots de cada pantalla | | | 📋 TODO |
| **T5.5** | Optimización de performance | MEDIA | 3h | 📋 TODO |
| T5.5.1 | Lazy loading de componentes | | | 📋 TODO |
| T5.5.2 | Optimizar queries Prisma (includes necesarios) | | | 📋 TODO |
| T5.5.3 | Lighthouse audit (target: >90) | | | 📋 TODO |

### Entregables
- [ ] Todos los flujos principales testeados
- [ ] Bugs críticos corregidos
- [ ] Deploy funcional en Raspberry Pi
- [ ] Manual de usuario entregado
- [ ] Performance aceptable (< 3s load)

---

## 🔮 FASE 6: OFFLINE MODE (POST-MVP)

### Objetivo
Funcionalidad completa sin conexión a internet.

### Estimación
- **Real:** 40-50 horas
- **Duración:** Post-MVP (si se requiere)

### Nota
Esta fase se ejecutará SOLO si el MVP es exitoso y hay demanda real de modo offline.

---

## 📊 PROGRESO GLOBAL

```
┌──────────────────────────────────────────────────────────────┐
│  FASE 0: Foundation         [░░░░░░░░░░░░░░░░░░░░] 0%        │
│  FASE 1: Event Management   [░░░░░░░░░░░░░░░░░░░░] 0%        │
│  FASE 2: MUSICADJ MVP       [░░░░░░░░░░░░░░░░░░░░] 0%        │
│  FASE 3: KARAOKEYA MVP      [░░░░░░░░░░░░░░░░░░░░] 0%        │
│  FASE 4: Users & Permissions[░░░░░░░░░░░░░░░░░░░░] 0%        │
│  FASE 5: Testing & Polish   [░░░░░░░░░░░░░░░░░░░░] 0%        │
│                                                              │
│  TOTAL MVP:                 [░░░░░░░░░░░░░░░░░░░░] 0%        │
└──────────────────────────────────────────────────────────────┘
```

**Tiempo invertido:** 0 horas  
**Tiempo estimado restante:** ~190 horas  
**Fecha estimada MVP:** Semana 10 (part-time)

---

## 📝 CÓMO USAR ESTE ROADMAP

### Al Iniciar Nueva Conversación con Claude

```
Retomando EUFORIA EVENTS - Fase [N]

Documentos adjuntos:
- SPEC v1.3
- ROADMAP (este documento)

Estado actual:
- Última tarea completada: [T#.#.#]
- Progreso Fase actual: [X%]
- Código en: [branch/commit]

Próxima tarea a desarrollar: [T#.#]
```

### Al Finalizar Tarea

1. Marcar tarea como ✅ DONE en roadmap
2. Actualizar % de progreso de la fase
3. Commitear código con mensaje: `feat: T#.# - descripción`
4. Actualizar sección "ESTADO ACTUAL" al inicio
5. Guardar roadmap actualizado

### Al Finalizar Fase

1. Verificar "Criterios de Cierre"
2. Actualizar barra de progreso
3. Commitear: `chore: Fase [N] completada`
4. Testear deploy en Raspberry Pi
5. Actualizar "Tiempo invertido"

---

## 🎯 HITOS CLAVE

| Hito | Descripción | ETA |
|------|-------------|-----|
| H1 | API + frontends levantados | Semana 1 |
| H2 | Crear primer evento con QR | Semana 3 |
| H3 | Primer pedido música funcional | Semana 5 |
| H4 | Primer turno karaoke funcional | Semana 7 |
| H5 | Deploy en Raspberry Pi | Semana 9 |
| **MVP RELEASE** | **Versión 1.0 funcional** | **Semana 10** |

---

## 🚨 DECISIONES PENDIENTES

| ID | Decisión | Opciones | Cuándo Decidir |
|----|----------|----------|----------------|
| D1 | Autenticación Guest | A) Email sin password, B) Email + código | Fase 2 (T2.2) |
| D2 | Storage imágenes | A) Base64 DB, B) Filesystem, C) S3 | Fase 2 (T2.3) |
| D3 | Notificaciones WhatsApp | A) Twilio, B) Sin notifs, C) Solo email | Post-MVP |
| D4 | Base de datos producción | A) SQLite, B) PostgreSQL | Al deploy (Fase 5) |

---

## 📞 CONTACTO Y RECURSOS

**Desarrollador:** Malcomito  
**Email:** [tu-email]  
**Repo:** https://github.com/Malcomito17/EuforiaEvents  
**Docs:**
- [SPEC v1.3](EUFORIA_EVENTS_SPEC_v1_3.md)
- [TECH v1.3](EUFORIA_EVENTS_TECH_REQUIREMENTS_v1_3.md)
- [ANÁLISIS](EUFORIA_EVENTS_ANALYSIS_FEEDBACK.md)

---

## 📜 CHANGELOG ROADMAP

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.0 | 2025-12-06 | Reinicio desde cero, estimaciones realistas, tareas granulares |
| 1.0 | 2025-01-27 | Roadmap inicial |

---

*Documento vivo - Actualizar después de cada sesión de desarrollo*
*Última actualización: 2025-12-06*

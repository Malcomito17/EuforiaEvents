# EUFORIA EVENTS
## Especificación del Proyecto v1.3

---

## 1. VISIÓN DEL PRODUCTO

**EUFORIA EVENTS** es una plataforma modular de gestión de eventos que permite administrar diferentes aspectos operativos de eventos corporativos y sociales. El sistema opera bajo una arquitectura multi-evento donde cada evento funciona como contenedor aislado de información.

### Principios de Diseño

- **Modularidad**: Cada funcionalidad es un módulo independiente activable por evento
- **Aislamiento por Evento**: Los datos de cada evento están completamente separados
- **Offline-First**: Funcionalidad core disponible sin conexión a internet
- **Tiempo Real**: Actualizaciones instantáneas entre clientes y operadores
- **Portabilidad**: Desplegable en local (notebook del DJ) o en cloud

---

## 2. GOALS (Objetivos del Proyecto)

### 2.1 Objetivos Principales

| ID | Objetivo | Criterio de Éxito |
|----|----------|-------------------|
| G1 | Sistema de gestión de eventos centralizado | Un operador puede crear, configurar y gestionar múltiples eventos |
| G2 | Módulo MUSICADJ funcional | Clientes pueden solicitar temas vía QR, DJ recibe en tiempo real |
| G3 | Módulo KARAOKEYA funcional | Clientes se anotan, operador gestiona cola de turnos |
| G4 | Acceso basado en roles | Sistema de usuarios con permisos por módulo |
| G5 | Funcionamiento híbrido online/offline | El sistema opera sin internet, sincroniza cuando hay conexión |
| G6 | Exportación de datos | Generación de reportes CSV por evento |

### 2.2 Objetivos Secundarios (Post-MVP)

| ID | Objetivo | Descripción |
|----|----------|-------------|
| G7 | Dashboard de estadísticas | Métricas de pedidos, artistas más solicitados, etc. |
| G8 | Historial de eventos | Consulta y comparación de eventos anteriores |
| G9 | Personalización visual | Themes/branding por evento |
| G10 | Módulos adicionales | Base preparada para nuevos módulos |

---

## 3. ARQUITECTURA DEL SISTEMA

### 3.1 Modelo de Datos Principal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              SISTEMA                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐      ┌──────────────────────────────────────────┐     │
│  │    USERS     │      │              EVENTS                      │     │
│  ├──────────────┤      ├──────────────────────────────────────────┤     │
│  │ id           │      │ id                                       │     │
│  │ username     │      │ slug (URL amigable para QR)              │     │
│  │ password     │      │ status (DRAFT|ACTIVE|PAUSED|FINISHED)    │     │
│  │ role         │      │ venueId → Venue                          │     │
│  │ permissions[]│      │ clientId → Client                        │     │
│  │ created_at   │      │ createdById → User                       │     │
│  └──────────────┘      │ clonedFromId (para duplicar eventos)     │     │
│                        └──────────────────────────────────────────┘     │
│                                       │                                  │
│                    ┌──────────────────┼──────────────────┐              │
│                    ▼                  ▼                  ▼              │
│  ┌─────────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │       VENUE         │  │     CLIENT      │  │   EVENT_DATA    │     │
│  ├─────────────────────┤  ├─────────────────┤  ├─────────────────┤     │
│  │ id                  │  │ id              │  │ eventId         │     │
│  │ name                │  │ name            │  │ eventName       │     │
│  │ type                │  │ company         │  │ eventType       │     │
│  │ address             │  │ phone           │  │ startDate       │     │
│  │ city                │  │ email           │  │ guestCount      │     │
│  │ capacity            │  │ cuit            │  │ instagramUrl    │     │
│  │ contactName         │  │ notes           │  │ hashtag         │     │
│  │ instagramUrl        │  │ isActive        │  │ notes           │     │
│  │ isActive            │  └─────────────────┘  └─────────────────┘     │
│  └─────────────────────┘                                                │
│                                                                          │
│  * Venues y Clients son REUTILIZABLES entre eventos                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      INVITADOS (GUESTS)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────┐                                          │
│  │          GUEST            │  Identificación simplificada             │
│  ├───────────────────────────┤  para usuarios finales (sin password)    │
│  │ id                        │                                          │
│  │ email (único)             │◄─── Clave para recuperar historial       │
│  │ displayName               │◄─── "Juancho", "La Voz de Oro"           │
│  │ whatsapp (opcional)       │◄─── Para notificaciones                  │
│  │ createdAt                 │                                          │
│  │ lastSeenAt                │                                          │
│  └───────────────────────────┘                                          │
│              │                                                           │
│              │ Un Guest puede hacer pedidos en múltiples eventos        │
│              │                                                           │
│      ┌───────┴───────┐                                                  │
│      ▼               ▼                                                  │
│  SongRequest   KaraokeRequest                                           │
│                                                                          │
│  * Guest es GLOBAL (cross-evento)                                       │
│  * Sin password = máxima simplicidad                                    │
│  * localStorage para "recordarme"                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Modelo de Datos - Módulo MUSICADJ

```
┌───────────────────────────────────────────────────────────────┐
│                    MÓDULO MUSICADJ                            │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐      ┌─────────────────────────┐    │
│  │  MUSICADJ_CONFIG    │      │    SONG_REQUEST         │    │
│  ├─────────────────────┤      ├─────────────────────────┤    │
│  │ eventId (PK)        │      │ id                      │    │
│  │ enabled             │      │ eventId                 │    │
│  │ cooldownSeconds     │      │ guestId → Guest         │◄───│── Identificación
│  │ allowWithoutSpotify │      │ spotifyId (nullable)    │    │   unificada
│  │ welcomeMessage      │      │ title                   │    │
│  │ showQueueToClient   │      │ artist                  │    │
│  └─────────────────────┘      │ albumArtUrl             │    │
│                               │ status                  │    │
│                               │ priority                │    │
│                               │ createdAt               │    │
│                               └─────────────────────────┘    │
│                                                               │
│  ESTADOS: PENDING | HIGHLIGHTED | URGENT |                   │
│           PLAYED | DISCARDED                                  │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### 3.3 Modelo de Datos - Módulo KARAOKEYA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MÓDULO KARAOKEYA                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────┐      ┌─────────────────────────┐            │
│  │    KARAOKEYA_CONFIG       │      │   KARAOKE_REQUEST       │            │
│  ├───────────────────────────┤      ├─────────────────────────┤            │
│  │ eventId (PK)              │      │ id                      │            │
│  │ enabled                   │      │ eventId                 │            │
│  │ cooldownSeconds           │      │ guestId → Guest         │◄───────────│── Identificación
│  │ maxPerPerson              │      │ songId (FK opcional)    │◄──┐        │   unificada
│  │ showQueueToClient         │      │ title                   │   │        │
│  │ showNextSinger            │      │ artist                  │   │        │
│  │ ─── Sugerencias ───       │      │ turnNumber              │   │        │
│  │ suggestionsEnabled        │      │ queuePosition           │   │        │
│  │ suggestionsCount (0-5)    │      │ status                  │   │        │
│  │ allowedLanguages[]        │      │ createdAt / calledAt    │   │        │
│  └───────────────────────────┘      └─────────────────────────┘   │        │
│                                                                    │        │
│  ┌─────────────────────────────────────────────────────────────┐  │        │
│  │              KARAOKE_SONG (Catálogo Maestro)                │──┘        │
│  ├─────────────────────────────────────────────────────────────┤           │
│  │ id                                                          │           │
│  │ title                    # "Bohemian Rhapsody"              │           │
│  │ artist                   # "Queen"                          │           │
│  │ youtubeUrl               # Link a video con letra           │           │
│  │ language                 # ES | EN | PT                     │           │
│  │ difficulty (1-5)         # ⭐ a ⭐⭐⭐⭐⭐                      │           │
│  │ moods[]                  # ["NOSTALGICO", "SOY_CRACK"]      │           │
│  │ tags[]                   # ["Popular", "Clásico", "Dúo"]    │           │
│  │ timesRequested           # Contador global (aprendizaje)    │           │
│  │ timesCompleted           # Veces cantada exitosamente       │           │
│  │ createdAt / updatedAt                                       │           │
│  └─────────────────────────────────────────────────────────────┘           │
│                                                                             │
│  ESTADOS REQUEST: QUEUED | CALLED | ON_STAGE | COMPLETED | NO_SHOW         │
│                                                                             │
│  MOODS: PARA_ROMPERLA | ROMANTICO | BIEN_ARRIBA |                          │
│         NOSTALGICO | SOY_CRACK | SORPRENDEME                               │
│                                                                             │
│  IDIOMAS: ES (Español) | EN (English) | PT (Português)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Notas del Catálogo:**
- `KARAOKE_SONG` es una tabla global (no por evento)
- Se alimenta de canciones con videos de YouTube que contengan "LETRA" o "LYRICS"
- `timesRequested` y `timesCompleted` se actualizan con cada evento (aprendizaje cross-evento)
- Una canción puede tener múltiples moods (ej: "Don't Stop Me Now" = BIEN_ARRIBA + PARA_ROMPERLA)
- El campo `songId` en `KARAOKE_REQUEST` es opcional (puede ser búsqueda manual sin catálogo)

### 3.4 Sistema de Usuarios y Permisos

```
ROLES:
├── ADMIN
│   └── Acceso total al sistema
│       ├── Gestión de usuarios
│       ├── Gestión de eventos
│       └── Todos los módulos
│
├── MANAGER
│   └── Gestión de eventos asignados
│       ├── Crear/editar eventos
│       ├── Asignar operadores
│       └── Ver reportes
│
└── OPERATOR
    └── Operar módulos asignados
        ├── MUSICADJ (si tiene permiso)
        ├── KARAOKEYA (si tiene permiso)
        └── [Futuros módulos]

TABLA USER_PERMISSIONS:
├── userId
├── module (MUSICADJ | KARAOKEYA | ...)
├── canView
├── canOperate
└── canExport
```

### 3.5 Flujo de Acceso Cliente (QR → Módulos)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ACCESO UNIFICADO                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ESCANEO QR                                                              │
│     └── URL: euforia.events/e/martina-15-2501                              │
│                                                                             │
│  2. LANDING DEL EVENTO                                                      │
│     ┌─────────────────────────────────────┐                                │
│     │  🎉 Fiesta de Martina               │                                │
│     │  📍 Salón Aurora                    │                                │
│     │                                     │                                │
│     │  Email *         [____________]     │                                │
│     │  Nombre *        [____________]     │                                │
│     │  WhatsApp        [____________]     │  ← Opcional                    │
│     │                                     │                                │
│     │  ☑ Recordarme en este dispositivo  │  ← localStorage                │
│     │                                     │                                │
│     │        [INGRESAR 🎵]                │                                │
│     └─────────────────────────────────────┘                                │
│                         │                                                   │
│                         ▼                                                   │
│  3. HUB DE MÓDULOS (ya identificado)                                       │
│     ┌─────────────────────────────────────┐                                │
│     │  👋 ¡Hola, Juancho!                 │                                │
│     │                                     │                                │
│     │  ┌─────────┐      ┌─────────┐      │                                │
│     │  │ 🎵      │      │ 🎤      │      │                                │
│     │  │ PEDIR   │      │ CANTAR  │      │  ← Solo módulos habilitados    │
│     │  │ CANCIÓN │      │ KARAOKE │      │    para el evento              │
│     │  └─────────┘      └─────────┘      │                                │
│     │                                     │                                │
│     │  📋 Mis pedidos (3)                 │  ← Historial unificado        │
│     │  ¿No sos Juancho? [Cambiar]         │                                │
│     └─────────────────────────────────────┘                                │
│                         │                                                   │
│            ┌────────────┴────────────┐                                     │
│            ▼                         ▼                                     │
│  4a. MUSICADJ                  4b. KARAOKEYA                               │
│     ┌─────────────────┐           ┌─────────────────┐                      │
│     │ Buscar canción  │           │ Buscar / Sugerir│                      │
│     │ [___________]   │           │ [___] [✨Sugerir]│                      │
│     │                 │           │                 │                      │
│     │ • Despacito     │           │ Seleccionar mood│                      │
│     │ • Vivir Mi Vida │           │ → 3-5 opciones  │                      │
│     │ • ...           │           │ → Confirmar     │                      │
│     └─────────────────┘           └─────────────────┘                      │
│            │                              │                                 │
│            ▼                              ▼                                 │
│  5. CONFIRMACIÓN (datos ya cargados del Guest)                             │
│     ┌─────────────────────────────────────┐                                │
│     │  ✅ ¡Listo, Juancho!                │                                │
│     │                                     │                                │
│     │  Tu pedido fue registrado           │                                │
│     │  Te avisamos por WhatsApp           │  ← Si dejó número             │
│     │                                     │                                │
│     │  [← VOLVER]  [VER MIS PEDIDOS]      │                                │
│     └─────────────────────────────────────┘                                │
│                                                                             │
│  PANTALLA "MIS PEDIDOS" (unificada)                                        │
│     ┌─────────────────────────────────────┐                                │
│     │  📋 Mis pedidos - Juancho           │                                │
│     │                                     │                                │
│     │  🎵 MUSICADJ                        │                                │
│     │  ├─ "Despacito" ⏳ Pendiente        │                                │
│     │  └─ "Vivir Mi Vida" ✅ Reproducido  │                                │
│     │                                     │                                │
│     │  🎤 KARAOKEYA                       │                                │
│     │  └─ "Bohemian Rhapsody"             │                                │
│     │     🎯 Turno #7 (faltan 3)          │                                │
│     └─────────────────────────────────────┘                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Notas de implementación:**
- `localStorage` guarda `{email, displayName, whatsapp}` para evitar re-identificación
- Si el usuario vuelve con mismo email desde otro dispositivo → recupera historial
- Sin verificación de email (simplicidad > seguridad para este caso de uso)
- WhatsApp es opcional pero recomendado para notificaciones de turno

---

## 4. TODO (Tareas por Módulo)

### 4.1 Fase 0: Infraestructura Base ✅ COMPLETADA

| ID | Tarea | Estado | Notas |
|----|-------|--------|-------|
| T0.1 | Setup proyecto (monorepo structure) | ✅ | pnpm + turbo |
| T0.2 | Configuración Docker/Colima | ✅ | Colima para macOS Ventura |
| T0.3 | Setup base de datos SQLite + Prisma | ✅ | Schema sin enums |
| T0.4 | API base con Express + estructura de rutas | ✅ | /health y /api funcionando |
| T0.5 | Sistema de autenticación JWT | ⏳ | **PRÓXIMO** |
| T0.6 | Middleware de permisos por módulo | ⏳ | Depende de T0.5 |
| T0.7 | Setup Socket.io para realtime | ⏳ | |
| T0.8 | Frontend base React + routing | ✅ | Vite + Tailwind configurado |

### 4.2 Fase 1: Gestión de Eventos + Sistema Guest

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T1.1 | CRUD de eventos | ALTA | 6h |
| T1.2 | CRUD de venues (reutilizables) | ALTA | 4h |
| T1.3 | CRUD de clients (reutilizables) | ALTA | 4h |
| T1.4 | Formulario datos de evento | ALTA | 3h |
| T1.5 | Generación código QR por evento | ALTA | 2h |
| T1.6 | Estados de evento (draft/activo/finalizado) | ALTA | 2h |
| T1.7 | Duplicar evento existente | MEDIA | 3h |
| T1.8 | Listado de eventos con filtros | MEDIA | 3h |
| **T1.9** | **Modelo Guest + API identificación** | **ALTA** | **3h** |
| **T1.10** | **Landing evento: formulario identificación** | **ALTA** | **3h** |
| **T1.11** | **Hub de módulos + localStorage "recordarme"** | **ALTA** | **3h** |
| **T1.12** | **Pantalla "Mis pedidos" unificada** | **MEDIA** | **3h** |

### 4.3 Fase 2: Módulo MUSICADJ

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T2.1 | API endpoints CRUD song requests (con guestId) | CRÍTICA | 4h |
| T2.2 | Integración Spotify Web API (búsqueda) | CRÍTICA | 6h |
| T2.3 | Fallback búsqueda offline (base local) | ALTA | 4h |
| T2.4 | Interfaz cliente: búsqueda de temas | CRÍTICA | 4h |
| T2.5 | Interfaz cliente: confirmar pedido (datos precargados) | CRÍTICA | 2h |
| T2.6 | Interfaz operador: lista de pedidos | CRÍTICA | 6h |
| T2.7 | Interfaz operador: cambio de estados | CRÍTICA | 3h |
| T2.8 | Interfaz operador: drag&drop reordenar | ALTA | 4h |
| T2.9 | Interfaz operador: filtros y búsqueda | ALTA | 3h |
| T2.10 | Notificaciones realtime (Socket.io) | CRÍTICA | 4h |
| T2.11 | Control de cooldown por guest | ALTA | 3h |
| T2.12 | Exportación CSV | ALTA | 2h |
| T2.13 | Configuración módulo por evento | ALTA | 3h |
| T2.13 | Control de cooldown por cliente | ALTA | 3h |
| T2.14 | Exportación CSV | ALTA | 2h |
| T2.15 | Configuración módulo por evento | ALTA | 3h |

### 4.4 Fase 3: Módulo KARAOKEYA

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T3.1 | API endpoints CRUD karaoke requests (con guestId) | CRÍTICA | 4h |
| T3.2 | Sistema de turnos y cola | CRÍTICA | 4h |
| T3.3 | Interfaz cliente: anotarse (búsqueda + sugerencias) | CRÍTICA | 4h |
| T3.4 | Interfaz cliente: ver mi turno | ALTA | 3h |
| T3.5 | Interfaz operador: cola de turnos | CRÍTICA | 5h |
| T3.6 | Interfaz operador: llamar siguiente | CRÍTICA | 2h |
| T3.7 | Interfaz operador: reordenar cola | ALTA | 3h |
| T3.8 | Interfaz operador: marcar estados | ALTA | 2h |
| T3.9 | Display público (pantalla sala) | MEDIA | 4h |
| T3.10 | Notificaciones realtime + WhatsApp alert | CRÍTICA | 3h |
| T3.11 | Exportación CSV | ALTA | 2h |
| T3.12 | Configuración módulo por evento | ALTA | 3h |
| **T3.13** | **Catálogo maestro de canciones (KaraokeSongs)** | **ALTA** | **4h** |
| **T3.14** | **UI selección de mood (tarjetas visuales)** | **ALTA** | **3h** |
| **T3.15** | **Endpoint sugerencias por mood/idioma** | **ALTA** | **3h** |
| **T3.16** | **UI resultados con dificultad y tags** | **MEDIA** | **2h** |
| **T3.17** | **Sistema de aprendizaje cross-evento** | **MEDIA** | **4h** |
| **T3.18** | **Integración IA para "Sorpréndeme" (post-MVP)** | **BAJA** | **6h** |

#### Sistema de Sugerencias Inteligentes (T3.13-T3.18)

**Concepto:** El usuario puede buscar manualmente O pedir sugerencias por mood.

**Flujo:**
```
[BUSCAR CANCIÓN]  ─── o ───  [✨ SUGERIME ALGO]
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              🎉 PARA         😍 ROMÁNTICO    🔥 BIEN ARRIBA
              ROMPERLA        Baladas         Hits bailables
                    │               │               │
                    ▼               ▼               ▼
              😢 NOSTÁLGICO   🎯 SOY CRACK    🎲 SORPRÉNDEME
              Clásicos        Desafío vocal   Random
                    │
                    ▼
            [Filtro idioma: ES/EN/PT/Todos]
                    │
                    ▼
            [3-5 canciones sugeridas]
            - Título + Artista
            - Dificultad (⭐ a ⭐⭐⭐⭐⭐)
            - Tag contextual
            - Link YouTube (referencia)
                    │
                    ▼
            [🔄 OTRAS] [✅ ELEGIR ESTA]
```

**Moods disponibles:**
| Mood | Descripción | Ejemplo canciones |
|------|-------------|-------------------|
| PARA_ROMPERLA | Fiesta, diversión, coreables | Despacito, Vivir Mi Vida |
| ROMANTICO | Baladas de amor | My Heart Will Go On, Te Amo |
| BIEN_ARRIBA | Hits bailables energéticos | Don't Stop Me Now, Uptown Funk |
| NOSTALGICO | Clásicos emotivos | Bohemian Rhapsody, Hotel California |
| SOY_CRACK | Desafío vocal, canciones difíciles | I Will Always Love You, Nessun Dorma |
| SORPRENDEME | Random inteligente | Basado en popularidad del evento |

**Configuración por evento (KaraokeyaConfig):**
- `suggestionsEnabled`: Boolean (habilitar/deshabilitar feature)
- `suggestionsCount`: 0-5 (cantidad de sugerencias, 0 = deshabilitado)
- `allowedLanguages`: String[] (ES, EN, PT, o vacío = todos)

### 4.5 Fase 4: Gestión de Usuarios

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T4.1 | CRUD usuarios (admin) | CRÍTICA | 4h |
| T4.2 | Asignación de roles | CRÍTICA | 3h |
| T4.3 | Asignación de permisos por módulo | CRÍTICA | 4h |
| T4.4 | Cambio de contraseña | ALTA | 2h |
| T4.5 | Login/logout con sesión | CRÍTICA | 3h |
| T4.6 | Recuperación de contraseña (email) | BAJA | 4h |

### 4.6 Fase 5: Modo Offline

| ID | Tarea | Prioridad | Estimación |
|----|-------|-----------|------------|
| T5.1 | Service Worker para PWA | ALTA | 4h |
| T5.2 | IndexedDB para cache local | ALTA | 6h |
| T5.3 | Detección online/offline | ALTA | 2h |
| T5.4 | Cola de sincronización | ALTA | 6h |
| T5.5 | Resolución de conflictos | MEDIA | 4h |
| T5.6 | Base de datos de temas offline | ALTA | 4h |

---

## 5. ROADMAP ACTUALIZADO

### Fase 0: Foundation ✅ COMPLETADA (2025-01-27)

```
Objetivo: Infraestructura funcional
Entregable: Monorepo funcionando con API, frontends y DB

Completado:
✅ Estructura monorepo (pnpm + turbo)
✅ API Express respondiendo en :3000
✅ Frontend cliente en :5173
✅ Frontend operador en :5174
✅ Prisma + SQLite configurado
✅ Schema de base de datos creado
✅ Código en GitHub

Pendiente para cerrar fase:
⏳ T0.5: Sistema de autenticación JWT
⏳ T0.6: Middleware de permisos
⏳ T0.7: Socket.io base
```

### Fase 1: Event Management (Semana 2-3)
```
Objetivo: Poder crear y configurar eventos
Entregable: CRUD completo de eventos, venues y clients

Tareas: T1.1 → T1.8
Hitos:
├── [ ] CRUD de Venues y Clients
├── [ ] CRUD de Eventos
├── [ ] Formularios completos
└── [ ] QR funcionando
```

### Fase 2: MUSICADJ MVP (Semana 4-5)
```
Objetivo: Módulo de pedidos musicales funcional
Entregable: Clientes piden temas, DJ los ve en tiempo real

Tareas: T2.1 → T2.15
```

### Fase 3: KARAOKEYA MVP (Semana 6-7)
```
Objetivo: Módulo de karaoke funcional
Entregable: Sistema de turnos operativo

Tareas: T3.1 → T3.12
```

### Fase 4: Users & Permissions (Semana 8)
```
Objetivo: Sistema de usuarios completo
Entregable: Admin puede gestionar usuarios y permisos

Tareas: T4.1 → T4.5
```

### Fase 5: Offline Mode (Semana 9-10)
```
Objetivo: Funcionalidad sin internet
Entregable: App funciona offline, sincroniza al reconectar

Tareas: T5.1 → T5.6
```

### Fase 6: Polish & Testing (Semana 11-12)
```
Objetivo: Producto listo para producción
Entregables: 
- Tests automatizados
- Documentación
- Deploy pipeline
- Manual de usuario
```

---

## 6. MÉTRICAS DE ÉXITO

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de carga cliente | < 3 segundos | Lighthouse |
| Latencia pedido → visualización DJ | < 500ms | Logs |
| Uptime en evento | 99.9% | Monitoreo |
| Funcionamiento offline | 100% features core | Testing manual |
| Satisfacción operador | > 4/5 | Feedback |

---

## 7. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| API Spotify rate limits | Media | Alto | Cache agresivo, fallback offline |
| Pérdida de conexión en evento | Alta | Crítico | Modo offline robusto |
| Múltiples operadores simultáneos | Media | Medio | Locks optimistas, merge strategy |
| Volumen alto de pedidos | Baja | Medio | Throttling, cola de procesamiento |

---

## 8. DEFINICIONES TÉCNICAS

### Slugs de Evento (URL amigable)
- Formato: `[nombre-evento]-[MMYY]` o personalizado
- Ejemplos: `martina-15-0125`, `boda-juan-maria-0225`, `bar-central-vie`
- URL: `https://euforia.events/e/martina-15-0125`

### Estados de Evento
- `DRAFT`: En configuración, no accesible para clientes
- `ACTIVE`: Evento en curso, módulos habilitados funcionando
- `PAUSED`: Temporalmente deshabilitado
- `FINISHED`: Cerrado, solo lectura, disponible para export

### Configuración por Defecto
```json
{
  "cooldownSeconds": 300,
  "allowWithoutSpotify": true,
  "showQueueToClient": false,
  "maxRequestsPerPerson": 0,
  "welcomeMessage": "¡Bienvenido! Pedí tu tema favorito"
}
```

---

## CHANGELOG

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.3 | 2025-12-05 | Modelo Guest para identificación simplificada (sin password), flujo de acceso unificado QR→Guest→Módulos, pantalla "Mis pedidos" unificada, SongRequest y KaraokeRequest ahora usan guestId |
| 1.2 | 2025-01-27 | Sistema de sugerencias inteligentes KARAOKEYA (T3.13-T3.18), catálogo maestro KaraokeSong, config sugerencias por evento |
| 1.1 | 2025-01-27 | Roadmap actualizado post-setup, Venues y Clients como entidades reutilizables, slugs amigables |
| 1.0 | 2025-01-XX | Documento inicial |

---

*Documento generado para el proyecto EUFORIA EVENTS*
*Repositorio: https://github.com/Malcomito17/EuforiaEvents*
*Última actualización: 2025-12-05*

# 🎉 EUFORIA EVENTS

Sistema modular de gestión de eventos para DJs y operadores de karaoke, diseñado para eventos sociales (bodas, cumpleaños de 15, fiestas corporativas, etc.).

**Versión:** 0.4.0 | **Schema:** v1.3 | **Estado:** En desarrollo activo

---

## 🎯 Descripción

EUFORIA EVENTS es una plataforma integral que permite a DJs y operadores gestionar eventos en tiempo real, con dos módulos principales:

- **MUSICADJ**: Sistema de pedidos musicales con búsqueda Spotify, gestión de cola en tiempo real, cooldown configurable y panel de DJ profesional.
- **KARAOKEYA**: Sistema de karaoke con catálogo maestro, pedidos de canciones, gestión de cantantes y turnos.

Los invitados acceden vía código QR sin necesidad de registrarse (solo email), pueden pedir temas y ver el estado de sus solicitudes en tiempo real.

---

## ✨ Features Principales

### ✅ Fase 0: Foundation (100%)
- Monorepo con pnpm + Turbo
- Backend API REST con Express + TypeScript
- Base de datos SQLite + Prisma ORM (optimizada para Raspberry Pi)
- Autenticación JWT con roles (ADMIN, MANAGER, OPERATOR)
- Sistema de permisos por módulo
- Frontend base con React + Vite + Tailwind CSS
- Socket.io para actualizaciones en tiempo real
- Docker Compose para desarrollo

### ✅ Fase 1: Event Management (100%)
- CRUD completo de Venues (salones, locaciones)
- CRUD completo de Clients (clientes)
- CRUD completo de Events con estados (DRAFT, ACTIVE, PAUSED, FINISHED)
- Generación de códigos QR por evento
- Duplicación de eventos con configuración
- Sistema de Guest sin password (email + displayName)
- Frontend operator completo (Venues, Clients, Events, QR)

### ✅ Fase 2: MUSICADJ MVP (50%)
**Backend (100%):**
- Sistema de pedidos con Guest model (v1.3)
- Búsqueda en Spotify API (opcional)
- Cooldown configurable per-guest, per-event
- Estados: PENDING, HIGHLIGHTED, URGENT, PLAYED, DISCARDED
- Sistema de prioridades para reordenar cola
- Estadísticas en tiempo real
- Socket.io para actualizaciones instantáneas
- Config por evento (enabled, cooldown, allowWithoutSpotify, etc.)

**Frontend Operator (100%):**
- Panel DJ con Socket.io real-time
- Filtros por estado (all, active, played, discarded)
- Búsqueda de pedidos
- Acciones rápidas (HIGHLIGHTED, URGENT, PLAYED, DISCARDED)
- Stats cards en vivo
- Connection status indicator
- Album art display
- Links a Spotify

**Frontend Cliente (0%):**
- Identificación Guest (pendiente)
- Búsqueda y pedido de tema (pendiente)
- Vista "Mis pedidos" (pendiente)

### 🚧 Fase 3: KARAOKEYA MVP (0%)
- Catálogo maestro de canciones
- Pedidos de karaoke con turno
- Panel de operador con gestión de cantantes
- Vista para invitados

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express + TypeScript
- **Database:** SQLite con WAL mode (optimizado para RPi 4)
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT
- **Real-time:** Socket.io
- **APIs:** Spotify Web API (Client Credentials Flow)

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** Zustand
- **Forms:** react-hook-form
- **HTTP:** Axios
- **Real-time:** Socket.io Client

### DevOps
- **Monorepo:** pnpm + Turbo
- **Containerization:** Docker + Docker Compose
- **Target Platform:** Raspberry Pi 4 (production)

---

## 🚀 Quick Start

### Prerrequisitos
- Node.js 20+
- pnpm 10+
- Docker & Docker Compose (opcional)

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd euforia-events

# Instalar dependencias
pnpm install

# Generar Prisma Client
cd apps/api
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed

# Variables de entorno (opcional)
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env con tus credenciales de Spotify
```

### Desarrollo

#### Opción A: Sin Docker

```bash
# Terminal 1: API
cd apps/api
pnpm dev
# API running on http://localhost:3000

# Terminal 2: Web Operator
cd apps/web-operator
pnpm dev
# Frontend on http://localhost:5174

# Terminal 3: Web Client (cuando esté listo)
cd apps/web-client
pnpm dev
# Frontend on http://localhost:5173
```

#### Opción B: Con Docker

```bash
docker-compose up
# API: http://localhost:3000
# Web Operator: http://localhost:5174
# Web Client: http://localhost:5173
```

### Credenciales de Prueba

```
Usuario: admin
Password: admin123
Rol: ADMIN (acceso completo)

Usuario: operador
Password: admin123
Rol: OPERATOR (acceso a MUSICADJ y KARAOKEYA)
```

---

## 📂 Project Structure

```
euforia-events/
├── apps/
│   ├── api/                    # Backend API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema v1.3
│   │   │   └── seed.ts         # Seed data
│   │   └── src/
│   │       ├── modules/        # Feature modules
│   │       │   ├── auth/       # JWT authentication
│   │       │   ├── events/     # Event management
│   │       │   ├── venues/     # Venue CRUD
│   │       │   ├── clients/    # Client CRUD
│   │       │   ├── guests/     # Guest model (v1.3)
│   │       │   ├── musicadj/   # MUSICADJ module
│   │       │   └── karaokeya/  # KARAOKEYA module (WIP)
│   │       ├── socket/         # Socket.io handlers
│   │       └── shared/         # Utils, middleware
│   ├── web-operator/           # Operator dashboard
│   │   └── src/
│   │       ├── pages/          # React pages
│   │       ├── components/     # Shared components
│   │       ├── lib/            # API client, socket
│   │       └── stores/         # Zustand stores
│   └── web-client/             # Client public app
│       └── src/                # (WIP)
├── docs/                       # Documentation
│   ├── EUFORIA_EVENTS_SPEC_v1.3.md
│   ├── EUFORIA_EVENTS_TECH_REQUIREMENTS_v1.3.md
│   ├── EUFORIA_EVENTS_ROADMAP_v2.md
│   ├── PROGRESO_FASES_0_1_2.md
│   ├── FASE_1_TESTING.md
│   ├── FASE_1_UI_VERIFICATION.md
│   └── FASE_2_TESTING.md
├── docker/                     # Dockerfiles
├── docker-compose.yml
├── package.json                # Root workspace
└── pnpm-workspace.yaml
```

---

## 📖 API Documentation

### Base URL (Development)
```
http://localhost:3000/api
```

### Available Endpoints

#### Authentication
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user
- `POST /auth/change-password` - Change password

#### Events
- `GET /events` - List events
- `GET /events/slug/:slug` - Get by slug (public)
- `POST /events` - Create event
- `PATCH /events/:id` - Update event
- `PATCH /events/:id/status` - Update status
- `POST /events/:id/duplicate` - Duplicate event
- `GET /events/:id/qr` - Get QR code

#### Venues & Clients
- Full CRUD for both resources
- Soft delete with reactivation

#### Guests (v1.3)
- `POST /guests/identify` - Identify guest (email-based)
- `GET /guests/:id/requests` - Get all guest requests

#### MUSICADJ
**Public endpoints:**
- `GET /events/:eventId/musicadj/config`
- `GET /events/:eventId/musicadj/search` (Spotify)
- `POST /events/:eventId/musicadj/requests` (create request)

**Protected endpoints (operator):**
- `PATCH /events/:eventId/musicadj/config`
- `GET /events/:eventId/musicadj/requests` (list with filters)
- `GET /events/:eventId/musicadj/requests/:id`
- `PATCH /events/:eventId/musicadj/requests/:id` (update status)
- `DELETE /events/:eventId/musicadj/requests/:id`
- `POST /events/:eventId/musicadj/requests/reorder`
- `GET /events/:eventId/musicadj/stats`

**Ver documentación completa:** [docs/FASE_2_TESTING.md](./docs/FASE_2_TESTING.md)

---

## 🔄 Real-time Events (Socket.io)

### Room Pattern
```
event:{eventId}
```

### MUSICADJ Events
- `musicadj:newRequest` - New request created
- `musicadj:requestUpdated` - Request status/priority changed
- `musicadj:requestDeleted` - Request deleted
- `musicadj:queueReordered` - Queue manually reordered
- `musicadj:configUpdated` - Config changed

---

## 🗄️ Database Schema v1.3

### Key Models
- **User**: Admin, manager, operator users
- **UserPermission**: Module-based permissions
- **Venue**: Event locations
- **Client**: Event clients/customers
- **Event** + **EventData**: Event info and metadata
- **Guest**: Cross-event guest tracking (email-based, no password)
- **SongRequest**: MUSICADJ song requests (→ Guest FK)
- **MusicadjConfig**: Per-event MUSICADJ settings
- **KaraokeSong**: Master karaoke catalog
- **KaraokeRequest**: Karaoke requests (→ Guest FK)
- **KaraokeyaConfig**: Per-event KARAOKEYA settings

**Major Change in v1.3:**
- Introduced **Guest model** as single source of truth
- Removed duplicate `requesterName`, `requesterEmail` fields from requests
- All requests now use `guestId` FK to Guest table
- Enables cross-event guest tracking and analytics

---

## 📊 Development Status

```
FASE 0: Foundation          [████████████████████] 100% ✅
FASE 1: Event Management    [████████████████████] 100% ✅
FASE 2: MUSICADJ MVP        [██████████░░░░░░░░░░]  50% ✅
FASE 3: KARAOKEYA MVP       [░░░░░░░░░░░░░░░░░░░░]   0%
FASE 4: Users & Permissions [░░░░░░░░░░░░░░░░░░░░]   0%
FASE 5: Testing & Polish    [░░░░░░░░░░░░░░░░░░░░]   0%
```

**Total Progress:** Backend ~70%, Frontend ~45%

**Ver progreso detallado:** [docs/PROGRESO_FASES_0_1_2.md](./docs/PROGRESO_FASES_0_1_2.md)

---

## 🧪 Testing

### Backend Tests
```bash
cd apps/api

# Unit tests (pendiente)
pnpm test

# Manual API testing
# Ver: docs/FASE_1_TESTING.md
# Ver: docs/FASE_2_TESTING.md
```

### Frontend Tests
```bash
cd apps/web-operator
pnpm test
```

---

## 🚀 Production Deployment

### Target Platform
- **Hardware:** Raspberry Pi 4 (4GB RAM)
- **OS:** Raspberry Pi OS Lite (64-bit)
- **Storage:** SSD USB 3.0
- **Network:** Ethernet + WiFi hotspot for clients

### Build for Production

```bash
# Build all apps
pnpm build

# Start production API
cd apps/api
NODE_ENV=production pnpm start

# Serve static frontends (nginx)
```

### Environment Variables

```env
# API (apps/api/.env)
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key"
NODE_ENV="production"

# Spotify (opcional)
SPOTIFY_CLIENT_ID="your-client-id"
SPOTIFY_CLIENT_SECRET="your-client-secret"

# URLs
FRONTEND_URL="http://raspberry-pi-ip:5174"
CLIENT_URL="http://raspberry-pi-ip:5173"
```

---

## 📝 Documentation

- **[Specification v1.3](./docs/EUFORIA_EVENTS_SPEC_v1.3.md)** - Complete feature spec
- **[Tech Requirements v1.3](./docs/EUFORIA_EVENTS_TECH_REQUIREMENTS_v1.3.md)** - Technical decisions
- **[Roadmap v2](./docs/EUFORIA_EVENTS_ROADMAP_v2.md)** - Development roadmap
- **[Progress Report](./docs/PROGRESO_FASES_0_1_2.md)** - Current status
- **[Phase 1 Testing](./docs/FASE_1_TESTING.md)** - API testing guide (Events, Venues, Clients)
- **[Phase 1 UI Verification](./docs/FASE_1_UI_VERIFICATION.md)** - Frontend verification report
- **[Phase 2 Testing](./docs/FASE_2_TESTING.md)** - MUSICADJ API testing guide

---

## 🤝 Contributing

Este proyecto está en desarrollo activo. Contactar al maintainer para contribuir.

---

## 📄 License

Proprietary - All rights reserved

---

## 👨‍💻 Author

Desarrollado para operaciones de DJ y karaoke en eventos sociales en Ushuaia, Argentina.

---

**¿Necesitas ayuda?** Revisa la documentación en `docs/` o contacta al equipo de desarrollo.

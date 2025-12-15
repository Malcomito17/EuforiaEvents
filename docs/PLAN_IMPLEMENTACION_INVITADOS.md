# Plan de Implementación - Módulo INVITADOS
## Fecha: 2025-01-14

---

## 🎯 OBJETIVO

Implementar el módulo de gestión de invitados formales del evento, incluyendo:
- Lista pre-armada de invitados
- Check-in de asistencia
- Asignación de mesas
- Asignación de menú
- Restricciones alimentarias

---

## 📋 PRE-REQUISITOS

### PASO 0: Refactor Guest → Participant

**Archivos a modificar** (estimado: 25+ archivos):

#### Backend (API)
- `prisma/schema.prisma` - Renombrar modelo
- `modules/guests/` → `modules/participants/`
  - `guests.service.ts` → `participants.service.ts`
  - `guests.controller.ts` → `participants.controller.ts`
  - `guests.routes.ts` → `participants.routes.ts`
  - `guests.types.ts` → `participants.types.ts`
- `modules/musicadj/musicadj.service.ts` - Referencias a Guest
- `modules/musicadj/musicadj.types.ts` - Tipos
- `modules/karaokeya/karaokeya.service.ts` - Referencias a Guest
- `modules/karaokeya/karaokeya.types.ts` - Tipos

#### Frontend (web-client)
- `src/services/guestService.ts` → `participantService.ts`
- `src/stores/guestStore.ts` → `participantStore.ts`
- Todas las páginas que usen Guest (6+ archivos)

#### Frontend (web-operator)
- Referencias en páginas de MUSICADJ y KARAOKEYA

#### Migración de Base de Datos
```bash
# Crear migración
pnpm --filter api prisma migrate dev --name rename_guest_to_participant

# Actualizar seed
pnpm --filter api prisma db seed
```

**Tiempo estimado**: 2-3 horas

---

## 📊 FASE 1: MODELO DE DATOS

### 1.1 Schema Prisma - Modelo Guest (Invitados)

```prisma
model Guest {
  id              String    @id @default(cuid())
  eventId         String

  // Datos personales
  fullName        String    // Nombre completo
  email           String?   // OPCIONAL
  phone           String?
  company         String?   // Empresa (para eventos corporativos)

  // Check-in
  checkedIn       Boolean   @default(false)
  checkedInAt     DateTime?
  checkedInBy     String?   // userId del recepcionista

  // Asignaciones
  tableId         String?

  // Datos adicionales
  notes           String?   // Observaciones generales
  dietaryRestrictions String? // JSON: ["celíaco", "vegano", "sin_lactosa"]

  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  createdBy       String?   // userId

  // Relaciones
  event           Event     @relation("EventGuests", fields: [eventId], references: [id], onDelete: Cascade)
  table           Table?    @relation("TableGuests", fields: [tableId], references: [id], onDelete: SetNull)
  participantId   String?   @unique
  participant     Participant? @relation("GuestParticipant", fields: [participantId], references: [id])
  guestDishes     GuestDish[]

  @@index([eventId])
  @@index([eventId, checkedIn])
  @@index([eventId, fullName])
  @@index([tableId])
  @@index([email])
}
```

### 1.2 Actualización Modelo Participant

```prisma
model Participant {
  id              String   @id @default(cuid())
  email           String   @unique
  displayName     String
  whatsapp        String?
  isSystemParticipant Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relación con invitado formal
  guest           Guest?   @relation("GuestParticipant")

  // Servicios públicos
  songRequests    SongRequest[]
  karaokeRequests KaraokeRequest[]
  likedSongs      KaraokeSongLike[]

  @@index([email])
}
```

---

## 🔧 FASE 2: BACKEND - API

### 2.1 Estructura del Módulo

```
modules/guests/
├── guests.controller.ts
├── guests.service.ts
├── guests.routes.ts
├── guests.types.ts
└── index.ts
```

### 2.2 Zod Schemas (guests.types.ts)

**Tipos de validación**:
- `createGuestSchema` - Crear invitado
- `updateGuestSchema` - Actualizar invitado
- `bulkImportGuestsSchema` - Importación masiva
- `checkInGuestSchema` - Marcar check-in
- `assignTableSchema` - Asignar mesa
- `guestFiltersSchema` - Filtros de búsqueda

**Estados/Enums**:
- Dietary restrictions: VEGETARIANO, VEGANO, CELIACO, SIN_LACTOSA, KOSHER, HALAL, etc.

### 2.3 Endpoints REST (guests.routes.ts)

```
# Gestión de invitados (protegido - ADMIN, MANAGER, OPERATOR)
GET    /api/events/:eventId/guests
POST   /api/events/:eventId/guests
GET    /api/events/:eventId/guests/:id
PATCH  /api/events/:eventId/guests/:id
DELETE /api/events/:eventId/guests/:id

# Importación masiva
POST   /api/events/:eventId/guests/import         (CSV/JSON)
GET    /api/events/:eventId/guests/export         (CSV/Excel)
GET    /api/events/:eventId/guests/template       (CSV vacío)

# Check-in (protegido - RECEPTION)
POST   /api/events/:eventId/guests/:id/checkin
POST   /api/events/:eventId/guests/:id/checkout
GET    /api/events/:eventId/guests/search         (búsqueda rápida)

# Asignaciones
PATCH  /api/events/:eventId/guests/:id/table      (asignar mesa)
PATCH  /api/events/:eventId/guests/:id/menu       (asignar platos)

# Estadísticas
GET    /api/events/:eventId/guests/stats          (total, checked-in, pendientes)

# Enlace con Participante
POST   /api/events/:eventId/guests/:id/link-participant
DELETE /api/events/:eventId/guests/:id/unlink-participant
```

### 2.4 Lógica de Negocio (guests.service.ts)

**Funciones principales**:
- `create(eventId, input, userId)` - Crear invitado
- `findById(guestId)` - Buscar por ID
- `findAll(eventId, filters)` - Listar con filtros
- `update(guestId, input)` - Actualizar
- `delete(guestId)` - Eliminar
- `checkIn(guestId, userId)` - Marcar ingreso
- `checkOut(guestId)` - Desmarcar ingreso
- `search(eventId, query)` - Búsqueda rápida (nombre, email, teléfono)
- `bulkImport(eventId, guests, userId)` - Importar CSV/JSON
- `export(eventId, format)` - Exportar a CSV/Excel
- `linkParticipant(guestId, participantId)` - Enlazar con participante
- `autoLinkByEmail(eventId)` - Enlace automático por email
- `getStats(eventId)` - Estadísticas del evento

**Validaciones**:
- Email único por evento (opcional, pero si existe debe ser único)
- No permitir check-in duplicado
- Validar que mesa exista antes de asignar
- Verificar restricciones alimentarias al asignar platos

### 2.5 Error Handling

```typescript
export class GuestError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'GuestError'
  }
}
```

**Errores comunes**:
- Guest not found (404)
- Email already exists in this event (400)
- Already checked in (400)
- Table not found (404)
- Invalid dietary restriction (400)

---

## 🎨 FASE 3: FRONTEND - Web Operator

### 3.1 Páginas Nuevas

```
apps/web-operator/src/pages/
├── Guests/
│   ├── GuestList.tsx           # Lista principal
│   ├── GuestCreate.tsx         # Crear invitado
│   ├── GuestEdit.tsx           # Editar invitado
│   ├── GuestImport.tsx         # Importación masiva
│   └── GuestStats.tsx          # Estadísticas
```

### 3.2 Componentes

```
apps/web-operator/src/components/
├── GuestCard.tsx               # Card de invitado
├── GuestTable.tsx              # Tabla con búsqueda/filtros
├── GuestForm.tsx               # Formulario crear/editar
├── CheckInBadge.tsx            # Badge de estado check-in
├── DietaryBadge.tsx            # Badge de restricciones
└── GuestImportModal.tsx        # Modal de importación
```

### 3.3 Servicios

```typescript
// apps/web-operator/src/services/guestService.ts
export const guestService = {
  getAll(eventId, filters)
  getById(guestId)
  create(eventId, data)
  update(guestId, data)
  delete(guestId)
  search(eventId, query)
  checkIn(guestId)
  checkOut(guestId)
  import(eventId, file)
  export(eventId, format)
  linkParticipant(guestId, participantId)
  getStats(eventId)
}
```

### 3.4 Store (Zustand)

```typescript
// apps/web-operator/src/stores/guestStore.ts
interface GuestStore {
  guests: Guest[]
  selectedGuest: Guest | null
  loading: boolean
  filters: GuestFilters
  stats: GuestStats | null

  fetchGuests(eventId)
  fetchGuestById(id)
  createGuest(eventId, data)
  updateGuest(id, data)
  deleteGuest(id)
  searchGuests(eventId, query)
  checkIn(id)
  checkOut(id)
  setFilters(filters)
  fetchStats(eventId)
}
```

### 3.5 Rutas

```tsx
// Agregar en App.tsx o Routes.tsx
<Route path="/events/:eventId/guests" element={<GuestList />} />
<Route path="/events/:eventId/guests/new" element={<GuestCreate />} />
<Route path="/events/:eventId/guests/:guestId" element={<GuestEdit />} />
<Route path="/events/:eventId/guests/import" element={<GuestImport />} />
```

---

## 📱 FASE 4: FRONTEND - Web Check-in (Futuro)

**Nota**: Se implementará en fase posterior

```
apps/web-checkin/
├── src/
│   ├── pages/
│   │   ├── Login.tsx           # Login con rol RECEPTION
│   │   ├── Search.tsx          # Búsqueda rápida
│   │   └── GuestDetail.tsx     # Detalle + botón check-in
│   └── services/
│       └── checkinService.ts
```

---

## 🔄 FASE 5: ENLACE AUTOMÁTICO Participant ↔ Guest

### Lógica de Auto-enlace

```typescript
// Cuando un Participant se registra
async function identifyParticipant(email, displayName, eventId?) {
  // 1. Crear o actualizar Participant
  const participant = await upsertParticipant(email, displayName)

  // 2. Si se especifica eventId, buscar Guest con mismo email
  if (eventId) {
    const guest = await prisma.guest.findFirst({
      where: {
        eventId,
        email,
        participantId: null  // No enlazado previamente
      }
    })

    // 3. Si existe, enlazar automáticamente
    if (guest) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: { participantId: participant.id }
      })

      console.log(`[AUTO-LINK] Guest ${guest.fullName} linked to Participant ${email}`)
    }
  }

  return participant
}
```

### Endpoint Manual

```typescript
// POST /api/events/:eventId/guests/:guestId/link-participant
async function linkParticipant(guestId, participantId) {
  // Validar que ambos existen
  const guest = await prisma.guest.findUnique({ where: { id: guestId } })
  const participant = await prisma.participant.findUnique({ where: { id: participantId } })

  if (!guest || !participant) {
    throw new GuestError('Guest or Participant not found', 404)
  }

  // Enlazar
  await prisma.guest.update({
    where: { id: guestId },
    data: { participantId }
  })

  return { message: 'Linked successfully', guest, participant }
}
```

---

## 📊 FASE 6: IMPORTACIÓN MASIVA

### Formato CSV Esperado

```csv
fullName,email,phone,company,dietaryRestrictions,notes
Juan Pérez,juan@example.com,1234567890,Acme Inc,"celíaco,vegano",Llega tarde
María González,maria@example.com,0987654321,,vegetariano,
```

### Lógica de Importación

```typescript
async function bulkImport(eventId, csvData, userId) {
  const results = {
    created: 0,
    updated: 0,
    errors: []
  }

  for (const row of csvData) {
    try {
      // Validar datos
      const validated = createGuestSchema.parse(row)

      // Buscar existente por email (si tiene)
      let guest = null
      if (validated.email) {
        guest = await prisma.guest.findFirst({
          where: { eventId, email: validated.email }
        })
      }

      if (guest) {
        // Actualizar existente
        await prisma.guest.update({
          where: { id: guest.id },
          data: validated
        })
        results.updated++
      } else {
        // Crear nuevo
        await prisma.guest.create({
          data: {
            ...validated,
            eventId,
            createdBy: userId
          }
        })
        results.created++
      }
    } catch (error) {
      results.errors.push({
        row,
        error: error.message
      })
    }
  }

  return results
}
```

---

## 🧪 TESTING

### Tests Unitarios (Backend)

```
apps/api/src/modules/guests/__tests__/
├── guests.service.test.ts
├── guests.controller.test.ts
└── auto-link.test.ts
```

**Casos de prueba**:
- Crear invitado con email único
- Crear invitado sin email
- Check-in correcto
- Check-in duplicado (debe fallar)
- Auto-enlace por email
- Enlace manual
- Importación CSV válida
- Importación CSV con errores
- Búsqueda por nombre/email/teléfono
- Filtros combinados

### Tests E2E (Frontend)

```
apps/web-operator/e2e/
└── guests.spec.ts
```

**Flujos a probar**:
- Crear invitado manualmente
- Editar invitado
- Eliminar invitado
- Importar CSV
- Buscar invitado
- Marcar check-in desde operador

---

## 📦 MIGRACIÓN

### Script de Migración

```bash
# 1. Crear migración Prisma
cd apps/api
pnpm prisma migrate dev --name add_guests_module

# 2. Ejecutar migración
pnpm prisma migrate deploy

# 3. Seed de datos de prueba (opcional)
pnpm prisma db seed
```

### Rollback Plan

```bash
# Si algo falla, revertir migración
pnpm prisma migrate resolve --rolled-back [migration_name]
```

---

## 📝 DOCUMENTACIÓN

### Actualizar Documentación

- `docs/API.md` - Agregar endpoints de Guests
- `docs/MODULES.md` - Agregar descripción del módulo
- `README.md` - Actualizar lista de módulos

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### PASO 1: Refactor Guest → Participant
- [ ] Actualizar schema.prisma
- [ ] Migración de BD
- [ ] Renombrar archivos backend
- [ ] Actualizar imports y referencias
- [ ] Renombrar archivos frontend
- [ ] Testing completo
- [ ] Commit: "refactor: rename Guest to Participant"

### PASO 2: Modelo Guest (Invitados)
- [ ] Definir schema en Prisma
- [ ] Migración de BD
- [ ] Crear tipos TypeScript
- [ ] Testing del modelo

### PASO 3: Backend - Módulo Guests
- [ ] Crear estructura de archivos
- [ ] Implementar Zod schemas
- [ ] Implementar service layer
- [ ] Implementar controller
- [ ] Implementar routes
- [ ] Error handling
- [ ] Testing unitario

### PASO 4: Backend - Auto-enlace
- [ ] Lógica de auto-enlace en Participant identification
- [ ] Endpoint manual de enlace
- [ ] Testing de enlace

### PASO 5: Backend - Importación
- [ ] Parser de CSV
- [ ] Lógica de bulk import
- [ ] Endpoint de importación
- [ ] Endpoint de exportación
- [ ] Endpoint de template
- [ ] Testing de importación

### PASO 6: Frontend - Operator
- [ ] Páginas (List, Create, Edit, Import)
- [ ] Componentes reutilizables
- [ ] Service layer
- [ ] Store (Zustand)
- [ ] Rutas
- [ ] Testing E2E

### PASO 7: Integración
- [ ] Agregar enlace en menú del operador
- [ ] Integrar con módulo de eventos
- [ ] Testing de integración completa
- [ ] Documentación

### PASO 8: Deploy
- [ ] Build de producción
- [ ] Migración de BD en producción
- [ ] Deploy
- [ ] Smoke testing en producción

---

## ⏱️ ESTIMACIÓN DE TIEMPOS

| Fase | Tiempo Estimado |
|------|----------------|
| Refactor Guest → Participant | 2-3 horas |
| Modelo Guest + Migración | 1 hora |
| Backend Service + Controller | 3-4 horas |
| Backend Routes + Testing | 2 horas |
| Auto-enlace + Testing | 1-2 horas |
| Importación CSV | 2-3 horas |
| Frontend Operator (páginas) | 4-5 horas |
| Frontend Operator (componentes) | 2-3 horas |
| Integración y testing | 2 horas |
| Documentación | 1 hora |
| **TOTAL** | **20-26 horas** |

---

## 🚀 PRÓXIMOS MÓDULOS

Después de completar Invitados:
1. **Mesas** (asignación espacial)
2. **Menú** (gestión de platos y asignación)
3. **Check-in App** (interfaz de recepción)
4. **Timeline** (agenda del evento)

---

**Documento creado**: 2025-01-14
**Última actualización**: 2025-01-14

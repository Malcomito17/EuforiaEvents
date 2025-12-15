# Modelo Invitados - Versión Corregida
## Fecha: 2025-01-14

---

## 🎯 CONCEPTO CLAVE

**Un individuo (Persona)** puede estar en **múltiples eventos** (guestlists).

**Ejemplo**:
- Juan Pérez (Persona) está invitado a:
  - Evento "Boda María" → Mesa 5, Check-in: Sí, Menú: Vegano
  - Evento "Cumpleaños Carlos" → Mesa 2, Check-in: No, Menú: Normal
  - Evento "Fiesta Empresa" → Mesa 10, Check-in: Sí, Menú: Vegano

**Datos generales** (reutilizables): Nombre, email, teléfono, empresa, restricciones alimentarias
**Datos específicos del evento**: Mesa asignada, check-in, observaciones particulares

---

## 📊 ARQUITECTURA DE MODELOS

### Modelo 1: Person (Individuo General)

**Propósito**: Catálogo global de personas que pueden ser invitadas a eventos

```prisma
model Person {
  id              String   @id @default(cuid())

  // Datos personales (generales, reutilizables)
  fullName        String
  email           String?  @unique  // OPCIONAL pero si existe es único global
  phone           String?
  company         String?

  // Preferencias generales
  dietaryRestrictions String?  // JSON: ["celíaco", "vegano"]
  notes           String?      // Observaciones generales

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?  // userId

  // Relación con Participant (si usa servicios públicos)
  participantId   String?  @unique
  participant     Participant? @relation("PersonParticipant", fields: [participantId], references: [id])

  // Relación con guestlists
  eventGuests     EventGuest[]

  @@index([email])
  @@index([fullName])
}
```

**Características**:
- Email único global (si existe)
- Reutilizable entre eventos
- Datos maestros de la persona
- Puede enlazarse con Participant para usar MUSICADJ/KARAOKEYA

---

### Modelo 2: EventGuest (Entrada en Guestlist)

**Propósito**: Representa la inclusión de una Persona en un Evento específico (guestlist)

```prisma
model EventGuest {
  id              String    @id @default(cuid())
  eventId         String
  personId        String

  // Check-in (específico del evento)
  checkedIn       Boolean   @default(false)
  checkedInAt     DateTime?
  checkedInBy     String?   // userId del recepcionista

  // Asignaciones (específicas del evento)
  tableId         String?

  // Observaciones específicas del evento
  notes           String?   // Ej: "Llega tarde", "Trae acompañante"

  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  addedBy         String?   // userId que agregó a esta persona al evento

  // Relaciones
  event           Event     @relation("EventGuestList", fields: [eventId], references: [id], onDelete: Cascade)
  person          Person    @relation(fields: [personId], references: [id], onDelete: Cascade)
  table           Table?    @relation("TableGuests", fields: [tableId], references: [id], onDelete: SetNull)
  guestDishes     GuestDish[]

  // Unicidad: una persona solo puede estar una vez en la guestlist del evento
  @@unique([eventId, personId])
  @@index([eventId])
  @@index([eventId, checkedIn])
  @@index([personId])
  @@index([tableId])
}
```

**Características**:
- Tabla intermedia con datos adicionales
- Una persona solo puede estar UNA vez en la guestlist de un evento
- Datos específicos del contexto del evento
- Asignaciones (mesa) específicas por evento

---

### Modelo 3: Participant (Acceso Público)

**Propósito**: Auto-registro voluntario para servicios públicos

```prisma
model Participant {
  id              String   @id @default(cuid())
  email           String   @unique
  displayName     String
  whatsapp        String?
  isSystemParticipant Boolean @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relación opcional con Person
  person          Person?  @relation("PersonParticipant")

  // Servicios públicos
  songRequests    SongRequest[]
  karaokeRequests KaraokeRequest[]
  likedSongs      KaraokeSongLike[]

  @@index([email])
}
```

---

## 🔄 RELACIONES

### Person ↔ EventGuest ↔ Event
```
Person (1) ──── (N) EventGuest (N) ──── (1) Event

Un individuo puede estar en múltiples eventos
Un evento tiene múltiples invitados
EventGuest es la tabla intermedia con datos contextuales
```

### Person ↔ Participant (Opcional)
```
Person (1) ──── (0..1) Participant

Si una persona tiene email y decide usar servicios públicos,
se crea un Participant y se enlazan
```

### EventGuest ↔ Table
```
EventGuest (N) ──── (1) Table

Múltiples invitados pueden estar en la misma mesa
Un invitado puede estar en una mesa (o ninguna)
```

### EventGuest ↔ GuestDish
```
EventGuest (1) ──── (N) GuestDish

Un invitado puede tener múltiples platos asignados
```

---

## 💡 FLUJOS DE TRABAJO

### Flujo 1: Agregar invitado NUEVO a un evento

```typescript
// 1. Crear la persona (si no existe)
const person = await prisma.person.create({
  data: {
    fullName: "Juan Pérez",
    email: "juan@example.com",
    phone: "1234567890",
    company: "Acme Inc",
    dietaryRestrictions: JSON.stringify(["vegano"])
  }
})

// 2. Agregar a la guestlist del evento
const eventGuest = await prisma.eventGuest.create({
  data: {
    eventId: "evento-123",
    personId: person.id,
    addedBy: "user-456"
  }
})
```

### Flujo 2: Agregar invitado EXISTENTE a un evento

```typescript
// 1. Buscar persona existente
const person = await prisma.person.findFirst({
  where: { email: "juan@example.com" }
})

// 2. Agregar a la guestlist del evento (si no está ya)
const eventGuest = await prisma.eventGuest.upsert({
  where: {
    eventId_personId: {
      eventId: "evento-123",
      personId: person.id
    }
  },
  create: {
    eventId: "evento-123",
    personId: person.id,
    addedBy: "user-456"
  },
  update: {} // Ya existe, no hacer nada
})
```

### Flujo 3: Importación masiva CSV

```typescript
// CSV: fullName, email, phone, company, dietaryRestrictions
for (const row of csvData) {
  // 1. Buscar o crear persona
  let person = null
  if (row.email) {
    person = await prisma.person.findUnique({
      where: { email: row.email }
    })
  }

  if (!person) {
    person = await prisma.person.create({
      data: {
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        company: row.company,
        dietaryRestrictions: row.dietaryRestrictions
      }
    })
  }

  // 2. Agregar a guestlist (si no está)
  await prisma.eventGuest.upsert({
    where: {
      eventId_personId: {
        eventId: eventId,
        personId: person.id
      }
    },
    create: {
      eventId: eventId,
      personId: person.id,
      addedBy: userId
    },
    update: {} // Ya en lista, skip
  })
}
```

### Flujo 4: Check-in de invitado

```typescript
// Marcar check-in en el contexto del evento
await prisma.eventGuest.update({
  where: { id: eventGuestId },
  data: {
    checkedIn: true,
    checkedInAt: new Date(),
    checkedInBy: receptionistUserId
  }
})
```

### Flujo 5: Asignar mesa a invitado

```typescript
// Asignar mesa específica en este evento
await prisma.eventGuest.update({
  where: { id: eventGuestId },
  data: {
    tableId: "mesa-5"
  }
})
```

### Flujo 6: Auto-enlace con Participant

```typescript
// Cuando un Participant se registra, buscar Person con mismo email
async function identifyParticipant(email, displayName, eventId?) {
  // 1. Crear o actualizar Participant
  const participant = await prisma.participant.upsert({
    where: { email },
    create: { email, displayName },
    update: { displayName }
  })

  // 2. Buscar Person con mismo email
  const person = await prisma.person.findUnique({
    where: { email },
    include: { participant: true }
  })

  // 3. Si existe Person y no tiene Participant, enlazar
  if (person && !person.participantId) {
    await prisma.person.update({
      where: { id: person.id },
      data: { participantId: participant.id }
    })

    console.log(`[AUTO-LINK] Person ${person.fullName} linked to Participant ${email}`)
  }

  return participant
}
```

---

## 📋 ENDPOINTS REST

### Personas (Catálogo Global)

```
# Gestión de personas (ADMIN, MANAGER)
GET    /api/persons
POST   /api/persons
GET    /api/persons/:id
PATCH  /api/persons/:id
DELETE /api/persons/:id
GET    /api/persons/search?q=...

# Enlace con Participant
POST   /api/persons/:id/link-participant
DELETE /api/persons/:id/unlink-participant
```

### Guestlist del Evento

```
# Gestión de guestlist (ADMIN, MANAGER, OPERATOR)
GET    /api/events/:eventId/guestlist
POST   /api/events/:eventId/guestlist            (agregar persona a guestlist)
GET    /api/events/:eventId/guestlist/:id
PATCH  /api/events/:eventId/guestlist/:id
DELETE /api/events/:eventId/guestlist/:id        (quitar de guestlist)

# Importación masiva
POST   /api/events/:eventId/guestlist/import
GET    /api/events/:eventId/guestlist/export
GET    /api/events/:eventId/guestlist/template

# Check-in (RECEPTION)
POST   /api/events/:eventId/guestlist/:id/checkin
POST   /api/events/:eventId/guestlist/:id/checkout
GET    /api/events/:eventId/guestlist/search

# Asignaciones
PATCH  /api/events/:eventId/guestlist/:id/table
PATCH  /api/events/:eventId/guestlist/:id/menu

# Estadísticas
GET    /api/events/:eventId/guestlist/stats
```

---

## ✅ VENTAJAS DE ESTE MODELO

1. **Reutilización de datos**: Una persona no se duplica entre eventos
2. **Datos contextuales**: Check-in, mesa, observaciones son específicos del evento
3. **Flexibilidad**: Una persona puede estar en múltiples eventos con diferentes asignaciones
4. **Integridad**: Email único global (si existe)
5. **Escalabilidad**: Catálogo de personas crece con el tiempo
6. **Auditoría**: Se sabe quién agregó a quién y cuándo
7. **Enlace con servicios públicos**: Person puede enlazarse con Participant

---

## 🔑 IDENTIFICACIÓN ÚNICA

### En Person (Global)
- Si tiene email: email es único
- Si no tiene email: ID único (cuid)

### En EventGuest (Por evento)
- Constraint único: `[eventId, personId]`
- Una persona solo puede estar UNA vez en la guestlist de un evento

---

## 📝 NOTAS IMPORTANTES

### Búsqueda de invitados en un evento

```typescript
// Buscar en guestlist con datos de la persona
const guestlist = await prisma.eventGuest.findMany({
  where: {
    eventId: "evento-123",
    person: {
      fullName: { contains: "Juan", mode: 'insensitive' }
    }
  },
  include: {
    person: true,
    table: true
  }
})
```

### Eliminar persona del evento (no del catálogo)

```typescript
// Solo quitar de la guestlist
await prisma.eventGuest.delete({
  where: {
    eventId_personId: {
      eventId: "evento-123",
      personId: "person-456"
    }
  }
})

// La Person sigue existiendo en el catálogo global
```

---

**Modelo actualizado**: 2025-01-14
**Requiere actualizar**: PLAN_IMPLEMENTACION_INVITADOS.md

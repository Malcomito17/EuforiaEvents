# Resumen de Modelos Finales - Nuevos Módulos
## Fecha: 2025-01-14 - VERSIÓN DEFINITIVA

---

## 🎯 MÓDULOS DISEÑADOS

1. ✅ **INVITADOS** - Gestión de lista de invitados
2. ✅ **MENÚ** - Catálogo de platos y asignación con restricciones
3. ✅ **MESAS** - Distribución espacial y asignación
4. ✅ **CHECK-IN** - Aplicación de recepción

---

## 📊 SCHEMA PRISMA COMPLETO

### Event (Actualizado)

```prisma
model Event {
  // ... campos actuales ...

  // NUEVO - Configuración operativa de invitados
  tieneMesasAsignadas Boolean @default(true)
  tieneMenuIndividual Boolean @default(true)
  requiereCheckout    Boolean @default(false)  // ⭐ NUEVO

  // NUEVO - Configuración de salón
  salonAncho      Float?   // Ancho en metros
  salonLargo      Float?   // Largo en metros
  salonImageUrl   String?  // Plano del salón

  // Relaciones
  mesas           Mesa[]        @relation("EventMesas")
  eventGuests     EventGuest[]  @relation("EventGuests")
  eventMenu       EventDish[]   @relation("EventMenu")
  customCategories DishCategory[] @relation("EventCategories")
}
```

**Configuraciones por tipo de evento**:
```typescript
// Cena formal
{
  tieneMesasAsignadas: true,
  tieneMenuIndividual: true,
  requiereCheckout: true  // Control de salidas
}

// Buffet/fingerfood
{
  tieneMesasAsignadas: false,
  tieneMenuIndividual: false,
  requiereCheckout: false
}

// Evento corporativo
{
  tieneMesasAsignadas: true,
  tieneMenuIndividual: true,
  requiereCheckout: true  // Seguridad/control
}

// Fiesta informal
{
  tieneMesasAsignadas: false,
  tieneMenuIndividual: true,
  requiereCheckout: false  // Solo importa quién llegó
}
```

---

### Person (Catálogo Global de Personas)

```prisma
model Person {
  id              String   @id @default(cuid())

  // Identidad
  nombre          String
  apellido        String
  email           String?  @unique  // Opcional, único si existe
  phone           String?
  company         String?

  // Restricciones alimentarias (global)
  dietaryRestrictions String? @default("[]") // JSON: ["VEGANO", "CELIACO"]

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?

  // Hash de ayuda (NO único, para detectar duplicados en UI)
  identityHash    String   // SHA256(email + nombre + apellido)

  // Relaciones
  participantId   String?  @unique
  participant     Participant? @relation("PersonParticipant", fields: [participantId], references: [id])
  eventGuests     EventGuest[]

  @@index([email])
  @@index([apellido, nombre])
  @@index([identityHash])
}
```

---

### EventGuest (Entrada en Guestlist)

```prisma
model EventGuest {
  id              String    @id @default(cuid())

  // Relaciones
  eventId         String
  personId        String

  // Asignación de mesa
  mesaId          String?

  // Estado de asistencia
  estadoIngreso   String    @default("PENDIENTE") // PENDIENTE, INGRESADO, NO_ASISTIO

  // Check-in
  checkedInAt     DateTime?
  checkedInBy     String?   // userId del recepcionista

  // Check-out (⭐ solo si Event.requiereCheckout = true)
  checkedOutAt    DateTime?
  checkedOutBy    String?   // userId del recepcionista

  // Observaciones específicas del evento
  observaciones   String?
  accesibilidad   String?   // NINGUNA, MOVILIDAD_REDUCIDA, VISUAL, AUDITIVA, OTRA

  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  addedBy         String?

  // Relaciones
  event           Event     @relation("EventGuests", fields: [eventId], references: [id], onDelete: Cascade)
  person          Person    @relation(fields: [personId], references: [id], onDelete: Cascade)
  mesa            Mesa?     @relation("MesaGuests", fields: [mesaId], references: [id], onDelete: SetNull)
  guestDishes     GuestDish[]

  @@unique([eventId, personId])
  @@index([eventId])
  @@index([eventId, estadoIngreso])
  @@index([personId])
  @@index([mesaId])
}
```

---

### Dish (Catálogo Global de Platos)

```prisma
model Dish {
  id              String   @id @default(cuid())
  nombre          String
  descripcion     String?

  // Información alimentaria
  dietaryInfo     String   @default("[]") // JSON: ["VEGANO", "SIN_GLUTEN"]

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?

  eventDishes     EventDish[]

  @@index([nombre])
  @@index([isActive])
}
```

---

### DishCategory (Categorías Configurables)

```prisma
model DishCategory {
  id              String   @id @default(cuid())
  eventId         String?  // NULL = categoría global, eventId = custom

  nombre          String   // ENTRADA, PRINCIPAL, POSTRE, etc.
  orden           Int      @default(0)
  isSystemDefault Boolean  @default(false)

  createdAt       DateTime @default(now())

  event           Event?   @relation("EventCategories", fields: [eventId], references: [id], onDelete: Cascade)
  eventDishes     EventDish[]

  @@unique([eventId, nombre])
  @@index([eventId])
}
```

---

### EventDish (Menú del Evento)

```prisma
model EventDish {
  id              String   @id @default(cuid())

  eventId         String
  dishId          String
  categoryId      String

  isDefault       Boolean  @default(false)  // Plato default de la categoría
  orden           Int      @default(0)

  createdAt       DateTime @default(now())

  event           Event        @relation("EventMenu", fields: [eventId], references: [id], onDelete: Cascade)
  dish            Dish         @relation(fields: [dishId], references: [id], onDelete: Cascade)
  category        DishCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  guestDishes     GuestDish[]

  @@unique([eventId, dishId])
  @@index([eventId])
  @@index([eventId, categoryId])
}
```

---

### GuestDish (Platos Asignados)

```prisma
model GuestDish {
  id              String   @id @default(cuid())

  eventGuestId    String
  eventDishId     String

  assignedAt      DateTime @default(now())
  assignedBy      String?  // null = automático, userId = manual

  eventGuest      EventGuest @relation(fields: [eventGuestId], references: [id], onDelete: Cascade)
  eventDish       EventDish  @relation(fields: [eventDishId], references: [id], onDelete: Cascade)

  @@unique([eventGuestId, eventDishId])
  @@index([eventGuestId])
  @@index([eventDishId])
}
```

---

### Mesa

```prisma
model Mesa {
  id              String   @id @default(cuid())

  eventId         String
  numero          String   // "5", "VIP-1", "A1"
  capacidad       Int
  forma           String   @default("REDONDA") // REDONDA, CUADRADA, RECTANGULAR, OVALADA
  sector          String?  // "VIP", "General", "Terraza"

  // Posicionamiento espacial (opcional)
  posX            Float?
  posY            Float?
  rotation        Float?   @default(0)

  observaciones   String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?

  event           Event    @relation("EventMesas", fields: [eventId], references: [id], onDelete: Cascade)
  invitados       EventGuest[] @relation("MesaGuests")

  @@unique([eventId, numero])
  @@index([eventId])
  @@index([eventId, sector])
}
```

---

### User (Actualizado con rol RECEPTION)

```prisma
model User {
  // ... campos existentes ...
  role      String   @default("OPERATOR")
  // Valores: ADMIN, MANAGER, OPERATOR, DJ, RECEPTION
}
```

---

## 🔄 LÓGICA DE CHECK-OUT CONFIGURABLE

### En Check-in App

```typescript
// Al cargar evento
const evento = await getEvento(eventId)

if (evento.requiereCheckout) {
  // Mostrar botones de check-in Y check-out
  return (
    <>
      {guest.estadoIngreso === 'PENDIENTE' && (
        <button onClick={() => checkIn(guest.id)}>
          ✅ MARCAR INGRESO
        </button>
      )}

      {guest.estadoIngreso === 'INGRESADO' && !guest.checkedOutAt && (
        <button onClick={() => checkOut(guest.id)}>
          🚪 MARCAR SALIDA
        </button>
      )}

      {guest.checkedOutAt && (
        <div>Salió a las {formatTime(guest.checkedOutAt)}</div>
      )}
    </>
  )
} else {
  // Solo mostrar botón de check-in
  return (
    <>
      {guest.estadoIngreso === 'PENDIENTE' && (
        <button onClick={() => checkIn(guest.id)}>
          ✅ MARCAR INGRESO
        </button>
      )}

      {guest.estadoIngreso === 'INGRESADO' && (
        <div>✅ Ingresó a las {formatTime(guest.checkedInAt)}</div>
      )}
    </>
  )
}
```

---

### Endpoint de Check-out

```typescript
// POST /api/events/:eventId/checkin/:guestId/checkout
async function checkOut(eventId: string, guestId: string, userId: string) {
  // 1. Verificar que evento requiere checkout
  const event = await prisma.event.findUnique({ where: { id: eventId } })

  if (!event.requiereCheckout) {
    throw new Error('Este evento no requiere registro de salidas')
  }

  // 2. Verificar que invitado está INGRESADO
  const guest = await prisma.eventGuest.findUnique({ where: { id: guestId } })

  if (guest.estadoIngreso !== 'INGRESADO') {
    throw new Error('El invitado no está ingresado')
  }

  if (guest.checkedOutAt) {
    throw new Error('El invitado ya marcó salida')
  }

  // 3. Marcar salida
  const updated = await prisma.eventGuest.update({
    where: { id: guestId },
    data: {
      checkedOutAt: new Date(),
      checkedOutBy: userId
    }
  })

  // 4. Emitir evento WebSocket
  io.to(`checkin:${eventId}`).emit('checkin:guest:updated', updated)

  return updated
}
```

---

### Estadísticas con Check-out

```typescript
// GET /api/events/:eventId/checkin/stats
async function getStats(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } })

  const total = await prisma.eventGuest.count({ where: { eventId } })
  const ingresados = await prisma.eventGuest.count({
    where: { eventId, estadoIngreso: 'INGRESADO' }
  })
  const pendientes = await prisma.eventGuest.count({
    where: { eventId, estadoIngreso: 'PENDIENTE' }
  })
  const noAsistieron = await prisma.eventGuest.count({
    where: { eventId, estadoIngreso: 'NO_ASISTIO' }
  })

  let dentroDelEvento = ingresados
  let salieronTemprano = 0

  if (event.requiereCheckout) {
    // Calcular cuántos están adentro vs cuántos salieron
    dentroDelEvento = await prisma.eventGuest.count({
      where: {
        eventId,
        estadoIngreso: 'INGRESADO',
        checkedOutAt: null
      }
    })

    salieronTemprano = await prisma.eventGuest.count({
      where: {
        eventId,
        estadoIngreso: 'INGRESADO',
        checkedOutAt: { not: null }
      }
    })
  }

  return {
    total,
    ingresados,
    dentroDelEvento,
    salieronTemprano: event.requiereCheckout ? salieronTemprano : null,
    pendientes,
    noAsistieron,
    requiereCheckout: event.requiereCheckout
  }
}
```

---

## 🎨 UI - Header con Checkout

### Si requiere checkout (evento.requiereCheckout = true):

```
┌──────────────────────────────────────────────┐
│  🎊 Boda María - Check-in                    │
│  ✅ 85 ingresados  🏠 60 adentro  🚪 25 salieron │
│  ⏳ 65 pendientes  ❌ 0 no asistieron         │
└──────────────────────────────────────────────┘
```

### Si NO requiere checkout (evento.requiereCheckout = false):

```
┌──────────────────────────────────────────────┐
│  🎉 Fiesta Informal - Check-in               │
│  ✅ 85/150 ingresados  ⏳ 65 pendientes       │
└──────────────────────────────────────────────┘
```

---

## 📋 CONFIGURACIÓN DEL EVENTO (UI)

### En web-operator al crear/editar evento:

```
┌─────────────────────────────────────────┐
│  Configuración Operativa                │
├─────────────────────────────────────────┤
│                                         │
│  ☑️ Asignación de mesas                 │
│  ☑️ Menú individual                     │
│  ☐ Registrar salidas (checkout)        │
│                                         │
│  💡 Activa "Registrar salidas" para:   │
│     - Eventos largos (+4 horas)        │
│     - Control de seguridad             │
│     - Eventos corporativos             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO CON CHECKOUT

### Evento con checkout habilitado:

```
1. Invitado llega a las 20:00
   - Recepcionista: MARCAR INGRESO
   - Estado: INGRESADO
   - checkedInAt: 2025-01-14 20:00:00

2. Invitado sale a las 22:30
   - Recepcionista: MARCAR SALIDA
   - checkedOutAt: 2025-01-14 22:30:00
   - Estado: sigue INGRESADO (estuvo 2.5 horas)

3. Estadísticas actualizadas:
   - Ingresados totales: 85
   - Dentro del evento: 60
   - Salieron temprano: 25
```

### Evento sin checkout:

```
1. Invitado llega a las 20:00
   - Recepcionista: MARCAR INGRESO
   - Estado: INGRESADO
   - checkedInAt: 2025-01-14 20:00:00

2. No hay opción de marcar salida
   - Asumimos que estuvo en el evento completo

3. Estadísticas:
   - Ingresados: 85/150
   - Pendientes: 65
```

---

## ✅ BENEFICIOS DEL MODELO HÍBRIDO

1. **Flexibilidad**: Cada evento decide según sus necesidades
2. **Simplicidad**: Eventos informales no se complican con checkout
3. **Control**: Eventos formales tienen registro completo de entradas/salidas
4. **UI adaptativa**: Check-in app muestra u oculta botón según configuración
5. **Auditoría**: Cuando se necesita, está disponible

---

## 📊 CASOS DE USO

### Evento que REQUIERE checkout:
- Cena de gala (control de asistencia por tiempos)
- Evento corporativo (seguridad, registro de horas)
- Conferencia (saber quién se quedó hasta el final)
- Evento con horarios (almuerzo 12-15, cena 20-23)

### Evento que NO REQUIERE checkout:
- Fiesta de cumpleaños
- Casamiento (nadie se va temprano)
- Evento corto (<3 horas)
- Buffet informal

---

## 🎯 RESUMEN FINAL

**Total de modelos nuevos**: 8
1. Person
2. EventGuest
3. Dish
4. DishCategory
5. EventDish
6. GuestDish
7. Mesa
8. Event (actualizado)

**Total de aplicaciones**: 1 nueva
- `apps/web-checkin/` (app dedicada de recepción)

**Configuraciones del evento**: 3
- `tieneMesasAsignadas`: boolean
- `tieneMenuIndividual`: boolean
- `requiereCheckout`: boolean ⭐ NUEVO

**Estados**: Solo 3 (simple y claro)
- PENDIENTE
- INGRESADO
- NO_ASISTIO

**Campos de checkout** (opcionales según configuración):
- `checkedOutAt`: DateTime?
- `checkedOutBy`: String?

---

**Documento definitivo**: 2025-01-14
**Estado**: ✅ 100% completo y listo para implementación
**Todos los módulos diseñados**: Invitados, Menú, Mesas, Check-in

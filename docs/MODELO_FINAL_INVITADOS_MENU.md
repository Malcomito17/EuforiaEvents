# Modelo Final - Invitados + Menú
## Fecha: 2025-01-14 - VERSIÓN DEFINITIVA

---

## 🎯 DECISIONES FINALES CONFIRMADAS

### 1. IDENTIFICACIÓN DE PERSONAS
- ✅ Hash como ayuda visual (no único, no forzado)
- ✅ Sistema permite duplicados (dos "Juan Pérez" pueden coexistir)
- ✅ Operador resuelve duplicados manualmente en UI

### 2. CONFIGURACIÓN DEL EVENTO
```
Event {
  tieneMesasAsignadas: boolean (default: true)
  tieneMenuIndividual: boolean (default: true)
}
```

**Casos de uso**:
- Cena formal: mesas=true, menú=true
- Buffet/fingerfood: mesas=false, menú=false
- Evento híbrido: mesas=true, menú=false

### 3. RESTRICCIONES ALIMENTARIAS
- ✅ Ubicación: en **Person** (global, reutilizable)
- ✅ Lógica: "todo o nada" (invitado VEGANO+CELÍACO necesita plato que cumpla AMBOS)
- ✅ Asignación: automática por default, editable manualmente

### 4. CATEGORÍAS DE PLATOS
- ✅ **Configurables** por evento
- ✅ Defaults sugeridos: ENTRADA, PRINCIPAL, POSTRE, BUFFET, OTRO
- ✅ Operador puede crear categorías custom: "APERITIVO", "DIGESTIVO", etc.

### 5. ASIGNACIÓN AUTOMÁTICA DE PLATOS
- ✅ Al agregar invitado → asigna plato DEFAULT de cada categoría
- ✅ SI invitado tiene restricciones → valida que plato default cumpla
- ✅ SI default NO cumple → busca otro en el menú que cumpla
- ✅ SI ninguno cumple → NO asigna + ALERTA CRÍTICA

---

## 📊 SCHEMA PRISMA COMPLETO

### Person (Catálogo Global de Personas)

```prisma
model Person {
  id              String   @id @default(cuid())

  // Identidad básica
  nombre          String
  apellido        String

  // Contacto (opcional)
  email           String?  @unique  // Único si existe
  phone           String?
  company         String?

  // Restricciones alimentarias (global, reutilizable)
  dietaryRestrictions String? @default("[]") // JSON: ["VEGANO", "CELIACO"]

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?  // userId

  // Hash de ayuda (NO único, solo para UI)
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

  // Relaciones principales
  eventId         String
  personId        String

  // Asignación de mesa (nullable si evento no tiene mesas)
  mesaId          String?

  // Estado operativo
  estadoIngreso   String    @default("PENDIENTE") // PENDIENTE, INGRESADO, NO_ASISTIO

  // Observaciones específicas del evento
  observaciones   String?
  accesibilidad   String?   // NINGUNA, MOVILIDAD_REDUCIDA, VISUAL, AUDITIVA, OTRA

  // Metadata
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  addedBy         String?   // userId

  // Relaciones
  event           Event     @relation("EventGuests", fields: [eventId], references: [id], onDelete: Cascade)
  person          Person    @relation(fields: [personId], references: [id], onDelete: Cascade)
  mesa            Mesa?     @relation("MesaGuests", fields: [mesaId], references: [id], onDelete: SetNull)
  guestDishes     GuestDish[]

  @@unique([eventId, personId])  // Una persona solo puede estar una vez en un evento
  @@index([eventId])
  @@index([eventId, estadoIngreso])
  @@index([personId])
  @@index([mesaId])
}
```

---

### DishCategory (Categorías de Platos - Configurables)

```prisma
model DishCategory {
  id              String   @id @default(cuid())
  eventId         String?  // NULL = categoría global (default), eventId = custom del evento

  nombre          String   // "ENTRADA", "PRINCIPAL", "POSTRE", "APERITIVO", etc.
  orden           Int      @default(0)
  isSystemDefault Boolean  @default(false) // true para ENTRADA, PRINCIPAL, POSTRE, BUFFET

  createdAt       DateTime @default(now())

  event           Event?   @relation("EventCategories", fields: [eventId], references: [id], onDelete: Cascade)
  eventDishes     EventDish[]

  @@unique([eventId, nombre])  // Nombre único por evento
  @@index([eventId])
}
```

**Categorías por defecto del sistema** (isSystemDefault=true, eventId=null):
- ENTRADA
- PRINCIPAL
- POSTRE
- BUFFET
- OTRO

---

### Dish (Catálogo Global de Platos)

```prisma
model Dish {
  id              String   @id @default(cuid())

  nombre          String
  descripcion     String?

  // Información alimentaria (para validación de restricciones)
  dietaryInfo     String   @default("[]") // JSON: ["VEGANO", "SIN_GLUTEN", "SIN_LACTOSA"]

  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?

  // Relaciones
  eventDishes     EventDish[]

  @@index([nombre])
  @@index([isActive])
}
```

**Restricciones disponibles** (enum sugerido):
- VEGANO
- VEGETARIANO
- SIN_GLUTEN (celíaco)
- SIN_LACTOSA
- KOSHER
- HALAL
- SIN_FRUTOS_SECOS
- BAJO_SODIO
- DIABETICO

---

### EventDish (Platos del Menú del Evento)

```prisma
model EventDish {
  id              String   @id @default(cuid())

  // Relaciones
  eventId         String
  dishId          String
  categoryId      String

  // Configuración
  isDefault       Boolean  @default(false) // Marca el plato default de la categoría
  orden           Int      @default(0)

  createdAt       DateTime @default(now())

  // Relaciones
  event           Event        @relation("EventMenu", fields: [eventId], references: [id], onDelete: Cascade)
  dish            Dish         @relation(fields: [dishId], references: [id], onDelete: Cascade)
  category        DishCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  guestDishes     GuestDish[]

  @@unique([eventId, dishId])       // Un plato solo puede estar una vez en el menú
  @@unique([eventId, categoryId, isDefault])  // Solo un default por categoría
  @@index([eventId])
  @@index([eventId, categoryId])
}
```

---

### GuestDish (Platos Asignados al Invitado)

```prisma
model GuestDish {
  id              String   @id @default(cuid())

  // Relaciones
  eventGuestId    String
  eventDishId     String

  // Metadata
  assignedAt      DateTime @default(now())
  assignedBy      String?  // userId (null = asignación automática)

  // Relaciones
  eventGuest      EventGuest @relation(fields: [eventGuestId], references: [id], onDelete: Cascade)
  eventDish       EventDish  @relation(fields: [eventDishId], references: [id], onDelete: Cascade)

  @@unique([eventGuestId, eventDishId])  // Un invitado no puede tener el mismo plato dos veces
  @@index([eventGuestId])
  @@index([eventDishId])
}
```

---

### Event (Actualización)

```prisma
model Event {
  // ... campos actuales ...

  // NUEVO - Configuración operativa
  tieneMesasAsignadas Boolean @default(true)
  tieneMenuIndividual Boolean @default(true)

  // Relaciones
  eventGuests     EventGuest[]
  eventMenu       EventDish[]  @relation("EventMenu")
  customCategories DishCategory[] @relation("EventCategories")
}
```

---

## 🔄 LÓGICA DE ASIGNACIÓN AUTOMÁTICA

### Algoritmo al agregar invitado a guestlist:

```typescript
async function agregarInvitadoAEvento(personId, eventId) {
  // 1. Obtener persona con restricciones
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: { dietaryRestrictions: true }
  })

  const restricciones = JSON.parse(person.dietaryRestrictions || '[]')

  // 2. Crear entrada en guestlist
  const eventGuest = await prisma.eventGuest.create({
    data: {
      eventId,
      personId,
      estadoIngreso: 'PENDIENTE'
    }
  })

  // 3. Obtener categorías del evento
  const categorias = await prisma.dishCategory.findMany({
    where: { OR: [{ eventId }, { isSystemDefault: true }] }
  })

  const asignaciones = []
  const alertas = []

  // 4. Para cada categoría, asignar plato default (si cumple restricciones)
  for (const categoria of categorias) {
    // Buscar plato default de esta categoría
    let platoDefault = await prisma.eventDish.findFirst({
      where: {
        eventId,
        categoryId: categoria.id,
        isDefault: true
      },
      include: { dish: true }
    })

    if (!platoDefault) continue // No hay default, skip

    // Verificar restricciones
    const dishInfo = JSON.parse(platoDefault.dish.dietaryInfo || '[]')
    const cumpleRestricciones = restricciones.every(r => dishInfo.includes(r))

    if (cumpleRestricciones) {
      // Asignar plato default
      asignaciones.push({
        eventGuestId: eventGuest.id,
        eventDishId: platoDefault.id,
        assignedBy: null // Automático
      })
    } else {
      // Buscar otro plato en el menú que cumpla
      const platoAlternativo = await prisma.eventDish.findFirst({
        where: {
          eventId,
          categoryId: categoria.id,
          dish: {
            // dietaryInfo debe incluir todas las restricciones
            // (esto requiere una función custom o raw query)
          }
        },
        include: { dish: true }
      })

      if (platoAlternativo) {
        asignaciones.push({
          eventGuestId: eventGuest.id,
          eventDishId: platoAlternativo.id,
          assignedBy: null
        })
      } else {
        // ALERTA CRÍTICA: no hay plato compatible
        alertas.push({
          tipo: 'RESTRICCION_NO_CUBIERTA',
          categoria: categoria.nombre,
          restricciones: restricciones,
          personId: person.id,
          personNombre: `${person.apellido}, ${person.nombre}`
        })
      }
    }
  }

  // 5. Crear asignaciones en batch
  if (asignaciones.length > 0) {
    await prisma.guestDish.createMany({ data: asignaciones })
  }

  // 6. Retornar resultado
  return {
    eventGuest,
    platosAsignados: asignaciones.length,
    alertas
  }
}
```

---

## 📊 DASHBOARD DE MENÚ

### Ubicación: `/events/:eventId/menu-overview`

### Endpoint: `GET /api/events/:eventId/menu/stats`

**Respuesta**:
```json
{
  "totalInvitados": 150,
  "conPlatosAsignados": 142,
  "sinPlatosAsignados": 8,
  "conRestricciones": 25,

  "alertasCriticas": [
    {
      "tipo": "RESTRICCION_NO_CUBIERTA",
      "count": 3,
      "invitados": [
        {
          "id": "guest-123",
          "nombre": "González, María",
          "restricciones": ["CELIACO"],
          "categoriaSinCubrir": "PRINCIPAL"
        },
        {
          "id": "guest-456",
          "nombre": "Pérez, Juan",
          "restricciones": ["KOSHER"],
          "categoriaSinCubrir": "ENTRADA"
        }
      ]
    }
  ],

  "distribucionPlatos": [
    {
      "dishId": "dish-1",
      "nombre": "Bife de chorizo",
      "categoria": "PRINCIPAL",
      "isDefault": true,
      "invitadosAsignados": 80
    },
    {
      "dishId": "dish-2",
      "nombre": "Pollo grillé",
      "categoria": "PRINCIPAL",
      "isDefault": false,
      "invitadosAsignados": 45
    }
  ],

  "restriccionesDetectadas": [
    {
      "restriccion": "VEGANO",
      "count": 12,
      "cubierto": true,
      "platoCompatible": "Pasta vegana"
    },
    {
      "restriccion": "CELIACO",
      "count": 3,
      "cubierto": false,
      "platoCompatible": null
    }
  ]
}
```

---

## 🎨 UI - ALERTAS VISUALES

### En listado de invitados:

```
┌─────────────────────────────────────────────────┐
│ Nombre          Mesa  Platos  Estado  Alertas   │
├─────────────────────────────────────────────────┤
│ Pérez, Juan     #5    3/3     ✅      -         │
│ González, María #3    2/3     ⏳      ⚠️ Sin plato PRINCIPAL │
│ López, Ana      #10   0/3     ⏳      🔴 Sin platos asignados │
└─────────────────────────────────────────────────┘
```

### Badge de restricciones:

```
María González  🥗 VEGANO  🌾 CELIACO  ⚠️ 1 plato sin asignar
```

### En formulario de edición de invitado:

```
Restricciones alimentarias: [VEGANO] [CELIACO]

Platos asignados:
✅ ENTRADA: Ensalada verde
⚠️ PRINCIPAL: (sin asignar - no hay platos compatibles)
✅ POSTRE: Frutas frescas

💡 Sugerencia: Agregar un plato sin gluten y vegano a la categoría PRINCIPAL
```

---

## 🚨 VALIDACIONES Y ALERTAS

### Nivel 1: Al crear menú del evento
- ⚠️ Advertencia si falta plato default en alguna categoría
- 💡 Sugerencia de platos del catálogo

### Nivel 2: Al agregar invitado
- ✅ Asignación automática exitosa
- ⚠️ Asignación parcial (algunas categorías sin plato compatible)
- 🔴 Sin asignación (ningún plato compatible)

### Nivel 3: Dashboard de menú
- 🔴 Alerta crítica si hay invitados sin platos por restricciones
- 📊 Listado completo de invitados afectados
- 💡 Sugerencia: "Agregar plato [restricción] a la categoría [X]"

### Nivel 4: Pre-evento (checklist)
- ⛔ Bloqueador si hay invitados sin platos asignados
- ✅ Todo OK si todos tienen platos asignados

---

## 🔄 FLUJOS COMPLETOS

### Flujo 1: Crear evento con menú

1. Operador crea evento
2. Configura: `tieneMesasAsignadas=true`, `tieneMenuIndividual=true`
3. Va a "Gestión de Menú"
4. Selecciona platos del catálogo global:
   - Ensalada verde (ENTRADA) → marca como default
   - Bife (PRINCIPAL) → marca como default
   - Pollo (PRINCIPAL)
   - Pasta vegana (PRINCIPAL, dietaryInfo: [VEGANO])
   - Flan (POSTRE) → marca como default
5. Sistema valida: ✅ Todas las categorías tienen default

### Flujo 2: Importar invitados con restricciones

**CSV**:
```csv
nombre,apellido,email,dietaryRestrictions
Juan,Pérez,juan@example.com,
María,González,maria@example.com,VEGANO
Ana,López,ana@example.com,"VEGANO,CELIACO"
```

**Proceso**:
1. Sistema lee CSV
2. Para cada fila:
   - Buscar Person por email
   - Si no existe, crear
   - Agregar a EventGuest
   - Ejecutar asignación automática de platos
3. Resultado:
   - Juan: 3 platos asignados ✅
   - María: 3 platos asignados ✅ (Pasta vegana en PRINCIPAL)
   - Ana: 2 platos asignados ⚠️ (falta PRINCIPAL compatible)

**Alerta generada**:
```
⚠️ 1 invitado con restricciones no cubiertas:
- López, Ana (VEGANO + CELIACO)
  Categoría PRINCIPAL: no hay platos sin gluten y veganos

💡 Sugerencia: Agregar "Risotto vegano sin gluten" al menú
```

### Flujo 3: Operador resuelve alerta

1. Operador ve dashboard con alerta crítica
2. Accede a "Gestión de Menú"
3. Busca en catálogo: "Risotto vegano" (dietaryInfo: [VEGANO, SIN_GLUTEN])
4. Agrega al menú del evento en categoría PRINCIPAL
5. Sistema detecta que ahora hay plato compatible
6. Ejecuta reasignación automática para Ana López
7. ✅ Alerta resuelta

### Flujo 4: Asignación manual (override)

1. Operador edita invitado "Pérez, Juan"
2. Ve platos asignados:
   - ENTRADA: Ensalada verde ✅
   - PRINCIPAL: Bife (default) ✅
   - POSTRE: Flan ✅
3. Cambia PRINCIPAL de "Bife" a "Pollo"
4. Sistema valida que "Pollo" está en el menú ✅
5. Actualiza GuestDish

---

## 📝 ENDPOINTS REST

### Menú del Evento

```
GET    /api/events/:eventId/menu
POST   /api/events/:eventId/menu/dishes         # Agregar plato al menú
DELETE /api/events/:eventId/menu/dishes/:id     # Quitar plato del menú
PATCH  /api/events/:eventId/menu/dishes/:id     # Marcar como default
POST   /api/events/:eventId/menu/categories     # Crear categoría custom

GET    /api/events/:eventId/menu/stats          # Dashboard de menú
GET    /api/events/:eventId/menu/alerts         # Alertas críticas
```

### Asignación de Platos a Invitados

```
GET    /api/events/:eventId/guestlist/:guestId/dishes
POST   /api/events/:eventId/guestlist/:guestId/dishes    # Asignar plato
DELETE /api/events/:eventId/guestlist/:guestId/dishes/:dishId  # Quitar plato
POST   /api/events/:eventId/guestlist/:guestId/reassign  # Reasignar automático
```

### Catálogo de Platos (Global)

```
GET    /api/dishes
POST   /api/dishes
PATCH  /api/dishes/:id
DELETE /api/dishes/:id
GET    /api/dishes/search?restrictions=VEGANO,CELIACO
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Crear modelos Prisma (Person, EventGuest, Dish, EventDish, GuestDish, DishCategory)
- [ ] Migración de BD
- [ ] Módulo dishes (CRUD catálogo global)
- [ ] Módulo menu (gestión menú del evento)
- [ ] Módulo guestlist (gestión invitados)
- [ ] Lógica de asignación automática
- [ ] Sistema de validación de restricciones
- [ ] Endpoint de dashboard/stats
- [ ] Endpoint de alertas

### Frontend - Operador
- [ ] Página: Catálogo de platos (/dishes)
- [ ] Página: Menú del evento (/events/:id/menu)
- [ ] Página: Guestlist (/events/:id/guestlist)
- [ ] Página: Dashboard de menú (/events/:id/menu-overview)
- [ ] Componente: DietaryBadge
- [ ] Componente: DishCard
- [ ] Componente: AlertasCriticas
- [ ] Modal: Asignar platos a invitado
- [ ] Importación CSV con restricciones

### Testing
- [ ] Asignación automática con restricciones
- [ ] Validación de compatibilidad
- [ ] Generación de alertas
- [ ] Reasignación manual
- [ ] Importación CSV

---

**Documento definitivo**: 2025-01-14
**Estado**: ✅ Listo para implementación

# Próxima Sesión - Continuar Implementación Backend

## 📍 Estado Actual (2025-12-14 22:35)

### ✅ COMPLETADO
- Base de datos: 100% ✅
- Módulo participants: 100% ✅ (renombrado de guests)
- Módulo persons: 100% ✅

### ⏳ PENDIENTE (60% del backend)

## 🎯 TAREAS PARA LA PRÓXIMA SESIÓN

### 1️⃣ PRIORIDAD ALTA - Módulo event-guests (Guestlist)

**Crear los siguientes archivos en** `/apps/api/src/modules/event-guests/`:

#### `event-guests.types.ts`
```typescript
import { z } from 'zod'

// Schema para agregar invitado a evento
export const eventGuestCreateSchema = z.object({
  personId: z.string().cuid(),
  mesaId: z.string().cuid().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  accesibilidad: z.enum(['NINGUNA', 'MOVILIDAD_REDUCIDA', 'VISUAL', 'AUDITIVA', 'OTRA']).optional(),
})

// Schema para actualizar invitado
export const eventGuestUpdateSchema = z.object({
  mesaId: z.string().cuid().optional().nullable(),
  estadoIngreso: z.enum(['PENDIENTE', 'INGRESADO', 'NO_ASISTIO']).optional(),
  observaciones: z.string().optional().nullable(),
  accesibilidad: z.enum(['NINGUNA', 'MOVILIDAD_REDUCIDA', 'VISUAL', 'AUDITIVA', 'OTRA']).optional(),
})

// Schema para check-in
export const checkInSchema = z.object({
  eventGuestId: z.string().cuid(),
})

// Schema para importación CSV
export const importCSVSchema = z.object({
  guests: z.array(z.object({
    nombre: z.string(),
    apellido: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    mesaNumero: z.string().optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
  })),
})

export type EventGuestCreateInput = z.infer<typeof eventGuestCreateSchema>
export type EventGuestUpdateInput = z.infer<typeof eventGuestUpdateSchema>
```

#### `event-guests.service.ts`
**Métodos a implementar**:
1. `addGuest(eventId, personId, data)` - Agregar invitado a guestlist
2. `removeGuest(eventGuestId)` - Quitar invitado de guestlist
3. `updateGuest(eventGuestId, data)` - Actualizar datos del invitado
4. `getGuestlist(eventId)` - Obtener guestlist completa con relaciones (person, mesa)
5. `checkIn(eventGuestId, userId)` - Marcar ingreso
6. `checkOut(eventGuestId, userId)` - Marcar salida (solo si event.requiereCheckout)
7. `importCSV(eventId, guests, userId)` - Importar guestlist desde CSV
8. `getStats(eventId)` - Estadísticas de check-in

**Lógica especial**:
- Al agregar guest, verificar que la Person existe
- Al hacer check-in de un invitado con email, buscar si existe Participant con ese email y enlazarlo automáticamente
- Validar que si event.requiereCheckout = false, no permitir checkout

#### `event-guests.controller.ts`
**Endpoints a crear**:
- `POST /api/events/:eventId/guests` - Agregar invitado
- `GET /api/events/:eventId/guests` - Listar guestlist
- `PUT /api/events/:eventId/guests/:guestId` - Actualizar invitado
- `DELETE /api/events/:eventId/guests/:guestId` - Quitar invitado
- `POST /api/events/:eventId/guests/:guestId/checkin` - Check-in
- `POST /api/events/:eventId/guests/:guestId/checkout` - Check-out
- `POST /api/events/:eventId/guests/import` - Importar CSV
- `GET /api/events/:eventId/guests/stats` - Estadísticas

#### `event-guests.routes.ts`
Todas las rutas protegidas con `authenticate`

#### `index.ts`
Exportar routes, service, controller, types

---

### 2️⃣ Módulo dishes (Catálogo de Platos)

**Crear en** `/apps/api/src/modules/dishes/`:

#### Archivos necesarios:
- `dishes.types.ts` - Schemas Zod para create/update
- `dishes.service.ts` - CRUD completo de platos
- `dishes.controller.ts` - Endpoints REST
- `dishes.routes.ts` - Rutas protegidas
- `index.ts`

**Endpoints**:
- `POST /api/dishes` - Crear plato
- `GET /api/dishes` - Listar platos activos
- `GET /api/dishes/:dishId` - Obtener plato
- `PUT /api/dishes/:dishId` - Actualizar plato
- `DELETE /api/dishes/:dishId` - Desactivar plato (soft delete con isActive=false)

**Campos**:
- nombre, descripcion, dietaryInfo (JSON array), isActive, createdBy

---

### 3️⃣ Módulo menu (Gestión de Menú del Evento)

**Crear en** `/apps/api/src/modules/menu/`:

#### Archivos necesarios:
- `menu.types.ts`
- `menu.service.ts`
- `menu.controller.ts`
- `menu.routes.ts`
- `index.ts`

**Endpoints**:
- `POST /api/events/:eventId/menu/dishes` - Agregar plato al menú
- `GET /api/events/:eventId/menu` - Obtener menú completo con categorías
- `DELETE /api/events/:eventId/menu/dishes/:dishId` - Quitar plato del menú
- `POST /api/events/:eventId/menu/categories` - Crear categoría custom
- `POST /api/events/:eventId/menu/assign-auto` - Asignación automática de platos default
- `GET /api/events/:eventId/menu/alerts` - Dashboard de alertas (restricciones sin platos compatibles)

**Lógica especial**:
- Validación de restricciones: alertar si un invitado tiene restricción pero no hay platos compatibles en el menú
- Asignación automática de platos default por categoría

---

### 4️⃣ Módulo mesas (Gestión de Mesas)

**Crear en** `/apps/api/src/modules/mesas/`:

#### Archivos necesarios:
- `mesas.types.ts`
- `mesas.service.ts`
- `mesas.controller.ts`
- `mesas.routes.ts`
- `index.ts`

**Endpoints**:
- `POST /api/events/:eventId/mesas` - Crear mesa
- `GET /api/events/:eventId/mesas` - Listar mesas con ocupación
- `PUT /api/events/:eventId/mesas/:mesaId` - Actualizar mesa (posición, capacidad)
- `DELETE /api/events/:eventId/mesas/:mesaId` - Eliminar mesa
- `POST /api/events/:eventId/mesas/auto-assign` - Auto-asignación de invitados a mesas

**Campos**:
- numero, capacidad, forma, sector, posX, posY, rotation

---

### 5️⃣ Actualizar app.ts

Agregar las rutas de los nuevos módulos:

```typescript
import { personRoutes } from './modules/persons'
import { eventGuestRoutes } from './modules/event-guests'
import { dishRoutes } from './modules/dishes'
import { menuRoutes } from './modules/menu'
import { mesasRoutes } from './modules/mesas'

// Rutas globales
app.use('/api/persons', personRoutes)
app.use('/api/dishes', dishRoutes)

// Rutas anidadas bajo eventos
app.use('/api/events/:eventId/guests', eventGuestRoutes)
app.use('/api/events/:eventId/menu', menuRoutes)
app.use('/api/events/:eventId/mesas', mesasRoutes)
```

---

## 📋 CHECKLIST PRÓXIMA SESIÓN

- [ ] Crear módulo event-guests completo
- [ ] Crear módulo dishes completo
- [ ] Crear módulo menu completo
- [ ] Crear módulo mesas completo
- [ ] Actualizar app.ts con rutas
- [ ] Probar endpoints con curl/Postman
- [ ] Compilar backend sin errores
- [ ] Commit de cambios

---

## 🔍 COMANDOS ÚTILES

### Iniciar servidor de desarrollo
```bash
cd /Users/malcomito/Projects/euforia-events/apps/api
npm run dev
```

### Probar endpoint
```bash
# Listar personas
curl -X GET http://localhost:3000/api/persons \
  -H "Authorization: Bearer YOUR_TOKEN"

# Crear persona
curl -X POST http://localhost:3000/api/persons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "dietaryRestrictions": ["VEGANO"]
  }'
```

### Verificar compilación
```bash
cd /Users/malcomito/Projects/euforia-events/apps/api
npm run build
```

---

## 📊 PROGRESO ESTIMADO

- ✅ Base de datos: 100% (2h)
- ✅ Participants: 100% (1h)
- ✅ Persons: 100% (1.5h)
- ⏳ Event-guests: 0% → estimado 2.5h
- ⏳ Dishes: 0% → estimado 1h
- ⏳ Menu: 0% → estimado 2h
- ⏳ Mesas: 0% → estimado 1.5h

**Total restante**: ~7 horas de implementación backend

---

## 🎯 OBJETIVO FINAL

Tener todos los endpoints REST del backend funcionando para:
- Gestión de catálogo de personas (persons) ✅
- Gestión de guestlist por evento (event-guests) ⏳
- Gestión de catálogo de platos (dishes) ⏳
- Gestión de menú del evento (menu) ⏳
- Gestión de mesas (mesas) ⏳

Luego comenzar con el frontend en web-operator.

---

**Última actualización**: 2025-12-14 22:35
**Commit previo**: Por hacer
**Branch**: feature/guestlist-module (por crear)

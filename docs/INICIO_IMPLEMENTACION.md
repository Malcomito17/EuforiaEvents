# Inicio de Implementación - Módulo Invitados
## Fecha: 2025-01-14

---

## 🎯 OBJETIVO INMEDIATO

Crear interfaz de carga de invitados en el panel del operador (`web-operator`).

**Dos modalidades**:
1. **Carga manual**: Formulario para agregar invitado individual
2. **Importación masiva**: Subir archivo XLS o CSV con lista completa

---

## 📊 MODELO FINAL APROBADO

### Person (Catálogo Global de Personas)
```prisma
model Person {
  id              String   @id @default(cuid())
  fullName        String
  email           String?  @unique  // OPCIONAL, único si existe
  phone           String?
  company         String?
  dietaryRestrictions String?  // JSON
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?
  participantId   String?  @unique
  participant     Participant?
  eventGuests     EventGuest[]
}
```

### EventGuest (Guestlist del Evento)
```prisma
model EventGuest {
  id              String    @id @default(cuid())
  eventId         String
  personId        String
  checkedIn       Boolean   @default(false)
  checkedInAt     DateTime?
  checkedInBy     String?
  tableId         String?
  notes           String?   // Observaciones específicas del evento
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  addedBy         String?

  event           Event
  person          Person
  table           Table?
  guestDishes     GuestDish[]

  @@unique([eventId, personId])
}
```

**Concepto clave**: Un individuo (Person) puede estar en múltiples eventos. Los datos generales están en Person, los datos específicos del evento (mesa, check-in) están en EventGuest.

---

## 🔧 PLAN DE IMPLEMENTACIÓN

### FASE 1: BACKEND (API) - Estimado: 4-6 horas

#### 1.1 Actualizar Schema Prisma
- [ ] Agregar modelo `Person`
- [ ] Agregar modelo `EventGuest`
- [ ] Crear migración
- [ ] Ejecutar migración
- **Archivos**: `apps/api/prisma/schema.prisma`

#### 1.2 Crear módulo Persons (Catálogo Global)
```
apps/api/src/modules/persons/
├── persons.types.ts        # Zod schemas
├── persons.service.ts      # Lógica de negocio
├── persons.controller.ts   # HTTP handlers
├── persons.routes.ts       # Endpoints REST
└── index.ts
```

**Endpoints principales**:
```
GET    /api/persons              # Listar todas las personas
POST   /api/persons              # Crear persona
GET    /api/persons/:id          # Ver persona
PATCH  /api/persons/:id          # Actualizar persona
DELETE /api/persons/:id          # Eliminar persona
GET    /api/persons/search?q=... # Búsqueda rápida
```

#### 1.3 Crear módulo Guestlist (Invitados del Evento)
```
apps/api/src/modules/guestlist/
├── guestlist.types.ts
├── guestlist.service.ts
├── guestlist.controller.ts
├── guestlist.routes.ts
└── index.ts
```

**Endpoints principales**:
```
# Gestión de guestlist
GET    /api/events/:eventId/guestlist
POST   /api/events/:eventId/guestlist          # Agregar persona a evento
DELETE /api/events/:eventId/guestlist/:id      # Quitar de evento
PATCH  /api/events/:eventId/guestlist/:id      # Actualizar datos del evento

# Importación
POST   /api/events/:eventId/guestlist/import   # Importar XLS/CSV
GET    /api/events/:eventId/guestlist/template # Descargar plantilla vacía
GET    /api/events/:eventId/guestlist/export   # Exportar guestlist

# Check-in (futuro)
POST   /api/events/:eventId/guestlist/:id/checkin
POST   /api/events/:eventId/guestlist/:id/checkout
```

#### 1.4 Lógica de Importación

**Librería sugerida**: `xlsx` (para leer XLS/CSV)

```bash
cd apps/api
pnpm add xlsx
pnpm add -D @types/node
```

**Funcionalidad**:
- Leer archivo XLS o CSV
- Parsear filas
- Por cada fila:
  1. Buscar Person por email (si tiene)
  2. Si existe Person: usar existente
  3. Si no existe: crear nueva Person
  4. Agregar Person a EventGuest (si no está ya)
- Retornar resumen: creados, actualizados, errores

---

### FASE 2: FRONTEND (Web Operator) - Estimado: 6-8 horas

#### 2.1 Estructura de Archivos

```
apps/web-operator/src/
├── pages/
│   └── Guestlist/
│       ├── GuestlistView.tsx       # Vista principal de la guestlist del evento
│       ├── PersonForm.tsx          # Formulario crear/editar persona
│       └── ImportModal.tsx         # Modal de importación XLS/CSV
├── components/
│   ├── GuestTable.tsx              # Tabla de invitados
│   ├── GuestCard.tsx               # Card individual
│   ├── DietaryBadge.tsx            # Badge de restricciones
│   └── CheckInBadge.tsx            # Badge de check-in
├── services/
│   ├── personService.ts            # API calls a /api/persons
│   └── guestlistService.ts         # API calls a /api/events/:id/guestlist
└── stores/
    └── guestlistStore.ts           # Estado global (Zustand)
```

#### 2.2 Página Principal: GuestlistView

**Ubicación**: `/events/:eventId/guestlist`

**Secciones**:
1. **Header**:
   - Título: "Lista de Invitados - {EventName}"
   - Botón: "Agregar Invitado" (abre formulario)
   - Botón: "Importar XLS/CSV" (abre modal)
   - Botón: "Exportar" (descarga XLS)

2. **Filtros** (barra superior):
   - Búsqueda por nombre
   - Filtro por check-in (Todos / Check-in / Pendientes)
   - Filtro por mesa

3. **Tabla de invitados**:
   Columnas:
   - Nombre completo
   - Email
   - Teléfono
   - Mesa
   - Check-in (badge)
   - Restricciones (badges)
   - Acciones (editar, eliminar)

4. **Estadísticas** (cards superiores):
   - Total invitados
   - Check-in realizados
   - Pendientes

#### 2.3 Formulario: PersonForm

**Campos**:
- Nombre completo (obligatorio)
- Email (opcional)
- Teléfono (opcional)
- Empresa (opcional)
- Restricciones alimentarias (select múltiple)
  - Opciones: Vegetariano, Vegano, Celíaco, Sin lactosa, Kosher, Halal, Ninguna
- Observaciones (textarea)

**Comportamiento**:
- Si email existe: buscar Person existente y mostrar aviso
- Si Person existe: "Esta persona ya está registrada. ¿Desea agregarla a este evento?"
- Si Person no existe: crear nueva y agregar a evento
- Validaciones: nombre mínimo 3 caracteres, email válido

#### 2.4 Modal: ImportModal

**Proceso**:
1. **Subir archivo**:
   - Drag & drop o botón "Seleccionar archivo"
   - Formatos aceptados: .xls, .xlsx, .csv
   - Tamaño máximo: 5MB

2. **Preview**:
   - Mostrar primeras 5 filas
   - Validar columnas requeridas
   - Mostrar errores de formato

3. **Confirmar**:
   - Botón "Importar"
   - Mostrar progreso
   - Mostrar resultado:
     - X personas creadas
     - X personas existentes agregadas al evento
     - X errores (con detalle)

**Formato de plantilla CSV**:
```csv
fullName,email,phone,company,dietaryRestrictions,notes
Juan Pérez,juan@example.com,1234567890,Acme Inc,"vegano,celíaco",Llega tarde
María González,maria@example.com,0987654321,,,
```

#### 2.5 Servicios

**personService.ts**:
```typescript
export const personService = {
  async getAll(filters) {
    return axios.get('/api/persons', { params: filters })
  },
  async getById(id) {
    return axios.get(`/api/persons/${id}`)
  },
  async create(data) {
    return axios.post('/api/persons', data)
  },
  async update(id, data) {
    return axios.patch(`/api/persons/${id}`, data)
  },
  async delete(id) {
    return axios.delete(`/api/persons/${id}`)
  },
  async search(query) {
    return axios.get('/api/persons/search', { params: { q: query } })
  }
}
```

**guestlistService.ts**:
```typescript
export const guestlistService = {
  async getGuestlist(eventId) {
    return axios.get(`/api/events/${eventId}/guestlist`)
  },
  async addToGuestlist(eventId, personId) {
    return axios.post(`/api/events/${eventId}/guestlist`, { personId })
  },
  async removeFromGuestlist(eventId, eventGuestId) {
    return axios.delete(`/api/events/${eventId}/guestlist/${eventGuestId}`)
  },
  async importGuestlist(eventId, file) {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post(`/api/events/${eventId}/guestlist/import`, formData)
  },
  async exportGuestlist(eventId, format = 'xlsx') {
    return axios.get(`/api/events/${eventId}/guestlist/export`, {
      params: { format },
      responseType: 'blob'
    })
  },
  async getTemplate() {
    return axios.get(`/api/events/${eventId}/guestlist/template`, {
      responseType: 'blob'
    })
  }
}
```

#### 2.6 Store (Zustand)

```typescript
interface GuestlistStore {
  // Estado
  guestlist: EventGuest[]
  loading: boolean
  filters: GuestlistFilters

  // Acciones
  fetchGuestlist: (eventId: string) => Promise<void>
  addPerson: (eventId: string, personData: any) => Promise<void>
  removePerson: (eventId: string, eventGuestId: string) => Promise<void>
  importGuestlist: (eventId: string, file: File) => Promise<ImportResult>
  exportGuestlist: (eventId: string) => Promise<void>
  setFilters: (filters: GuestlistFilters) => void
}
```

---

### FASE 3: RUTAS Y NAVEGACIÓN

#### 3.1 Agregar Ruta en App

```tsx
// apps/web-operator/src/App.tsx (o Routes.tsx)
<Route
  path="/events/:eventId/guestlist"
  element={<GuestlistView />}
/>
```

#### 3.2 Agregar Enlace en Menú del Evento

```tsx
// En la página de detalle del evento, agregar botón/tab:
<Link to={`/events/${eventId}/guestlist`}>
  <Button>
    <Users className="w-4 h-4 mr-2" />
    Lista de Invitados
  </Button>
</Link>
```

---

## 🧪 TESTING

### Backend
- [ ] Test: Crear Person sin email
- [ ] Test: Crear Person con email duplicado (debe fallar)
- [ ] Test: Agregar Person a EventGuest
- [ ] Test: Agregar misma Person dos veces al mismo evento (debe fallar)
- [ ] Test: Importar CSV válido
- [ ] Test: Importar CSV con errores
- [ ] Test: Exportar guestlist

### Frontend
- [ ] Test E2E: Cargar invitado manual
- [ ] Test E2E: Importar CSV
- [ ] Test E2E: Exportar guestlist
- [ ] Test E2E: Filtrar y buscar invitados

---

## 📦 DEPENDENCIAS NECESARIAS

### Backend
```bash
cd apps/api
pnpm add xlsx            # Para leer/escribir XLS
pnpm add multer          # Ya existe (upload de archivos)
```

### Frontend
```bash
cd apps/web-operator
pnpm add react-dropzone  # Para drag & drop de archivos
pnpm add @tanstack/react-table  # Para tabla avanzada (opcional)
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### BACKEND
- [ ] Actualizar schema.prisma (Person + EventGuest)
- [ ] Crear migración y ejecutar
- [ ] Crear módulo persons (types, service, controller, routes)
- [ ] Crear módulo guestlist (types, service, controller, routes)
- [ ] Implementar parser de XLS/CSV
- [ ] Implementar lógica de importación
- [ ] Implementar exportación
- [ ] Testing unitario
- [ ] Commit: "feat: add persons and guestlist backend modules"

### FRONTEND
- [ ] Crear página GuestlistView
- [ ] Crear formulario PersonForm
- [ ] Crear modal ImportModal
- [ ] Crear componentes (GuestTable, badges)
- [ ] Crear servicios (personService, guestlistService)
- [ ] Crear store (guestlistStore)
- [ ] Agregar ruta en App
- [ ] Agregar enlace en menú del evento
- [ ] Testing E2E
- [ ] Commit: "feat: add guestlist management UI in operator panel"

### INTEGRACIÓN
- [ ] Testing completo de flujo manual
- [ ] Testing completo de flujo de importación
- [ ] Documentación de uso
- [ ] Deploy a producción

---

## ⏱️ ESTIMACIÓN TOTAL

| Tarea | Tiempo |
|-------|--------|
| Backend (modelos + migración) | 2h |
| Backend (service + controller) | 3h |
| Backend (importación/exportación) | 2h |
| Frontend (página principal) | 3h |
| Frontend (formulario manual) | 2h |
| Frontend (modal importación) | 3h |
| Servicios y store | 2h |
| Testing e integración | 3h |
| **TOTAL** | **20h** |

---

## 🚀 PRÓXIMA SESIÓN

**Comenzar con**:
1. Actualizar schema.prisma
2. Crear migración
3. Implementar módulo persons (backend)
4. Implementar módulo guestlist (backend)
5. Probar endpoints con Postman/Thunder Client

**Luego**:
6. Crear interfaz en web-operator
7. Testing completo
8. Deploy

---

**Documento creado**: 2025-01-14
**Listo para implementar**: Sí
**Archivos de referencia**:
- `docs/MODELO_INVITADOS_CORREGIDO.md` (modelo final)
- `docs/DECISIONES_NUEVOS_MODULOS.md` (decisiones)
- `docs/TODO_NUEVOS_MODULOS.md` (tareas generales)

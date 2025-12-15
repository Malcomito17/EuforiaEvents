# Guía de Implementación UI - Nuevos Módulos

## 📋 Resumen

Esta guía detalla la implementación del frontend (web-operator) para los nuevos módulos:

1. **Invitados** (Persons + Event Guests)
2. **Menú** (Dishes + Menu del evento)
3. **Mesas** (Distribución espacial)
4. **QR Check-in** (Acceso directo)

**Backend**: ✅ 100% completado
**Frontend**: ⏳ Pendiente de implementación

---

## 🗂️ Estructura de Archivos a Crear

```
apps/web-operator/src/
├── pages/
│   ├── Events/
│   │   ├── EventGuests/           # NUEVO - Módulo de invitados
│   │   │   ├── index.tsx          # Lista de invitados
│   │   │   ├── GuestForm.tsx      # Formulario crear/editar
│   │   │   ├── ImportCSV.tsx      # Importación CSV
│   │   │   └── CheckInModal.tsx   # Modal de check-in
│   │   │
│   │   ├── EventMenu/             # NUEVO - Módulo de menú
│   │   │   ├── index.tsx          # Gestión del menú
│   │   │   ├── DishList.tsx       # Lista de platos disponibles
│   │   │   ├── MenuBuilder.tsx    # Constructor de menú
│   │   │   ├── GuestAssignments.tsx  # Asignación de platos
│   │   │   └── AlertsDashboard.tsx   # Dashboard de alertas
│   │   │
│   │   ├── EventMesas/            # NUEVO - Módulo de mesas
│   │   │   ├── index.tsx          # Gestión de mesas
│   │   │   ├── MesaCanvas.tsx     # Canvas drag & drop
│   │   │   ├── MesaForm.tsx       # Formulario crear/editar
│   │   │   └── AutoAssign.tsx     # Auto-asignación
│   │   │
│   │   └── EventCheckinQR.tsx     # NUEVO - Modal QR check-in
│   │
├── components/
│   ├── persons/                    # NUEVO - Componentes reutilizables
│   │   ├── PersonCard.tsx
│   │   └── PersonSelector.tsx
│   │
│   ├── dishes/                     # NUEVO
│   │   ├── DishCard.tsx
│   │   └── DietaryBadge.tsx
│   │
│   └── mesas/                      # NUEVO
│       ├── MesaShape.tsx          # Shapes SVG
│       └── MesaInfo.tsx
│
└── lib/
    └── api/
        ├── persons.ts              # NUEVO - API client
        ├── eventGuests.ts          # NUEVO
        ├── dishes.ts               # NUEVO
        ├── menu.ts                 # NUEVO
        └── mesas.ts                # NUEVO
```

---

## 🎯 MÓDULO 1: Invitados

### Páginas a crear

#### `pages/Events/EventGuests/index.tsx`

**Funcionalidad**:
- Listar todos los invitados del evento
- Filtros: estado (PENDIENTE/INGRESADO/NO_ASISTIO), mesa, búsqueda
- Acciones: Agregar, Editar, Check-in, Eliminar
- Importar CSV
- Ver estadísticas

**Endpoints a usar**:
```typescript
GET    /api/events/:eventId/guests              // Listar
POST   /api/events/:eventId/guests              // Crear
PUT    /api/events/:eventId/guests/:id          // Actualizar
DELETE /api/events/:eventId/guests/:id          // Eliminar
POST   /api/events/:eventId/guests/:id/checkin  // Check-in
GET    /api/events/:eventId/guests/stats        // Estadísticas
```

**Layout sugerido**:
```tsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

export function EventGuestsPage() {
  const { eventId } = useParams()
  const [guests, setGuests] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')

  // Fetch guests
  useEffect(() => {
    fetchGuests()
    fetchStats()
  }, [eventId, filter])

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total" value={stats?.total} />
        <StatCard label="Ingresados" value={stats?.ingresados} />
        <StatCard label="Pendientes" value={stats?.pendientes} />
        <StatCard label="% Asistencia" value={`${stats?.porcentajeAsistencia}%`} />
      </div>

      {/* Acciones */}
      <div className="flex gap-4">
        <button onClick={() => setShowGuestForm(true)}>
          Agregar Invitado
        </button>
        <button onClick={() => setShowImportCSV(true)}>
          Importar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todos</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="INGRESADO">Ingresados</option>
          <option value="NO_ASISTIO">No asistieron</option>
        </select>
        <input
          type="search"
          placeholder="Buscar invitado..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabla de invitados */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Mesa</th>
            <th>Estado</th>
            <th>Check-in</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {guests.map(guest => (
            <tr key={guest.id}>
              <td>{guest.person.nombre} {guest.person.apellido}</td>
              <td>{guest.person.email}</td>
              <td>{guest.mesa?.numero || 'Sin asignar'}</td>
              <td>
                <Badge status={guest.estadoIngreso} />
              </td>
              <td>
                {guest.checkedInAt ?
                  formatDate(guest.checkedInAt) :
                  '-'
                }
              </td>
              <td>
                <button onClick={() => handleCheckIn(guest.id)}>
                  Check-in
                </button>
                <button onClick={() => handleEdit(guest)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(guest.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modales */}
      {showGuestForm && <GuestFormModal onClose={() => setShowGuestForm(false)} />}
      {showImportCSV && <ImportCSVModal onClose={() => setShowImportCSV(false)} />}
    </div>
  )
}
```

#### `pages/Events/EventGuests/GuestForm.tsx`

**Funcionalidad**:
- Formulario para crear/editar invitado
- Selector de persona (autocomplete)
- Asignación de mesa
- Observaciones y accesibilidad

**Campos**:
```typescript
interface GuestFormData {
  personId: string       // Selector de persona (con búsqueda)
  mesaId?: string        // Selector de mesa
  observaciones?: string
  accesibilidad?: 'NINGUNA' | 'MOVILIDAD_REDUCIDA' | 'VISUAL' | 'AUDITIVA' | 'OTRA'
}
```

#### `pages/Events/EventGuests/ImportCSV.tsx`

**Funcionalidad**:
- Upload de archivo CSV
- Preview de datos antes de importar
- Mapeo de columnas
- Resultados de importación

**Formato CSV esperado**:
```csv
nombre,apellido,email,phone,company,mesaNumero,dietaryRestrictions,observaciones
Juan,Pérez,juan@example.com,1234567890,Empresa SA,5,"VEGANO,SIN_GLUTEN",VIP
```

**Endpoint**:
```typescript
POST /api/events/:eventId/guests/import
Body: {
  guests: [
    {
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@example.com",
      phone: "1234567890",
      company: "Empresa SA",
      mesaNumero: "5",
      dietaryRestrictions: ["VEGANO", "SIN_GLUTEN"],
      observaciones: "VIP"
    }
  ]
}
```

---

## 🍽️ MÓDULO 2: Menú

### Páginas a crear

#### `pages/Events/EventMenu/index.tsx`

**Funcionalidad**:
- Ver menú del evento agrupado por categorías
- Agregar/quitar platos del menú
- Asignar platos a invitados
- Ver dashboard de alertas

**Endpoints a usar**:
```typescript
GET    /api/events/:eventId/menu                   // Obtener menú
POST   /api/events/:eventId/menu/dishes            // Agregar plato
DELETE /api/events/:eventId/menu/dishes/:dishId    // Quitar plato
GET    /api/events/:eventId/menu/alerts            // Alertas
POST   /api/events/:eventId/menu/assign-auto       // Auto-asignar
```

**Layout sugerido**:
```tsx
export function EventMenuPage() {
  const { eventId } = useParams()
  const [menu, setMenu] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar: Catálogo de platos */}
      <div className="col-span-4">
        <h2>Catálogo de Platos</h2>
        <DishList
          onAddToMenu={(dish) => handleAddDishToMenu(dish)}
        />
      </div>

      {/* Main: Menú del evento */}
      <div className="col-span-8">
        {/* Alertas */}
        {alerts.length > 0 && (
          <div className="bg-yellow-50 p-4 mb-4">
            <h3>⚠️ {alerts.length} Alertas de Restricciones</h3>
            <button onClick={() => setShowAlerts(true)}>
              Ver Dashboard
            </button>
          </div>
        )}

        {/* Menú por categorías */}
        {menu?.categories.map(cat => (
          <div key={cat.category.id} className="mb-6">
            <h3>{cat.category.nombre}</h3>
            <div className="grid grid-cols-3 gap-4">
              {cat.dishes.map(dish => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onRemove={() => handleRemoveDish(dish.dishId)}
                  onSetDefault={() => handleSetDefault(dish.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Asignación de platos a invitados */}
        <div className="mt-8">
          <button onClick={handleAutoAssign}>
            Auto-asignar Platos Default
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### `pages/Events/EventMenu/AlertsDashboard.tsx`

**Funcionalidad**:
- Mostrar alertas de incompatibilidades
- 3 tipos: MISSING_COMPATIBLE_DISH, NO_DISH_ASSIGNED, INCOMPATIBLE_DISH
- Sugerencias de platos compatibles
- Acción rápida para asignar

**Endpoint**:
```typescript
GET /api/events/:eventId/menu/alerts

Response: {
  alerts: [
    {
      type: "MISSING_COMPATIBLE_DISH",
      severity: "HIGH",
      eventGuestId: "...",
      guestName: "Juan Pérez",
      restriction: "VEGANO",
      message: "No hay platos con VEGANO en el menú para Juan Pérez",
      suggestedDishes: ["dish-id-1", "dish-id-2"]
    }
  ],
  totalAlerts: 5,
  highSeverity: 2,
  mediumSeverity: 3,
  guestsWithIssues: 3
}
```

---

## 🪑 MÓDULO 3: Mesas

### Páginas a crear

#### `pages/Events/EventMesas/index.tsx`

**Funcionalidad**:
- Canvas drag & drop para posicionar mesas
- CRUD de mesas
- Auto-asignación de invitados
- Estadísticas de ocupación

**Endpoints a usar**:
```typescript
GET    /api/events/:eventId/mesas              // Listar con stats
POST   /api/events/:eventId/mesas              // Crear
PUT    /api/events/:eventId/mesas/:id          // Actualizar
DELETE /api/events/:eventId/mesas/:id          // Eliminar
POST   /api/events/:eventId/mesas/auto-assign  // Auto-asignar
```

**Layout sugerido**:
```tsx
export function EventMesasPage() {
  const { eventId } = useParams()
  const [mesas, setMesas] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedMesa, setSelectedMesa] = useState(null)

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sidebar: Lista de mesas */}
      <div className="col-span-4">
        <div className="flex justify-between items-center mb-4">
          <h2>Mesas ({mesas.length})</h2>
          <button onClick={() => setShowMesaForm(true)}>
            + Nueva Mesa
          </button>
        </div>

        {/* Estadísticas */}
        <div className="space-y-2 mb-4">
          <div>Ocupadas: {stats?.ocupadas} / {stats?.total}</div>
          <div>Capacidad total: {stats?.capacidadTotal}</div>
          <div>Invitados asignados: {stats?.invitadosAsignados}</div>
          <div>Sin mesa: {stats?.invitadosSinMesa}</div>
        </div>

        {/* Auto-asignación */}
        <button onClick={handleAutoAssign}>
          Auto-asignar Invitados
        </button>

        {/* Lista de mesas */}
        <div className="mt-4 space-y-2">
          {mesas.map(mesa => (
            <div
              key={mesa.id}
              className={`p-3 border rounded cursor-pointer ${
                selectedMesa?.id === mesa.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedMesa(mesa)}
            >
              <div className="font-semibold">Mesa {mesa.numero}</div>
              <div className="text-sm">
                {mesa._count.invitados} / {mesa.capacidad} personas
              </div>
              <div className="text-sm text-gray-500">{mesa.forma}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main: Canvas de distribución */}
      <div className="col-span-8">
        <div className="border rounded-lg h-[600px] relative bg-gray-50">
          <MesaCanvas
            mesas={mesas}
            selectedMesa={selectedMesa}
            onSelectMesa={setSelectedMesa}
            onUpdatePosition={(mesaId, x, y, rotation) =>
              handleUpdatePosition(mesaId, x, y, rotation)
            }
          />
        </div>

        {/* Info de mesa seleccionada */}
        {selectedMesa && (
          <div className="mt-4 p-4 border rounded">
            <h3>Mesa {selectedMesa.numero}</h3>
            <div>Capacidad: {selectedMesa.capacidad}</div>
            <div>Forma: {selectedMesa.forma}</div>
            <div>Sector: {selectedMesa.sector || 'Sin sector'}</div>
            <div>Invitados: {selectedMesa._count.invitados}</div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEditMesa(selectedMesa)}>
                Editar
              </button>
              <button onClick={() => handleDeleteMesa(selectedMesa.id)}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### `components/mesas/MesaCanvas.tsx`

**Funcionalidad**:
- Renderizar mesas en canvas
- Drag & drop para mover mesas
- Rotación de mesas
- Visualización de ocupación

**Tecnología sugerida**: React + SVG o Canvas HTML5

**Ejemplo básico**:
```tsx
export function MesaCanvas({ mesas, onUpdatePosition }) {
  const [dragging, setDragging] = useState(null)

  return (
    <svg width="100%" height="100%" viewBox="0 0 1000 600">
      {mesas.map(mesa => (
        <g
          key={mesa.id}
          transform={`translate(${mesa.posX || 0}, ${mesa.posY || 0}) rotate(${mesa.rotation || 0})`}
          onMouseDown={() => setDragging(mesa.id)}
          style={{ cursor: 'move' }}
        >
          <MesaShape
            forma={mesa.forma}
            capacidad={mesa.capacidad}
            ocupados={mesa._count.invitados}
          />
          <text textAnchor="middle" y="5">
            {mesa.numero}
          </text>
        </g>
      ))}
    </svg>
  )
}
```

---

## 📱 MÓDULO 4: QR Check-in

### Componente a crear

#### `pages/Events/EventCheckinQR.tsx`

**Funcionalidad**:
- Modal/página para mostrar QR de check-in
- Botón "Generar/Regenerar"
- Mostrar link para copiar
- Opciones: Imprimir QR, Compartir por WhatsApp

**Endpoints a usar**:
```typescript
GET  /api/events/:eventId/checkin/qr             // Obtener QR
GET  /api/events/:eventId/checkin/link           // Obtener link
POST /api/events/:eventId/checkin/generate-token // Regenerar token
```

**Componente sugerido**:
```tsx
export function EventCheckinQR({ eventId, onClose }) {
  const [qr, setQr] = useState(null)
  const [link, setLink] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchQRAndLink()
  }, [eventId])

  const fetchQRAndLink = async () => {
    const [qrRes, linkRes] = await Promise.all([
      fetch(`/api/events/${eventId}/checkin/qr`),
      fetch(`/api/events/${eventId}/checkin/link`)
    ])

    const qrData = await qrRes.json()
    const linkData = await linkRes.json()

    setQr(qrData.qr)
    setLink(linkData.url)
  }

  const handleRegenerate = async () => {
    if (!confirm('¿Regenerar token? El QR anterior dejará de funcionar.')) {
      return
    }

    await fetch(`/api/events/${eventId}/checkin/generate-token`, {
      method: 'POST'
    })

    await fetchQRAndLink() // Actualizar QR y link
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(link)
    alert('Link copiado al portapapeles')
  }

  const handleShareWhatsApp = () => {
    const message = `Acceso al check-in del evento: ${link}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="modal">
      <div className="modal-content max-w-md">
        <h2>QR de Acceso Check-in</h2>

        {/* QR Code */}
        <div className="flex justify-center my-6">
          {qr ? (
            <img src={qr} alt="QR Check-in" className="w-64 h-64" />
          ) : (
            <div>Cargando...</div>
          )}
        </div>

        {/* Link */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Link de acceso directo:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={link || ''}
              readOnly
              className="flex-1 px-3 py-2 border rounded"
            />
            <button onClick={handleCopyLink}>
              📋 Copiar
            </button>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex-1">
            🖨️ Imprimir
          </button>
          <button onClick={handleShareWhatsApp} className="flex-1">
            📱 WhatsApp
          </button>
          <button onClick={handleRegenerate} className="flex-1">
            🔄 Regenerar
          </button>
        </div>

        {/* Cerrar */}
        <button onClick={onClose} className="mt-4 w-full">
          Cerrar
        </button>
      </div>
    </div>
  )
}
```

---

## 🔌 API Clients

### `lib/api/persons.ts`

```typescript
import { apiClient } from './client'

export const personsAPI = {
  // Listar todas las personas
  list: async () => {
    const res = await apiClient.get('/api/persons')
    return res.data
  },

  // Buscar personas
  search: async (query: string) => {
    const res = await apiClient.get(`/api/persons/search?q=${query}`)
    return res.data
  },

  // Crear persona
  create: async (data: PersonCreateInput) => {
    const res = await apiClient.post('/api/persons', data)
    return res.data
  },

  // Actualizar persona
  update: async (id: string, data: PersonUpdateInput) => {
    const res = await apiClient.put(`/api/persons/${id}`, data)
    return res.data
  },

  // Eliminar persona
  delete: async (id: string) => {
    const res = await apiClient.delete(`/api/persons/${id}`)
    return res.data
  }
}
```

### `lib/api/eventGuests.ts`

```typescript
export const eventGuestsAPI = {
  list: async (eventId: string) => {
    const res = await apiClient.get(`/api/events/${eventId}/guests`)
    return res.data
  },

  create: async (eventId: string, data: GuestCreateInput) => {
    const res = await apiClient.post(`/api/events/${eventId}/guests`, data)
    return res.data
  },

  update: async (eventId: string, guestId: string, data: GuestUpdateInput) => {
    const res = await apiClient.put(`/api/events/${eventId}/guests/${guestId}`, data)
    return res.data
  },

  delete: async (eventId: string, guestId: string) => {
    const res = await apiClient.delete(`/api/events/${eventId}/guests/${guestId}`)
    return res.data
  },

  checkIn: async (eventId: string, guestId: string) => {
    const res = await apiClient.post(`/api/events/${eventId}/guests/${guestId}/checkin`)
    return res.data
  },

  checkOut: async (eventId: string, guestId: string) => {
    const res = await apiClient.post(`/api/events/${eventId}/guests/${guestId}/checkout`)
    return res.data
  },

  importCSV: async (eventId: string, guests: CSVGuestInput[]) => {
    const res = await apiClient.post(`/api/events/${eventId}/guests/import`, { guests })
    return res.data
  },

  getStats: async (eventId: string) => {
    const res = await apiClient.get(`/api/events/${eventId}/guests/stats`)
    return res.data
  }
}
```

---

## 🎨 Componentes Reutilizables

### `components/persons/PersonSelector.tsx`

```tsx
export function PersonSelector({ value, onChange }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (search.length >= 2) {
      searchPersons(search)
    }
  }, [search])

  return (
    <div>
      <label>Seleccionar Persona</label>
      <input
        type="search"
        placeholder="Buscar por nombre, apellido o email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Resultados */}
      {results.length > 0 && (
        <div className="mt-2 border rounded max-h-48 overflow-y-auto">
          {results.map(person => (
            <div
              key={person.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onChange(person.id)}
            >
              <div className="font-semibold">
                {person.nombre} {person.apellido}
              </div>
              {person.email && (
                <div className="text-sm text-gray-600">{person.email}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Crear nueva persona */}
      <button
        onClick={() => setShowCreate(true)}
        className="mt-2 text-blue-600"
      >
        + Crear nueva persona
      </button>

      {showCreate && (
        <PersonFormModal
          onClose={() => setShowCreate(false)}
          onCreated={(newPerson) => {
            onChange(newPerson.id)
            setShowCreate(false)
          }}
        />
      )}
    </div>
  )
}
```

---

## 📍 Integración con Rutas

### Actualizar `App.tsx`

```tsx
import {
  EventGuestsPage,
  EventMenuPage,
  EventMesasPage,
  EventCheckinQR
} from '@/pages/Events'

// Agregar rutas:
<Route
  path="/events/:id/guests"
  element={
    <ProtectedRoute>
      <Layout>
        <EventGuestsPage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/events/:id/menu"
  element={
    <ProtectedRoute>
      <Layout>
        <EventMenuPage />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/events/:id/mesas"
  element={
    <ProtectedRoute>
      <Layout>
        <EventMesasPage />
      </Layout>
    </ProtectedRoute>
  }
/>
```

### Actualizar navegación del evento

En `EventDetailPage`, agregar botones:

```tsx
<nav>
  <Link to={`/events/${id}/guests`}>Invitados</Link>
  <Link to={`/events/${id}/menu`}>Menú</Link>
  <Link to={`/events/${id}/mesas`}>Mesas</Link>
  <button onClick={() => setShowCheckinQR(true)}>
    📱 QR Check-in
  </button>
</nav>
```

---

## ✅ Checklist de Implementación

### Fase 1: Setup básico
- [ ] Crear estructura de carpetas
- [ ] Crear API clients (persons, eventGuests, dishes, menu, mesas)
- [ ] Actualizar rutas en App.tsx

### Fase 2: Módulo Invitados
- [ ] EventGuests/index.tsx - Lista principal
- [ ] GuestForm.tsx - Formulario crear/editar
- [ ] ImportCSV.tsx - Importación CSV
- [ ] CheckInModal.tsx - Modal de check-in
- [ ] PersonSelector component
- [ ] Integrar con API

### Fase 3: Módulo Menú
- [ ] EventMenu/index.tsx - Gestión principal
- [ ] DishList.tsx - Lista de platos del catálogo
- [ ] MenuBuilder.tsx - Constructor de menú
- [ ] AlertsDashboard.tsx - Dashboard de alertas
- [ ] DishCard component
- [ ] Integrar con API

### Fase 4: Módulo Mesas
- [ ] EventMesas/index.tsx - Gestión principal
- [ ] MesaCanvas.tsx - Canvas drag & drop
- [ ] MesaForm.tsx - Formulario crear/editar
- [ ] AutoAssign.tsx - Modal auto-asignación
- [ ] MesaShape component
- [ ] Integrar con API

### Fase 5: QR Check-in
- [ ] EventCheckinQR.tsx - Modal QR
- [ ] Integrar botón en EventDetailPage
- [ ] Probar generación de QR
- [ ] Probar compartir por WhatsApp

### Fase 6: Testing
- [ ] Probar flujo completo de invitados
- [ ] Probar importación CSV
- [ ] Probar asignación de menú
- [ ] Probar canvas de mesas
- [ ] Probar QR check-in

---

## 📊 Estimación de Tiempo

- **Fase 1 - Setup**: 1 hora
- **Fase 2 - Invitados**: 6-8 horas
- **Fase 3 - Menú**: 6-8 horas
- **Fase 4 - Mesas**: 8-10 horas (canvas es complejo)
- **Fase 5 - QR**: 2 horas
- **Fase 6 - Testing**: 4 horas

**Total estimado**: 27-33 horas de desarrollo frontend

---

## 🎯 Prioridades

1. **Alta**: Invitados + QR Check-in (core del sistema)
2. **Media**: Menú (importante pero no crítico)
3. **Baja**: Mesas (nice to have, complejo)

---

**Última actualización**: 2025-12-14
**Backend status**: ✅ 100% Completado
**Frontend status**: ⏳ Documentación lista para implementar

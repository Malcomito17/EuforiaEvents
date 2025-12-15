# Modelo de Mesas y Salón
## Fecha: 2025-01-14 - VERSIÓN DEFINITIVA

---

## 🎯 DECISIONES CONFIRMADAS

### 1. ASIGNACIÓN DE INVITADOS
- ✅ Asignación a mesa SIN lugares numerados
- ✅ Invitados simplemente "van a la Mesa #5" (sin orden específico)
- ✅ Observaciones generales de la mesa (no por lugar)

**Razón**: Es difícil que los invitados respeten ubicaciones específicas en eventos reales.

### 2. ATRIBUTOS DE MESA
- ✅ Específicos por evento (no globales, no reutilizables)
- ✅ Incluyen: número, capacidad, forma, sector, observaciones
- ✅ Posicionamiento espacial opcional (coordenadas x, y)

### 3. DISTRIBUCIÓN ESPACIAL
- ✅ Salón tiene dimensiones (ancho x largo en metros)
- ✅ Mesas tienen posición (x, y) para representación a escala
- ✅ Permite visualización tipo "plano del salón"

### 4. VALIDACIONES
- ✅ Advertencia si mesa excede capacidad
- ✅ Advertencia si mesa está vacía
- ❌ NO permitir sobre-asignación (pospuesto para futuro)

---

## 📊 SCHEMA PRISMA

### Mesa

```prisma
model Mesa {
  id              String   @id @default(cuid())

  // Relación con evento
  eventId         String

  // Identificación
  numero          String   // "5", "10", "VIP-1", "A1", etc.

  // Características
  capacidad       Int      // Cuántos invitados caben
  forma           String   @default("REDONDA") // REDONDA, CUADRADA, RECTANGULAR
  sector          String?  // "VIP", "General", "Terraza", "Interior", etc.

  // Posicionamiento espacial (opcional, para representación visual)
  posX            Float?   // Coordenada X en el plano del salón (metros o píxeles)
  posY            Float?   // Coordenada Y en el plano del salón
  rotation        Float?   @default(0) // Rotación en grados (para mesas rectangulares)

  // Observaciones
  observaciones   String?  // "Cerca de la entrada", "Tiene enchufes", "Vista al escenario"

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String?  // userId

  // Relaciones
  event           Event    @relation("EventMesas", fields: [eventId], references: [id], onDelete: Cascade)
  invitados       EventGuest[] @relation("MesaGuests")

  @@unique([eventId, numero])  // Número único por evento
  @@index([eventId])
  @@index([eventId, sector])
}
```

**Formas de mesa disponibles**:
- REDONDA (default)
- CUADRADA
- RECTANGULAR
- OVALADA
- HERRADURA (U-shape)

---

### Event (Actualización - Configuración de Salón)

```prisma
model Event {
  // ... campos actuales ...

  // Configuración de salón (para distribución espacial)
  salonAncho      Float?   // Ancho del salón en metros (ej: 20.5)
  salonLargo      Float?   // Largo del salón en metros (ej: 30.0)
  salonImageUrl   String?  // Imagen/plano del salón (opcional)

  // Relaciones
  mesas           Mesa[]   @relation("EventMesas")
}
```

**Propósito**: Permite crear un canvas/plano a escala para visualizar y posicionar mesas.

**Ejemplo**:
- Salón: 20m x 30m
- Canvas UI: 800px x 1200px (escala 1m = 40px)
- Mesa en posición (5m, 10m) → se dibuja en (200px, 400px)

---

## 🎨 REPRESENTACIÓN VISUAL

### Canvas de Salón (UI)

```
┌────────────────────────────────────────┐
│  SALÓN - 20m x 30m                     │
│                                        │
│   [○] Mesa 1     [○] Mesa 2           │
│    VIP            VIP                  │
│    8/8           6/8                   │
│                                        │
│                                        │
│   [□] Mesa 3     [□] Mesa 4           │
│   General        General               │
│    10/10         8/10                  │
│                                        │
│                [▬] Mesa 5              │
│                Terraza                 │
│                 12/12                  │
│                                        │
│   [Escenario]                          │
│                                        │
└────────────────────────────────────────┘
```

**Símbolos**:
- ○ = Mesa redonda
- □ = Mesa cuadrada
- ▬ = Mesa rectangular

**Colores** (sugeridos):
- 🟢 Verde: Mesa completa (capacidad alcanzada)
- 🟡 Amarillo: Mesa parcial (tiene espacio)
- 🔴 Rojo: Mesa vacía (sin invitados)
- 🟣 Morado: Mesa VIP

---

## 📊 DASHBOARD DE MESAS

### Endpoint: `GET /api/events/:eventId/mesas/stats`

**Respuesta**:
```json
{
  "totalMesas": 20,
  "totalCapacidad": 160,
  "totalInvitados": 142,
  "totalInvitadosAsignados": 135,
  "totalInvitadosSinMesa": 7,

  "mesasCompletas": 12,
  "mesasConEspacio": 5,
  "mesasVacias": 3,

  "porSector": [
    {
      "sector": "VIP",
      "mesas": 4,
      "capacidad": 32,
      "ocupados": 30
    },
    {
      "sector": "General",
      "mesas": 12,
      "capacidad": 96,
      "ocupados": 85
    },
    {
      "sector": "Terraza",
      "mesas": 4,
      "capacidad": 32,
      "ocupados": 20
    }
  ],

  "alertas": [
    {
      "tipo": "MESA_VACIA",
      "mesaId": "mesa-10",
      "mesaNumero": "10",
      "sector": "Terraza"
    },
    {
      "tipo": "MESA_EXCEDE_CAPACIDAD",
      "mesaId": "mesa-5",
      "mesaNumero": "5",
      "capacidad": 8,
      "asignados": 9
    }
  ]
}
```

---

### Vista en UI: Lista de Mesas

```
┌──────────────────────────────────────────────────────┐
│ MESAS DEL EVENTO - Boda María                        │
│                                                      │
│ Total: 20 mesas | Capacidad: 160 | Ocupadas: 135    │
│ Invitados sin mesa: 7 ⚠️                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│ 🟢 Mesa #1 (VIP) - Redonda - 8/8                    │
│    Pérez, Juan | González, María | López, Ana...    │
│    📝 Vista al escenario                            │
│                                                      │
│ 🟡 Mesa #3 (General) - Cuadrada - 6/10              │
│    Martínez, Carlos | Fernández, Laura...           │
│    [Agregar invitados]                               │
│                                                      │
│ 🔴 Mesa #10 (Terraza) - Rectangular - 0/12 ⚠️       │
│    (vacía)                                           │
│    [Asignar invitados]                               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJOS DE TRABAJO

### Flujo 1: Crear mesas del evento

**Opción A - Manual (una por una)**:
```
1. Operador va a "Gestión de Mesas"
2. Click en "Agregar Mesa"
3. Formulario:
   - Número: 5
   - Capacidad: 8
   - Forma: Redonda
   - Sector: VIP
   - Observaciones: "Cerca del escenario"
4. Sistema crea mesa
5. Repetir para cada mesa
```

**Opción B - Generación rápida**:
```
1. Operador: "Crear 10 mesas"
2. Formulario rápido:
   - Cantidad: 10
   - Numeración: 1 al 10 (auto)
   - Capacidad por defecto: 8
   - Forma: Redonda
   - Sector: General
3. Sistema crea 10 mesas en batch
4. Operador ajusta individualmente si es necesario
```

**Opción C - Importación CSV**:
```csv
numero,capacidad,forma,sector,observaciones
1,8,REDONDA,VIP,Vista al escenario
2,8,REDONDA,VIP,
3,10,CUADRADA,General,
4,10,CUADRADA,General,
5,12,RECTANGULAR,Terraza,Tiene enchufes
```

---

### Flujo 2: Asignar invitados a mesa

**Desde lista de invitados**:
```
1. Operador selecciona invitados (checkbox múltiple)
2. Click en "Asignar a mesa"
3. Dropdown: Seleccionar mesa
   - Mesa #5 (VIP) - 2/8 (6 espacios disponibles) ✅
   - Mesa #3 (General) - 8/10 (2 espacios disponibles) ✅
   - Mesa #10 (Terraza) - 10/12 (2 espacios disponibles) ⚠️
4. Sistema valida capacidad
5. Si OK → asigna
6. Si excede → muestra error "La mesa solo tiene X espacios"
```

**Desde detalle de mesa**:
```
1. Operador entra a Mesa #5
2. Ve lista de invitados asignados (8/8)
3. Click en "Agregar invitado"
4. Búsqueda rápida de invitados sin mesa
5. Selecciona invitado
6. Sistema valida capacidad
7. Asigna
```

---

### Flujo 3: Distribución espacial (drag & drop)

```
1. Operador va a "Plano del Salón"
2. Sistema muestra canvas con dimensiones (20m x 30m)
3. Sistema muestra todas las mesas como elementos draggables
4. Operador arrastra "Mesa #5" al centro del salón
5. Sistema guarda posición (posX: 10m, posY: 15m)
6. Operador rota mesa rectangular (45°)
7. Sistema actualiza `rotation: 45`
8. Vista se actualiza en tiempo real
```

**Features**:
- Snap to grid (ajustar a grilla cada 0.5m)
- Zoom in/out
- Mostrar capacidad y ocupación en cada mesa
- Exportar a imagen (PNG/PDF)

---

### Flujo 4: Reorganización automática

```
1. Operador tiene 150 invitados, 20 mesas (capacidad 160 total)
2. Click en "Auto-asignar mesas"
3. Sistema ejecuta algoritmo:
   - Distribuir invitados equitativamente
   - Priorizar llenar mesas VIP primero
   - Balancear mesas (evitar 1 invitado solo en mesa de 10)
4. Resultado:
   - 12 mesas completas (8/8)
   - 5 mesas con 6-7 invitados
   - 3 mesas vacías
5. Operador puede ajustar manualmente después
```

---

## 🚨 VALIDACIONES

### Al asignar invitado a mesa:

**✅ Validación exitosa**:
- Mesa tiene espacio disponible
- Invitado no está ya asignado a otra mesa del mismo evento

**⚠️ Advertencias**:
- Mesa alcanzó capacidad exacta (está completa)
- Mesa está en sector diferente al esperado

**❌ Errores bloqueantes**:
- Mesa excedería capacidad (8 invitados en mesa de 8)
- Invitado ya está en otra mesa del evento

---

### Dashboard - Alertas

**🟡 Advertencia baja**:
- Mesa vacía (0 invitados)
- Mesa con 1 solo invitado (en mesa grande)

**🟠 Advertencia media**:
- Invitados sin mesa asignada

**🔴 Alerta crítica**:
- Mesa excede capacidad (deshabilitado por ahora, para futuro)

---

## 📝 ENDPOINTS REST

### Mesas

```
GET    /api/events/:eventId/mesas
POST   /api/events/:eventId/mesas              # Crear mesa
POST   /api/events/:eventId/mesas/bulk         # Crear múltiples
POST   /api/events/:eventId/mesas/import       # Importar CSV
GET    /api/events/:eventId/mesas/:id
PATCH  /api/events/:eventId/mesas/:id          # Actualizar mesa
DELETE /api/events/:eventId/mesas/:id
PATCH  /api/events/:eventId/mesas/:id/position # Actualizar posición (x, y, rotation)

GET    /api/events/:eventId/mesas/stats        # Dashboard
GET    /api/events/:eventId/mesas/:id/guests   # Invitados de la mesa
```

### Asignación

```
POST   /api/events/:eventId/mesas/:mesaId/assign     # Asignar invitados a mesa
DELETE /api/events/:eventId/mesas/:mesaId/unassign   # Quitar invitados
POST   /api/events/:eventId/mesas/auto-assign        # Auto-asignación
```

### Salón

```
PATCH  /api/events/:eventId/salon               # Configurar dimensiones
GET    /api/events/:eventId/salon/layout        # Obtener layout completo
```

---

## 🎨 COMPONENTES UI

### Frontend - Web Operator

```
apps/web-operator/src/pages/Mesas/
├── MesasView.tsx              # Vista principal lista de mesas
├── MesaDetail.tsx             # Detalle de mesa con invitados
├── SalonLayout.tsx            # Plano del salón (drag & drop)
├── MesaForm.tsx               # Formulario crear/editar mesa
├── MesaBulkCreate.tsx         # Crear múltiples mesas
└── MesaImport.tsx             # Importar CSV

apps/web-operator/src/components/
├── MesaCard.tsx               # Card de mesa en lista
├── MesaIcon.tsx               # Ícono según forma (○, □, ▬)
├── MesaCanvas.tsx             # Representación draggable en canvas
├── CapacityBadge.tsx          # Badge 8/10, 0/8, etc.
└── SectorBadge.tsx            # Badge VIP, General, etc.
```

---

## 🧮 ALGORITMO DE AUTO-ASIGNACIÓN

```typescript
async function autoAsignarMesas(eventId: string) {
  // 1. Obtener mesas y invitados
  const mesas = await prisma.mesa.findMany({
    where: { eventId },
    orderBy: [{ sector: 'asc' }, { numero: 'asc' }],
    include: { invitados: true }
  })

  const invitadosSinMesa = await prisma.eventGuest.findMany({
    where: { eventId, mesaId: null }
  })

  // 2. Calcular capacidad disponible
  const capacidadTotal = mesas.reduce((sum, m) => sum + m.capacidad, 0)
  const ocupadosActual = mesas.reduce((sum, m) => sum + m.invitados.length, 0)
  const espacioDisponible = capacidadTotal - ocupadosActual

  if (invitadosSinMesa.length > espacioDisponible) {
    throw new Error('No hay suficiente capacidad para todos los invitados')
  }

  // 3. Estrategia: llenar mesas equitativamente
  const asignaciones: Array<{ guestId: string, mesaId: string }> = []
  let invitadosRestantes = [...invitadosSinMesa]

  // Priorizar llenar mesas VIP
  const mesasVIP = mesas.filter(m => m.sector === 'VIP')
  const mesasOtras = mesas.filter(m => m.sector !== 'VIP')

  for (const mesa of [...mesasVIP, ...mesasOtras]) {
    const espacios = mesa.capacidad - mesa.invitados.length

    for (let i = 0; i < espacios && invitadosRestantes.length > 0; i++) {
      const invitado = invitadosRestantes.shift()!
      asignaciones.push({
        guestId: invitado.id,
        mesaId: mesa.id
      })
    }

    if (invitadosRestantes.length === 0) break
  }

  // 4. Ejecutar asignaciones
  await prisma.$transaction(
    asignaciones.map(a =>
      prisma.eventGuest.update({
        where: { id: a.guestId },
        data: { mesaId: a.mesaId }
      })
    )
  )

  return {
    asignados: asignaciones.length,
    mesasAfectadas: new Set(asignaciones.map(a => a.mesaId)).size
  }
}
```

---

## ✅ INTEGRACIÓN CON MÓDULOS EXISTENTES

### Con Invitados (EventGuest)
- EventGuest.mesaId → referencia a Mesa
- Cascading: si se elimina Mesa → mesaId se pone NULL (no elimina invitado)

### Con Evento (Event)
- Event tiene dimensiones del salón (salonAncho, salonLargo)
- Event tiene configuración: tieneMesasAsignadas (boolean)
- Si false → módulo de mesas no se usa

### Con Check-in (futuro)
- En app de recepción, mostrar número de mesa al hacer check-in
- "Juan Pérez → Mesa #5 (VIP)"

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Agregar modelo Mesa a schema.prisma
- [ ] Agregar campos de salón a Event
- [ ] Migración de BD
- [ ] Módulo mesas (CRUD)
- [ ] Endpoints de asignación
- [ ] Endpoint de estadísticas
- [ ] Algoritmo de auto-asignación
- [ ] Validaciones de capacidad
- [ ] Importación CSV

### Frontend
- [ ] Página: Lista de mesas
- [ ] Página: Detalle de mesa
- [ ] Página: Plano del salón (canvas drag & drop)
- [ ] Componente: MesaCard
- [ ] Componente: MesaCanvas (draggable)
- [ ] Formulario: Crear mesa
- [ ] Modal: Crear múltiples mesas
- [ ] Modal: Asignar invitados a mesa
- [ ] Dashboard de estadísticas
- [ ] Importación CSV

### Testing
- [ ] Crear mesa
- [ ] Asignar invitados
- [ ] Validación de capacidad
- [ ] Auto-asignación
- [ ] Drag & drop en canvas
- [ ] Importación CSV

---

## 🚀 PRÓXIMA FASE

Después de Mesas, continuamos con:
1. **Check-in App** (interfaz de recepción)
2. **Timeline** (agenda del evento)
3. **Roles adicionales** (RECEPTION, CATERING, etc.)

---

**Documento definitivo**: 2025-01-14
**Estado**: ✅ Listo para implementación
**Dependencias**: Requiere módulo de Invitados implementado

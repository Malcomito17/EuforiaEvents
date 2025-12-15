# Check-in App - Aplicación de Recepción
## Fecha: 2025-01-14 - VERSIÓN DEFINITIVA

---

## 🎯 OBJETIVO

Aplicación dedicada para personal de recepción en eventos, optimizada para:
- ✅ Búsqueda rápida de invitados
- ✅ Check-in/check-out de asistencia
- ✅ Visualización de información crítica (mesa, restricciones, observaciones)
- ✅ Interfaz minimalista sin distracciones
- ✅ Uso bajo presión (alta concurrencia en puerta)

---

## 🔐 ROL RECEPTION

### Creación del Rol

```prisma
model User {
  // ... campos existentes ...
  role: String  // ADMIN, MANAGER, OPERATOR, DJ, RECEPTION
}
```

**Valor**: `RECEPTION`

### Permisos del Rol

```typescript
const RECEPTION_PERMISSIONS = {
  // MÓDULOS CON ACCESO
  INVITADOS: {
    canView: true,      // ✅ Ver lista de invitados
    canEdit: false,     // ❌ No puede editar datos personales
    canDelete: false,   // ❌ No puede eliminar
    canExport: false,   // ❌ No puede exportar
    canCheckIn: true    // ✅ Puede marcar check-in/out
  },

  MESAS: {
    canView: true,      // ✅ Ver mesa asignada
    canEdit: false,     // ❌ No puede reasignar mesas
    canDelete: false,
    canExport: false
  },

  MENU: {
    canView: true,      // ✅ Ver platos asignados
    canEdit: false,     // ❌ No puede cambiar platos
    canDelete: false,
    canExport: false
  },

  // SIN ACCESO A:
  EVENTS: { canView: false },         // ❌ Configuración de eventos
  MUSICADJ: { canView: false },       // ❌ Módulos de servicios públicos
  KARAOKEYA: { canView: false },
  VENUES: { canView: false },         // ❌ Gestión de salones
  CLIENTS: { canView: false },        // ❌ Gestión de clientes
  USERS: { canView: false },          // ❌ Gestión de usuarios
  TIMELINE: { canView: false }        // ❌ Agenda del evento
}
```

---

## 🏗️ ARQUITECTURA DE LA APP

### Nueva Aplicación Dedicada

```
apps/web-checkin/
├── src/
│   ├── pages/
│   │   ├── Login.tsx              # Login con rol RECEPTION
│   │   ├── EventSelect.tsx        # Selección de evento (si tiene múltiples)
│   │   ├── CheckIn.tsx            # Pantalla principal de check-in
│   │   └── GuestDetail.tsx        # Detalle de invitado
│   ├── components/
│   │   ├── SearchBar.tsx          # Búsqueda rápida
│   │   ├── GuestCard.tsx          # Card de invitado
│   │   ├── CheckInButton.tsx      # Botón principal check-in
│   │   ├── InfoBadges.tsx         # Badges de mesa, restricciones, etc.
│   │   └── StatsHeader.tsx        # Estadísticas en tiempo real
│   ├── services/
│   │   ├── authService.ts         # Login RECEPTION
│   │   └── checkinService.ts      # API calls
│   ├── stores/
│   │   └── checkinStore.ts        # Estado (Zustand)
│   └── App.tsx
├── public/
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎨 DISEÑO UI/UX - PRINCIPIOS

### 1. MINIMALISMO EXTREMO
- ✅ Solo información crítica
- ✅ Fuentes grandes (legibles a distancia)
- ✅ Colores claros y contrastantes
- ✅ Sin menús complejos ni opciones innecesarias

### 2. VELOCIDAD
- ✅ Búsqueda con autofocus al cargar
- ✅ Resultados en tiempo real (mientras escribe)
- ✅ Máximo 2 clicks para check-in
- ✅ Atajos de teclado (Enter para confirmar)

### 3. FEEDBACK VISUAL INMEDIATO
- ✅ Check-in exitoso: animación verde + sonido
- ✅ Ya ingresado: advertencia amarilla
- ✅ Invitado no encontrado: error rojo claro

### 4. OPTIMIZACIÓN PARA TABLET/MÓVIL
- ✅ Responsive (funciona en iPad, tablets Android)
- ✅ Toques grandes (dedos, no mouse)
- ✅ Orientación portrait y landscape

---

## 📱 PANTALLAS PRINCIPALES

### Pantalla 1: Login

```
┌────────────────────────────────────┐
│                                    │
│        🎟️  CHECK-IN                │
│        EUFORIA EVENTS              │
│                                    │
│   ┌──────────────────────────┐    │
│   │ Usuario                  │    │
│   └──────────────────────────┘    │
│                                    │
│   ┌──────────────────────────┐    │
│   │ Contraseña               │    │
│   └──────────────────────────┘    │
│                                    │
│   ┌──────────────────────────┐    │
│   │     INICIAR SESIÓN       │    │
│   └──────────────────────────┘    │
│                                    │
│   Solo para personal de           │
│   recepción autorizado             │
│                                    │
└────────────────────────────────────┘
```

**Comportamiento**:
- Validar usuario con rol RECEPTION
- Si el usuario tiene acceso a múltiples eventos → mostrar selector
- Si solo tiene acceso a 1 evento → ir directo a check-in

---

### Pantalla 2: Selección de Evento (si aplica)

```
┌────────────────────────────────────┐
│  Selecciona el evento              │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  🎊 Boda María                │ │
│  │  15 de Febrero - 150 invitados│ │
│  │  ✅ 85 ingresados              │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  🎂 Cumpleaños 50 Juan        │ │
│  │  20 de Febrero - 80 invitados │ │
│  │  ⏳ 0 ingresados               │ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

---

### Pantalla 3: Check-in Principal (⭐ Pantalla clave)

```
┌──────────────────────────────────────────────┐
│  🎊 Boda María - Check-in                    │
│  ✅ 85/150 ingresados  ⏳ 65 pendientes       │
├──────────────────────────────────────────────┤
│                                              │
│  🔍 [Buscar invitado por nombre...]          │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Resultados de búsqueda:                     │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  GONZÁLEZ, MARÍA                     │   │
│  │  Mesa #5 (VIP) • 🥗 Vegano           │   │
│  │  📝 Movilidad reducida                │   │
│  │  ⏳ PENDIENTE                         │   │
│  │  [✅ MARCAR INGRESO]                  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  GONZÁLEZ, JUAN                      │   │
│  │  Mesa #3 (General)                   │   │
│  │  ✅ INGRESADO - 19:45                 │   │
│  │  [❌ MARCAR SALIDA]                   │   │
│  └──────────────────────────────────────┘   │
│                                              │
└──────────────────────────────────────────────┘
```

**Características**:
- Búsqueda en tiempo real (mientras escribe)
- Resultados instantáneos (máx 100ms)
- Ordenados por relevancia (exactitud del match)
- Destacar invitados pendientes primero

---

### Pantalla 4: Detalle de Invitado (opcional, modal)

```
┌────────────────────────────────────┐
│  GONZÁLEZ, MARÍA                   │
│                                    │
│  📍 Mesa: #5 (VIP)                 │
│  🥗 Restricciones: Vegano          │
│  🍽️ Platos: Ensalada, Pasta, Flan │
│  📝 Observaciones:                 │
│     Movilidad reducida - Silla    │
│     de ruedas disponible           │
│                                    │
│  Estado: ⏳ PENDIENTE               │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  ✅ CONFIRMAR INGRESO        │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Volver]                          │
└────────────────────────────────────┘
```

---

## 🔄 FLUJOS DE TRABAJO

### Flujo 1: Check-in Normal (Happy Path)

```
1. Recepcionista abre app (ya logueado)
2. Invitado llega: "Soy María González"
3. Recepcionista escribe "Maria" en búsqueda
4. Sistema muestra resultados en tiempo real
5. Recepcionista ve:
   - GONZÁLEZ, MARÍA
   - Mesa #5 (VIP)
   - 🥗 Vegano
   - ⏳ PENDIENTE
6. Click en "MARCAR INGRESO"
7. Sistema:
   - Actualiza estadoIngreso → "INGRESADO"
   - Guarda checkedInAt → now()
   - Guarda checkedInBy → userId
8. Animación de éxito ✅ (verde)
9. Card se actualiza:
   - ✅ INGRESADO - 19:45
   - Botón cambia a "MARCAR SALIDA"
10. Recepcionista: "Bienvenida María, estás en la Mesa 5"
```

**Tiempo total**: 5-10 segundos

---

### Flujo 2: Invitado ya ingresado (advertencia)

```
1. Recepcionista busca "Juan González"
2. Sistema muestra:
   - GONZÁLEZ, JUAN
   - ✅ INGRESADO - 19:45
3. Recepcionista ve que ya ingresó
4. Opciones:
   - A) Ignorar (ya está adentro, todo OK)
   - B) Marcar salida (si salió y volvió a entrar)
```

---

### Flujo 3: Invitado no encontrado

```
1. Recepcionista busca "Pedro Ramírez"
2. Sistema no encuentra resultados
3. Mensaje claro:
   "❌ No se encontró ningún invitado con ese nombre"

   "¿El invitado está en la lista?"
   [Verificar con organizador]

4. Recepcionista consulta con organizador
5. Organizador:
   - A) No está invitado → rechazar entrada
   - B) Está pero con otro nombre → buscar de nuevo
   - C) Error en la lista → agregar manualmente desde web-operator
```

**Importante**: Check-in app NO permite agregar invitados (sin permisos).

---

### Flujo 4: Check-out (salida)

```
1. Invitado sale temprano: "Me tengo que ir, soy Juan"
2. Recepcionista busca "Juan"
3. Ve que está INGRESADO
4. Click en "MARCAR SALIDA"
5. Sistema actualiza estadoIngreso → "NO_ASISTIO"? O crear nuevo estado "SALIO"?
```

**Pregunta**: ¿Necesitamos distinguir entre:
- NO_ASISTIO (nunca llegó)
- SALIO (llegó pero se fue temprano)

**Opción A**: Estados separados
- PENDIENTE
- INGRESADO
- SALIO
- NO_ASISTIO

**Opción B**: Solo campo adicional
- estadoIngreso: INGRESADO
- checkedOutAt: timestamp (nullable)

**¿Cuál prefieres?**

---

## 📊 ESTADÍSTICAS EN TIEMPO REAL

### Header de la App

```
┌──────────────────────────────────────┐
│  🎊 Boda María                       │
│  ✅ 85/150  ⏳ 65  ❌ 0              │
│     (57%)  (43%)  (0%)              │
└──────────────────────────────────────┘
```

**Métricas**:
- Total ingresados / Total invitados
- Pendientes
- No asistieron (opcional)
- Porcentajes

**Actualización**: Tiempo real vía WebSocket

---

## 🔌 ENDPOINTS REST

### Autenticación

```
POST   /api/auth/login                    # Login (verificar rol RECEPTION)
GET    /api/auth/me                       # Datos del usuario logueado
```

### Check-in

```
GET    /api/events/:eventId/checkin/guests       # Lista de invitados (search)
GET    /api/events/:eventId/checkin/stats        # Estadísticas
POST   /api/events/:eventId/checkin/:guestId     # Marcar ingreso
DELETE /api/events/:eventId/checkin/:guestId     # Marcar salida
```

**Detalle del endpoint de búsqueda**:
```typescript
GET /api/events/:eventId/checkin/guests?search=maria

Response:
{
  results: [
    {
      id: "guest-123",
      fullName: "GONZÁLEZ, MARÍA",
      mesa: {
        numero: "5",
        sector: "VIP"
      },
      dietaryRestrictions: ["VEGANO"],
      observaciones: "Movilidad reducida",
      accesibilidad: "MOVILIDAD_REDUCIDA",
      estadoIngreso: "PENDIENTE",
      checkedInAt: null,
      checkedInBy: null
    }
  ]
}
```

---

## 🔄 WEBSOCKET (Tiempo Real)

### Eventos de Socket.io

```typescript
// Cliente se conecta al room del evento
socket.emit('checkin:join', eventId)

// Servidor emite cuando hay check-in
socket.on('checkin:guest:updated', (data) => {
  // Actualizar UI en tiempo real
  // Útil si hay múltiples recepcionistas
})

// Servidor emite stats actualizadas
socket.on('checkin:stats:updated', (stats) => {
  // Actualizar header con nuevos números
})
```

**Propósito**: Si hay 2+ recepcionistas simultáneos, todos ven los check-ins en tiempo real.

---

## 🛠️ STACK TÉCNICO

### Frontend (apps/web-checkin)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "axios": "^1.7.0",
    "socket.io-client": "^4.7.5",
    "zustand": "^4.5.2",
    "tailwindcss": "^3.4.3",
    "lucide-react": "^0.378.0"
  }
}
```

**Sin dependencias pesadas**:
- ❌ No drag & drop
- ❌ No charts complejos
- ❌ No tablas avanzadas
- ✅ Solo lo esencial: búsqueda, botones, badges

---

## 🐳 DOCKER

### Dockerfile.web-checkin

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install
RUN pnpm --filter web-checkin build

FROM nginx:alpine
COPY --from=builder /app/apps/web-checkin/dist /usr/share/nginx/html
COPY docker/nginx/web-checkin.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.prod.yml

```yaml
services:
  web-checkin:
    build:
      context: .
      dockerfile: docker/Dockerfile.web-checkin
    container_name: euforia-checkin-prod
    restart: unless-stopped
    networks:
      - euforia-network
```

### Nginx

```nginx
# docker/nginx/conf.d/euforia.conf

location /checkin/ {
    rewrite ^/checkin/(.*)$ /$1 break;
    proxy_pass http://web-checkin:80;
    proxy_http_version 1.1;

    # Headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    # Security
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
}

location = /checkin {
    return 301 /checkin/;
}
```

**URL de acceso**: `https://app.euforiateclog.cloud/checkin/`

---

## 🔒 SEGURIDAD

### 1. Autenticación Obligatoria
- ✅ No hay acceso sin login
- ✅ Solo usuarios con rol RECEPTION
- ✅ Token JWT con expiración (7 días)

### 2. Permisos Estrictos
- ✅ Solo puede ver invitados del evento asignado
- ✅ No puede editar datos personales
- ✅ No puede eliminar invitados
- ✅ Solo puede marcar check-in/out

### 3. Rate Limiting
- ✅ Máximo 100 requests por minuto por usuario
- ✅ Previene abuso de búsquedas

### 4. Logs de Auditoría
- ✅ Cada check-in registra:
  - Quién hizo el check-in (userId)
  - Cuándo (timestamp)
  - Desde qué IP

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Backend
- [ ] Agregar rol RECEPTION a User
- [ ] Crear middleware de autorización para rol RECEPTION
- [ ] Endpoints de check-in
- [ ] WebSocket events para check-in
- [ ] Estadísticas en tiempo real
- [ ] Logs de auditoría

### Frontend - Web Check-in
- [ ] Crear app: `apps/web-checkin`
- [ ] Configurar Vite + React + Tailwind
- [ ] Página: Login
- [ ] Página: Selección de evento
- [ ] Página: Check-in principal
- [ ] Componente: SearchBar con autocomplete
- [ ] Componente: GuestCard
- [ ] Componente: CheckInButton
- [ ] Componente: StatsHeader
- [ ] Servicio: authService
- [ ] Servicio: checkinService
- [ ] Store: checkinStore
- [ ] WebSocket integration
- [ ] Responsive design (tablet/móvil)

### DevOps
- [ ] Dockerfile para web-checkin
- [ ] Actualizar docker-compose.prod.yml
- [ ] Configurar ruta /checkin/ en Nginx
- [ ] Testing en producción

### Testing
- [ ] Login con rol RECEPTION
- [ ] Búsqueda de invitados
- [ ] Check-in exitoso
- [ ] Check-in de invitado ya ingresado
- [ ] Invitado no encontrado
- [ ] Check-out
- [ ] Estadísticas en tiempo real
- [ ] Múltiples recepcionistas simultáneos

---

## 🎯 CASOS DE USO REALES

### Escenario 1: Evento grande (200+ invitados)

**Problema**: Cola en la entrada

**Solución**:
- 3 recepcionistas con tablets
- Cada uno con web-checkin abierto
- Búsqueda rápida en paralelo
- WebSocket sincroniza check-ins
- No hay duplicados (sistema valida)

---

### Escenario 2: Invitado VIP con necesidades especiales

```
Recepcionista busca: "María González"
Sistema muestra:
  - GONZÁLEZ, MARÍA
  - Mesa #1 (VIP)
  - 🦽 MOVILIDAD_REDUCIDA
  - 📝 "Silla de ruedas lista en entrada"

Recepcionista:
  1. Marca check-in
  2. Lee observación
  3. Coordina con personal: "Lleven la silla a Mesa 1"
```

---

### Escenario 3: Invitado con acompañante no invitado

```
Recepcionista busca: "Juan Pérez"
Sistema: encontrado ✅

Invitado: "Vengo con mi esposa María"
Recepcionista busca: "María Pérez"
Sistema: no encontrado ❌

Recepcionista:
  - Consulta con organizador
  - Organizador desde web-operator:
    - Agrega "Pérez, María" a guestlist
    - Asigna a Mesa 5 (misma que Juan)

Recepcionista vuelve a buscar: "María Pérez"
Sistema: encontrado ✅ (actualizado en tiempo real)
Marca check-in de ambos
```

---

## 💡 MEJORAS FUTURAS (Post-MVP)

- [ ] Escáner de QR codes (cada invitado tiene QR único)
- [ ] Impresión de badges/acreditaciones
- [ ] Check-in mediante reconocimiento facial (AI)
- [ ] Integración con WhatsApp (notificar a organizador si VIP llega)
- [ ] Modo offline (cache local si se cae internet)
- [ ] Exportar reporte de asistencia en tiempo real

---

## ✅ DECISIÓN FINAL: CHECKOUT CONFIGURABLE

**Modelo híbrido adoptado**:

### Event (configuración)
```
requiereCheckout: boolean (default: false)
```

### EventGuest
```
estadoIngreso: "PENDIENTE" | "INGRESADO" | "NO_ASISTIO"
checkedOutAt: DateTime? (nullable, solo se usa si Event.requiereCheckout = true)
checkedOutBy: String? (userId del recepcionista)
```

### Comportamiento
- **Si evento.requiereCheckout = true**: App muestra botón "MARCAR SALIDA"
- **Si evento.requiereCheckout = false**: App NO muestra botón de salida

### Casos de uso
**Requiere checkout**:
- Eventos largos (+4 horas)
- Control de seguridad
- Eventos corporativos
- Conferencias

**No requiere checkout**:
- Fiestas de cumpleaños
- Casamientos
- Eventos cortos (<3 horas)
- Buffets informales

---

**Documento definitivo**: 2025-01-14
**Estado**: ✅ 100% completo y listo para implementación
**Dependencias**: Módulo de Invitados + Rol RECEPTION

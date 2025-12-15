# TODO - Nuevos Módulos
## Última actualización: 2025-01-14

---

## 🎯 EN CURSO

### MÓDULO INVITADOS - FASE 1 (INMEDIATO)
- [ ] **PASO 1**: Refactor Guest → Participant
  - [ ] Actualizar schema.prisma (renombrar modelo)
  - [ ] Crear migración Prisma
  - [ ] Renombrar módulo backend: `modules/guests/` → `modules/participants/`
  - [ ] Actualizar todos los imports y referencias en backend
  - [ ] Renombrar archivos frontend (web-client y web-operator)
  - [ ] Actualizar stores y servicios frontend
  - [ ] Testing completo del refactor
  - [ ] Commit y push

- [ ] **PASO 2**: Crear modelo Guest (Invitados formales)
  - [ ] Definir schema completo en Prisma
  - [ ] Crear migración de BD
  - [ ] Actualizar relaciones con Event, Participant, Table
  - [ ] Testing del modelo

- [ ] **PASO 3**: Backend - Módulo Guests
  - [ ] Crear estructura: `modules/guests/`
  - [ ] Implementar `guests.types.ts` (Zod schemas)
  - [ ] Implementar `guests.service.ts` (lógica de negocio)
  - [ ] Implementar `guests.controller.ts` (HTTP handlers)
  - [ ] Implementar `guests.routes.ts` (endpoints REST)
  - [ ] Error handling (GuestError)
  - [ ] Tests unitarios

- [ ] **PASO 4**: Auto-enlace Participant ↔ Guest
  - [ ] Lógica en `participants.service.ts` (auto-link por email)
  - [ ] Endpoint manual: POST `/guests/:id/link-participant`
  - [ ] Endpoint manual: DELETE `/guests/:id/unlink-participant`
  - [ ] Testing de enlace automático
  - [ ] Testing de enlace manual

- [ ] **PASO 5**: Importación/Exportación masiva
  - [ ] Parser de CSV
  - [ ] Endpoint POST `/guests/import`
  - [ ] Endpoint GET `/guests/export`
  - [ ] Endpoint GET `/guests/template`
  - [ ] Manejo de errores en importación
  - [ ] Testing de importación válida
  - [ ] Testing de importación con errores

- [ ] **PASO 6**: Frontend - Web Operator
  - [ ] Crear páginas:
    - [ ] `GuestList.tsx` (lista con filtros)
    - [ ] `GuestCreate.tsx` (crear invitado)
    - [ ] `GuestEdit.tsx` (editar invitado)
    - [ ] `GuestImport.tsx` (importación masiva)
  - [ ] Crear componentes:
    - [ ] `GuestCard.tsx`
    - [ ] `GuestTable.tsx`
    - [ ] `GuestForm.tsx`
    - [ ] `CheckInBadge.tsx`
    - [ ] `DietaryBadge.tsx`
  - [ ] Crear servicio: `guestService.ts`
  - [ ] Crear store: `guestStore.ts`
  - [ ] Agregar rutas en App
  - [ ] Agregar enlace en menú principal
  - [ ] Testing E2E

- [ ] **PASO 7**: Integración y Testing
  - [ ] Testing de integración completo
  - [ ] Documentación de API
  - [ ] Documentación de uso

- [ ] **PASO 8**: Deploy
  - [ ] Build de producción
  - [ ] Migración de BD en producción
  - [ ] Deploy y smoke testing

---

## ⏳ PENDIENTE - SIGUIENTES FASES

### MÓDULO MESAS - FASE 2
- [ ] Diseño técnico completo
- [ ] Modelo `Table` en Prisma
- [ ] Backend: service + controller + routes
- [ ] Frontend: CRUD de mesas
- [ ] Frontend: Asignación visual de invitados a mesas
- [ ] Frontend: Vista de distribución espacial
- [ ] Testing e integración

### MÓDULO MENÚ - FASE 3
- [ ] Diseño técnico completo
- [ ] Modelo `Dish` (catálogo global)
- [ ] Modelo `EventDish` (platos por evento)
- [ ] Modelo `GuestDish` (asignación a invitados)
- [ ] Backend: CRUD de platos
- [ ] Backend: Validación de restricciones alimentarias
- [ ] Frontend: Gestión de catálogo
- [ ] Frontend: Asignación de platos a evento
- [ ] Frontend: Asignación de platos a invitados
- [ ] Frontend: Filtros por restricciones
- [ ] Testing e integración

### APP CHECK-IN - FASE 4
- [ ] Diseño técnico completo
- [ ] Crear nueva app: `apps/web-checkin/`
- [ ] Configurar Vite + React + Tailwind
- [ ] Página de Login (rol RECEPTION)
- [ ] Página de búsqueda rápida
- [ ] Página de detalle de invitado
- [ ] Botón de check-in/checkout
- [ ] Visualización de mesa y observaciones
- [ ] Configurar Docker para nueva app
- [ ] Configurar Nginx para ruta `/checkin/`
- [ ] Testing E2E
- [ ] Deploy

### ROL RECEPTION
- [ ] Agregar rol RECEPTION al sistema
- [ ] Configurar permisos del rol:
  - [ ] Ver INVITADOS (solo lectura)
  - [ ] Ver MESAS (solo lectura)
  - [ ] Ver MENU (solo lectura)
  - [ ] Ejecutar CHECK-IN (lectura + escritura)
- [ ] Actualizar middleware de autorización
- [ ] Testing de permisos

### MÓDULO TIMELINE - FASE 5 (FUTURO)
- [ ] Diseño técnico completo
- [ ] Modelo `TimelineSlot` en Prisma
- [ ] Backend: CRUD de slots
- [ ] Backend: Lógica de orden cronológico
- [ ] Backend: Cálculo de atrasos
- [ ] Frontend: Visualización de agenda
- [ ] Frontend: Drag & drop para reordenar
- [ ] Frontend: Comparación planificado vs real
- [ ] Frontend: Indicadores visuales (a tiempo/atrasado)
- [ ] WebSocket para updates en tiempo real
- [ ] Testing e integración
- [ ] **Evaluar**: Relación con invitados (definir casos de uso)

---

## 🚫 POSPUESTO (No Prioritario)

- [ ] Notificaciones SMS/WhatsApp para invitados
- [ ] Sistema de confirmación de asistencia (RSVP)
- [ ] Estadísticas avanzadas de asistencia
- [ ] Exportación avanzada (PDF, Excel con formato)
- [ ] Códigos QR individuales por invitado
- [ ] Relación Timeline ↔ Invitados (requiere análisis de casos de uso)
- [ ] Roles adicionales (CATERING, PRODUCCION, etc.)

---

## 📋 BACKLOG - Ideas para Evaluar

- [ ] Integración con Google Calendar para Timeline
- [ ] Notificaciones push en web-operator
- [ ] App móvil nativa para check-in (React Native)
- [ ] Sistema de badges/acreditaciones imprimibles
- [ ] Gestión de proveedores (catering, DJ, fotógrafo)
- [ ] Módulo de presupuestos
- [ ] Dashboard ejecutivo con métricas del evento
- [ ] Historial de eventos pasados con analytics

---

## ✅ COMPLETADO

### Sistema Base
- [x] MUSICADJ - Sistema de pedidos musicales (100%)
- [x] KARAOKEYA - Sistema de karaoke (100%)
- [x] Display Screen público para karaoke (100%)
- [x] Upload de imágenes (eventos + karaokeya)
- [x] Sistema de autenticación JWT
- [x] Sistema de permisos granulares
- [x] WebSocket real-time (Socket.io)
- [x] Docker + Docker Compose producción
- [x] Nginx reverse proxy
- [x] Frontend web-client (acceso público QR)
- [x] Frontend web-operator (panel de control)

### Documentación
- [x] Documento de decisiones de diseño
- [x] Plan de implementación de Invitados
- [x] TODO de nuevos módulos
- [x] Resumen ejecutivo del sistema actual

---

## 📊 PROGRESO GENERAL

### Módulo INVITADOS
- Diseño técnico: ✅ 100%
- Implementación: ⏳ 0%
- Testing: ⏳ 0%
- Deploy: ⏳ 0%

### Módulo MESAS
- Diseño técnico: ⏳ 0%
- Implementación: ⏳ 0%

### Módulo MENÚ
- Diseño técnico: ⏳ 0%
- Implementación: ⏳ 0%

### App CHECK-IN
- Diseño técnico: ⏳ 0%
- Implementación: ⏳ 0%

### Módulo TIMELINE
- Diseño técnico: ⏳ 0%
- Implementación: ⏳ 0%

---

**Próxima sesión**: Comenzar con PASO 1 (Refactor Guest → Participant)

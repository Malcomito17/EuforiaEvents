# Decisiones de Diseño - Nuevos Módulos
## Fecha: 2025-01-14

---

## 📋 CONTEXTO

Expansión del sistema EUFORIA EVENTS con nuevos módulos de gestión formal de eventos:
- Invitados (lista formal)
- Mesas
- Menú
- Timeline
- Check-in/Recepción

---

## ✅ DECISIONES TOMADAS

### 1. REFACTOR SEMÁNTICO: Guest → Participant

**Decisión**: Renombrar modelo `Guest` → `Participant` inmediatamente

**Razón**:
- Claridad semántica
- `Participant` = Auto-registro voluntario para servicios públicos (MUSICADJ/KARAOKEYA)
- `Guest` = Invitado formal de lista pre-armada del evento

**Impacto**:
- Migración de base de datos
- Refactor de 20+ archivos
- Actualización de tipos, endpoints, servicios

**Estado**: ✅ APROBADO

---

### 2. RELACIÓN Invitado ↔ Participante

**Decisión**: Enlace automático por email cuando existe

**Funcionamiento**:
- Si un invitado tiene email cargado
- Y un participante se registra con el mismo email
- Se vinculan automáticamente
- El operador puede editar/corregir manualmente si hay error

**Nota**: La registración de participante es de baja sensibilidad, errores se pueden corregir fácilmente

**Estado**: ✅ APROBADO

---

### 3. EMAIL ÚNICO EN PARTICIPANTES

**Decisión**: Mantener email único cross-evento

**Razón**:
- Un participante frecuente no necesita re-registrarse en cada evento
- Facilita experiencia de usuario
- Se evaluará en base al uso real si genera problemas

**Estado**: ✅ APROBADO

---

### 4. RESTRICCIONES ALIMENTARIAS

**Decisión**: Doble nivel (Invitado + Plato)

**Implementación**:
- **Invitado**: Tiene campo `dietaryRestrictions` (ej: ["celíaco", "vegano"])
- **Plato**: Tiene campo `dietaryInfo` (ej: ["VEGANO", "SIN_GLUTEN"])
- **Regla**: Un invitado con marca "VEGANO" solo puede tener asignado un plato con marca "VEGANO"
- **Sistema**: Puede sugerir/filtrar platos compatibles automáticamente

**Estado**: ✅ APROBADO

---

### 5. RELACIÓN TIMELINE ↔ INVITADOS

**Decisión**: Posponer para fase posterior

**Razón**: No es crítico para MVP, requiere más análisis de casos de uso reales

**Estado**: ⏳ PENDIENTE PARA FUTURO

---

### 6. ARQUITECTURA CHECK-IN

**Decisión**: Nueva aplicación dedicada `apps/web-checkin/`

**Características**:
- Interfaz 100% minimalista
- Optimizada para uso bajo presión
- Forma parte del sistema completo
- Se gestiona desde interfaz del operador (configuración, accesos)
- Requiere nuevo contenedor Docker

**Estado**: ✅ APROBADO

---

### 7. AUTENTICACIÓN CHECK-IN

**Decisión**: Login con rol RECEPTION

**Razón**:
- Seguridad y auditoría (saber quién hizo cada check-in)
- Control de acceso
- Profesionalismo en eventos formales

**Nota**: Inicialmente rol RECEPTION, próximamente se definirán otros roles específicos

**Estado**: ✅ APROBADO

---

### 8. NUEVO ROL: RECEPTION

**Decisión**: Agregar rol `RECEPTION` al sistema

**Permisos**:
- ✅ Ver INVITADOS (solo lectura)
- ✅ Ver MESAS (solo lectura)
- ✅ Ver MENU (solo lectura)
- ✅ Ejecutar CHECK-IN (lectura + escritura del estado de ingreso únicamente)
- ❌ Sin acceso a configuración
- ❌ Sin acceso a edición de datos maestros
- ❌ Sin acceso a otros módulos (MUSICADJ, KARAOKEYA, etc.)

**Estado**: ✅ APROBADO

---

## 🎯 PRIORIDADES DE IMPLEMENTACIÓN

### FASE 1: INVITADOS (INMEDIATO)
1. Refactor `Guest` → `Participant`
2. Crear modelo `Guest` (invitados formales)
3. CRUD de invitados desde operador
4. Importación masiva (CSV/Excel)
5. Búsqueda y filtros

### FASE 2: MESAS (SIGUIENTE)
1. Modelo `Table`
2. CRUD de mesas
3. Asignación de invitados a mesas
4. Visualización de distribución

### FASE 3: MENÚ (SIGUIENTE)
1. Modelo `Dish` (catálogo global)
2. Modelo `EventDish` (platos por evento)
3. Modelo `GuestDish` (asignación a invitados)
4. Validación de restricciones alimentarias

### FASE 4: CHECK-IN (SIGUIENTE)
1. App `web-checkin`
2. Búsqueda rápida
3. Marcar ingreso
4. Visualización de mesa y observaciones

### FASE 5: TIMELINE (FUTURO)
1. Modelo `TimelineSlot`
2. Gestión de agenda
3. Comparación planificado vs real
4. Indicadores de atraso
5. (Evaluar relación con invitados)

---

## 🚫 DECISIONES POSPUESTAS

- Relación Timeline ↔ Invitados
- Roles adicionales más allá de RECEPTION
- Notificaciones SMS/WhatsApp para invitados
- Sistema de confirmación de asistencia (RSVP)
- Estadísticas avanzadas de asistencia

---

## 📝 NOTAS TÉCNICAS

### Convenciones a Mantener
- Estructura modular: `controller.ts` + `service.ts` + `routes.ts` + `types.ts`
- Validación con Zod schemas
- Errores custom por módulo
- WebSocket real-time donde aplique
- Permisos granulares por módulo

### Compatibilidad
- Todos los nuevos módulos siguen los mismos patrones de MUSICADJ y KARAOKEYA
- Base de datos: SQLite con Prisma ORM
- Autenticación: JWT Bearer
- Real-time: Socket.io cuando se requiere

---

**Documento actualizado**: 2025-01-14
**Próxima revisión**: Al completar FASE 1

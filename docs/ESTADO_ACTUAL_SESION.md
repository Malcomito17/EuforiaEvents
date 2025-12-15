# Estado Actual de la Sesión - Nuevos Módulos
## Fecha: 2025-01-14
## Hora: Sesión activa

---

## 📍 PUNTO ACTUAL

Estamos en la fase de **DISEÑO TÉCNICO** del módulo de INVITADOS.

**Última decisión importante**: Los invitados son específicos del evento y el email NO es obligatorio ni único.

---

## ✅ DECISIONES TOMADAS EN ESTA SESIÓN

### 1. Clarificación de Entidades

#### PARTICIPANTES (antes llamados Guest)
- Auto-registro voluntario vía email
- Email **OBLIGATORIO** y único cross-evento
- Para usar servicios públicos: MUSICADJ + KARAOKEYA
- DisplayName + WhatsApp opcional
- Reutilizables entre eventos

#### INVITADOS (nuevos - Guest)
- Lista pre-armada por el organizador
- **Específicos del evento** (no cross-evento)
- Email **OPCIONAL** (NO requerido, NO índice único)
- Gestión formal: check-in, mesas, menú
- Datos: nombre completo, teléfono, observaciones
- NO auto-registro, los carga el operador

**Diferencia clave**: PARTICIPANTES son voluntarios con email, INVITADOS son lista formal sin email obligatorio.

---

### 2. Relación Participant ↔ Guest

**Decisión**: Pueden relacionarse opcionalmente

- Si un invitado tiene email Y un participante se registra con el mismo email → enlace automático
- Permite que invitados formales usen servicios públicos (KARAOKEYA/MUSICADJ)
- El operador puede editar/corregir enlace manualmente
- La registración de participante es de baja sensibilidad (errores se corrigen fácilmente)

---

### 3. Identificación de Invitados

**CORRECCIÓN IMPORTANTE** (último mensaje del usuario):

❌ **NO usar email como índice único**
- El email NO SIEMPRE estará indicado
- No puede ser requerido
- No puede ser índice de la tabla

✅ **Usar hash de identificación**
- Generar hash con: `eventId + fullName + phone` (u otros datos)
- Este hash sirve para:
  - Evitar duplicados exactos en el mismo evento
  - Identificación única sin depender del email
  - Búsqueda rápida

**Propuesta de hash**:
```
hash = SHA256(eventId + normalizedFullName + normalizedPhone)
normalizedFullName = fullName.toLowerCase().trim().replace(/\s+/g, ' ')
normalizedPhone = phone?.replace(/\D/g, '') // solo dígitos
```

---

### 4. Restricciones Alimentarias

**Decisión**: Doble nivel

- **Invitado**: Campo `dietaryRestrictions` con restricciones personales
- **Plato**: Campo `dietaryInfo` con información del plato
- **Regla**: Un invitado con marca "VEGANO" solo puede tener platos con marca "VEGANO"
- El sistema puede sugerir/filtrar platos compatibles

---

### 5. Arquitectura de Check-in

**Decisión**: Nueva aplicación dedicada

- Crear `apps/web-checkin/`
- Interfaz 100% minimalista para recepción
- Optimizada para uso bajo presión
- Gestionada desde web-operator (configuración, accesos)
- Login con rol RECEPTION

---

### 6. Nuevo Rol RECEPTION

**Decisión**: Agregar rol al sistema

**Permisos**:
- ✅ Ver INVITADOS (solo lectura)
- ✅ Ver MESAS (solo lectura)
- ✅ Ver MENU (solo lectura)
- ✅ Ejecutar CHECK-IN (lectura + escritura del estado de ingreso)
- ❌ Sin acceso a configuración
- ❌ Sin acceso a edición de datos maestros

**Nota**: Próximamente se definirán otros roles específicos

---

### 7. Timeline

**Decisión**: Posponer relación con Invitados

- Crear el módulo Timeline básico
- Evaluar más adelante si necesita relación directa con invitados
- No es crítico para MVP

---

## 🎯 PRIORIDAD INMEDIATA

### FASE 1: Módulo INVITADOS

**Orden de implementación**:
1. ✅ Refactor `Guest` → `Participant` (renombrado semántico)
2. ✅ Crear modelo `Guest` (invitados formales con hash)
3. Backend completo (CRUD + importación + auto-enlace)
4. Frontend web-operator (gestión de invitados)

---

## 📊 MODELO ACTUALIZADO - Guest (Invitados)

### Características Clave

```
model Guest {
  // Identificación
  id: cuid (PK)
  eventId: String (FK a Event) - ESPECÍFICO DEL EVENTO
  identityHash: String (hash único por evento)

  // Datos personales
  fullName: String (OBLIGATORIO)
  email: String (OPCIONAL - puede ser null)
  phone: String (OPCIONAL)
  company: String (OPCIONAL)

  // Check-in
  checkedIn: Boolean (default: false)
  checkedInAt: DateTime (nullable)
  checkedInBy: String (userId - nullable)

  // Asignaciones
  tableId: String (FK a Table - nullable)

  // Restricciones
  dietaryRestrictions: String (JSON - nullable)
  notes: String (observaciones - nullable)

  // Metadata
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: String (userId - nullable)

  // Relación opcional con Participant
  participantId: String (FK a Participant - nullable, unique)

  // Índices
  @@unique([eventId, identityHash])  // Evitar duplicados
  @@index([eventId, fullName])       // Búsqueda rápida
  @@index([eventId, checkedIn])      // Filtro check-in
  @@index([email])                   // Búsqueda por email (cuando existe)
}
```

### Generación del Hash

**Lógica**:
1. Normalizar fullName: lowercase, trim, espacios únicos
2. Normalizar phone: solo dígitos
3. Combinar: `eventId + fullName + phone`
4. Hash: SHA256 o similar
5. Almacenar en `identityHash`

**Propósito**:
- Identificación única sin depender de email
- Evitar duplicados exactos en el mismo evento
- Búsqueda rápida

---

## 📝 ARCHIVOS CREADOS EN ESTA SESIÓN

1. **`docs/DECISIONES_NUEVOS_MODULOS.md`**
   - Todas las decisiones de diseño
   - Razones y contexto
   - Estado de cada decisión

2. **`docs/PLAN_IMPLEMENTACION_INVITADOS.md`**
   - Plan técnico detallado
   - Estructura de archivos
   - Endpoints REST
   - Estimación de tiempos
   - Checklist completo

3. **`docs/TODO_NUEVOS_MODULOS.md`**
   - TODO completo de todas las fases
   - Tareas pendientes
   - Tareas pospuestas
   - Backlog de ideas

4. **`docs/ESTADO_ACTUAL_SESION.md`** (este archivo)
   - Estado actual de la sesión
   - Decisiones tomadas
   - Próximos pasos

---

## 🔄 CORRECCIONES PENDIENTES

### Actualizar PLAN_IMPLEMENTACION_INVITADOS.md

**Cambios a realizar**:
1. ✅ Modelo Guest: Email opcional (no único, no requerido)
2. ✅ Agregar campo `identityHash`
3. ✅ Cambiar índice único de `email` a `[eventId, identityHash]`
4. ✅ Agregar lógica de generación de hash en service
5. ✅ Actualizar validaciones Zod (email opcional)
6. ✅ Actualizar lógica de auto-enlace (solo si email existe)

---

## 🚀 PRÓXIMOS PASOS

### Inmediato (esta sesión o la siguiente)

1. **Actualizar documentación** con corrección del modelo (email opcional + hash)
2. **Comenzar implementación** - PASO 1: Refactor Guest → Participant
   - Actualizar schema.prisma
   - Migración de BD
   - Renombrar archivos y módulos
   - Actualizar referencias
   - Testing

### Siguientes pasos

3. **PASO 2**: Crear modelo Guest con hash
4. **PASO 3**: Backend - service + controller + routes
5. **PASO 4**: Frontend - web-operator
6. **PASO 5**: Integración y testing

---

## 📌 NOTAS IMPORTANTES

### Para retomar la sesión

1. **Leer primero**: `docs/ESTADO_ACTUAL_SESION.md` (este archivo)
2. **Consultar**: `docs/DECISIONES_NUEVOS_MODULOS.md` para decisiones
3. **Seguir**: `docs/PLAN_IMPLEMENTACION_INVITADOS.md` para implementación
4. **Trackear**: `docs/TODO_NUEVOS_MODULOS.md` para tareas pendientes

### Comando para continuar desarrollo

```bash
# Ver documentación actualizada
cd /Users/malcomito/Projects/euforia-events
cat docs/ESTADO_ACTUAL_SESION.md
cat docs/PLAN_IMPLEMENTACION_INVITADOS.md

# Comenzar con refactor
git checkout -b feature/guests-module
```

---

## 🎯 OBJETIVO DE LA PRÓXIMA SESIÓN

**Completar PASO 1**: Refactor completo de `Guest` → `Participant`

**Resultado esperado**:
- Modelo renombrado en BD
- Módulo backend renombrado
- Frontend actualizado
- Tests pasando
- Commit y push exitoso

**Tiempo estimado**: 2-3 horas

---

## 📊 PROGRESO ACTUAL

### Diseño Técnico
- Módulo INVITADOS: ✅ 95% (falta actualizar corrección de hash)
- Módulo MESAS: ⏳ 0%
- Módulo MENÚ: ⏳ 0%
- App CHECK-IN: ⏳ 0%
- Módulo TIMELINE: ⏳ 0%

### Implementación
- Módulo INVITADOS: ⏳ 0%
- Todo lo demás: ⏳ 0%

---

## 📚 DOCUMENTACIÓN CREADA

1. **`DECISIONES_NUEVOS_MODULOS.md`** - Todas las decisiones de diseño
2. **`TODO_NUEVOS_MODULOS.md`** - TODO completo de todas las fases
3. **`MODELO_FINAL_INVITADOS_MENU.md`** - ⭐⭐⭐ MODELO DEFINITIVO Invitados + Menú
4. **`MODELO_MESAS_SALON.md`** - ⭐⭐⭐ MODELO DEFINITIVO Mesas + Salón
5. **`MODELO_CHECKIN_APP.md`** - ⭐⭐⭐ MODELO DEFINITIVO Check-in App
6. **`RESUMEN_MODELOS_FINALES.md`** - ⭐⭐⭐ RESUMEN COMPLETO de todos los modelos
7. **`ESTADO_ACTUAL_SESION.md`** - Este archivo (resumen de sesión)

**Deprecados** (versiones intermedias):
- `PLAN_IMPLEMENTACION_INVITADOS.md`
- `MODELO_INVITADOS_CORREGIDO.md`
- `INICIO_IMPLEMENTACION.md`

---

## 🎯 RESUMEN FINAL - DISEÑO 100% COMPLETO

### ✅ MÓDULOS DISEÑADOS (4 de 4)

1. **INVITADOS** - Person + EventGuest
   - Catálogo global reutilizable
   - Guestlist por evento
   - Restricciones alimentarias
   - Enlace automático con Participant

2. **MENÚ** - Dish + DishCategory + EventDish + GuestDish
   - Catálogo global de platos
   - Categorías configurables por evento
   - Asignación automática con validación de restricciones
   - Dashboard de alertas

3. **MESAS** - Mesa + Salón
   - Distribución espacial (canvas drag & drop)
   - Asignación de invitados
   - Auto-asignación inteligente
   - Dashboard de ocupación

4. **CHECK-IN** - App dedicada + Rol RECEPTION
   - Interfaz minimalista para recepción
   - Búsqueda rápida en tiempo real
   - Check-out configurable por evento
   - WebSocket para múltiples recepcionistas

### 📊 MODELOS PRISMA (8 nuevos)
1. Person
2. EventGuest
3. Dish
4. DishCategory
5. EventDish
6. GuestDish
7. Mesa
8. Event (actualizado con 3 configuraciones)

### ⚙️ CONFIGURACIONES DEL EVENTO
```typescript
Event {
  tieneMesasAsignadas: boolean  // Default: true
  tieneMenuIndividual: boolean  // Default: true
  requiereCheckout: boolean     // Default: false ⭐ NUEVO
}
```

### 🔐 NUEVO ROL
- **RECEPTION**: Permisos limitados (solo check-in/out, sin edición)

---

## 🚀 PRÓXIMOS PASOS

### Para Continuar la Implementación

1. **Leer documentación**:
   - `docs/MODELO_INVITADOS_CORREGIDO.md` (modelo final)
   - `docs/INICIO_IMPLEMENTACION.md` (guía paso a paso)

2. **Comenzar implementación** (estimado: 20 horas total):
   - Backend: modelos + endpoints (7 horas)
   - Frontend: interfaz en web-operator (10 horas)
   - Testing e integración (3 horas)

3. **Comando inicial**:
   ```bash
   cd /Users/malcomito/Projects/euforia-events
   git checkout -b feature/guestlist-module
   # Actualizar apps/api/prisma/schema.prisma
   ```

---

**Última actualización**: 2025-01-14 (Sesión activa)
**Responsable**: Claude Sonnet 4.5
**Usuario**: malcomito
**Estado**: ✅ Diseño completado, listo para implementación

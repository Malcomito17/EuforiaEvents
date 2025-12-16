# Funcionalidades Pendientes - EUFORIA EVENTS

## Actualizado: 2025-12-16

---

## 1. CRUD DE PLATOS - Acceso desde Menú General

### Estado Actual
- El CRUD de platos existe en `/dishes` (DishList.tsx, DishForm.tsx)
- La ruta está configurada en App.tsx
- El enlace "Platos" está habilitado en el menú lateral (Layout.tsx)
- **PERO**: No hay acceso directo desde la pestaña "General" del menú del evento

### Problema
Cuando el operador está en la vista de Menú de un evento (`/events/:id/menu`), no puede:
- Crear nuevos platos sin salir de la vista
- Acceder rápidamente al catálogo de platos

### Solución Propuesta
1. Agregar botón "Gestionar Catálogo de Platos" en la pestaña General del menú
2. O agregar modal inline para crear platos rápidamente
3. O agregar link directo al catálogo desde el selector de platos

### Archivos a Modificar
- `apps/web-operator/src/pages/Events/EventMenu.tsx`
- Posiblemente crear componente `QuickDishForm.tsx`

---

## 2. FUNCIONALIDADES PENDIENTES EN FRONTEND

### 2.1 EventInvitados.tsx
- [x] Tabla con ordenamiento por columnas
- [x] Filtro "Sin mesa"
- [x] Asignación rápida de mesa inline
- [x] Columna de platos asignados
- [ ] Exportación a CSV/Excel
- [ ] Filtros avanzados (por estado, por restricción alimentaria)

### 2.2 EventMenu.tsx
- [x] Vista de categorías con platos
- [x] Agregar platos del catálogo al menú
- [x] Marcar platos como default
- [ ] **Acceso al CRUD de platos desde la vista**
- [ ] Reordenamiento drag & drop de platos
- [ ] Vista de alertas de restricciones alimentarias

### 2.3 EventMesas.tsx
- [x] Lista de mesas con capacidad/ocupación
- [x] Asignación de invitados desde vista de mesa
- [x] Modal para agregar invitados sin mesa
- [ ] Canvas visual para distribución espacial
- [ ] Drag & drop de mesas
- [ ] Auto-asignación inteligente con UI

### 2.4 GuestForm.tsx
- [x] Selector de persona
- [x] Asignación de mesa
- [x] Necesidades de accesibilidad
- [x] Sección "Menú Asignado" al editar
- [ ] Vista de restricciones alimentarias de la persona

### 2.5 Dishes (Catálogo)
- [x] Lista con filtro por categoría
- [x] Búsqueda por nombre
- [x] Formulario crear/editar
- [ ] Información nutricional
- [ ] Imágenes de platos

---

## 3. INTEGRACIONES PENDIENTES

### 3.1 App Check-in Dedicada
- **Estado**: No implementada
- **Propósito**: Interfaz minimalista para recepción
- **Ubicación planificada**: `apps/web-checkin/`
- **Características**:
  - Búsqueda rápida de invitados
  - Check-in con un click
  - Vista de mesa asignada
  - Impresión de etiqueta (opcional)

### 3.2 WebSocket para Tiempo Real
- **Estado**: No implementado
- **Uso**: Sincronización entre múltiples operadores
- **Eventos**:
  - Nuevo check-in
  - Cambio de mesa
  - Actualización de menú

### 3.3 Rol RECEPTION
- **Estado**: Definido en schema, no implementado en auth
- **Permisos**:
  - Solo lectura de invitados, mesas, menú
  - Escritura solo para check-in/check-out

---

## 4. MEJORAS DE UX PENDIENTES

### 4.1 Dashboard de Evento
- [ ] Widget de estadísticas en tiempo real
- [ ] Gráfico de check-ins por hora
- [ ] Alertas destacadas

### 4.2 Navegación
- [ ] Breadcrumbs en todas las vistas
- [ ] Accesos rápidos entre módulos relacionados
- [ ] Indicadores de items pendientes

### 4.3 Formularios
- [ ] Validación en tiempo real más visible
- [ ] Autocompletado mejorado
- [ ] Atajos de teclado

---

## 5. PRIORIDADES SUGERIDAS

### Alta Prioridad
1. Acceso al CRUD de platos desde EventMenu
2. Canvas visual para mesas
3. Exportación de listas

### Media Prioridad
1. App Check-in dedicada
2. Filtros avanzados en invitados
3. Dashboard de alertas de menú

### Baja Prioridad
1. WebSocket tiempo real
2. Rol RECEPTION
3. Información nutricional de platos

---

## 6. NOTAS TÉCNICAS

### Para agregar acceso a platos desde EventMenu

```tsx
// En EventMenu.tsx, agregar en la pestaña General:

// Opción 1: Link al catálogo
<Link
  to="/dishes"
  className="text-primary-600 hover:underline"
>
  Gestionar catálogo de platos →
</Link>

// Opción 2: Botón que abre en nueva pestaña
<button
  onClick={() => window.open('/dishes', '_blank')}
  className="btn-secondary"
>
  Abrir catálogo de platos
</button>

// Opción 3: Modal con formulario rápido
const [showQuickDishForm, setShowQuickDishForm] = useState(false)
// ... render modal con DishForm embebido
```

### Estado de las rutas de Dishes

```tsx
// App.tsx - YA CONFIGURADO
<Route path="/dishes" element={<ProtectedRoute><DishList /></ProtectedRoute>} />
<Route path="/dishes/new" element={<ProtectedRoute><DishForm /></ProtectedRoute>} />
<Route path="/dishes/:id/edit" element={<ProtectedRoute><DishForm /></ProtectedRoute>} />

// Layout.tsx - YA HABILITADO
{ name: 'Platos', path: '/dishes', icon: UtensilsCrossed }
// comingSoon: false (removido)
```

---

**Última actualización**: 2025-12-16
**Próxima revisión sugerida**: Después de implementar acceso a platos desde menú

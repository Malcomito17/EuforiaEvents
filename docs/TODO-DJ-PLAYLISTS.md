# 📋 TODO: ROL DJ + IMPORTACIÓN DE PLAYLISTS

**Fecha de creación**: 2025-12-13
**Versión**: 1.0
**Total de tareas**: 31

---

## 🎯 PARTE 1: ROL DJ (Operador Simplificado)

### 🗄️ BACKEND - Base de Datos (2 tareas)

- [ ] **1.1** - Agregar rol 'DJ' al sistema
  - **Archivo**: `apps/api/prisma/schema.prisma:19`
  - **Cambio**: `role String @default("OPERATOR")  // ADMIN | OPERATOR | VIEWER | DJ`
  - **Estimación**: 5 min

- [ ] **1.2** - Ejecutar migración de Prisma
  - **Comando**: `cd apps/api && npx prisma migrate dev --name add_dj_role`
  - **Estimación**: 5 min

---

### ⚙️ BACKEND - Auth & Middleware (3 tareas)

- [ ] **2.1** - Actualizar tipos de roles en auth
  - **Archivo**: `apps/api/src/modules/auth/auth.types.ts`
  - **Agregar**: `export const USER_ROLES = { ADMIN: 'ADMIN', OPERATOR: 'OPERATOR', VIEWER: 'VIEWER', DJ: 'DJ' } as const`
  - **Estimación**: 10 min

- [ ] **2.2** - Crear middleware específico para rol DJ
  - **Archivo**: `apps/api/src/modules/auth/auth.middleware.ts`
  - **Función**: `requireDJOrHigher()` - Permitir acceso si role = DJ, OPERATOR o ADMIN
  - **Estimación**: 20 min

- [ ] **2.3** - Actualizar validación en createUser/updateUser
  - **Archivo**: `apps/api/src/modules/users/users.service.ts`
  - **Validar**: role debe ser uno de: ADMIN | OPERATOR | VIEWER | DJ
  - **Estimación**: 15 min

---

### 🛣️ BACKEND - Rutas específicas para DJ (5 tareas)

- [ ] **3.1** - Crear módulo DJ
  - **Archivos nuevos**:
    - `apps/api/src/modules/dj/dj.routes.ts`
    - `apps/api/src/modules/dj/dj.controller.ts`
    - `apps/api/src/modules/dj/dj.service.ts`
  - **Endpoint**: `GET /api/dj/events` - Lista simplificada de eventos ACTIVE
  - **Campos**: `id, name, slug, startDate, venue.name`
  - **Estimación**: 45 min

- [ ] **3.2** - Endpoint GET /api/dj/events/:id
  - **Respuesta**: Detalles del evento + configs de MUSICADJ/KARAOKEYA
  - **Incluir**: Permisos del DJ para cada módulo
  - **Estimación**: 30 min

- [ ] **3.3** - Endpoint GET /api/dj/events/:id/musicadj
  - **Respuesta**: Lista de pedidos con datos esenciales
  - **Campos**: `id, title, artist, status, priority, guest.displayName, createdAt`
  - **Orden**: `priority DESC, createdAt ASC`
  - **Estimación**: 30 min

- [ ] **3.4** - Endpoint GET /api/dj/events/:id/karaokeya
  - **Respuesta**: Cola de karaoke con datos esenciales
  - **Campos**: `id, title, artist, status, turnNumber, queuePosition, guest.displayName, createdAt`
  - **Orden**: `queuePosition ASC`
  - **Estimación**: 30 min

- [ ] **3.5** - Endpoint GET /api/dj/guests/:guestId/history
  - **Respuesta**: Historial completo de pedidos del guest (MUSICADJ + KARAOKEYA)
  - **Orden**: `createdAt DESC`
  - **Límite**: Últimos 50 pedidos
  - **Estimación**: 40 min

---

### 🎨 FRONTEND OPERATOR - Layout & Navegación (3 tareas)

- [ ] **4.1** - Crear componente DJLayout
  - **Archivo**: `apps/web-operator/src/components/DJLayout.tsx`
  - **Características**:
    - Header simple con logo + nombre evento + logout
    - Sin sidebar/menú lateral
    - Footer con info básica
    - Responsive: optimizado para tablet/mobile (vertical)
  - **Estimación**: 1.5 hr

- [ ] **4.2** - Actualizar ProtectedRoute para detectar rol DJ
  - **Archivo**: `apps/web-operator/src/components/ProtectedRoute.tsx`
  - **Lógica**: Si `user.role === 'DJ'` → Redirect a `/dj/events`
  - **Estimación**: 20 min

- [ ] **4.3** - Crear rutas específicas para DJ
  - **Archivo**: `apps/web-operator/src/App.tsx`
  - **Rutas**:
    - `/dj/events` → Lista de eventos
    - `/dj/events/:id` → Detalles + módulos habilitados
    - `/dj/events/:id/musicadj` → Vista MUSICADJ
    - `/dj/events/:id/karaokeya` → Vista KARAOKEYA
  - **Estimación**: 30 min

---

### 📱 FRONTEND OPERATOR - Vista DJ MusicaDJ (3 tareas)

- [ ] **5.1** - Crear DJMusicaDJView
  - **Archivo**: `apps/web-operator/src/pages/DJ/DJMusicaDJ.tsx`
  - **Layout**:
    - Lista vertical simple (no tabla)
    - Cards con datos esenciales: Título + Artista, Estado (badge), Prioridad (indicador visual), Nombre del guest (con botón historial), Tiempo transcurrido (ej: "hace 5 min")
  - **Acciones por card**:
    - Drag handle para reordenar
    - Botón cambiar estado (PENDING → HIGHLIGHTED → URGENT → PLAYED)
    - Botón ver historial del guest
  - **Estimación**: 2.5 hr

- [ ] **5.2** - Crear componente DJRequestCard
  - **Archivo**: `apps/web-operator/src/components/DJ/DJRequestCard.tsx`
  - **Props**: `request, onStatusChange, onReorder, onViewHistory`
  - **Diseño**: Card compacto con gestos touch-friendly (botones grandes, espaciado generoso)
  - **Estimación**: 1 hr

- [ ] **5.3** - Implementar Drag & Drop con touch support
  - **Librería**: `@dnd-kit/core` (ya soporta touch)
  - **Comando**: `cd apps/web-operator && pnpm add @dnd-kit/core @dnd-kit/sortable`
  - **Funcionalidad**: Reordenar pedidos arrastrando cards
  - **Estimación**: 1.5 hr

---

### 🎤 FRONTEND OPERATOR - Vista DJ KaraokeYa (2 tareas)

- [ ] **6.1** - Crear DJKaraokeYaView
  - **Archivo**: `apps/web-operator/src/pages/DJ/DJKaraokeYa.tsx`
  - **Similar a MusicaDJ pero con**:
    - Número de turno visible
    - Estado de cola (QUEUED → CALLED → ON_STAGE → COMPLETED)
    - Botón "Llamar siguiente"
  - **Estimación**: 2 hr

- [ ] **6.2** - Crear componente DJKaraokeCard
  - **Archivo**: `apps/web-operator/src/components/DJ/DJKaraokeCard.tsx`
  - **Datos adicionales**: `turnNumber, queuePosition`
  - **Estimación**: 45 min

---

### 👤 FRONTEND OPERATOR - Historial de Participante (1 tarea)

- [ ] **7.1** - Crear modal GuestHistoryModal
  - **Archivo**: `apps/web-operator/src/components/DJ/GuestHistoryModal.tsx`
  - **Contenido**:
    - Nombre del guest
    - Email / WhatsApp
    - Timeline de pedidos (MUSICADJ + KARAOKEYA mezclados)
    - Agrupados por fecha
    - Indicador de módulo (badge: MusicaDJ | KaraokeYa)
    - Estado de cada pedido
  - **Estimación**: 1.5 hr

---

## 🎵 PARTE 2: IMPORTACIÓN DE PLAYLISTS DE SPOTIFY

### 🗄️ BACKEND - Base de Datos (3 tareas)

- [ ] **8.1** - Agregar campos en SongRequest para playlist
  - **Archivo**: `apps/api/prisma/schema.prisma`
  - **Modelo**: `SongRequest`
  - **Nuevos campos**:
    ```prisma
    playlistId String? // ID de la playlist de origen
    fromClientPlaylist Boolean @default(false) // Marca visual
    ```
  - **Estimación**: 10 min

- [ ] **8.2** - Crear modelo ClientPlaylist
  - **Archivo**: `apps/api/prisma/schema.prisma`
  - **Nuevo modelo completo**:
    ```prisma
    model ClientPlaylist {
      id String @id @default(cuid())
      eventId String
      spotifyPlaylistId String @unique
      name String
      description String?
      trackCount Int
      importedAt DateTime @default(now())
      importedBy String // userId

      event Event @relation(fields: [eventId], references: [id])

      @@map("client_playlists")
    }
    ```
  - **Estimación**: 15 min

- [ ] **8.3** - Ejecutar migración
  - **Comando**: `cd apps/api && npx prisma migrate dev --name add_spotify_playlist_import`
  - **Estimación**: 5 min

---

### 🎵 BACKEND - Servicio de Spotify (2 tareas)

- [ ] **9.1** - Crear función getPlaylistTracks(playlistId)
  - **Archivo**: `apps/api/src/shared/services/spotify.service.ts`
  - **Lógica**:
    1. Autenticar con Spotify API (Client Credentials Flow)
    2. `GET https://api.spotify.com/v1/playlists/{playlistId}/tracks`
    3. Parsear respuesta
    4. Retornar: `[{ spotifyId, title, artist, albumArtUrl }]`
  - **Manejo de errores**: Playlist privada, no encontrada, API error
  - **Estimación**: 1 hr

- [ ] **9.2** - Crear función importPlaylistToEvent()
  - **Archivo**: `apps/api/src/modules/musicadj/musicadj.service.ts`
  - **Parámetros**: `(eventId, spotifyPlaylistId, userId)`
  - **Lógica**:
    1. Validar que evento exista y esté ACTIVE
    2. Obtener tracks con `getPlaylistTracks()`
    3. Crear `ClientPlaylist` en DB
    4. Crear `SongRequest` por cada track con:
       - `status: 'PENDING'`
       - `priority: 0`
       - `playlistId: clientPlaylist.id`
       - `fromClientPlaylist: true`
       - `guestId`: Sistema (crear guest "Playlist del Cliente" si no existe)
    5. Retornar: `{ playlistId, imported: count }`
  - **Estimación**: 1.5 hr

---

### 🛣️ BACKEND - Endpoints de Importación (2 tareas)

- [ ] **10.1** - POST /api/events/:eventId/musicadj/import-playlist
  - **Archivo**: `apps/api/src/modules/musicadj/musicadj.controller.ts`
  - **Body**: `{ spotifyPlaylistUrl: string }`
  - **Lógica**:
    - Extraer `playlistId` de la URL (soportar formatos: `https://open.spotify.com/playlist/{id}`, `spotify:playlist:{id}`)
    - Validar formato
    - Llamar `importPlaylistToEvent()`
    - Retornar resultado
  - **Auth**: `requireModuleAccess('MUSICADJ')`
  - **Estimación**: 45 min

- [ ] **10.2** - GET /api/events/:eventId/musicadj/playlists
  - **Respuesta**: Lista de playlists importadas para el evento
  - **Incluir**: `nombre, trackCount, importedAt, importedBy.username`
  - **Orden**: `importedAt DESC`
  - **Estimación**: 30 min

---

### 🎨 FRONTEND OPERATOR - UI de Importación (3 tareas)

- [ ] **11.1** - Crear componente ImportPlaylistModal
  - **Archivo**: `apps/web-operator/src/components/MusicaDJ/ImportPlaylistModal.tsx`
  - **Contenido**:
    - Input para URL de Spotify playlist
    - Botón "Previsualizar" (opcional - mostrar nombre/descripción/trackCount)
    - Preview: nombre, descripción, cantidad de tracks
    - Botón "Importar"
    - Loading states (spinner durante importación)
    - Manejo de errores (URL inválida, API error, playlist privada)
  - **Estimación**: 1.5 hr

- [ ] **11.2** - Agregar botón "Importar Playlist" en MusicaDJ
  - **Archivo**: `apps/web-operator/src/pages/EventDetail.tsx`
  - **Ubicación**: Header de la sección MusicaDJ (junto a filtros/acciones)
  - **Icono**: Upload + Spotify logo (verde)
  - **Estimación**: 20 min

- [ ] **11.3** - Agregar badge visual en lista de pedidos
  - **Archivo**: `apps/web-operator/src/components/MusicaDJ/RequestCard.tsx`
  - **Condición**: Si `fromClientPlaylist === true`
  - **Badge**: `🎵 Playlist del Cliente` (color distintivo - verde Spotify)
  - **Tooltip**: Mostrar nombre de la playlist de origen
  - **Estimación**: 30 min

---

### 🎨 FRONTEND OPERATOR - Gestión de Playlists (1 tarea)

- [ ] **12.1** - Crear sección "Playlists Importadas"
  - **Archivo**: `apps/web-operator/src/pages/EventDetail.tsx`
  - **Ubicación**: Dentro de MusicaDJ tab (sección colapsable)
  - **Contenido**:
    - Lista de playlists importadas (table o cards)
    - Información: Nombre, Tracks importados, Fecha, Usuario que importó
    - Botón para reimportar/actualizar (opcional)
    - Contador de tracks reproducidos vs pendientes
    - Opción para eliminar playlist (soft delete - marcar pedidos)
  - **Estimación**: 1 hr

---

## 📱 EXTRAS - Optimizaciones Mobile para DJ (3 tareas)

- [ ] **13.1** - Implementar gestos touch
  - **Funcionalidad**:
    - Swipe right: Cambiar estado al siguiente
    - Swipe left: Ver historial del participante
    - Long press: Mostrar menú de opciones
  - **Librería**: `react-swipeable` o gestos nativos
  - **Estimación**: 1.5 hr

- [ ] **13.2** - PWA optimizations
  - **Archivos**:
    - `apps/web-operator/public/manifest.json` con `display: standalone`
    - Service worker para cache de assets
    - Iconos para iOS/Android (diferentes tamaños)
  - **Features**:
    - Add to home screen
    - Splash screen
    - Offline fallback
  - **Estimación**: 2 hr

- [ ] **13.3** - Feedback háptico
  - **Funcionalidad**:
    - Vibración al cambiar estado
    - Vibración al reordenar (drag & drop)
    - Vibración al completar acción
  - **API**: `navigator.vibrate()` (soportado en mobile)
  - **Estimación**: 30 min

---

## 📊 RESUMEN DE ESTIMACIONES

| Categoría | Tareas | Tiempo Estimado |
|-----------|--------|-----------------|
| Backend DB | 5 | 50 min |
| Backend Auth/Middleware | 3 | 45 min |
| Backend Rutas DJ | 5 | 3 hr |
| Backend Spotify | 4 | 3.5 hr |
| Frontend Layout DJ | 3 | 2.3 hr |
| Frontend Vista DJ MusicaDJ | 3 | 5 hr |
| Frontend Vista DJ KaraokeYa | 2 | 2.75 hr |
| Frontend Historial | 1 | 1.5 hr |
| Frontend Importación UI | 3 | 2.3 hr |
| Frontend Gestión Playlists | 1 | 1 hr |
| Extras Mobile | 3 | 4 hr |
| **TOTAL** | **31** | **~26 horas** |

---

## 🎯 ORDEN RECOMENDADO DE IMPLEMENTACIÓN

### FASE 1: ROL DJ - Backend (Prioridad Alta)
1. ✅ Tareas 1.1 - 1.2 (DB: rol DJ)
2. ✅ Tareas 2.1 - 2.3 (Auth & Middleware)
3. ✅ Tareas 3.1 - 3.5 (Endpoints DJ)

**Estimación Fase 1**: ~4.5 horas

---

### FASE 2: ROL DJ - Frontend (Prioridad Alta)
4. ✅ Tareas 4.1 - 4.3 (Layout & Rutas)
5. ✅ Tareas 5.1 - 5.3 (Vista MusicaDJ)
6. ✅ Tareas 6.1 - 6.2 (Vista KaraokeYa)
7. ✅ Tarea 7.1 (Historial)

**Estimación Fase 2**: ~11.5 horas

---

### FASE 3: IMPORTACIÓN DE PLAYLISTS - Backend (Prioridad Media)
8. ✅ Tareas 8.1 - 8.3 (DB: playlists)
9. ✅ Tareas 9.1 - 9.2 (Servicio Spotify)
10. ✅ Tareas 10.1 - 10.2 (Endpoints)

**Estimación Fase 3**: ~4 horas

---

### FASE 4: IMPORTACIÓN DE PLAYLISTS - Frontend (Prioridad Media)
11. ✅ Tareas 11.1 - 11.3 (UI Importación)
12. ✅ Tarea 12.1 (Gestión Playlists)

**Estimación Fase 4**: ~3.3 horas

---

### FASE 5: OPTIMIZACIONES MOBILE (Prioridad Baja - Opcional)
13. ✅ Tareas 13.1 - 13.3 (Gestos, PWA, Háptico)

**Estimación Fase 5**: ~4 horas

---

## 📝 NOTAS IMPORTANTES

### Consideraciones Técnicas

1. **Rol DJ**:
   - Los DJs solo pueden ver eventos, no crear/editar/eliminar
   - Solo pueden cambiar estado de pedidos, no eliminarlos
   - Acceso restringido según permisos de módulo (UserPermission)

2. **Importación de Playlists**:
   - Requiere Spotify Client Credentials (ya configurado: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`)
   - Solo playlists públicas (las privadas requieren OAuth de usuario)
   - Límite de Spotify API: 100 tracks por request (paginar si es necesario)
   - Crear guest "Sistema - Playlist" para asociar pedidos importados

3. **Mobile Optimizations**:
   - Priorizar gestos touch sobre clicks
   - Botones grandes (mínimo 44x44px)
   - Evitar hover effects (no existen en mobile)
   - Feedback visual inmediato en todas las acciones

### Testing

**Backend**:
- [ ] Probar endpoints con Postman/Thunder Client
- [ ] Validar permisos de DJ
- [ ] Verificar importación con playlist de prueba

**Frontend**:
- [ ] Probar en tablet (iPad, Android)
- [ ] Probar en móvil (iPhone, Android)
- [ ] Verificar drag & drop en touch
- [ ] Validar PWA en diferentes navegadores

---

**Última actualización**: 2025-12-13
**Estado**: 🟡 En Desarrollo
**Progreso**: 0/31 tareas completadas (0%)

# Changelog - EUFORIA EVENTS

## [2025-01-06] - Campos de Redes Sociales y Fix Spotify

### Agregado
- **Campos de redes sociales en formulario de eventos** (Commit 53b1802)
  - Facebook: Campo de texto para URL de página de Facebook
  - Twitter/X: Campo de texto para handle o URL de Twitter
  - Sitio Web: Campo de texto para URL del sitio web del evento
  - Imagen del Evento: Campo de texto para URL de imagen del evento
  - Ubicación: `apps/web-operator/src/pages/Events/EventForm.tsx`
  - Los campos ya existían en el schema de Prisma, ahora son accesibles desde la UI

### Corregido
- **Fix crítico en carga de credenciales de Spotify** (Commit 74a8ffd)
  - Problema: El archivo `.env` no se cargaba correctamente cuando el servidor se iniciaba desde diferentes directorios
  - Causa: Uso de `process.cwd()` que depende del directorio de ejecución
  - Solución: Cambio a `__dirname` para path absoluto independiente del directorio de ejecución
  - Impacto: Resuelve error "Token no proporcionado" al importar playlists de Spotify
  - Archivo modificado: `apps/api/src/server.ts`

### Técnico
- Uso de `fileURLToPath` e `import.meta.url` para resolver `__dirname` en módulos ES
- Path del .env ahora: `resolve(__dirname, '../.env')` desde `apps/api/src/server.ts`

---

## [2025-01-05] - MUSICADJ Playlist Import Frontend

### Agregado
- **Frontend completo de importación de playlists de Spotify**
  - Modal `ImportPlaylistModal` con validación de URL de Spotify
  - Botón "Importar Playlist" en página MUSICADJ
  - Badge verde "Playlist" para identificar pedidos originados de playlist
  - Sección de gestión de playlists importadas con:
    - Lista de playlists con contador de canciones
    - Función de eliminación de playlists
    - UI colapsable para mejor organización
  - Carga paralela de datos (requests, config, playlists) usando Promise.all

### Archivos Modificados
- `apps/web-operator/src/components/ImportPlaylistModal.tsx` (NUEVO)
- `apps/web-operator/src/pages/MusicaDJ/MusicaDJPage.tsx`
- `apps/web-operator/src/lib/api.ts`

---

## [2025-01-04] - MUSICADJ Playlist Import Backend

### Agregado
- **Backend completo de importación de playlists de Spotify**
  - Integración con Spotify API para obtener tracks de playlists
  - Sistema de caché de playlists importadas
  - Opciones configurables:
    - Importar solo para referencia
    - Crear pedidos automáticamente de todas las canciones
  - Marcador `fromClientPlaylist` para identificar origen
  - Endpoints nuevos:
    - `POST /api/events/:eventId/musicadj/import-playlist`
    - `GET /api/events/:eventId/musicadj/playlists`
    - `DELETE /api/events/:eventId/musicadj/playlists/:playlistId`

### Base de Datos
- Modelo `ClientPlaylist` agregado:
  - Campos: id, eventId, spotifyPlaylistId, name, description, trackCount, importedAt, importedBy
  - Relación con SongRequest
- Campo `playlistId` agregado a `SongRequest`
- Campo `fromClientPlaylist` (Boolean) agregado a `SongRequest`

### Archivos Modificados
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/musicadj/musicadj.service.ts`
- `apps/api/src/modules/musicadj/musicadj.controller.ts`
- `apps/api/src/modules/musicadj/musicadj.routes.ts`
- `apps/api/src/modules/musicadj/spotify.service.ts`

---

## Pendiente de Desarrollo

### KARAOKEYA - CRUD de Canciones con Sistema de "Me Gusta"
**Estado**: Plan completo documentado en `/Users/malcomito/.claude/plans/sunny-hatching-lamport.md`

**Fases a implementar**:
1. ✅ Migración de Base de Datos (COMPLETADO)
2. ⏳ Backend - Schemas y Tipos
3. ⏳ Backend - Service Functions
4. ⏳ Backend - Controllers y Routes
5. ⏳ Frontend Operator - API Client
6. ⏳ Frontend Operator - Páginas CRUD
7. ⏳ Frontend Client - Componentes Reusables
8. ⏳ Frontend Client - Actualizar Sugerencias

**Nuevos campos en KaraokeSong**:
- `opinion` (String, opcional): Opinión editorial del operador
- `ranking` (Int 1-5): Calificación de calidad
- `difficulty` (Enum): FACIL/MEDIO/DIFICIL/PAVAROTTI
- `likesCount` (Int): Contador global de "me gusta"

**Sistema de "Me Gusta"**:
- Global (no por evento)
- Tabla junction `KaraokeSongLike` para prevenir duplicados
- API pública para que invitados den like desde sugerencias

**Estimación**: 10-12 horas de desarrollo

---

## Información del Proyecto

### Stack Tecnológico
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Frontend Operator**: React + TypeScript + React Hook Form + TailwindCSS
- **Frontend Client**: React + TypeScript + TailwindCSS
- **Base de Datos**: SQLite (dev/prod en Raspberry Pi)
- **Realtime**: Socket.io
- **Monorepo**: pnpm workspaces

### Estructura de Directorios
```
euforia-events/
├── apps/
│   ├── api/              # Backend Express + Prisma
│   ├── web-operator/     # Frontend para operadores
│   └── web-client/       # Frontend para invitados (QR)
├── docs/                 # Documentación del proyecto
└── .claude/plans/        # Planes de desarrollo de Claude
```

### Módulos Activos
1. **MUSICADJ**: Sistema de pedidos de música con Spotify
2. **KARAOKEYA**: Sistema de karaoke con catálogo de YouTube

### Variables de Entorno Requeridas (apps/api/.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=<secreto-seguro>
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
NODE_ENV=development
PORT=3000

# Spotify (MUSICADJ)
SPOTIFY_CLIENT_ID=<tu-client-id>
SPOTIFY_CLIENT_SECRET=<tu-client-secret>

# YouTube (KARAOKEYA)
YOUTUBE_API_KEY=<tu-api-key>

# Twilio (Opcional - Notificaciones)
TWILIO_ACCOUNT_SID=<tu-account-sid>
TWILIO_AUTH_TOKEN=<tu-auth-token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Comandos de Desarrollo

**Instalar dependencias**:
```bash
pnpm install
```

**Desarrollo local** (desde raíz del proyecto):
```bash
# API
cd apps/api
SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=xxx YOUTUBE_API_KEY=xxx npx tsx watch src/server.ts

# Web Operator
cd apps/web-operator
pnpm dev

# Web Client
cd apps/web-client
pnpm dev
```

**Base de datos**:
```bash
cd apps/api
npx prisma migrate dev        # Crear migración
npx prisma generate           # Generar cliente Prisma
npx prisma studio             # Ver datos en browser
```

### URLs de Desarrollo
- API: http://localhost:3000
- Web Operator: http://localhost:5173
- Web Client: http://localhost:5174
- Prisma Studio: http://localhost:5555

### Deployment en Raspberry Pi
1. `git pull` en el directorio del proyecto
2. Verificar que `.env` tenga las credenciales correctas
3. El servidor debería reiniciarse automáticamente (PM2 en modo watch)

---

## Últimas Sesiones de Desarrollo

### 2025-01-06: Campos de Redes Sociales + Fix Spotify
**Duración**: ~2 horas
**Problemas resueltos**:
- Error TypeScript por campos faltantes en EventData interface
- Error "Token no proporcionado" en importación de playlists (problema de carga de .env)

**Commits**:
- `53b1802`: feat(events): add social media fields to event form
- `74a8ffd`: fix(api): load .env file using reliable __dirname path

### 2025-01-05: MUSICADJ Playlist Import Frontend
**Duración**: ~3 horas
**Implementado**:
- Modal completo de importación con validación
- UI de gestión de playlists
- Badges visuales para identificar origen

### 2025-01-04: MUSICADJ Playlist Import Backend
**Duración**: ~4 horas
**Implementado**:
- Integración con Spotify API
- Modelo de base de datos ClientPlaylist
- Endpoints CRUD completos

---

## Notas para Continuar el Desarrollo

### Próximos Pasos Recomendados
1. **Implementar KARAOKEYA CRUD** según plan en `.claude/plans/sunny-hatching-lamport.md`
2. **Testing**: Crear tests para importación de playlists
3. **UX**: Mejorar manejo de errores en frontend con mensajes más específicos
4. **Performance**: Implementar paginación en lista de playlists

### Problemas Conocidos
- Ninguno crítico en este momento
- Plan de KARAOKEYA CRUD está completo y listo para implementación

### Recursos Útiles
- Plan KARAOKEYA: `/Users/malcomito/.claude/plans/sunny-hatching-lamport.md`
- Documentación Spotify API: https://developer.spotify.com/documentation/web-api
- Documentación Prisma: https://www.prisma.io/docs

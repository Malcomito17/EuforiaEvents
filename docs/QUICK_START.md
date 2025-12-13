# EUFORIA EVENTS - Quick Start Guide

## Inicio Rápido para Desarrollo

### 1. Instalación Inicial

```bash
# Clonar repositorio
git clone https://github.com/Malcomito17/EuforiaEvents.git
cd EuforiaEvents

# Instalar dependencias
pnpm install

# Configurar base de datos
cd apps/api
cp .env.example .env  # Editar con tus credenciales
npx prisma migrate dev
npx prisma generate
```

### 2. Configurar Variables de Entorno

Edita `apps/api/.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu-secreto-super-seguro-minimo-32-caracteres"
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000

# Spotify (para MUSICADJ)
SPOTIFY_CLIENT_ID=tu_client_id_aqui
SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui

# YouTube (para KARAOKEYA)
YOUTUBE_API_KEY=tu_api_key_aqui
```

**Obtener credenciales de Spotify**:
1. Ir a https://developer.spotify.com/dashboard
2. Crear una nueva app
3. Copiar Client ID y Client Secret

**Obtener API Key de YouTube**:
1. Ir a https://console.cloud.google.com
2. Crear proyecto y habilitar YouTube Data API v3
3. Crear credenciales (API Key)

### 3. Iniciar Servidores de Desarrollo

**Terminal 1 - API**:
```bash
cd apps/api
SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=xxx YOUTUBE_API_KEY=xxx npx tsx watch src/server.ts
```

**Terminal 2 - Web Operator**:
```bash
cd apps/web-operator
pnpm dev
```

**Terminal 3 - Web Client**:
```bash
cd apps/web-client
pnpm dev
```

### 4. Acceder a las Aplicaciones

- **API**: http://localhost:3000
- **Web Operator** (Panel de Control): http://localhost:5173
- **Web Client** (Vista Invitados): http://localhost:5174
- **Prisma Studio**: `npx prisma studio` → http://localhost:5555

### 5. Crear Usuario Admin

```bash
cd apps/api
node -e "
const bcrypt = require('bcryptjs');
const password = bcrypt.hashSync('admin123', 10);
console.log('INSERT INTO users (id, username, email, password, role) VALUES (\"admin1\", \"admin\", \"admin@euforia.com\", \"' + password + '\", \"ADMIN\");');
"
```

Copia el SQL generado y ejecútalo en Prisma Studio o SQLite.

## Flujo de Trabajo de Desarrollo

### Estructura del Proyecto

```
euforia-events/
├── apps/
│   ├── api/              # Backend (Express + Prisma)
│   │   ├── src/
│   │   │   ├── modules/  # Módulos de negocio
│   │   │   │   ├── auth/
│   │   │   │   ├── events/
│   │   │   │   ├── musicadj/
│   │   │   │   └── karaokeya/
│   │   │   ├── config/
│   │   │   └── server.ts
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── web-operator/     # Panel de Control
│   │   └── src/
│   │       ├── pages/
│   │       ├── components/
│   │       └── lib/
│   └── web-client/       # Vista para Invitados
│       └── src/
├── docs/                 # Documentación
└── .claude/plans/        # Planes de desarrollo
```

### Comandos Útiles

```bash
# Crear nueva migración de DB
cd apps/api
npx prisma migrate dev --name descripcion_cambio

# Generar cliente Prisma después de cambios en schema
npx prisma generate

# Ver base de datos en browser
npx prisma studio

# Build para producción
cd apps/api && pnpm build
cd apps/web-operator && pnpm build
cd apps/web-client && pnpm build

# Linter y formato
pnpm lint
pnpm format
```

### Git Workflow

```bash
# Crear rama para nueva feature
git checkout -b feature/nombre-feature

# Hacer commits con mensajes descriptivos
git add .
git commit -m "feat(modulo): descripción breve del cambio"

# Push y crear PR
git push origin feature/nombre-feature
```

### Convenciones de Commits

- `feat(module):` Nueva funcionalidad
- `fix(module):` Corrección de bug
- `docs:` Cambios en documentación
- `refactor(module):` Refactorización sin cambio de funcionalidad
- `chore:` Tareas de mantenimiento
- `test(module):` Agregar o modificar tests

## Módulos Activos

### MUSICADJ - Pedidos de Música
- **Operator**: Gestión de pedidos, reordenamiento, búsqueda Spotify, importación de playlists
- **Client**: Búsqueda de canciones, envío de pedidos via QR
- **Endpoints**: `/api/events/:eventId/musicadj/*`

### KARAOKEYA - Sistema de Karaoke
- **Operator**: Gestión de cola, llamado de turnos, CRUD de catálogo
- **Client**: Búsqueda de canciones, pedido de turnos
- **Endpoints**: `/api/events/:eventId/karaokeya/*`

## Troubleshooting

### Error: "Token no proporcionado" al importar playlist
**Solución**: Verifica que las variables `SPOTIFY_CLIENT_ID` y `SPOTIFY_CLIENT_SECRET` estén en `.env`

### Error: Prisma Client no generado
```bash
cd apps/api
npx prisma generate
```

### Puerto 3000 ya en uso
```bash
# Encontrar proceso
lsof -ti:3000

# Matar proceso
kill -9 $(lsof -ti:3000)
```

### Hot reload no funciona
- Verifica que estés usando `npx tsx watch` en lugar de `npx tsx`
- Reinicia el servidor manualmente

## Próximos Pasos

1. Revisa `docs/CHANGELOG.md` para ver cambios recientes
2. Revisa `.claude/plans/` para ver planes de desarrollo futuros
3. Consulta documentación específica de módulos en `docs/modules/`

## Recursos

- [Documentación Prisma](https://www.prisma.io/docs)
- [Documentación React](https://react.dev)
- [Documentación Express](https://expressjs.com)
- [Documentación Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Documentación YouTube Data API](https://developers.google.com/youtube/v3)

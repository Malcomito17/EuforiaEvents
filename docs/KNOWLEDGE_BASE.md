# EUFORIA EVENTS - Knowledge Base

## Actualizado: 2025-12-16
## Estado: Produccion Activa

---

## 1. ARQUITECTURA DEL PROYECTO

### Estructura de Aplicaciones

```
euforia-events/
├── apps/
│   ├── api/                  # Backend Express + Prisma + SQLite
│   ├── web-operator/         # Panel de control (React + Vite)
│   └── web-client/           # App pública para invitados (React + Vite)
├── docker/
│   ├── Dockerfile.api        # Dev - API
│   ├── Dockerfile.api.prod   # Prod - API optimizado
│   ├── Dockerfile.web-*      # Dev/Prod para frontends
│   └── nginx/                # Configuración nginx para producción
├── docs/                     # Documentación del proyecto
├── scripts/                  # Scripts de utilidad
├── docker-compose.yml        # Desarrollo local
└── docker-compose.prod.yml   # Producción (Raspberry Pi)
```

### Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Node.js 20, Express, TypeScript |
| ORM | Prisma 5.22 |
| Base de datos | SQLite |
| Frontend | React 18, Vite, TypeScript, TailwindCSS |
| Validación | Zod |
| Autenticación | JWT |
| Contenedores | Docker, Docker Compose |
| Proxy reverso | Nginx (producción) |
| Túnel público | Cloudflare Tunnel |

---

## 2. MÓDULOS IMPLEMENTADOS

### 2.1 Módulo de Personas (persons)
- **Propósito**: Catálogo global de personas reutilizable entre eventos
- **Campos**: nombre, apellido, email, phone, company, dietaryRestrictions
- **Características**:
  - Hash de identidad para evitar duplicados
  - Enlace automático con participantes por email

### 2.2 Módulo de Invitados (event-guests)
- **Propósito**: Guestlist específica por evento
- **Características**:
  - Estados de ingreso: PENDIENTE, INGRESADO, NO_ASISTIO
  - Check-in/Check-out con timestamps
  - Asignación a mesas
  - Necesidades de accesibilidad
  - Importación masiva desde CSV
  - Platos asignados del menú

### 2.3 Módulo de Platos (dishes)
- **Propósito**: Catálogo global de platos
- **Campos**: nombre, descripcion, categoria, dietaryInfo
- **Categorías**: ENTRADA, PRINCIPAL, GUARNICION, POSTRE, BEBIDA, DEGUSTACION, OTRO

### 2.4 Módulo de Menú (menu)
- **Propósito**: Gestión del menú por evento
- **Características**:
  - Categorías configurables con orden
  - Platos por defecto por categoría
  - `allowMultipleDefaults` para menús de degustación
  - Asignación de platos a invitados
  - Validación de restricciones alimentarias
  - Dashboard de alertas

### 2.5 Módulo de Mesas (mesas)
- **Propósito**: Distribución espacial de mesas
- **Campos**: numero, capacidad, forma, sector, posición (x, y, rotation)
- **Formas**: REDONDA, RECTANGULAR, CUADRADA, OVALADA
- **Características**:
  - Asignación de invitados
  - Estadísticas de ocupación
  - Auto-asignación inteligente

### 2.6 Módulo de Participantes (participants)
- **Propósito**: Auto-registro voluntario para servicios públicos
- **Uso**: MUSICADJ (solicitar canciones), KARAOKEYA
- **Diferencia con invitados**: Son voluntarios, requieren email

---

## 3. INFRAESTRUCTURA DE PRODUCCIÓN

### Raspberry Pi 4

| Detalle | Valor |
|---------|-------|
| IP Local | 192.168.80.159 |
| Usuario | malcomito |
| Password | 111001 |
| Proyecto | ~/projects/EuforiaEvents |
| Branch | main |

### Contenedores en Producción

| Contenedor | Imagen | Puerto | Función |
|------------|--------|--------|---------|
| euforia-api-prod | euforia-events-api:latest | 3000 (interno) | Backend API |
| euforia-nginx-prod | nginx:alpine | 80 (público) | Reverse proxy |
| euforia-web-client-prod | euforia-events-web-client:latest | 80 (interno) | App invitados |
| euforia-web-operator-prod | euforia-events-web-operator:latest | 80 (interno) | Panel operador |

### Dominios Cloudflare

| Servicio | URL |
|----------|-----|
| App pública | https://app.euforiateclog.cloud |
| Panel operador | https://operador.app.euforiateclog.cloud |

### Persistencia de Datos

```
~/projects/EuforiaEvents/data/
├── db/
│   └── production.db     # Base de datos SQLite
├── uploads/              # Archivos subidos
├── logs/                 # Logs de aplicación
│   └── nginx/            # Logs de nginx
└── nginx-cache/          # Cache de nginx
```

---

## 4. COMANDOS DE DEPLOYMENT

### Desde máquina local (macOS)

```bash
# Conectar a la Pi
sshpass -p '111001' ssh malcomito@192.168.80.159

# O desde el proyecto local
cd /Users/malcomito/Projects/euforia-events

# Push cambios a GitHub
git add . && git commit -m "mensaje" && git push origin main
```

### En la Raspberry Pi

```bash
cd ~/projects/EuforiaEvents

# Pull cambios
git pull origin main

# Detener contenedores
docker compose -f docker-compose.prod.yml down

# Rebuild (si hay cambios en código)
docker compose -f docker-compose.prod.yml build --no-cache

# Levantar servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f

# Aplicar migraciones de BD
docker exec euforia-api-prod npx prisma db push

# Ver estado
docker compose -f docker-compose.prod.yml ps
```

### Script de Deployment Automatizado

```bash
# Desde la Pi
cd ~/projects/EuforiaEvents
./deploy.sh           # Modo interactivo
./deploy.sh --auto    # Modo automático
```

---

## 5. CREDENCIALES

### Usuarios del Sistema

| Usuario | Password | Rol | Permisos |
|---------|----------|-----|----------|
| admin | admin123 | ADMIN | Acceso total |
| operador | admin123 | OPERATOR | Gestión de eventos |

### Variables de Entorno (.env)

```bash
NODE_ENV=production
JWT_SECRET=eJIjxnqnABIk27NnNj9HDY3LI0PfagR+VCWHihoIH2raKrfOh9FuH001eQ9wZ2fP
DATABASE_URL=file:./prisma/data/production.db
PUBLIC_DOMAIN=https://app.euforiateclog.cloud
OPERATOR_DOMAIN=https://operador.app.euforiateclog.cloud
```

---

## 6. ENDPOINTS API PRINCIPALES

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Usuario actual

### Eventos
- `GET /api/events` - Listar eventos
- `POST /api/events` - Crear evento
- `GET /api/events/:id` - Detalle evento
- `GET /api/events/:eventId/stats` - Estadísticas

### Invitados (Guestlist)
- `GET /api/events/:eventId/guests` - Listar invitados
- `POST /api/events/:eventId/guests` - Agregar invitado
- `PATCH /api/events/:eventId/guests/:id` - Actualizar
- `POST /api/events/:eventId/guests/:id/checkin` - Check-in
- `POST /api/events/:eventId/guests/:id/checkout` - Check-out
- `POST /api/events/:eventId/guests/import` - Importar CSV

### Menú
- `GET /api/events/:eventId/menu` - Obtener menú completo
- `POST /api/events/:eventId/menu/dishes` - Agregar plato al menú
- `PUT /api/events/:eventId/menu/dishes/:dishId/default` - Toggle default
- `POST /api/events/:eventId/menu/assign` - Asignar plato a invitado
- `GET /api/events/:eventId/menu/alerts` - Alertas de restricciones

### Mesas
- `GET /api/events/:eventId/mesas` - Listar mesas
- `POST /api/events/:eventId/mesas` - Crear mesa
- `PUT /api/events/:eventId/mesas/:id/position` - Actualizar posición
- `POST /api/events/:eventId/mesas/auto-assign` - Auto-asignar invitados

### Platos (Catálogo)
- `GET /api/dishes` - Listar platos
- `POST /api/dishes` - Crear plato
- `PUT /api/dishes/:id` - Actualizar
- `DELETE /api/dishes/:id` - Eliminar

### Personas (Catálogo)
- `GET /api/persons` - Listar personas
- `POST /api/persons` - Crear persona
- `GET /api/persons/search?q=` - Buscar

---

## 7. ESTRUCTURA DE BASE DE DATOS

### Modelos Principales

```prisma
model Event {
  id                    String
  slug                  String @unique
  name                  String
  status                EventStatus
  tieneMesasAsignadas   Boolean @default(true)
  tieneMenuIndividual   Boolean @default(true)
  requiereCheckout      Boolean @default(false)
  // ... relaciones con guests, mesas, menu
}

model Person {
  id                  String
  nombre              String
  apellido            String
  email               String?
  phone               String?
  dietaryRestrictions String[] // Array de restricciones
  identityHash        String @unique
}

model EventGuest {
  id            String
  eventId       String
  personId      String
  mesaId        String?
  estadoIngreso EstadoIngreso // PENDIENTE, INGRESADO, NO_ASISTIO
  checkedInAt   DateTime?
  accesibilidad Accesibilidad?
}

model Mesa {
  id        String
  eventId   String
  numero    String
  capacidad Int
  forma     FormaMesa // REDONDA, RECTANGULAR, etc.
  x         Float?    // Posición en canvas
  y         Float?
  rotation  Float?
}

model Dish {
  id          String
  nombre      String
  categoria   CategoriaPlato
  dietaryInfo String[] // VEGANO, CELIACO, etc.
}

model EventDish {
  id         String
  eventId    String
  dishId     String
  categoryId String?
  orden      Int
  esDefault  Boolean
}
```

---

## 8. TAREAS PENDIENTES

### Próxima Implementación
- [ ] Migrar Docker al SSD de la Raspberry Pi
- [ ] Implementar app web-checkin dedicada
- [ ] Agregar WebSocket para actualizaciones en tiempo real
- [ ] Implementar rol RECEPTION con permisos limitados

### Mejoras Futuras
- [ ] Canvas drag & drop para distribución de mesas
- [ ] Exportación de reportes (PDF, Excel)
- [ ] Dashboard de estadísticas avanzado
- [ ] Integración con impresoras de etiquetas

---

## 9. TROUBLESHOOTING

### Contenedor API no inicia
```bash
docker logs euforia-api-prod --tail 100
# Verificar que existe production.db
ls -la ~/projects/EuforiaEvents/data/db/
```

### Error de Prisma
```bash
docker exec euforia-api-prod npx prisma generate
docker exec euforia-api-prod npx prisma db push
docker restart euforia-api-prod
```

### Nginx 502 Bad Gateway
```bash
# Verificar que el API está corriendo
docker exec euforia-api-prod curl -s http://localhost:3000/health
# Reiniciar nginx
docker restart euforia-nginx-prod
```

### Resetear base de datos
```bash
# CUIDADO: Esto borra todos los datos
docker exec euforia-api-prod rm /app/apps/api/prisma/data/production.db
docker exec euforia-api-prod npx prisma db push
docker exec euforia-api-prod npx prisma db seed
docker restart euforia-api-prod
```

---

## 10. INFORMACIÓN DEL REPOSITORIO

| Campo | Valor |
|-------|-------|
| Repositorio | https://github.com/Malcomito17/EuforiaEvents |
| Branch principal | main |
| Último merge | feature/guestlist-backend → main |
| Fecha | 2025-12-16 |

### Commits Importantes
- `d980910` - feat: Complete guestlist, menu, and mesas module improvements
- `7f50b54` - fix: Remove non-existent packages/shared references
- `41126db` - fix: Add defensive programming to prevent runtime crashes

---

**Última actualización**: 2025-12-16 04:10
**Estado del sistema**: Producción activa y funcionando
**Próxima tarea pendiente**: Migración de Docker al SSD

# EUFORIA EVENTS - Estado del Proyecto

**Última actualización**: 16 de diciembre, 2025
**Versión**: v2.2
**Commit**: `7e1a4c0` - chore: Add isImportante/isDestacado flags to seed data

---

## DESPLIEGUE EN PRODUCCIÓN

### Servidor Raspberry Pi
```
Host: 192.168.80.160
User: malcomito
Password: 111001
Path: ~/projects/EuforiaEvents (con mayúsculas)
```

### URLs de Producción
| Servicio | URL |
|----------|-----|
| Web Client (invitados) | https://app.euforiateclog.cloud |
| Web Operator (admin) | https://app.euforiateclog.cloud/operador |
| API | https://app.euforiateclog.cloud/api |
| Check-in Público | https://app.euforiateclog.cloud/checkin/:slug?token=xxx |

### Credenciales por Defecto
```
Admin: admin / admin123
Operador: operador / admin123
```

### Comandos de Deploy Rápido
```bash
# Deploy completo automático
sshpass -p '111001' ssh malcomito@192.168.80.160 "cd ~/projects/EuforiaEvents && ./deploy.sh --auto"

# Deploy solo web-operator
sshpass -p '111001' ssh malcomito@192.168.80.160 "cd ~/projects/EuforiaEvents && git pull origin main && docker compose -f docker-compose.prod.yml build web-operator && docker compose -f docker-compose.prod.yml up -d web-operator"

# Deploy solo web-client
sshpass -p '111001' ssh malcomito@192.168.80.160 "cd ~/projects/EuforiaEvents && git pull origin main && docker compose -f docker-compose.prod.yml build web-client && docker compose -f docker-compose.prod.yml up -d web-client"

# Deploy solo API
sshpass -p '111001' ssh malcomito@192.168.80.160 "cd ~/projects/EuforiaEvents && git pull origin main && docker compose -f docker-compose.prod.yml build api && docker compose -f docker-compose.prod.yml up -d api"

# Ejecutar seed en producción
docker exec euforia-api-prod npx prisma db seed

# Push de cambios de schema
docker exec euforia-api-prod npx prisma db push

# Regenerar Prisma client (después de cambios de schema)
docker exec euforia-api-prod npx prisma generate && docker restart euforia-api-prod
```

### Troubleshooting Común
```bash
# Ver logs del API
docker logs euforia-api-prod -f

# Error "readonly database" - Permisos de BD
docker exec -u root euforia-api-prod chown -R nodejs:nodejs /app/apps/api/prisma/data/
docker exec -u root euforia-api-prod chmod 777 /app/apps/api/prisma/data/
docker restart euforia-api-prod

# Verificar estado de contenedores
docker ps --filter "name=euforia-"
```

---

## ESTADO GENERAL

**Sistema completamente funcional** en producción con:

- ✅ Gestión completa de eventos, venues y clientes
- ✅ Sistema de usuarios con permisos granulares (ADMIN, OPERATOR, DJ, VIEWER)
- ✅ Módulo MUSICADJ (solicitudes de música con Spotify)
- ✅ Módulo KARAOKEYA (solicitudes de karaoke con YouTube)
- ✅ Módulo INVITADOS (gestión de lista de invitados con check-in)
- ✅ Módulo MENÚ (gestión de platos y selección de menú)
- ✅ Módulo MESAS (distribución y asignación de mesas)
- ✅ Sistema de Check-in público con QR y token de acceso
- ✅ Panel DJ dedicado para gestión de colas
- ✅ Badges de invitados (Importante/Destacado)
- ✅ QR de evento como modal (mejor UX)
- ✅ Comunicaciones en tiempo real vía Socket.io

---

## CAMBIOS RECIENTES (Sesión 16/12/2025)

### Fixes Aplicados
1. **MusicaDJ/KaraokeYA/DJ Services** - Corregidas referencias de `guest` a `participant` (modelo Prisma correcto)
2. **Database readonly errors** - Corregidos permisos en producción
3. **Platos module** - Fix de permisos de escritura en BD

### Nuevas Funcionalidades
1. **Modal QR de Evento** - Convertido de página a modal para mejor UX
2. **Badges Importante/Destacado** - Visibles en:
   - App de Check-in (web-client)
   - Listado de Invitados (web-operator)
3. **Seed actualizado** - Incluye invitados con badges de prueba

### Archivos Modificados
- `apps/api/src/modules/musicadj/musicadj.service.ts` - guest → participant
- `apps/api/src/modules/karaokeya/karaokeya.service.ts` - guest → participant
- `apps/api/src/modules/dj/dj.service.ts` - guest → participant
- `apps/web-operator/src/components/EventQRModal.tsx` - NUEVO
- `apps/web-operator/src/pages/Events/EventDetail.tsx` - Usa modal QR
- `apps/web-operator/src/pages/Events/EventInvitados.tsx` - Badges visible
- `apps/web-client/src/pages/EventCheckin.tsx` - Ya tenía badges
- `apps/api/prisma/seed.ts` - Invitados con isImportante/isDestacado

---

## ARQUITECTURA

### Backend (Node.js + TypeScript + Express)
- **API RESTful** con autenticación JWT
- **Base de datos**: SQLite + Prisma ORM
- **Real-time**: Socket.io para actualizaciones en vivo
- **Integraciones**: Spotify API, YouTube Search API

### Frontend
- **Operador**: React + TypeScript + React Router + Zustand (puerto 5174)
- **Cliente**: React + TypeScript + Tailwind CSS (puerto 5173)
- **Deploy**: Docker + Nginx en Raspberry Pi

### Modelos Importantes (Prisma)
- `Event` - Evento principal
- `EventGuest` - Invitado del evento (con isImportante, isDestacado)
- `Person` - Datos personales (nombre, email, dietaryRestrictions)
- `Participant` - Usuario de MUSICADJ/KARAOKEYA (diferente de Person)
- `Mesa` - Mesas del evento
- `Dish` - Platos del catálogo
- `EventDish` - Platos asignados a evento
- `SongRequest` - Pedidos de MUSICADJ
- `KaraokeRequest` - Pedidos de KARAOKEYA

---

## ESTRUCTURA DEL PROYECTO

```
euforia-events/
├── apps/
│   ├── api/                    # Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema
│   │   │   ├── seed.ts         # Datos de prueba
│   │   │   └── data/           # SQLite files
│   │   └── src/modules/
│   │       ├── auth/
│   │       ├── events/
│   │       ├── event-guests/   # Invitados
│   │       ├── menu/           # Platos y menú
│   │       ├── mesas/
│   │       ├── musicadj/
│   │       ├── karaokeya/
│   │       └── dj/             # Panel DJ
│   │
│   ├── web-client/             # Frontend Cliente
│   │   └── src/pages/
│   │       ├── EventCheckin.tsx    # Check-in público
│   │       ├── MusicaDJRequest.tsx
│   │       └── KaraokeyaRequest.tsx
│   │
│   └── web-operator/           # Frontend Operador
│       └── src/
│           ├── components/
│           │   ├── EventQRModal.tsx
│           │   ├── EventCheckinQR.tsx
│           │   └── GuestForm.tsx
│           └── pages/Events/
│               ├── EventDetail.tsx
│               ├── EventInvitados.tsx
│               └── EventQR.tsx (deprecated, usar modal)
│
├── docker-compose.prod.yml     # Producción
├── docker-compose.yml          # Desarrollo
├── DEPLOYMENT.md               # Guía de deploy
├── PROJECT_STATUS.md           # Este archivo
└── TODO.md                     # Roadmap
```

---

## TAREAS PENDIENTES

### Por Implementar
- [ ] Migrar Docker al SSD del Raspberry Pi (performance)
- [ ] Sistema de backups automáticos de BD
- [ ] Tests unitarios y E2E

### Mejoras Futuras
- [ ] Tema oscuro/claro
- [ ] PWA para instalación en dispositivos
- [ ] Notificaciones push móviles
- [ ] Exportación de reportes PDF

---

## NOTAS TÉCNICAS

### Diferencia entre Person y Participant
- **Person**: Datos de invitado (EventGuest) - nombre, email, restricciones dietarias
- **Participant**: Usuario de MUSICADJ/KARAOKEYA - identificación para pedidos de música/karaoke

### Campos de EventGuest
```typescript
{
  id: string
  eventId: string
  personId: string
  mesaId: string | null
  estadoIngreso: 'PENDIENTE' | 'INGRESADO' | 'NO_ASISTIO'
  isImportante: boolean  // Badge rojo ⭐
  isDestacado: boolean   // Badge ámbar ✨
  checkedInAt: Date | null
  accesibilidad: 'NINGUNA' | 'MOVILIDAD_REDUCIDA' | 'VISUAL' | 'AUDITIVA'
  observaciones: string | null
}
```

### Token de Check-in Público
- Generado con: `POST /api/events/:eventId/checkin/generate-token`
- Usado en URL: `/checkin/:slug?token=xxx`
- Almacenado en: `Event.checkinAccessToken`

---

**Última actualización**: 16 de diciembre, 2025

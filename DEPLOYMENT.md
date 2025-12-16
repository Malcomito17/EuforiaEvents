# EUFORIA EVENTS - Deployment Guide

## Raspberry Pi Server Configuration

### SSH Access
```bash
Host: 192.168.80.159
User: malcomito
Password: 111001
```

### Project Location
```bash
~/projects/EuforiaEvents
```

### Quick Deploy Commands

**Full deployment (interactive):**
```bash
ssh malcomito@192.168.80.159
cd ~/projects/EuforiaEvents
./deploy.sh
```

**Full deployment (automatic):**
```bash
ssh malcomito@192.168.80.159 "cd ~/projects/EuforiaEvents && ./deploy.sh --auto"
```

**Deploy specific container:**
```bash
# Web Client only
docker compose -f docker-compose.prod.yml build web-client && docker compose -f docker-compose.prod.yml up -d web-client

# Web Operator only
docker compose -f docker-compose.prod.yml build web-operator && docker compose -f docker-compose.prod.yml up -d web-operator

# API only
docker compose -f docker-compose.prod.yml build api && docker compose -f docker-compose.prod.yml up -d api
```

**One-liner from local machine:**
```bash
sshpass -p '111001' ssh malcomito@192.168.80.159 "cd ~/projects/EuforiaEvents && git pull origin main && docker compose -f docker-compose.prod.yml build web-client && docker compose -f docker-compose.prod.yml up -d web-client"
```

## Production URLs

| Service | Local URL | Public URL (via Cloudflare) |
|---------|-----------|----------------------------|
| Web Client (invitados) | http://localhost:5173 | https://app.euforiateclog.cloud |
| Web Operator (admin) | http://localhost:5174 | https://app.euforiateclog.cloud/operador |
| API | http://localhost:3000 | https://app.euforiateclog.cloud/api |
| Check-in Public | - | https://app.euforiateclog.cloud/checkin/:slug?token=xxx |

## Application Credentials

### Default Admin User
```
Username: admin
Password: admin123
```

### Operator Demo User
```
Username: operador1
Password: operador123
```

## Docker Commands

```bash
# Ver estado de contenedores
docker ps --filter "name=euforia-"

# Ver logs del API
docker logs euforia-api-prod -f

# Ver logs del web-operator
docker logs euforia-web-operator-prod -f

# Ver logs del web-client
docker logs euforia-web-client-prod -f

# Reiniciar API
docker restart euforia-api-prod

# Detener todo
docker compose -f docker-compose.prod.yml down

# Reconstruir todo sin cache
docker compose -f docker-compose.prod.yml build --no-cache

# Ejecutar seed en produccion
docker exec euforia-api-prod npx prisma db seed

# Push schema changes
docker exec euforia-api-prod npx prisma db push
```

## Database

- **Type:** SQLite
- **Location in container:** `/app/apps/api/prisma/data/production.db`
- **Backup location:** `~/projects/EuforiaEvents/backups/`

### Backup Database
```bash
docker exec euforia-api-prod cp /app/apps/api/prisma/data/production.db /tmp/backup.db
docker cp euforia-api-prod:/tmp/backup.db ./backups/production-$(date +%Y%m%d-%H%M%S).db
```

## Environment Variables

Key environment variables in `docker-compose.prod.yml`:

```yaml
# API
DATABASE_URL: file:/app/apps/api/prisma/data/production.db
JWT_SECRET: [secure-random-string]
PUBLIC_DOMAIN: https://app.euforiateclog.cloud
CHECKIN_APP_URL: https://app.euforiateclog.cloud

# Web Client
VITE_API_URL: /api

# Web Operator
VITE_API_URL: /api
```

## Troubleshooting

### API no inicia
```bash
docker logs euforia-api-prod --tail 100
```

### Database errors
```bash
docker exec euforia-api-prod npx prisma db push
docker exec euforia-api-prod npx prisma generate
```

### Rebuild from scratch
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Check container health
```bash
docker exec euforia-api-prod curl -s http://localhost:3000/health
```

## Notes

- Use `docker compose` (without hyphen) on the Raspberry Pi
- The script `deploy.sh` handles the full deployment process
- Always pull latest changes before building: `git pull origin main`

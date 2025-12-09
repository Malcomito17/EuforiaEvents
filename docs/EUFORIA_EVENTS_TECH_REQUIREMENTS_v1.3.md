# EUFORIA EVENTS
## Requerimientos Técnicos y Entorno de Desarrollo v1.0

---

## 1. STACK TECNOLÓGICO DEFINITIVO

### 1.1 Resumen del Stack

| Componente | Tecnología | Versión Mínima |
|------------|------------|----------------|
| **Runtime** | Node.js | 20.x LTS |
| **Package Manager** | pnpm | 8.x |
| **Backend Framework** | Express.js | 4.x |
| **Base de Datos** | SQLite (dev/local) / PostgreSQL (prod) | SQLite 3.x / PG 15+ |
| **ORM** | Prisma | 5.x |
| **Realtime** | Socket.io | 4.x |
| **Frontend Framework** | React | 18.x |
| **Build Tool** | Vite | 5.x |
| **CSS** | Tailwind CSS | 3.x |
| **State Management** | Zustand | 4.x |
| **HTTP Client** | Axios | 1.x |
| **Validación** | Zod | 3.x |
| **Testing** | Vitest + Testing Library | Latest |
| **Containerización** | Docker + Docker Compose | 24.x / 2.x |

### 1.2 Justificación de Decisiones

**¿Por qué pnpm?**
- Instalación más rápida que npm/yarn
- Mejor manejo de monorepo
- Menor uso de disco (hardlinks)

**¿Por qué Prisma?**
- Type-safe queries (TypeScript nativo)
- Migraciones declarativas
- Funciona igual con SQLite y PostgreSQL
- Studio para debug visual

**¿Por qué Zustand sobre Redux?**
- Mínimo boilerplate
- Bundle size pequeño (~1KB)
- Perfecto para apps medianas
- Integración simple con React

**¿Por qué SQLite para desarrollo?**
- Zero configuration
- Un solo archivo = fácil backup
- Perfecto para uso local en eventos
- Migración transparente a PostgreSQL para cloud

> ⚠️ **Nota sobre SQLite y Enums**: SQLite no soporta enums nativos. En el schema de Prisma usamos `String` con valores por defecto (ej: `@default("OPERATOR")`). Los valores válidos se validan a nivel de aplicación con Zod.

---

## 2. ESTRUCTURA DEL PROYECTO (MONOREPO)

```
euforia-events/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── api/                    # Backend Express
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── env.ts
│   │   │   │   └── spotify.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── auth.routes.ts
│   │   │   │   │   └── auth.middleware.ts
│   │   │   │   ├── events/
│   │   │   │   │   ├── events.controller.ts
│   │   │   │   │   ├── events.service.ts
│   │   │   │   │   └── events.routes.ts
│   │   │   │   ├── musicadj/
│   │   │   │   │   ├── musicadj.controller.ts
│   │   │   │   │   ├── musicadj.service.ts
│   │   │   │   │   ├── musicadj.routes.ts
│   │   │   │   │   └── spotify.service.ts
│   │   │   │   ├── karaokeya/
│   │   │   │   │   ├── karaokeya.controller.ts
│   │   │   │   │   ├── karaokeya.service.ts
│   │   │   │   │   └── karaokeya.routes.ts
│   │   │   │   └── users/
│   │   │   │       ├── users.controller.ts
│   │   │   │       ├── users.service.ts
│   │   │   │       └── users.routes.ts
│   │   │   ├── shared/
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── error.middleware.ts
│   │   │   │   │   ├── auth.middleware.ts
│   │   │   │   │   └── permissions.middleware.ts
│   │   │   │   ├── utils/
│   │   │   │   │   ├── logger.ts
│   │   │   │   │   ├── qr-generator.ts
│   │   │   │   │   └── csv-export.ts
│   │   │   │   └── types/
│   │   │   │       └── index.ts
│   │   │   ├── socket/
│   │   │   │   ├── index.ts
│   │   │   │   └── handlers/
│   │   │   │       ├── musicadj.handler.ts
│   │   │   │       └── karaokeya.handler.ts
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web-client/             # Frontend Cliente (QR)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── musicadj/
│   │   │   │   └── karaokeya/
│   │   │   ├── pages/
│   │   │   │   ├── EventLanding.tsx
│   │   │   │   ├── MusicaDJRequest.tsx
│   │   │   │   └── KaraokeyaSignup.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/
│   │   │   ├── utils/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── web-operator/           # Frontend Operador/Admin
│       ├── src/
│       │   ├── components/
│       │   │   ├── common/
│       │   │   ├── layout/
│       │   │   ├── events/
│       │   │   ├── musicadj/
│       │   │   ├── karaokeya/
│       │   │   └── users/
│       │   ├── pages/
│       │   │   ├── Login.tsx
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Events/
│       │   │   ├── MusicaDJ/
│       │   │   ├── Karaokeya/
│       │   │   └── Users/
│       │   ├── hooks/
│       │   ├── services/
│       │   ├── stores/
│       │   ├── utils/
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       ├── index.html
│       ├── package.json
│       ├── tailwind.config.js
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── packages/
│   └── shared/                 # Código compartido
│       ├── src/
│       │   ├── types/          # TypeScript types compartidos
│       │   ├── validators/     # Schemas Zod compartidos
│       │   ├── constants/      # Constantes (estados, roles, etc.)
│       │   └── utils/          # Utilidades comunes
│       ├── package.json
│       └── tsconfig.json
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web-client
│   ├── Dockerfile.web-operator
│   └── nginx.conf
│
├── scripts/
│   ├── setup.sh
│   ├── seed-db.ts
│   └── export-event.ts
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_MANUAL.md
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── docker-compose.prod.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 3. ARQUITECTURA DE ENTORNOS

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ENTORNO DE DESARROLLO                        │
│                            (macOS 13+)                              │
├─────────────────────────────────────────────────────────────────────┤
│  MacBook / iMac / Mac Mini                                          │
│  ├── Node.js 20.x (nativo)                                         │
│  ├── pnpm + Turbo                                                  │
│  ├── VS Code / Cursor                                              │
│  ├── Colima + Docker CLI (reemplazo ligero de Docker Desktop)      │
│  └── SQLite (desarrollo local)                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Build & Push
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ENTORNO DE PRODUCCIÓN                          │
│                    (Raspberry Pi 4+ / CasaOS)                       │
├─────────────────────────────────────────────────────────────────────┤
│  Raspberry Pi 4 (4GB+ RAM recomendado)                             │
│  ├── Raspberry Pi OS (64-bit) / Debian                             │
│  ├── CasaOS (gestión de contenedores)                              │
│  ├── Docker (ARM64)                                                │
│  │   ├── euforia-api (Node.js Alpine ARM64)                        │
│  │   ├── euforia-web-client (Nginx Alpine ARM64)                   │
│  │   └── euforia-web-operator (Nginx Alpine ARM64)                 │
│  └── SQLite / PostgreSQL (según necesidad)                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. REQUISITOS DEL SISTEMA

### 3.1 Entorno de Desarrollo (macOS)

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| macOS | 13.0 (Ventura) | 14.0+ (Sonoma) |
| Chip | Intel / Apple Silicon | Apple Silicon (M1/M2/M3) |
| RAM | 8 GB | 16 GB |
| Disco | 20 GB libres | SSD 50 GB+ |

### 3.2 Entorno de Producción (Raspberry Pi)

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| Modelo | Raspberry Pi 4 (4GB) | Raspberry Pi 4/5 (8GB) |
| Storage | microSD 32GB Class 10 | SSD USB 3.0 (128GB+) |
| SO | Raspberry Pi OS 64-bit | Debian 12 64-bit |
| Red | WiFi | Ethernet Gigabit |

> ⚠️ **Importante**: Usar almacenamiento SSD via USB mejora drásticamente el rendimiento y vida útil vs microSD.

### 3.3 Software - Entorno de Desarrollo (macOS)

```bash
# Instalación con Homebrew (gestor de paquetes para macOS)

# 1. Instalar Homebrew (si no lo tenés)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Instalar dependencias base
brew install git
brew install node@20
brew install pnpm

# 3. Instalar Colima + Docker CLI (reemplazo ligero de Docker Desktop)
#    Colima funciona en macOS Ventura y versiones anteriores
brew install colima docker docker-compose docker-buildx

# 4. Instalar VS Code (o Cursor)
brew install --cask visual-studio-code
# o
brew install --cask cursor

# 5. Verificar instalaciones
git --version      # >= 2.40
node --version     # >= 20.x
pnpm --version     # >= 8.x
docker --version   # >= 24.x (se verifica después de iniciar Colima)
```

### 3.4 Configuración de Colima (Docker Engine para macOS)

Colima es un runtime de contenedores ligero que reemplaza Docker Desktop. Es open source, consume menos recursos y funciona en macOS Ventura (13.x) y anteriores.

```bash
# Iniciar Colima con configuración recomendada para desarrollo
# Ajustar CPU y memoria según tu Mac

# Para Apple Silicon (M1/M2/M3) - con soporte multi-arquitectura:
colima start --cpu 4 --memory 8 --disk 60 --arch aarch64

# Para Intel Mac:
colima start --cpu 4 --memory 8 --disk 60

# Verificar que Docker funciona
docker ps
docker run hello-world

# Configurar buildx para imágenes multi-arquitectura (necesario para Raspberry Pi)
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Para detener Colima cuando no lo uses (libera recursos)
colima stop

# Ver estado
colima status
```

**Comandos útiles de Colima:**

```bash
# Agregar aliases a ~/.zshrc para uso diario
cat >> ~/.zshrc << 'EOF'

# Colima / Docker aliases
alias docker-start="colima start --cpu 4 --memory 8 --disk 60"
alias docker-stop="colima stop"
alias docker-status="colima status"
EOF

source ~/.zshrc
```

**Inicio automático (opcional):**

```bash
# Si querés que Colima inicie con el sistema
brew services start colima

# Para desactivar inicio automático
brew services stop colima
```

### 3.5 Desarrollo Sin Docker (Equipos con RAM Limitada)

Para equipos con 4-8GB de RAM, se recomienda desarrollar sin Docker, ejecutando Node.js nativo:

```bash
# Desarrollo sin contenedores (consume menos recursos)
# Solo necesitás Node.js y pnpm instalados

# Iniciar API
pnpm dev:api

# Iniciar frontend cliente (otra terminal)
pnpm dev:client

# Iniciar frontend operador (otra terminal)
pnpm dev:operator

# O iniciar todo junto
pnpm dev
```

**Ventajas:**
- Menor consumo de RAM (~500MB vs ~2GB con Docker)
- Inicio más rápido
- Hot reload más ágil

**Cuándo usar Docker:**
- Para buildear imágenes de producción (ARM64 para Raspberry Pi)
- Para testing de integración
- Cuando tenés 16GB+ de RAM

```bash
# Solo cuando necesites Docker
colima start --cpu 2 --memory 2 --disk 40 --vm-type qemu

# Buildear imágenes para producción
docker buildx build --platform linux/arm64 -t euforia-api:latest .

# Apagar cuando termines
colima stop
```

### 3.4 Software - Entorno de Producción (Raspberry Pi + CasaOS)

```bash
# En Raspberry Pi con Raspberry Pi OS 64-bit instalado

# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar CasaOS (instalación de una línea)
curl -fsSL https://get.casaos.io | sudo bash

# 3. Acceder a CasaOS
# Abrir en navegador: http://[IP-RASPBERRY]:80
# Primera vez: crear usuario admin

# CasaOS ya incluye Docker, no necesitás instalarlo manualmente
```

### 3.3 Extensiones VS Code Recomendadas

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "PKief.material-icon-theme",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "mikestead.dotenv"
  ]
}
```

---

## 4. SETUP DEL ENTORNO DE DESARROLLO

### 4.1 Instalación Inicial

```bash
# 1. Clonar repositorio
git clone https://github.com/[tu-usuario]/euforia-events.git
cd euforia-events

# 2. Instalar pnpm (si no lo tenés)
npm install -g pnpm

# 3. Instalar dependencias de todo el monorepo
pnpm install

# 4. Copiar variables de entorno
cp .env.example .env

# 5. Configurar variables (editar .env)
code .env

# 6. Generar cliente Prisma y crear DB
pnpm db:generate
pnpm db:push

# 7. Seed de datos iniciales (usuario admin)
pnpm db:seed

# 8. Iniciar desarrollo
pnpm dev
```

### 4.2 Variables de Entorno (.env)

```bash
# ===========================================
# EUFORIA EVENTS - Environment Variables
# ===========================================

# General
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
OPERATOR_URL=http://localhost:5174

# Database
# Para desarrollo local (SQLite)
DATABASE_URL="file:./dev.db"

# Para producción (PostgreSQL)
# DATABASE_URL="postgresql://user:password@localhost:5432/euforia_events"

# Authentication
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-prod
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Spotify API
SPOTIFY_CLIENT_ID=tu-client-id
SPOTIFY_CLIENT_SECRET=tu-client-secret

# Opcional: Email (para recuperación de password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# Logs
LOG_LEVEL=debug
```

### 4.3 Scripts Disponibles (package.json raíz)

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:api": "turbo run dev --filter=api",
    "dev:client": "turbo run dev --filter=web-client",
    "dev:operator": "turbo run dev --filter=web-operator",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "db:generate": "pnpm --filter api prisma generate",
    "db:push": "pnpm --filter api prisma db push",
    "db:migrate": "pnpm --filter api prisma migrate dev",
    "db:seed": "pnpm --filter api prisma db seed",
    "db:studio": "pnpm --filter api prisma studio",
    "docker:dev": "docker-compose up -d",
    "docker:build": "docker-compose -f docker-compose.prod.yml build",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up -d",
    "clean": "turbo run clean && rm -rf node_modules"
  }
}
```

---

## 5. CONFIGURACIÓN DOCKER

### 5.1 Estrategia Multi-Arquitectura

Para que las imágenes funcionen tanto en Mac (desarrollo) como en Raspberry Pi (producción), usamos builds multi-plataforma:

```bash
# En macOS, habilitar buildx para multi-arquitectura
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build para ambas arquitecturas
docker buildx build --platform linux/amd64,linux/arm64 -t euforia/api:latest .
```

### 5.2 docker-compose.yml (Desarrollo - macOS)

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "3000:3000"
    volumes:
      - ./apps/api:/app/apps/api
      - ./packages:/app/packages
      - /app/node_modules
      - /app/apps/api/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=file:./dev.db
    networks:
      - euforia-network

  web-client:
    build:
      context: .
      dockerfile: docker/Dockerfile.web-client
    ports:
      - "5173:5173"
    volumes:
      - ./apps/web-client:/app/apps/web-client
      - ./packages:/app/packages
      - /app/node_modules
      - /app/apps/web-client/node_modules
    environment:
      - VITE_API_URL=http://localhost:3000
    networks:
      - euforia-network

  web-operator:
    build:
      context: .
      dockerfile: docker/Dockerfile.web-operator
    ports:
      - "5174:5174"
    volumes:
      - ./apps/web-operator:/app/apps/web-operator
      - ./packages:/app/packages
      - /app/node_modules
      - /app/apps/web-operator/node_modules
    environment:
      - VITE_API_URL=http://localhost:3000
    networks:
      - euforia-network

networks:
  euforia-network:
    driver: bridge
```

### 5.3 docker-compose.prod.yml (Producción - Raspberry Pi / CasaOS)

```yaml
version: '3.8'

services:
  euforia-api:
    image: ghcr.io/[tu-usuario]/euforia-api:latest
    # O build local en el Pi:
    # build:
    #   context: .
    #   dockerfile: docker/Dockerfile.api.prod
    container_name: euforia-api
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - euforia-data:/app/data
      - euforia-logs:/app/logs
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/euforia.db
      - JWT_SECRET=${JWT_SECRET}
      - SPOTIFY_CLIENT_ID=${SPOTIFY_CLIENT_ID}
      - SPOTIFY_CLIENT_SECRET=${SPOTIFY_CLIENT_SECRET}
    networks:
      - euforia-network
    # Límites de recursos para Raspberry Pi
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  euforia-web:
    image: ghcr.io/[tu-usuario]/euforia-web:latest
    container_name: euforia-web
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - euforia-api
    networks:
      - euforia-network
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M

volumes:
  euforia-data:
    driver: local
  euforia-logs:
    driver: local

networks:
  euforia-network:
    driver: bridge
```

### 5.4 Dockerfile.api (Desarrollo)

```dockerfile
FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generar cliente Prisma
WORKDIR /app/apps/api
RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm", "dev"]
```

### 5.5 Dockerfile.api.prod (Producción - Optimizado para ARM64)

```dockerfile
# ================================
# Stage 1: Builder
# ================================
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Instalar dependencias (incluye devDependencies para build)
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS production

# Instalar curl para healthcheck
RUN apk add --no-cache curl

RUN npm install -g pnpm

WORKDIR /app

# Copiar solo lo necesario para producción
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Instalar solo dependencias de producción
RUN pnpm install --frozen-lockfile --prod

# Copiar build y prisma
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Crear directorios para datos
RUN mkdir -p /app/data /app/logs

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 5.6 Dockerfile.web.prod (Frontend unificado - Nginx ARM64)

```dockerfile
# ================================
# Stage 1: Build Cliente
# ================================
FROM node:20-alpine AS builder-client

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web-client/package.json ./apps/web-client/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/web-client ./apps/web-client
COPY packages/shared ./packages/shared

WORKDIR /app/apps/web-client
RUN pnpm build

# ================================
# Stage 2: Build Operador
# ================================
FROM node:20-alpine AS builder-operator

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web-operator/package.json ./apps/web-operator/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/web-operator ./apps/web-operator
COPY packages/shared ./packages/shared

WORKDIR /app/apps/web-operator
RUN pnpm build

# ================================
# Stage 3: Nginx (ARM64 compatible)
# ================================
FROM nginx:alpine AS production

# Copiar builds
COPY --from=builder-client /app/apps/web-client/dist /usr/share/nginx/html/client
COPY --from=builder-operator /app/apps/web-operator/dist /usr/share/nginx/html/operator

# Configuración Nginx
COPY docker/nginx.prod.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 5.7 nginx.prod.conf (Configuración para producción)

```nginx
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging optimizado
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    # Optimizaciones
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Compresión Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript 
               application/xml application/xml+rss text/javascript application/x-javascript;

    # Upstream API
    upstream api {
        server euforia-api:3000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;

        # Cliente público (acceso por QR)
        location / {
            root /usr/share/nginx/html/client;
            index index.html;
            try_files $uri $uri/ /index.html;

            # Cache para assets estáticos
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Panel operador
        location /operator {
            alias /usr/share/nginx/html/operator;
            index index.html;
            try_files $uri $uri/ /operator/index.html;
        }

        # API proxy
        location /api {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Socket.io
        location /socket.io {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

---

## 6. DEPLOYMENT EN CASAOS

### 6.1 Opción A: Instalación desde Docker Compose

```bash
# 1. En tu Mac, subir imágenes a GitHub Container Registry
docker buildx build --platform linux/arm64 \
  -t ghcr.io/[tu-usuario]/euforia-api:latest \
  -f docker/Dockerfile.api.prod \
  --push .

docker buildx build --platform linux/arm64 \
  -t ghcr.io/[tu-usuario]/euforia-web:latest \
  -f docker/Dockerfile.web.prod \
  --push .

# 2. En Raspberry Pi, crear directorio
mkdir -p ~/euforia-events
cd ~/euforia-events

# 3. Copiar docker-compose.prod.yml y .env
# (via SCP desde Mac o crear manualmente)

# 4. Crear archivo .env
cat > .env << EOF
JWT_SECRET=tu-secreto-super-seguro-generado
SPOTIFY_CLIENT_ID=tu-client-id
SPOTIFY_CLIENT_SECRET=tu-client-secret
EOF

# 5. Levantar servicios
docker-compose -f docker-compose.prod.yml up -d

# 6. Verificar
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 6.2 Opción B: Instalación desde CasaOS UI

1. Abrir CasaOS en `http://[IP-RASPBERRY]`
2. Ir a **App Store** → **Custom Install**
3. Pegar el contenido de `docker-compose.prod.yml`
4. Configurar variables de entorno
5. Click en **Install**

### 6.3 Configuración de Red para Acceso Externo

```bash
# En el router, configurar port forwarding:
# Puerto 80 (HTTP) → [IP-RASPBERRY]:80
# Puerto 443 (HTTPS) → [IP-RASPBERRY]:443 (si usás SSL)

# Para acceso por dominio, opciones:
# - DuckDNS (gratis): https://www.duckdns.org/
# - Cloudflare Tunnel (gratis, más seguro)
# - Tailscale (VPN mesh, muy recomendado)
```

### 6.4 Configuración con Tailscale (Recomendado)

```bash
# En Raspberry Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Esto te da una IP tipo 100.x.x.x accesible desde cualquier
# dispositivo con Tailscale instalado (tu Mac, celular, etc.)
# Sin necesidad de abrir puertos en el router
```

---

## 6. CONFIGURACIÓN DE BASE DE DATOS

### 6.1 Schema Prisma (prisma/schema.prisma)

> ⚠️ **SQLite no soporta enums nativos**. Usamos `String` con valores por defecto. Los valores válidos se definen en `packages/shared/src/constants` y se validan con Zod.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Cambiar a "postgresql" en producción
  url      = env("DATABASE_URL")
}

// ================================
// USUARIOS Y AUTENTICACIÓN
// ================================

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  password  String
  role      String   @default("OPERATOR")  // ADMIN | MANAGER | OPERATOR
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  permissions UserPermission[]
  events      Event[]          @relation("EventCreator")

  @@map("users")
}

model UserPermission {
  id         String  @id @default(cuid())
  userId     String
  module     String  // MUSICADJ | KARAOKEYA
  canView    Boolean @default(true)
  canOperate Boolean @default(false)
  canExport  Boolean @default(false)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, module])
  @@map("user_permissions")
}

// ================================
// VENUES Y CLIENTS (REUTILIZABLES)
// ================================

model Venue {
  id           String   @id @default(cuid())
  name         String
  type         String   @default("OTHER")  // SALON | BAR | RESTAURANT | CLUB | OUTDOOR | OTHER
  address      String?
  city         String?
  capacity     Int?
  contactName  String?
  contactPhone String?
  instagramUrl String?
  notes        String?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  events Event[]

  @@map("venues")
}

model Client {
  id        String   @id @default(cuid())
  name      String
  company   String?
  phone     String?
  email     String?
  cuit      String?
  notes     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  events Event[]

  @@map("clients")
}

// ================================
// INVITADOS (ACCESO SIMPLIFICADO)
// ================================

// Guest = usuario final que accede via QR (sin password)
// Identificación por email, cross-evento
model Guest {
  id          String   @id @default(cuid())
  email       String   @unique
  displayName String   // "Juancho", "La Voz de Oro", etc.
  whatsapp    String?  // Opcional, para notificaciones de turno
  createdAt   DateTime @default(now())
  lastSeenAt  DateTime @updatedAt

  songRequests    SongRequest[]
  karaokeRequests KaraokeRequest[]

  @@map("guests")
}

// ================================
// EVENTOS
// ================================

model Event {
  id           String   @id @default(cuid())
  slug         String   @unique  // URL amigable: "martina-15-2501"
  status       String   @default("DRAFT")  // DRAFT | ACTIVE | PAUSED | FINISHED
  venueId      String?
  clientId     String?
  clonedFromId String?
  createdById  String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  venue      Venue?  @relation(fields: [venueId], references: [id])
  client     Client? @relation(fields: [clientId], references: [id])
  clonedFrom Event?  @relation("EventClones", fields: [clonedFromId], references: [id])
  clones     Event[] @relation("EventClones")
  createdBy  User    @relation("EventCreator", fields: [createdById], references: [id])

  eventData       EventData?
  musicadjConfig  MusicadjConfig?
  songRequests    SongRequest[]
  karaokeyaConfig KaraokeyaConfig?
  karaokeRequests KaraokeRequest[]

  @@map("events")
}

model EventData {
  id              String    @id @default(cuid())
  eventId         String    @unique
  eventName       String
  eventType       String    @default("OTHER")  // WEDDING | FIFTEEN | CORPORATE | BIRTHDAY | PARTY | OTHER
  startDate       DateTime
  endDate         DateTime?
  guestCount      Int?
  instagramUrl    String?
  instagramUser   String?
  hashtag         String?
  spotifyPlaylist String?
  notes           String?
  customFields    String?   // JSON para campos adicionales

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("event_data")
}

// ================================
// MÓDULO MUSICADJ
// ================================

model MusicadjConfig {
  eventId             String  @id
  enabled             Boolean @default(true)
  cooldownSeconds     Int     @default(300)
  allowWithoutSpotify Boolean @default(true)
  welcomeMessage      String?
  showQueueToClient   Boolean @default(false)

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("musicadj_configs")
}

model SongRequest {
  id          String   @id @default(cuid())
  eventId     String
  guestId     String   // FK al Guest (identificación unificada)
  spotifyId   String?
  title       String
  artist      String
  albumArtUrl String?
  status      String   @default("PENDING")  // PENDING | HIGHLIGHTED | URGENT | PLAYED | DISCARDED
  priority    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guest Guest @relation(fields: [guestId], references: [id])

  @@index([eventId, status])
  @@index([eventId, createdAt])
  @@index([guestId])
  @@map("song_requests")
}

// ================================
// MÓDULO KARAOKEYA
// ================================

// Catálogo maestro de canciones (global, no por evento)
model KaraokeSong {
  id              String   @id @default(cuid())
  title           String
  artist          String
  youtubeUrl      String?  // Link a video con LETRA/LYRICS
  language        String   @default("ES")  // ES | EN | PT
  difficulty      Int      @default(3)     // 1-5 (⭐ a ⭐⭐⭐⭐⭐)
  moods           String   @default("[]")  // JSON array: ["PARA_ROMPERLA", "ROMANTICO", etc.]
  tags            String   @default("[]")  // JSON array: ["Popular", "Clásico", "Dúo"]
  timesRequested  Int      @default(0)     // Contador global (aprendizaje cross-evento)
  timesCompleted  Int      @default(0)     // Veces cantada exitosamente
  isActive        Boolean  @default(true)  // Para ocultar sin eliminar
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  requests KaraokeRequest[]

  @@index([language])
  @@index([difficulty])
  @@map("karaoke_songs")
}

model KaraokeyaConfig {
  eventId             String  @id
  enabled             Boolean @default(true)
  cooldownSeconds     Int     @default(600)
  maxPerPerson        Int     @default(0)  // 0 = sin límite
  showQueueToClient   Boolean @default(true)
  showNextSinger      Boolean @default(true)
  // Configuración de sugerencias
  suggestionsEnabled  Boolean @default(true)
  suggestionsCount    Int     @default(3)  // 0-5, cantidad de sugerencias a mostrar
  allowedLanguages    String  @default("[]")  // JSON array: ["ES", "EN"] o vacío = todos

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("karaokeya_configs")
}

model KaraokeRequest {
  id            String    @id @default(cuid())
  eventId       String
  guestId       String    // FK al Guest (identificación unificada)
  songId        String?   // FK opcional al catálogo (null si búsqueda manual)
  title         String
  artist        String?
  turnNumber    Int
  queuePosition Int
  status        String    @default("QUEUED")  // QUEUED | CALLED | ON_STAGE | COMPLETED | NO_SHOW | CANCELLED
  createdAt     DateTime  @default(now())
  calledAt      DateTime?

  event Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guest Guest        @relation(fields: [guestId], references: [id])
  song  KaraokeSong? @relation(fields: [songId], references: [id])

  @@index([eventId, status])
  @@index([eventId, queuePosition])
  @@index([guestId])
  @@index([songId])
  @@map("karaoke_requests")
}
```

---

## 7. OBTENER CREDENCIALES SPOTIFY

### 7.1 Pasos para crear App en Spotify

1. Ir a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Loguearse con cuenta Spotify (o crear una)
3. Click en "Create App"
4. Completar:
   - App name: `EUFORIA EVENTS`
   - App description: `Sistema de gestión de eventos - pedidos musicales`
   - Redirect URI: `http://localhost:3000/api/spotify/callback`
   - APIs used: Marcar "Web API"
5. Aceptar términos y crear
6. Copiar `Client ID` y `Client Secret` al `.env`

### 7.2 Endpoints de Spotify que usaremos

```
# Búsqueda de tracks (no requiere auth de usuario)
GET https://api.spotify.com/v1/search?q={query}&type=track&limit=10

# Auth: Client Credentials Flow
POST https://accounts.spotify.com/api/token
  grant_type=client_credentials
  client_id={SPOTIFY_CLIENT_ID}
  client_secret={SPOTIFY_CLIENT_SECRET}
```

---

## 8. FLUJO DE DESARROLLO RECOMENDADO

### 8.1 Git Workflow

```
main (producción)
  └── develop (integración)
        ├── feature/TASK-ID-descripcion
        ├── fix/TASK-ID-descripcion
        └── hotfix/descripcion-urgente
```

### 8.2 Convención de Commits

```bash
# Formato
<tipo>(<scope>): <descripción>

# Tipos
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Documentación
style:    Formato (no afecta código)
refactor: Refactorización
test:     Tests
chore:    Tareas de mantenimiento

# Ejemplos
feat(musicadj): agregar búsqueda de Spotify
fix(auth): corregir expiración de token JWT
docs(api): documentar endpoints de eventos
```

### 8.3 Checklist Pre-Commit

```bash
# Ejecutar antes de cada commit
pnpm lint        # Sin errores
pnpm test        # Tests pasando
pnpm format      # Código formateado
```

---

## 9. COMANDOS ÚTILES

```bash
# Desarrollo
pnpm dev                    # Levantar todo el proyecto
pnpm dev:api                # Solo backend
pnpm dev:client             # Solo frontend cliente
pnpm dev:operator           # Solo frontend operador

# Base de datos
pnpm db:studio              # Abrir Prisma Studio (GUI para DB)
pnpm db:migrate             # Crear nueva migración
pnpm db:push                # Push schema sin migración (dev)
pnpm db:seed                # Poblar datos iniciales

# Docker
docker-compose up -d        # Levantar servicios en background
docker-compose logs -f api  # Ver logs del API
docker-compose down         # Bajar todo
docker-compose down -v      # Bajar todo + eliminar volúmenes

# Testing
pnpm test                   # Correr todos los tests
pnpm test:watch             # Tests en modo watch
pnpm test:coverage          # Reporte de cobertura

# Build
pnpm build                  # Build de producción
pnpm preview                # Preview del build
```

---

## 10. OPTIMIZACIONES PARA RASPBERRY PI

### 10.1 Consideraciones de Rendimiento

| Aspecto | Configuración |
|---------|---------------|
| **Base de datos** | SQLite (bajo consumo) o PostgreSQL con límites de memoria |
| **Node.js** | Limitar heap: `--max-old-space-size=256` |
| **Nginx** | Worker processes: `auto` (usará 4 cores) |
| **Docker** | Límites de memoria por contenedor |
| **Logs** | Rotación automática, no verbose en prod |

### 10.2 Almacenamiento Recomendado

```bash
# EVITAR: microSD como almacenamiento principal
# Las escrituras frecuentes de SQLite degradan la SD

# RECOMENDADO: SSD USB 3.0
# 1. Conectar SSD al puerto USB 3.0 (azul)
# 2. Formatear como ext4
sudo mkfs.ext4 /dev/sda1

# 3. Montar automáticamente
echo '/dev/sda1 /mnt/ssd ext4 defaults,noatime 0 2' | sudo tee -a /etc/fstab
sudo mount -a

# 4. Mover datos de Docker al SSD
sudo systemctl stop docker
sudo mv /var/lib/docker /mnt/ssd/docker
sudo ln -s /mnt/ssd/docker /var/lib/docker
sudo systemctl start docker
```

### 10.3 Monitoreo de Recursos

```bash
# Instalar herramientas de monitoreo
sudo apt install htop iotop

# Ver uso de recursos en tiempo real
htop

# Ver temperatura del CPU (importante en Pi)
vcgencmd measure_temp

# Script de monitoreo simple
cat > ~/monitor.sh << 'EOF'
#!/bin/bash
echo "=== EUFORIA EVENTS - Status ==="
echo "Temperatura: $(vcgencmd measure_temp)"
echo "Memoria: $(free -h | grep Mem | awk '{print $3"/"$2}')"
echo "Disco: $(df -h /mnt/ssd | tail -1 | awk '{print $3"/"$2" ("$5" usado)"}')"
echo "Containers:"
docker ps --format "  {{.Names}}: {{.Status}}"
EOF
chmod +x ~/monitor.sh
```

### 10.4 Backup Automático

```bash
# Script de backup diario
cat > ~/backup-euforia.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/mnt/ssd/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de base de datos SQLite
docker cp euforia-api:/app/data/euforia.db $BACKUP_DIR/euforia_$DATE.db

# Mantener solo últimos 7 backups
ls -t $BACKUP_DIR/euforia_*.db | tail -n +8 | xargs -r rm

echo "Backup completado: euforia_$DATE.db"
EOF
chmod +x ~/backup-euforia.sh

# Agregar al cron (diario a las 3am)
(crontab -l 2>/dev/null; echo "0 3 * * * ~/backup-euforia.sh") | crontab -
```

---

## 11. CHECKLIST INICIAL

### Desarrollo (macOS)

```markdown
### Setup macOS - Primera vez:

- [ ] Homebrew instalado (`brew --version`)
- [ ] Git instalado (`git --version` >= 2.40)
- [ ] Node.js 20 instalado (`node -v` >= 20.x)
- [ ] pnpm instalado (`pnpm -v` >= 8.x)
- [ ] Colima instalado (`colima version`)
- [ ] Docker CLI instalado (`docker --version` después de `colima start`)
- [ ] Docker Buildx instalado (`docker buildx version`)
- [ ] Colima iniciado y funcionando (`colima status`)
- [ ] VS Code / Cursor instalado
- [ ] Extensiones VS Code instaladas

### Setup Proyecto:

- [ ] Repositorio clonado
- [ ] `.env` creado desde `.env.example`
- [ ] Credenciales Spotify configuradas
- [ ] `pnpm install` ejecutado sin errores
- [ ] `pnpm db:push` ejecutado
- [ ] `pnpm db:seed` ejecutado
- [ ] `pnpm dev` levanta sin errores

### Verificación:

- [ ] API responde en http://localhost:3000
- [ ] Cliente carga en http://localhost:5173
- [ ] Operador carga en http://localhost:5174
- [ ] Login funciona con usuario seed
```

### Producción (Raspberry Pi)

```markdown
### Setup Raspberry Pi - Primera vez:

- [ ] Raspberry Pi OS 64-bit instalado
- [ ] SSD USB configurado (recomendado)
- [ ] CasaOS instalado
- [ ] Acceso a CasaOS UI verificado
- [ ] IP estática configurada (opcional)
- [ ] Tailscale instalado (recomendado)

### Deploy:

- [ ] Imágenes Docker buildeadas para ARM64
- [ ] Imágenes subidas a registry (GHCR)
- [ ] docker-compose.prod.yml en el Pi
- [ ] .env configurado con secretos de producción
- [ ] Contenedores levantados y healthy
- [ ] Backup automático configurado

### Verificación:

- [ ] API responde en http://[IP-PI]:3000/health
- [ ] Web accesible en http://[IP-PI]
- [ ] Panel operador en http://[IP-PI]/operator
- [ ] WebSocket funcionando (actualizaciones en tiempo real)
- [ ] QR genera URL correcta
```

---

## 12. WORKFLOW DE DEPLOYMENT (macOS → Raspberry Pi)

### 12.1 Flujo Completo

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   DESARROLLO     │     │      BUILD       │     │   PRODUCCIÓN     │
│    (macOS)       │────▶│   (GitHub CI)    │────▶│  (Raspberry Pi)  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
   git push             Build ARM64              docker pull
   feature branch       Push to GHCR             docker-compose up
```

### 12.2 GitHub Actions (CI/CD)

```yaml
# .github/workflows/deploy.yml
name: Build and Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  API_IMAGE: ghcr.io/${{ github.repository }}/api
  WEB_IMAGE: ghcr.io/${{ github.repository }}/web

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push API
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.api.prod
          platforms: linux/arm64
          push: true
          tags: ${{ env.API_IMAGE }}:latest,${{ env.API_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push Web
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.web.prod
          platforms: linux/arm64
          push: true
          tags: ${{ env.WEB_IMAGE }}:latest,${{ env.WEB_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Raspberry Pi
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PI_HOST }}
          username: ${{ secrets.PI_USER }}
          key: ${{ secrets.PI_SSH_KEY }}
          script: |
            cd ~/euforia-events
            docker-compose -f docker-compose.prod.yml pull
            docker-compose -f docker-compose.prod.yml up -d
            docker system prune -f
```

### 12.3 Comandos de Deploy Manual

```bash
# Desde macOS - Build local para ARM64
docker buildx build --platform linux/arm64 \
  -t euforia-api:latest \
  -f docker/Dockerfile.api.prod \
  --load .

# Guardar imagen
docker save euforia-api:latest | gzip > euforia-api.tar.gz

# Copiar al Raspberry Pi
scp euforia-api.tar.gz pi@[IP-PI]:~/

# En Raspberry Pi - Cargar imagen
ssh pi@[IP-PI]
gunzip -c euforia-api.tar.gz | docker load
docker-compose -f docker-compose.prod.yml up -d
```

---

## 13. DESARROLLO REMOTO (ALTERNATIVAS)

Para situaciones donde no podés instalar herramientas localmente (oficina con restricciones, equipo prestado, etc.):

### 13.1 GitHub Codespaces (Recomendado)

```bash
# 60 horas gratis/mes con cuenta GitHub Free
# VS Code completo en el navegador
# Acceso desde: https://github.com/codespaces
```

**Configuración** (crear archivo `.devcontainer/devcontainer.json`):

```json
{
  "name": "EUFORIA EVENTS Dev",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "prisma.prisma",
        "bradlc.vscode-tailwindcss"
      ]
    }
  },
  "forwardPorts": [3000, 5173, 5174],
  "postCreateCommand": "npm install -g pnpm && pnpm install",
  "remoteUser": "node"
}
```

### 13.2 Otras Opciones

| Plataforma | Horas Gratis | Ventaja |
|------------|--------------|---------|
| GitHub Codespaces | 60/mes | Mejor integración con GitHub |
| Gitpod | 50/mes | Inicio más rápido |
| StackBlitz | Ilimitado (público) | WebContainers, sin Docker |

### 13.3 Workarounds para Firewall Corporativo

Si GitHub está bloqueado en tu red:

```bash
# Opción A: Mirror en GitLab
git remote add gitlab https://gitlab.com/tu-usuario/euforia-events.git
git push gitlab main

# Opción B: Tailscale VPN (atraviesa firewalls)
# Instalar en Mac y en Raspberry Pi
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
# Te da IP tipo 100.x.x.x accesible desde cualquier dispositivo con Tailscale

# Opción C: VS Code Remote Tunnels
# Desde Mac con acceso a internet:
code tunnel
# Te genera URL tipo: https://vscode.dev/tunnel/tu-mac/carpeta
```

---

## 14. TROUBLESHOOTING

### 14.1 Errores Comunes de Instalación

**Error: "zsh: command not found: node"**
```bash
# Node.js no está en el PATH
# Para Mac Intel:
echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Para Mac Apple Silicon:
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Error: "UNABLE_TO_GET_ISSUER_CERT_LOCALLY"**
```bash
# Problema de SSL (común en redes corporativas o con antivirus)
# Solución temporal:
npm config set strict-ssl false
pnpm config set strict-ssl false
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Ejecutar instalación
pnpm install

# IMPORTANTE: Reactivar después
npm config set strict-ssl true
pnpm config set strict-ssl true
unset NODE_TLS_REJECT_UNAUTHORIZED
```

**Error: "The current connector does not support enums"**
```bash
# SQLite no soporta enums nativos de Prisma
# Solución: Usar String en lugar de enum en schema.prisma
# Ver sección 6.1 para el schema correcto
```

**Error: Docker Desktop incompatible con macOS**
```bash
# Docker Desktop requiere Sonoma (14.x)+
# Alternativa: Usar Colima
brew install colima docker docker-compose
colima start --cpu 2 --memory 2 --disk 40 --vm-type qemu
```

### 14.2 Base de Datos

**Resetear base de datos de desarrollo:**
```bash
cd apps/api
rm dev.db           # Eliminar DB existente
pnpm exec prisma db push   # Recrear tablas
pnpm exec prisma db seed   # Cargar datos iniciales (si tenés seed)
```

**Ver contenido de la base de datos:**
```bash
pnpm exec prisma studio
# Abre GUI en http://localhost:5555
```

### 14.3 Puertos en Uso

```bash
# Ver qué proceso usa un puerto
lsof -i :3000
lsof -i :5173

# Matar proceso por PID
kill -9 [PID]

# O cambiar puertos en .env / vite.config.ts
```

---

## 15. RECURSOS Y DOCUMENTACIÓN

| Recurso | URL |
|---------|-----|
| **Stack Principal** | |
| Node.js | https://nodejs.org/ |
| pnpm | https://pnpm.io/ |
| Express | https://expressjs.com/ |
| Prisma | https://www.prisma.io/docs |
| React | https://react.dev/ |
| Vite | https://vitejs.dev/ |
| Tailwind CSS | https://tailwindcss.com/docs |
| Socket.io | https://socket.io/docs/ |
| Zustand | https://zustand-demo.pmnd.rs/ |
| Zod | https://zod.dev/ |
| **APIs Externas** | |
| Spotify API | https://developer.spotify.com/documentation/web-api |
| **Infraestructura** | |
| Docker | https://docs.docker.com/ |
| Colima | https://github.com/abiosoft/colima |
| CasaOS | https://casaos.io/docs |
| Tailscale | https://tailscale.com/kb/ |
| **Desarrollo Remoto** | |
| GitHub Codespaces | https://github.com/features/codespaces |
| Gitpod | https://www.gitpod.io/ |
| **macOS** | |
| Homebrew | https://brew.sh/ |
| **Raspberry Pi** | |
| Raspberry Pi OS | https://www.raspberrypi.com/documentation/ |

---

## CHANGELOG

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.3 | 2025-12-05 | Modelo Guest para identificación simplificada, SongRequest y KaraokeRequest ahora usan guestId (eliminados campos requester*/singer*), índices optimizados |
| 1.2 | 2025-01-27 | Modelo KaraokeSong (catálogo maestro), config sugerencias en KaraokeyaConfig, FK songId en KaraokeRequest |
| 1.1 | 2025-01-27 | Schema Prisma sin enums (SQLite), Colima como alternativa a Docker Desktop, sección desarrollo remoto y troubleshooting |
| 1.0 | 2025-01-XX | Documento inicial |

---

*Documento generado para el proyecto EUFORIA EVENTS*
*Repositorio: https://github.com/Malcomito17/EuforiaEvents*
*Última actualización: 2025-12-05*

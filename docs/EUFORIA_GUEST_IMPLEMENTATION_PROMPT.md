# EUFORIA EVENTS - Implementación Modelo Guest
## Prompt de Ejecución Directa

---

## INSTRUCCIONES

Ejecutar TODOS los cambios de este documento en orden, sin preguntas. El proyecto existe y está funcional. Vamos a:

1. Eliminar base de datos existente
2. Aplicar schema nuevo con modelo Guest
3. Crear módulo guest en backend
4. Modificar módulos musicadj y karaokeya
5. Actualizar frontend cliente
6. Probar funcionamiento

**NO preguntar confirmaciones. Ejecutar directamente.**

---

## ACCESO AL PROYECTO

```bash
# GitHub (repo privado)
GITHUB_TOKEN="[PEGAR TOKEN AQUÍ]"
REPO="Malcomito17/EuforiaEvents"

# Ubicación local
LOCAL_PATH="~/Projects/euforia-events"
```

---

## FASE 1: RESET BASE DE DATOS

```bash
cd ~/Projects/euforia-events/apps/api
rm -f dev.db dev.db-journal
```

---

## FASE 2: SCHEMA PRISMA COMPLETO

Reemplazar **TODO** el contenido de `apps/api/prisma/schema.prisma` con:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ================================
// USUARIOS Y AUTENTICACIÓN (OPERADORES)
// ================================

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  password  String
  role      String   @default("OPERATOR") // ADMIN | MANAGER | OPERATOR
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
// GUESTS (INVITADOS VÍA QR)
// ================================

model Guest {
  id          String   @id @default(cuid())
  email       String   @unique
  displayName String
  whatsapp    String?
  createdAt   DateTime @default(now())
  lastSeenAt  DateTime @updatedAt

  songRequests    SongRequest[]
  karaokeRequests KaraokeRequest[]

  @@map("guests")
}

// ================================
// VENUES Y CLIENTS (REUTILIZABLES)
// ================================

model Venue {
  id           String   @id @default(cuid())
  name         String
  type         String   @default("OTHER") // SALON | BAR | CLUB | QUINTA | HOTEL | OTHER
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
// EVENTOS
// ================================

model Event {
  id           String   @id @default(cuid())
  slug         String   @unique
  status       String   @default("DRAFT") // DRAFT | ACTIVE | PAUSED | FINISHED
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
  eventType       String    @default("OTHER") // CUMPLE15 | CASAMIENTO | CORPORATE | SOCIAL | OTHER
  startDate       DateTime
  endDate         DateTime?
  guestCount      Int?
  instagramUrl    String?
  instagramUser   String?
  hashtag         String?
  spotifyPlaylist String?
  notes           String?
  customFields    String?

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
  guestId     String
  spotifyId   String?
  title       String
  artist      String
  albumArtUrl String?
  status      String   @default("PENDING") // PENDING | HIGHLIGHTED | URGENT | PLAYED | DISCARDED
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

model KaraokeyaConfig {
  eventId           String  @id
  enabled           Boolean @default(true)
  cooldownSeconds   Int     @default(600)
  maxPerPerson      Int     @default(0)
  showQueueToClient Boolean @default(true)
  showNextSinger    Boolean @default(true)

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@map("karaokeya_configs")
}

model KaraokeRequest {
  id            String    @id @default(cuid())
  eventId       String
  guestId       String
  title         String
  artist        String?
  turnNumber    Int
  queuePosition Int
  status        String    @default("QUEUED") // QUEUED | CALLED | ON_STAGE | COMPLETED | NO_SHOW | CANCELLED
  createdAt     DateTime  @default(now())
  calledAt      DateTime?

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  guest Guest @relation(fields: [guestId], references: [id])

  @@index([eventId, status])
  @@index([eventId, queuePosition])
  @@index([guestId])
  @@map("karaoke_requests")
}
```

---

## FASE 3: MÓDULO GUEST (BACKEND)

### 3.1 Crear `apps/api/src/modules/guest/guest.types.ts`

```typescript
import { z } from 'zod'

// Schemas de validación
export const identifyGuestSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().min(2, 'Nombre muy corto').max(50),
  whatsapp: z.string().optional(),
})

export type IdentifyGuestInput = z.infer<typeof identifyGuestSchema>

// Response types
export interface GuestResponse {
  id: string
  email: string
  displayName: string
  whatsapp: string | null
  createdAt: Date
  lastSeenAt: Date
}

export interface GuestRequestsResponse {
  songRequests: Array<{
    id: string
    eventId: string
    title: string
    artist: string
    status: string
    createdAt: Date
  }>
  karaokeRequests: Array<{
    id: string
    eventId: string
    title: string
    artist: string | null
    turnNumber: number
    status: string
    createdAt: Date
  }>
}

export class GuestError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'GuestError'
  }
}
```

### 3.2 Crear `apps/api/src/modules/guest/guest.service.ts`

```typescript
import { prisma } from '../../config/database'
import { IdentifyGuestInput, GuestResponse, GuestRequestsResponse, GuestError } from './guest.types'

/**
 * Identifica o crea un guest por email
 * Si existe, actualiza displayName/whatsapp y lastSeenAt
 */
export async function identifyGuest(input: IdentifyGuestInput): Promise<GuestResponse> {
  const guest = await prisma.guest.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      displayName: input.displayName,
      whatsapp: input.whatsapp || null,
      lastSeenAt: new Date(),
    },
    create: {
      email: input.email.toLowerCase(),
      displayName: input.displayName,
      whatsapp: input.whatsapp || null,
    },
  })

  console.log(`[GUEST] Identificado: ${guest.displayName} (${guest.email})`)

  return guest
}

/**
 * Obtiene un guest por ID
 */
export async function getGuestById(guestId: string): Promise<GuestResponse> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
  })

  if (!guest) {
    throw new GuestError('Guest no encontrado', 404, 'GUEST_NOT_FOUND')
  }

  return guest
}

/**
 * Obtiene un guest por email
 */
export async function getGuestByEmail(email: string): Promise<GuestResponse | null> {
  const guest = await prisma.guest.findUnique({
    where: { email: email.toLowerCase() },
  })

  return guest
}

/**
 * Obtiene todos los requests de un guest (ambos módulos)
 */
export async function getGuestRequests(guestId: string, eventId?: string): Promise<GuestRequestsResponse> {
  const whereClause = eventId 
    ? { guestId, eventId } 
    : { guestId }

  const [songRequests, karaokeRequests] = await Promise.all([
    prisma.songRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventId: true,
        title: true,
        artist: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.karaokeRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventId: true,
        title: true,
        artist: true,
        turnNumber: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  return { songRequests, karaokeRequests }
}
```

### 3.3 Crear `apps/api/src/modules/guest/guest.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import * as guestService from './guest.service'
import { identifyGuestSchema, GuestError } from './guest.types'

export async function identify(req: Request, res: Response, next: NextFunction) {
  try {
    const input = identifyGuestSchema.parse(req.body)
    const guest = await guestService.identifyGuest(input)
    res.json(guest)
  } catch (error) {
    next(error)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { guestId } = req.params
    const guest = await guestService.getGuestById(guestId)
    res.json(guest)
  } catch (error) {
    next(error)
  }
}

export async function getByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.query
    if (!email || typeof email !== 'string') {
      throw new GuestError('Email requerido', 400)
    }
    const guest = await guestService.getGuestByEmail(email)
    if (!guest) {
      res.status(404).json({ error: 'Guest no encontrado' })
      return
    }
    res.json(guest)
  } catch (error) {
    next(error)
  }
}

export async function getRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { guestId } = req.params
    const { eventId } = req.query
    const requests = await guestService.getGuestRequests(
      guestId, 
      typeof eventId === 'string' ? eventId : undefined
    )
    res.json(requests)
  } catch (error) {
    next(error)
  }
}
```

### 3.4 Crear `apps/api/src/modules/guest/guest.routes.ts`

```typescript
import { Router } from 'express'
import * as controller from './guest.controller'

const router = Router()

// POST /api/guests/identify - Identificar o crear guest
router.post('/identify', controller.identify)

// GET /api/guests/by-email?email=xxx - Buscar por email
router.get('/by-email', controller.getByEmail)

// GET /api/guests/:guestId - Obtener por ID
router.get('/:guestId', controller.getById)

// GET /api/guests/:guestId/requests?eventId=xxx - Obtener requests
router.get('/:guestId/requests', controller.getRequests)

export default router
```

### 3.5 Crear `apps/api/src/modules/guest/index.ts`

```typescript
export * from './guest.types'
export * as guestService from './guest.service'
export { default as guestRoutes } from './guest.routes'
```

---

## FASE 4: MODIFICAR MUSICADJ

### 4.1 Actualizar `apps/api/src/modules/musicadj/musicadj.types.ts`

```typescript
import { z } from 'zod'

// Status enum
export type SongRequestStatus = 
  | 'PENDING' 
  | 'HIGHLIGHTED' 
  | 'URGENT' 
  | 'PLAYED' 
  | 'DISCARDED'

// Schemas de validación
export const createSongRequestSchema = z.object({
  guestId: z.string().min(1, 'Guest ID requerido'),
  spotifyId: z.string().optional(),
  title: z.string().min(1, 'Título requerido'),
  artist: z.string().min(1, 'Artista requerido'),
  albumArtUrl: z.string().url().optional(),
})

export const updateSongRequestSchema = z.object({
  status: z.enum(['PENDING', 'HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED']).optional(),
  priority: z.number().int().optional(),
})

export const listRequestsQuerySchema = z.object({
  status: z.enum(['PENDING', 'HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const musicadjConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).optional(),
  allowWithoutSpotify: z.boolean().optional(),
  welcomeMessage: z.string().max(500).optional().nullable(),
  showQueueToClient: z.boolean().optional(),
})

export type CreateSongRequestInput = z.infer<typeof createSongRequestSchema>
export type UpdateSongRequestInput = z.infer<typeof updateSongRequestSchema>
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>
export type MusicadjConfigInput = z.infer<typeof musicadjConfigSchema>

// Response types
export interface SongRequestResponse {
  id: string
  eventId: string
  guestId: string
  guest?: {
    id: string
    displayName: string
    email: string
  }
  spotifyId: string | null
  title: string
  artist: string
  albumArtUrl: string | null
  status: SongRequestStatus
  priority: number
  createdAt: Date
  updatedAt: Date
}

export class MusicadjError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'MusicadjError'
  }
}
```

### 4.2 Actualizar `apps/api/src/modules/musicadj/musicadj.service.ts`

```typescript
import { prisma } from '../../config/database'
import { 
  CreateSongRequestInput, 
  UpdateSongRequestInput,
  MusicadjConfigInput,
  ListRequestsQuery,
  SongRequestStatus,
  SongRequestResponse,
  MusicadjError
} from './musicadj.types'

// ============================================
// Config Operations
// ============================================

export async function getOrCreateConfig(eventId: string) {
  let config = await prisma.musicadjConfig.findUnique({
    where: { eventId }
  })

  if (!config) {
    config = await prisma.musicadjConfig.create({
      data: { eventId }
    })
    console.log(`[MUSICADJ] Config creada para evento ${eventId}`)
  }

  return config
}

export async function updateConfig(eventId: string, input: MusicadjConfigInput) {
  await getOrCreateConfig(eventId)

  const config = await prisma.musicadjConfig.update({
    where: { eventId },
    data: input
  })

  console.log(`[MUSICADJ] Config actualizada para evento ${eventId}`)
  return config
}

// ============================================
// Song Request Operations
// ============================================

export async function createRequest(eventId: string, input: CreateSongRequestInput): Promise<SongRequestResponse> {
  // Verificar evento
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { musicadjConfig: true }
  })

  if (!event) {
    throw new MusicadjError('Evento no encontrado', 404, 'EVENT_NOT_FOUND')
  }

  if (event.status !== 'ACTIVE') {
    throw new MusicadjError('El evento no está activo', 400, 'EVENT_NOT_ACTIVE')
  }

  // Verificar guest
  const guest = await prisma.guest.findUnique({
    where: { id: input.guestId }
  })

  if (!guest) {
    throw new MusicadjError('Guest no encontrado', 404, 'GUEST_NOT_FOUND')
  }

  // Verificar módulo habilitado
  const config = event.musicadjConfig || await getOrCreateConfig(eventId)
  if (!config.enabled) {
    throw new MusicadjError('El módulo de pedidos no está habilitado', 400, 'MODULE_DISABLED')
  }

  // TODO: Verificar cooldown por guest

  const request = await prisma.songRequest.create({
    data: {
      eventId,
      guestId: input.guestId,
      spotifyId: input.spotifyId || null,
      title: input.title,
      artist: input.artist,
      albumArtUrl: input.albumArtUrl || null,
      status: 'PENDING',
      priority: 0
    },
    include: {
      guest: {
        select: { id: true, displayName: true, email: true }
      }
    }
  })

  console.log(`[MUSICADJ] Nueva solicitud: "${input.title}" por ${guest.displayName}`)
  return request as SongRequestResponse
}

export async function getRequestById(eventId: string, requestId: string): Promise<SongRequestResponse> {
  const request = await prisma.songRequest.findFirst({
    where: { id: requestId, eventId },
    include: {
      guest: {
        select: { id: true, displayName: true, email: true }
      }
    }
  })

  if (!request) {
    throw new MusicadjError('Solicitud no encontrada', 404, 'REQUEST_NOT_FOUND')
  }

  return request as SongRequestResponse
}

export async function listRequests(eventId: string, query: ListRequestsQuery) {
  const { status, limit, offset } = query

  const where = {
    eventId,
    ...(status && { status })
  }

  const [requests, total] = await Promise.all([
    prisma.songRequest.findMany({
      where,
      include: {
        guest: {
          select: { id: true, displayName: true, email: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.songRequest.count({ where })
  ])

  return { requests, total, limit, offset }
}

export async function updateRequest(
  eventId: string, 
  requestId: string, 
  input: UpdateSongRequestInput
): Promise<SongRequestResponse> {
  await getRequestById(eventId, requestId)

  const request = await prisma.songRequest.update({
    where: { id: requestId },
    data: input,
    include: {
      guest: {
        select: { id: true, displayName: true, email: true }
      }
    }
  })

  console.log(`[MUSICADJ] Solicitud ${requestId} actualizada: ${JSON.stringify(input)}`)
  return request as SongRequestResponse
}

export async function deleteRequest(eventId: string, requestId: string) {
  await getRequestById(eventId, requestId)

  await prisma.songRequest.delete({
    where: { id: requestId }
  })

  console.log(`[MUSICADJ] Solicitud ${requestId} eliminada`)
  return { success: true }
}

export async function reorderQueue(eventId: string, requestIds: string[]) {
  const updates = requestIds.map((id, index) => 
    prisma.songRequest.update({
      where: { id },
      data: { priority: requestIds.length - index }
    })
  )

  await prisma.$transaction(updates)
  
  console.log(`[MUSICADJ] Cola reordenada: ${requestIds.length} items`)
  return { success: true, order: requestIds }
}

export async function getStats(eventId: string) {
  const stats = await prisma.songRequest.groupBy({
    by: ['status'],
    where: { eventId },
    _count: { status: true }
  })

  const total = await prisma.songRequest.count({ where: { eventId } })

  const byStatus = stats.reduce((acc, curr) => {
    acc[curr.status as SongRequestStatus] = curr._count.status
    return acc
  }, {} as Record<SongRequestStatus, number>)

  return {
    total,
    byStatus: {
      PENDING: byStatus.PENDING || 0,
      HIGHLIGHTED: byStatus.HIGHLIGHTED || 0,
      URGENT: byStatus.URGENT || 0,
      PLAYED: byStatus.PLAYED || 0,
      DISCARDED: byStatus.DISCARDED || 0
    }
  }
}
```

---

## FASE 5: MODIFICAR KARAOKEYA

### 5.1 Actualizar `apps/api/src/modules/karaokeya/karaokeya.types.ts`

```typescript
import { z } from 'zod'

// Status type
export type KaraokeRequestStatus = 
  | 'QUEUED' 
  | 'CALLED' 
  | 'ON_STAGE' 
  | 'COMPLETED' 
  | 'NO_SHOW' 
  | 'CANCELLED'

// Schemas
export const createKaraokeRequestSchema = z.object({
  guestId: z.string().min(1, 'Guest ID requerido'),
  title: z.string().min(1, 'Título requerido'),
  artist: z.string().optional(),
})

export const karaokeyaConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).optional(),
  maxPerPerson: z.number().int().min(0).optional(),
  showQueueToClient: z.boolean().optional(),
  showNextSinger: z.boolean().optional(),
})

export const listKaraokeRequestsQuerySchema = z.object({
  status: z.enum(['QUEUED', 'CALLED', 'ON_STAGE', 'COMPLETED', 'NO_SHOW', 'CANCELLED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreateKaraokeRequestInput = z.infer<typeof createKaraokeRequestSchema>
export type KaraokeyaConfigInput = z.infer<typeof karaokeyaConfigSchema>
export type ListKaraokeRequestsQuery = z.infer<typeof listKaraokeRequestsQuerySchema>

// Response types
export interface KaraokeRequestResponse {
  id: string
  eventId: string
  guestId: string
  guest?: {
    id: string
    displayName: string
    email: string
  }
  title: string
  artist: string | null
  turnNumber: number
  queuePosition: number
  status: KaraokeRequestStatus
  createdAt: Date
  calledAt: Date | null
}

export interface KaraokeyaConfigResponse {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  showNextSinger: boolean
}

export interface KaraokeQueueStats {
  total: number
  queued: number
  called: number
  onStage: number
  completed: number
  noShow: number
  cancelled: number
  nextTurnNumber: number
  estimatedWaitMinutes: number | null
}

export class KaraokeyaError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'KaraokeyaError'
  }
}
```

### 5.2 Actualizar `apps/api/src/modules/karaokeya/karaokeya.service.ts`

```typescript
import { prisma } from '../../config/database'
import { Prisma } from '@prisma/client'
import {
  CreateKaraokeRequestInput,
  KaraokeyaConfigInput,
  ListKaraokeRequestsQuery,
  KaraokeRequestResponse,
  KaraokeQueueStats,
  KaraokeyaConfigResponse,
  KaraokeRequestStatus,
  KaraokeyaError,
} from './karaokeya.types'

// ============================================
// CONFIGURACIÓN DEL MÓDULO
// ============================================

export async function getConfig(eventId: string): Promise<KaraokeyaConfigResponse | null> {
  const config = await prisma.karaokeyaConfig.findUnique({
    where: { eventId },
  })

  return config
}

export async function getOrCreateConfig(eventId: string): Promise<KaraokeyaConfigResponse> {
  let config = await prisma.karaokeyaConfig.findUnique({
    where: { eventId },
  })

  if (!config) {
    config = await prisma.karaokeyaConfig.create({
      data: { eventId },
    })
    console.log(`[KARAOKEYA] Config creada para evento ${eventId}`)
  }

  return config
}

export async function updateConfig(
  eventId: string,
  input: KaraokeyaConfigInput
): Promise<KaraokeyaConfigResponse> {
  const config = await prisma.karaokeyaConfig.upsert({
    where: { eventId },
    update: input,
    create: {
      eventId,
      ...input,
    },
  })

  console.log(`[KARAOKEYA] Config actualizada para evento ${eventId}`)
  return config
}

// ============================================
// REQUESTS DE KARAOKE
// ============================================

export async function createRequest(
  eventId: string,
  input: CreateKaraokeRequestInput
): Promise<KaraokeRequestResponse> {
  // 1. Verificar evento activo
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { karaokeyaConfig: true },
  })

  if (!event) {
    throw new KaraokeyaError('Evento no encontrado', 404, 'EVENT_NOT_FOUND')
  }

  if (event.status !== 'ACTIVE') {
    throw new KaraokeyaError('El evento no está activo', 400, 'EVENT_NOT_ACTIVE')
  }

  // 2. Verificar guest
  const guest = await prisma.guest.findUnique({
    where: { id: input.guestId },
  })

  if (!guest) {
    throw new KaraokeyaError('Guest no encontrado', 404, 'GUEST_NOT_FOUND')
  }

  // 3. Verificar módulo habilitado
  let config = event.karaokeyaConfig
  if (!config) {
    config = await prisma.karaokeyaConfig.create({
      data: { eventId },
    })
  }

  if (!config.enabled) {
    throw new KaraokeyaError('El karaoke no está habilitado', 400, 'MODULE_DISABLED')
  }

  // 4. Verificar límite por persona
  if (config.maxPerPerson > 0) {
    const existingCount = await prisma.karaokeRequest.count({
      where: {
        eventId,
        guestId: input.guestId,
        status: { in: ['QUEUED', 'CALLED', 'ON_STAGE'] },
      },
    })

    if (existingCount >= config.maxPerPerson) {
      throw new KaraokeyaError(
        `Ya tenés ${existingCount} turno(s) activo(s). Máximo: ${config.maxPerPerson}`,
        400,
        'MAX_PER_PERSON_EXCEEDED'
      )
    }
  }

  // 5. Obtener siguiente turno y posición
  const [lastTurn, lastPosition] = await Promise.all([
    prisma.karaokeRequest.findFirst({
      where: { eventId },
      orderBy: { turnNumber: 'desc' },
      select: { turnNumber: true },
    }),
    prisma.karaokeRequest.findFirst({
      where: { eventId, status: 'QUEUED' },
      orderBy: { queuePosition: 'desc' },
      select: { queuePosition: true },
    }),
  ])

  const nextTurnNumber = (lastTurn?.turnNumber ?? 0) + 1
  const nextQueuePosition = (lastPosition?.queuePosition ?? 0) + 1

  // 6. Crear request
  const request = await prisma.karaokeRequest.create({
    data: {
      eventId,
      guestId: input.guestId,
      title: input.title,
      artist: input.artist || null,
      turnNumber: nextTurnNumber,
      queuePosition: nextQueuePosition,
      status: 'QUEUED',
    },
    include: {
      guest: {
        select: { id: true, displayName: true, email: true },
      },
    },
  })

  console.log(
    `[KARAOKEYA] Turno #${nextTurnNumber} - "${input.title}" por ${guest.displayName}`
  )

  return request as KaraokeRequestResponse
}

export async function getRequestById(requestId: string): Promise<KaraokeRequestResponse | null> {
  const request = await prisma.karaokeRequest.findUnique({
    where: { id: requestId },
    include: {
      guest: {
        select: { id: true, displayName: true, email: true },
      },
    },
  })

  return request as KaraokeRequestResponse | null
}

export async function listRequests(
  eventId: string,
  query: ListKaraokeRequestsQuery
): Promise<{ requests: KaraokeRequestResponse[]; total: number }> {
  const where: Prisma.KaraokeRequestWhereInput = {
    eventId,
    ...(query.status && { status: query.status }),
  }

  const [requests, total] = await Promise.all([
    prisma.karaokeRequest.findMany({
      where,
      include: {
        guest: {
          select: { id: true, displayName: true, email: true },
        },
      },
      orderBy: [{ queuePosition: 'asc' }, { createdAt: 'asc' }],
      take: query.limit,
      skip: query.offset,
    }),
    prisma.karaokeRequest.count({ where }),
  ])

  return {
    requests: requests as KaraokeRequestResponse[],
    total,
  }
}

export async function getQueue(eventId: string): Promise<KaraokeRequestResponse[]> {
  const requests = await prisma.karaokeRequest.findMany({
    where: {
      eventId,
      status: { in: ['QUEUED', 'CALLED', 'ON_STAGE'] },
    },
    include: {
      guest: {
        select: { id: true, displayName: true, email: true },
      },
    },
    orderBy: [
      { status: 'asc' },
      { queuePosition: 'asc' },
    ],
  })

  return requests as KaraokeRequestResponse[]
}

export async function getQueueStats(eventId: string): Promise<KaraokeQueueStats> {
  const counts = await prisma.karaokeRequest.groupBy({
    by: ['status'],
    where: { eventId },
    _count: true,
  })

  const lastTurn = await prisma.karaokeRequest.findFirst({
    where: { eventId },
    orderBy: { turnNumber: 'desc' },
    select: { turnNumber: true },
  })

  const queuedCount = counts.find((c) => c.status === 'QUEUED')?._count ?? 0
  const AVG_SONG_MINUTES = 3
  const estimatedWaitMinutes = queuedCount > 0 ? queuedCount * AVG_SONG_MINUTES : null

  return {
    total: counts.reduce((sum, c) => sum + c._count, 0),
    queued: queuedCount,
    called: counts.find((c) => c.status === 'CALLED')?._count ?? 0,
    onStage: counts.find((c) => c.status === 'ON_STAGE')?._count ?? 0,
    completed: counts.find((c) => c.status === 'COMPLETED')?._count ?? 0,
    noShow: counts.find((c) => c.status === 'NO_SHOW')?._count ?? 0,
    cancelled: counts.find((c) => c.status === 'CANCELLED')?._count ?? 0,
    nextTurnNumber: (lastTurn?.turnNumber ?? 0) + 1,
    estimatedWaitMinutes,
  }
}

// ============================================
// GESTIÓN DE ESTADOS
// ============================================

export async function updateStatus(
  requestId: string,
  status: KaraokeRequestStatus
): Promise<KaraokeRequestResponse> {
  const request = await prisma.karaokeRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new KaraokeyaError('Turno no encontrado', 404, 'REQUEST_NOT_FOUND')
  }

  validateStatusTransition(request.status as KaraokeRequestStatus, status)

  const updateData: Prisma.KaraokeRequestUpdateInput = { status }
  if (status === 'CALLED') {
    updateData.calledAt = new Date()
  }

  const updated = await prisma.karaokeRequest.update({
    where: { id: requestId },
    data: updateData,
    include: {
      guest: {
        select: { id: true, displayName: true, email: true },
      },
    },
  })

  console.log(`[KARAOKEYA] Turno #${request.turnNumber}: ${request.status} → ${status}`)
  return updated as KaraokeRequestResponse
}

export async function callNext(eventId: string): Promise<KaraokeRequestResponse | null> {
  const next = await prisma.karaokeRequest.findFirst({
    where: { eventId, status: 'QUEUED' },
    orderBy: { queuePosition: 'asc' },
  })

  if (!next) return null

  const updated = await prisma.karaokeRequest.update({
    where: { id: next.id },
    data: { status: 'CALLED', calledAt: new Date() },
    include: {
      guest: {
        select: { id: true, displayName: true, email: true },
      },
    },
  })

  console.log(`[KARAOKEYA] Llamando turno #${next.turnNumber}`)
  return updated as KaraokeRequestResponse
}

export async function reorderQueue(requestId: string, newPosition: number): Promise<void> {
  const request = await prisma.karaokeRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new KaraokeyaError('Turno no encontrado', 404)
  }

  if (request.status !== 'QUEUED') {
    throw new KaraokeyaError('Solo se pueden reordenar turnos en cola', 400)
  }

  const oldPosition = request.queuePosition

  await prisma.$transaction(async (tx) => {
    if (newPosition > oldPosition) {
      await tx.karaokeRequest.updateMany({
        where: {
          eventId: request.eventId,
          status: 'QUEUED',
          queuePosition: { gt: oldPosition, lte: newPosition },
        },
        data: { queuePosition: { decrement: 1 } },
      })
    } else if (newPosition < oldPosition) {
      await tx.karaokeRequest.updateMany({
        where: {
          eventId: request.eventId,
          status: 'QUEUED',
          queuePosition: { gte: newPosition, lt: oldPosition },
        },
        data: { queuePosition: { increment: 1 } },
      })
    }

    await tx.karaokeRequest.update({
      where: { id: requestId },
      data: { queuePosition: newPosition },
    })
  })

  console.log(`[KARAOKEYA] Turno #${request.turnNumber}: pos ${oldPosition} → ${newPosition}`)
}

export async function batchReorder(eventId: string, orderedIds: string[]): Promise<void> {
  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx.karaokeRequest.update({
        where: { id: orderedIds[i] },
        data: { queuePosition: i + 1 },
      })
    }
  })

  console.log(`[KARAOKEYA] Cola reordenada - ${orderedIds.length} items`)
}

export async function deleteRequest(requestId: string): Promise<void> {
  const request = await prisma.karaokeRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new KaraokeyaError('Turno no encontrado', 404)
  }

  await prisma.karaokeRequest.delete({ where: { id: requestId } })
  console.log(`[KARAOKEYA] Turno #${request.turnNumber} eliminado`)
}

// ============================================
// EXPORT
// ============================================

export async function getAllForExport(eventId: string) {
  const requests = await prisma.karaokeRequest.findMany({
    where: { eventId },
    include: {
      guest: {
        select: { displayName: true, email: true, whatsapp: true },
      },
    },
    orderBy: { turnNumber: 'asc' },
  })

  console.log(`[KARAOKEYA] Exportando ${requests.length} turnos`)
  return requests
}

// ============================================
// HELPERS
// ============================================

function validateStatusTransition(
  current: KaraokeRequestStatus,
  next: KaraokeRequestStatus
): void {
  const validTransitions: Record<KaraokeRequestStatus, KaraokeRequestStatus[]> = {
    QUEUED: ['CALLED', 'CANCELLED'],
    CALLED: ['ON_STAGE', 'NO_SHOW', 'QUEUED'],
    ON_STAGE: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    NO_SHOW: ['QUEUED'],
    CANCELLED: ['QUEUED'],
  }

  if (!validTransitions[current].includes(next)) {
    throw new KaraokeyaError(`Transición inválida: ${current} → ${next}`, 400)
  }
}
```

---

## FASE 6: REGISTRAR RUTAS GUEST

### Actualizar `apps/api/src/app.ts`

Agregar después de las otras rutas:

```typescript
import { guestRoutes } from './modules/guest'

// ... existing routes ...

// Guest routes (public - no auth required)
app.use('/api/guests', guestRoutes)
```

---

## FASE 7: REGENERAR Y SEED

```bash
cd ~/Projects/euforia-events/apps/api

# Regenerar cliente Prisma
npx pnpm db:generate

# Aplicar schema (crea tablas)
npx pnpm db:push

# Ejecutar seed
npx pnpm db:seed
```

---

## FASE 8: FRONTEND CLIENTE

### 8.1 Actualizar `apps/web-client/src/types/index.ts`

```typescript
/**
 * Client Types - Tipos para el frontend cliente
 */

// ============================================
// Guest Types
// ============================================

export interface Guest {
  id: string
  email: string
  displayName: string
  whatsapp: string | null
  createdAt: string
  lastSeenAt: string
}

export interface GuestIdentifyInput {
  email: string
  displayName: string
  whatsapp?: string
}

export interface GuestRequestsResponse {
  songRequests: Array<{
    id: string
    eventId: string
    title: string
    artist: string
    status: string
    createdAt: string
  }>
  karaokeRequests: Array<{
    id: string
    eventId: string
    title: string
    artist: string | null
    turnNumber: number
    status: string
    createdAt: string
  }>
}

// ============================================
// Event Types
// ============================================

export interface Event {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string | null
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FINISHED'
}

export interface MusicadjConfig {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  allowWithoutSpotify: boolean
  welcomeMessage: string | null
  showQueueToClient: boolean
  spotifyAvailable: boolean
}

export interface KaraokeyaConfig {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  showNextSinger: boolean
}

// ============================================
// Spotify Types
// ============================================

export interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  album: string
  albumArtUrl: string | null
  durationMs: number
  previewUrl: string | null
  spotifyUrl: string
}

export interface SpotifySearchResult {
  tracks: SpotifyTrack[]
  total: number
  query: string
}

// ============================================
// Song Request Types (MUSICADJ)
// ============================================

export type SongRequestStatus = 
  | 'PENDING' 
  | 'HIGHLIGHTED' 
  | 'URGENT' 
  | 'PLAYED' 
  | 'DISCARDED'

export interface SongRequest {
  id: string
  eventId: string
  guestId: string
  guest?: {
    id: string
    displayName: string
    email: string
  }
  spotifyId: string | null
  title: string
  artist: string
  albumArtUrl: string | null
  status: SongRequestStatus
  priority: number
  createdAt: string
}

export interface CreateSongRequestInput {
  guestId: string
  spotifyId?: string
  title: string
  artist: string
  albumArtUrl?: string
}

// ============================================
// Karaoke Request Types (KARAOKEYA)
// ============================================

export type KaraokeRequestStatus = 
  | 'QUEUED' 
  | 'CALLED' 
  | 'ON_STAGE' 
  | 'COMPLETED' 
  | 'NO_SHOW' 
  | 'CANCELLED'

export interface KaraokeRequest {
  id: string
  eventId: string
  guestId: string
  guest?: {
    id: string
    displayName: string
    email: string
  }
  title: string
  artist: string | null
  turnNumber: number
  queuePosition: number
  status: KaraokeRequestStatus
  createdAt: string
  calledAt: string | null
}

export interface CreateKaraokeRequestInput {
  guestId: string
  title: string
  artist?: string
}

export interface KaraokeQueueStats {
  total: number
  queued: number
  called: number
  onStage: number
  completed: number
  noShow: number
  cancelled: number
  nextTurnNumber: number
  estimatedWaitMinutes: number | null
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  error: string
  code?: string
  details?: Array<{ field: string; message: string }>
}
```

### 8.2 Crear `apps/web-client/src/stores/guestStore.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Guest, GuestIdentifyInput, GuestRequestsResponse } from '../types'
import * as api from '../services/api'

interface GuestState {
  guest: Guest | null
  loading: boolean
  error: string | null
  
  // Actions
  identify: (input: GuestIdentifyInput) => Promise<Guest>
  loadFromStorage: () => void
  clearGuest: () => void
  getRequests: (eventId?: string) => Promise<GuestRequestsResponse>
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      guest: null,
      loading: false,
      error: null,

      identify: async (input: GuestIdentifyInput) => {
        set({ loading: true, error: null })
        try {
          const guest = await api.identifyGuest(input)
          set({ guest, loading: false })
          return guest
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error de identificación'
          set({ error: message, loading: false })
          throw err
        }
      },

      loadFromStorage: () => {
        // El persist middleware ya carga automáticamente
      },

      clearGuest: () => {
        set({ guest: null, error: null })
      },

      getRequests: async (eventId?: string) => {
        const { guest } = get()
        if (!guest) throw new Error('No hay guest identificado')
        return api.getGuestRequests(guest.id, eventId)
      },
    }),
    {
      name: 'euforia-guest',
      partialize: (state) => ({ guest: state.guest }),
    }
  )
)
```

### 8.3 Actualizar `apps/web-client/src/services/api.ts`

Agregar las funciones de guest:

```typescript
import type { 
  Guest, 
  GuestIdentifyInput, 
  GuestRequestsResponse,
  // ... existing imports
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// ============================================
// Guest API
// ============================================

export async function identifyGuest(input: GuestIdentifyInput): Promise<Guest> {
  const res = await fetch(`${API_URL}/api/guests/identify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Error de identificación')
  }
  
  return res.json()
}

export async function getGuestRequests(guestId: string, eventId?: string): Promise<GuestRequestsResponse> {
  const url = eventId 
    ? `${API_URL}/api/guests/${guestId}/requests?eventId=${eventId}`
    : `${API_URL}/api/guests/${guestId}/requests`
    
  const res = await fetch(url)
  
  if (!res.ok) {
    throw new Error('Error al obtener pedidos')
  }
  
  return res.json()
}

// ============================================
// Song Request API (actualizar)
// ============================================

export async function createSongRequest(
  eventId: string, 
  input: CreateSongRequestInput
): Promise<SongRequest> {
  const res = await fetch(`${API_URL}/api/events/${eventId}/musicadj/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Error al enviar pedido')
  }
  
  return res.json()
}

// ============================================
// Karaoke Request API (actualizar)
// ============================================

export async function createKaraokeRequest(
  eventId: string, 
  input: CreateKaraokeRequestInput
): Promise<KaraokeRequest> {
  const res = await fetch(`${API_URL}/api/events/${eventId}/karaokeya/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || 'Error al anotarse')
  }
  
  return res.json()
}
```

### 8.4 Crear `apps/web-client/src/pages/GuestIdentification.tsx`

```tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { useGuestStore } from '../stores/guestStore'
import { useEventStore } from '../stores/eventStore'

export default function GuestIdentification() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { guest, identify, loading: guestLoading, error: guestError } = useGuestStore()
  const { event, loading: eventLoading, error: eventError, loadEvent } = useEventStore()

  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Cargar evento
  useEffect(() => {
    if (slug) loadEvent(slug)
  }, [slug, loadEvent])

  // Si ya hay guest, ir al hub
  useEffect(() => {
    if (guest && event) {
      navigate(`/e/${slug}/hub`)
    }
  }, [guest, event, slug, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !displayName.trim()) return

    try {
      await identify({
        email: email.trim(),
        displayName: displayName.trim(),
        whatsapp: whatsapp.trim() || undefined,
      })
      navigate(`/e/${slug}/hub`)
    } catch (err) {
      // Error manejado por store
    }
  }

  const isValid = email.trim() && displayName.trim()

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (eventError || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Evento no encontrado</h1>
          <p className="text-white/60">{eventError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <p className="text-white/70">Identificate para continuar</p>
        </div>

        {/* Error */}
        {guestError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-sm text-red-200">{guestError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="input-field pl-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">
              Tu nombre *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Como querés que te llamen"
                className="input-field pl-12"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white/70">
              WhatsApp (opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+54 9 2901 123456"
                className="input-field pl-12"
              />
            </div>
            <p className="text-xs text-white/50 mt-1">
              Para avisarte cuando sea tu turno
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-white/10"
            />
            <span className="text-sm text-white/70">Recordarme en este dispositivo</span>
          </label>

          <button
            type="submit"
            disabled={!isValid || guestLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {guestLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Continuar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### 8.5 Crear `apps/web-client/src/pages/EventHub.tsx`

```tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Music2, Mic2, List, LogOut, Loader2, AlertCircle } from 'lucide-react'
import { useGuestStore } from '../stores/guestStore'
import { useEventStore } from '../stores/eventStore'

export default function EventHub() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { guest, clearGuest } = useGuestStore()
  const { event, musicadjConfig, karaokeyaConfig, loading, error, loadEvent } = useEventStore()

  useEffect(() => {
    if (slug) loadEvent(slug)
  }, [slug, loadEvent])

  // Si no hay guest, volver a identificación
  useEffect(() => {
    if (!guest) {
      navigate(`/e/${slug}`)
    }
  }, [guest, slug, navigate])

  const handleLogout = () => {
    clearGuest()
    navigate(`/e/${slug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error || !event || !guest) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-white/60">{error || 'Evento no encontrado'}</p>
        </div>
      </div>
    )
  }

  const hasMusicadj = musicadjConfig?.enabled
  const hasKaraokeya = karaokeyaConfig?.enabled

  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header */}
      <header className="text-center mb-8 pt-4">
        <p className="text-white/60 text-sm mb-1">{event.name}</p>
        <h1 className="text-2xl font-bold">👋 ¡Hola, {guest.displayName}!</h1>
      </header>

      {/* Módulos */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          {/* MUSICADJ */}
          {hasMusicadj && (
            <button
              onClick={() => navigate(`/e/${slug}/musicadj`)}
              className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Music2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Pedí tu tema</h2>
                <p className="text-white/60 text-sm">Buscá y solicitá tu canción</p>
              </div>
            </button>
          )}

          {/* KARAOKEYA */}
          {hasKaraokeya && (
            <button
              onClick={() => navigate(`/e/${slug}/karaokeya`)}
              className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
            >
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Karaoke</h2>
                <p className="text-white/60 text-sm">Anotate para cantar</p>
              </div>
            </button>
          )}

          {/* Mis pedidos */}
          <button
            onClick={() => navigate(`/e/${slug}/my-requests`)}
            className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-14 h-14 bg-gray-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <List className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Mis pedidos</h2>
              <p className="text-white/60 text-sm">Ver estado de mis solicitudes</p>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pt-4 pb-8">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Cambiar usuario</span>
        </button>
      </footer>
    </div>
  )
}
```

### 8.6 Crear `apps/web-client/src/pages/MyRequests.tsx`

```tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Music2, Mic2, Loader2, AlertCircle } from 'lucide-react'
import { useGuestStore } from '../stores/guestStore'
import { useEventStore } from '../stores/eventStore'
import type { GuestRequestsResponse } from '../types'

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-200' },
  HIGHLIGHTED: { label: 'Destacado', color: 'bg-blue-500/20 text-blue-200' },
  URGENT: { label: 'Urgente', color: 'bg-red-500/20 text-red-200' },
  PLAYED: { label: 'Reproducido', color: 'bg-green-500/20 text-green-200' },
  DISCARDED: { label: 'Descartado', color: 'bg-gray-500/20 text-gray-300' },
  QUEUED: { label: 'En cola', color: 'bg-yellow-500/20 text-yellow-200' },
  CALLED: { label: '¡Te llaman!', color: 'bg-primary-500/20 text-primary-200' },
  ON_STAGE: { label: 'En escenario', color: 'bg-green-500/20 text-green-200' },
  COMPLETED: { label: 'Completado', color: 'bg-green-500/20 text-green-200' },
  NO_SHOW: { label: 'No presente', color: 'bg-gray-500/20 text-gray-300' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-300' },
}

export default function MyRequests() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { guest, getRequests } = useGuestStore()
  const { event, loadEvent } = useEventStore()

  const [requests, setRequests] = useState<GuestRequestsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) loadEvent(slug)
  }, [slug, loadEvent])

  useEffect(() => {
    if (!guest) {
      navigate(`/e/${slug}`)
      return
    }

    const load = async () => {
      try {
        const data = await getRequests(event?.id)
        setRequests(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }

    if (event) load()
  }, [guest, event, slug, navigate, getRequests])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/e/${slug}/hub`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">Mis pedidos</h1>
            <p className="text-xs text-white/60">{event?.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Song Requests */}
        {requests?.songRequests && requests.songRequests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Music2 className="w-5 h-5 text-primary-400" />
              <h2 className="font-semibold">Temas pedidos</h2>
            </div>
            <div className="space-y-2">
              {requests.songRequests.map((req) => (
                <div key={req.id} className="card py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-white/60">{req.artist}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusLabels[req.status]?.color}`}>
                      {statusLabels[req.status]?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Karaoke Requests */}
        {requests?.karaokeRequests && requests.karaokeRequests.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mic2 className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold">Turnos de karaoke</h2>
            </div>
            <div className="space-y-2">
              {requests.karaokeRequests.map((req) => (
                <div key={req.id} className="card py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Turno #{req.turnNumber} - {req.title}
                      </p>
                      {req.artist && (
                        <p className="text-sm text-white/60">{req.artist}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${statusLabels[req.status]?.color}`}>
                      {statusLabels[req.status]?.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {(!requests?.songRequests?.length && !requests?.karaokeRequests?.length) && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/60">No tenés pedidos todavía</p>
          </div>
        )}
      </main>
    </div>
  )
}
```

### 8.7 Actualizar `apps/web-client/src/pages/MusicaDJRequest.tsx`

Modificar para usar guestStore en lugar de pedir datos:

```tsx
// Agregar al inicio
import { useGuestStore } from '../stores/guestStore'

// En el componente:
const { guest } = useGuestStore()

// Redirigir si no hay guest
useEffect(() => {
  if (!guest) {
    navigate(`/e/${slug}`)
  }
}, [guest, slug, navigate])

// Modificar handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!event || !guest) return

  const input: CreateSongRequestInput = {
    guestId: guest.id,
    ...(selectedTrack ? {
      spotifyId: selectedTrack.id,
      title: selectedTrack.name,
      artist: selectedTrack.artists.join(', '),
      albumArtUrl: selectedTrack.albumArtUrl || undefined,
    } : {
      title: manualTitle.trim(),
      artist: manualArtist.trim(),
    }),
  }

  // ... resto igual
}

// ELIMINAR: Sección "Tus datos" del formulario
// ELIMINAR: Estados requesterName, requesterLastname

// AGREGAR: Mostrar guest info en header
<p className="text-xs text-white/60">
  {event.name} • {guest?.displayName}
</p>
```

### 8.8 Actualizar `apps/web-client/src/pages/KaraokeyaSignup.tsx`

Mismo patrón que MusicaDJRequest - usar guestStore.

### 8.9 Actualizar `apps/web-client/src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GuestIdentification from './pages/GuestIdentification'
import EventHub from './pages/EventHub'
import MusicaDJRequest from './pages/MusicaDJRequest'
import RequestSuccess from './pages/RequestSuccess'
import KaraokeyaSignup from './pages/KaraokeyaSignup'
import KaraokeyaSuccess from './pages/KaraokeyaSuccess'
import KaraokeyaMyTurn from './pages/KaraokeyaMyTurn'
import KaraokeyaDisplay from './pages/KaraokeyaDisplay'
import MyRequests from './pages/MyRequests'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest identification (entry point) */}
        <Route path="/e/:slug" element={<GuestIdentification />} />
        
        {/* Hub (after identification) */}
        <Route path="/e/:slug/hub" element={<EventHub />} />
        
        {/* My requests */}
        <Route path="/e/:slug/my-requests" element={<MyRequests />} />
        
        {/* MUSICADJ */}
        <Route path="/e/:slug/musicadj" element={<MusicaDJRequest />} />
        <Route path="/e/:slug/musicadj/success" element={<RequestSuccess />} />
        
        {/* KARAOKEYA */}
        <Route path="/e/:slug/karaokeya" element={<KaraokeyaSignup />} />
        <Route path="/e/:slug/karaokeya/success" element={<KaraokeyaSuccess />} />
        <Route path="/e/:slug/karaokeya/my-turn" element={<KaraokeyaMyTurn />} />
        <Route path="/e/:slug/karaokeya/display" element={<KaraokeyaDisplay />} />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

---

## FASE 9: VERIFICACIÓN FINAL

```bash
# 1. Reiniciar API
cd ~/Projects/euforia-events/apps/api
npx pnpm dev

# 2. En otra terminal, reiniciar cliente
cd ~/Projects/euforia-events/apps/web-client
npx pnpm dev

# 3. Probar endpoints
curl -X POST http://localhost:3000/api/guests/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","displayName":"Tester"}'

# 4. Probar flujo completo en navegador
# http://localhost:5173/e/test-event-2501
```

---

## RESUMEN DE CAMBIOS

| Área | Archivos | Acción |
|------|----------|--------|
| Schema | `schema.prisma` | Reemplazar completo |
| Backend | `modules/guest/*` | Crear 5 archivos |
| Backend | `modules/musicadj/*` | Modificar 2 archivos |
| Backend | `modules/karaokeya/*` | Modificar 2 archivos |
| Backend | `app.ts` | Agregar ruta guest |
| Frontend | `types/index.ts` | Reemplazar completo |
| Frontend | `stores/guestStore.ts` | Crear |
| Frontend | `services/api.ts` | Agregar funciones |
| Frontend | `pages/GuestIdentification.tsx` | Crear |
| Frontend | `pages/EventHub.tsx` | Crear |
| Frontend | `pages/MyRequests.tsx` | Crear |
| Frontend | `pages/MusicaDJRequest.tsx` | Modificar |
| Frontend | `pages/KaraokeyaSignup.tsx` | Modificar |
| Frontend | `App.tsx` | Actualizar rutas |

**Total: ~20 archivos**

---

*Prompt generado para EUFORIA EVENTS - Implementación directa modelo Guest*

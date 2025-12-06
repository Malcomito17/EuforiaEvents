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

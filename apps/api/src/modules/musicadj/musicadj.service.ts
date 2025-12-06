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
